from app.schemas import RiskFactor, RiskIndex
from app.models import AvalancheForecast, WeatherSnapshot
from datetime import datetime, timezone
import json
import re


WIND_SLAB_KEYWORDS = [
    "wind slab", "wind loading", "wind-loaded", "cross-loaded",
    "leeward", "drifting snow", "wind crust", "wind affected"
]

WET_SLIDE_KEYWORDS = [
    "wet", "warming", "rain", "isothermal", "melt", "solar",
    "wet loose", "wet slab", "point release"
]

DANGER_LABELS = {
    1: "Low",
    2: "Moderate",
    3: "Considerable",
    4: "High",
    5: "Extreme",
}


def keyword_score(text: str, keywords: list[str]) -> int:
    """Count how many distinct keywords appear in text."""
    if not text:
        return 0
    text_lower = text.lower()
    return sum(1 for kw in keywords if kw in text_lower)


def compute_risk_index(
    forecast: AvalancheForecast,
    weather: WeatherSnapshot | None,
) -> RiskIndex:
    factors: list[RiskFactor] = []
    full_text = " ".join(filter(None, [
        forecast.discussion or "",
        forecast.problems_json or "",
    ]))

    # --- Factor 1: Danger rating (max 40 pts) ---
    danger = forecast.danger_alpine or 0
    danger_pts = min(danger * 8, 40)
    factors.append(RiskFactor(
        name="Avalanche Danger Rating",
        points=danger_pts,
        max_points=40,
        reason=f"Danger rated {DANGER_LABELS.get(danger, 'Unknown')} "
               f"({danger}/5) × 8 = {danger_pts} pts",
    ))

    # --- Factor 2: Wind slab signals (max 20 pts) ---
    wind_hits = keyword_score(full_text, WIND_SLAB_KEYWORDS)
    wind_pts = min(wind_hits * 5, 20)
    factors.append(RiskFactor(
        name="Wind Slab Signals",
        points=wind_pts,
        max_points=20,
        reason=f"Found {wind_hits} wind-related keyword(s) in forecast text "
               f"({wind_pts} pts)",
    ))

    # --- Factor 3: New snow (max 20 pts) ---
    if weather and weather.new_snow_24h_in is not None:
        snow = weather.new_snow_24h_in
        if snow >= 12:
            snow_pts = 20
        elif snow >= 6:
            snow_pts = 14
        elif snow >= 3:
            snow_pts = 8
        elif snow > 0:
            snow_pts = 4
        else:
            snow_pts = 0
        reason = f"{snow}\" new snow in 24h → {snow_pts} pts"
    else:
        snow_pts = 0
        reason = "No weather data available"
    factors.append(RiskFactor(
        name="New Snow Load",
        points=snow_pts,
        max_points=20,
        reason=reason,
    ))

    # --- Factor 4: Wet slide / warming signals (max 10 pts) ---
    wet_hits = keyword_score(full_text, WET_SLIDE_KEYWORDS)
    wet_pts = min(wet_hits * 2, 10)
    factors.append(RiskFactor(
        name="Wet Slide / Warming Signals",
        points=wet_pts,
        max_points=10,
        reason=f"Found {wet_hits} warming/wet keyword(s) in forecast text "
               f"({wet_pts} pts)",
    ))

    # --- Factor 5: Data freshness (max 10 pts) ---
    now = datetime.now(timezone.utc)
    fetched = forecast.fetched_at
    if fetched:
        if fetched.tzinfo is None:
            fetched = fetched.replace(tzinfo=timezone.utc)
        hours_old = (now - fetched).total_seconds() / 3600
        if hours_old <= 6:
            fresh_pts = 10
            fresh_reason = f"Data fetched {hours_old:.1f}h ago (fresh)"
        elif hours_old <= 24:
            fresh_pts = 5
            fresh_reason = f"Data fetched {hours_old:.1f}h ago (same day)"
        else:
            fresh_pts = 0
            fresh_reason = f"Data fetched {hours_old:.1f}h ago (stale)"
    else:
        fresh_pts = 0
        fresh_reason = "Fetch time unknown"
    factors.append(RiskFactor(
        name="Data Freshness",
        points=fresh_pts,
        max_points=10,
        reason=fresh_reason,
    ))

    total = sum(f.points for f in factors)

    # Confidence: based on how many data sources are present
    confidence_score = 50  # base: we have a forecast
    if weather:
        confidence_score += 30
    if forecast.discussion:
        confidence_score += 20

    return RiskIndex(
        score=min(total, 100),
        factors=factors,
        confidence=min(confidence_score, 100),
    )