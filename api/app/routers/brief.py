from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
import json

from app.database import get_db
from app.models import Region, AvalancheForecast, WeatherSnapshot
from app.schemas import RegionOut, DailyBrief
from app.scoring import compute_risk_index, DANGER_LABELS

router = APIRouter(prefix="/api", tags=["brief"])


@router.get("/regions", response_model=list[RegionOut])
def list_regions(db: Session = Depends(get_db)):
    return db.query(Region).order_by(Region.name).all()


@router.get("/brief/{region_slug}", response_model=DailyBrief)
def get_brief(
    region_slug: str,
    forecast_date: date = None,
    db: Session = Depends(get_db),
):
    region = db.query(Region).filter(Region.slug == region_slug).first()
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")

    if forecast_date is None:
        # Use most recent available forecast rather than strict today
        forecast = (
            db.query(AvalancheForecast)
            .filter(AvalancheForecast.region_id == region.id)
            .order_by(AvalancheForecast.forecast_date.desc())
            .first()
        )
        if not forecast:
            raise HTTPException(
                status_code=404,
                detail=f"No forecast found for {region_slug}"
            )
        forecast_date = forecast.forecast_date
    else:
        forecast = (
            db.query(AvalancheForecast)
            .filter(
                AvalancheForecast.region_id == region.id,
                AvalancheForecast.forecast_date == forecast_date,
            )
            .first()
        )
        if not forecast:
            raise HTTPException(
                status_code=404,
                detail=f"No forecast found for {region_slug} on {forecast_date}"
            )

    weather = (
        db.query(WeatherSnapshot)
        .filter(
            WeatherSnapshot.region_id == region.id,
            WeatherSnapshot.forecast_date == forecast_date,
        )
        .first()
    )

    risk_index = compute_risk_index(forecast, weather)

    problems = {}
    if forecast.problems_json:
        try:
            problems = json.loads(forecast.problems_json)
        except Exception:
            problems = {}

    danger = forecast.danger_alpine or 0

    return DailyBrief(
        region=region,
        forecast_date=forecast.forecast_date,
        danger_alpine=forecast.danger_alpine,
        danger_treeline=forecast.danger_treeline,
        danger_below_treeline=forecast.danger_below_treeline,
        danger_label=DANGER_LABELS.get(danger, "Unknown"),
        discussion=forecast.discussion,
        problems=problems,
        risk_index=risk_index,
        fetched_at=forecast.fetched_at,
    )