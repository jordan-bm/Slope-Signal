import httpx
import json
import re
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'api'))

from app.models import Region, AvalancheForecast

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://slope:signal@db:5432/slopesignal")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

UAC_ZONES = [
    {
        "slug": "uac-salt-lake",
        "name": "UAC Salt Lake",
        "center": "UAC",
        "state": "UT",
        "lat": 40.7608,
        "lon": -111.8910,
        "forecast_url": "https://utahavalanchecenter.org/forecast/salt-lake/json",
        "zone_key": "salt-lake",
    },
    {
        "slug": "uac-ogden",
        "name": "UAC Ogden",
        "center": "UAC",
        "state": "UT",
        "lat": 41.2230,
        "lon": -111.9738,
        "forecast_url": "https://utahavalanchecenter.org/forecast/ogden/json",
        "zone_key": "ogden",
    },
    {
        "slug": "uac-provo",
        "name": "UAC Provo",
        "center": "UAC",
        "state": "UT",
        "lat": 40.2338,
        "lon": -111.6585,
        "forecast_url": "https://utahavalanchecenter.org/forecast/provo/json",
        "zone_key": "provo",
    },
]

DANGER_MAP = {
    "low": 1,
    "limited": 1,
    "moderate": 2,
    "considerable": 3,
    "high": 4,
    "extreme": 5,
}

HEADERS = {
    "User-Agent": "SlopeSignal/0.1 contact@slopesignal.dev"
}


def parse_danger_rating(rating_str: str) -> int | None:
    """Convert text danger rating to integer 1-5."""
    if not rating_str:
        return None
    return DANGER_MAP.get(rating_str.lower().strip(), None)


def parse_rose_dominant(rose_str: str) -> int | None:
    """
    UAC danger rose is 24 comma-separated values (aspects at one elevation).
    Values appear to be pixel/color codes. We extract the most common non-zero
    value as a proxy for dominant danger. This is a v1 heuristic.
    """
    if not rose_str:
        return None
    try:
        values = [int(v) for v in rose_str.split(",") if v.strip()]
        # UAC uses 16=considerable-ish, 14=moderate-ish in their color encoding
        # We'll map back to our 1-5 scale based on overall_danger_rating instead
        return max(values) if values else None
    except ValueError:
        return None


def clean_html(text: str) -> str:
    """Strip basic HTML entities and tags from UAC text fields."""
    if not text:
        return ""
    text = text.replace("&nbsp;", " ")
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\r\r", "\n\n", text)
    return text.strip()


def parse_forecast_date(date_str: str) -> date:
    """Parse UAC date string like 'Thursday, February 26, 2026 - 7:01am'."""
    try:
        clean = date_str.split(" - ")[0].strip()
        return datetime.strptime(clean, "%A, %B %d, %Y").date()
    except Exception:
        return date.today()


def upsert_region(db: Session, zone: dict) -> Region:
    """Insert region if it doesn't exist, return the region row."""
    region = db.query(Region).filter(Region.slug == zone["slug"]).first()
    if not region:
        region = Region(
            slug=zone["slug"],
            name=zone["name"],
            center=zone["center"],
            state=zone["state"],
            lat=zone["lat"],
            lon=zone["lon"],
            forecast_url=zone["forecast_url"],
        )
        db.add(region)
        db.commit()
        db.refresh(region)
        print(f"  Created region: {region.name}")
    return region


def fetch_and_store_forecast(zone: dict, db: Session):
    """Fetch UAC forecast for one zone and upsert into avalanche_forecasts."""
    print(f"\nFetching: {zone['name']} ({zone['forecast_url']})")

    try:
        response = httpx.get(zone["forecast_url"], headers=HEADERS, timeout=15)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"  ERROR fetching {zone['name']}: {e}")
        return

    advisories = data.get("advisories", [])
    if not advisories:
        print(f"  No advisories found for {zone['name']}")
        return

    advisory = advisories[0].get("advisory", {})

    region = upsert_region(db, zone)
    forecast_date = parse_forecast_date(advisory.get("date_issued", ""))
    overall_danger = parse_danger_rating(advisory.get("overall_danger_rating", ""))

    # Build problems JSON from available text fields
    problems = {
        "bottom_line": clean_html(advisory.get("bottom_line", "")),
        "recent_activity": clean_html(advisory.get("recent_activity", "")),
        "special_announcement": clean_html(advisory.get("special_announcement", "")),
    }

    discussion = clean_html(advisory.get("current_conditions", ""))

    # Upsert: update if exists for this region+date, insert if not
    existing = (
        db.query(AvalancheForecast)
        .filter(
            AvalancheForecast.region_id == region.id,
            AvalancheForecast.forecast_date == forecast_date,
        )
        .first()
    )

    if existing:
        existing.danger_alpine = overall_danger
        existing.danger_treeline = overall_danger
        existing.danger_below_treeline = overall_danger
        existing.problems_json = json.dumps(problems)
        existing.discussion = discussion
        existing.source_url = zone["forecast_url"]
        existing.fetched_at = datetime.utcnow()
        print(f"  Updated forecast for {region.name} on {forecast_date}")
    else:
        forecast = AvalancheForecast(
            region_id=region.id,
            forecast_date=forecast_date,
            danger_alpine=overall_danger,
            danger_treeline=overall_danger,
            danger_below_treeline=overall_danger,
            problems_json=json.dumps(problems),
            discussion=discussion,
            source_url=zone["forecast_url"],
        )
        db.add(forecast)
        print(f"  Inserted forecast for {region.name} on {forecast_date}")

    db.commit()


def run():
    print("=== UAC Ingest Job Starting ===")
    db = SessionLocal()
    try:
        for zone in UAC_ZONES:
            fetch_and_store_forecast(zone, db)
    finally:
        db.close()
    print("\n=== UAC Ingest Job Complete ===")


if __name__ == "__main__":
    run()