from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class RegionOut(BaseModel):
    id: int
    slug: str
    name: str
    center: str
    state: str

    class Config:
        from_attributes = True


class RiskFactor(BaseModel):
    name: str
    points: int
    max_points: int
    reason: str


class RiskIndex(BaseModel):
    score: int
    factors: list[RiskFactor]
    confidence: int  # 0-100, based on data freshness + completeness


class DailyBrief(BaseModel):
    region: RegionOut
    forecast_date: date
    danger_alpine: Optional[int]
    danger_treeline: Optional[int]
    danger_below_treeline: Optional[int]
    danger_label: str
    discussion: Optional[str]
    problems: dict
    risk_index: RiskIndex
    fetched_at: Optional[datetime]