from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, nullable=False)  # e.g. "caic-front-range"
    name = Column(String(255), nullable=False)               # e.g. "CAIC Front Range"
    center = Column(String(100), nullable=False)             # e.g. "CAIC"
    state = Column(String(50), nullable=False)               # e.g. "CO"
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    forecast_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    forecasts = relationship("AvalancheForecast", back_populates="region")
    weather = relationship("WeatherSnapshot", back_populates="region")


class AvalancheForecast(Base):
    __tablename__ = "avalanche_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    forecast_date = Column(Date, nullable=False)

    # Danger ratings (1=Low, 2=Moderate, 3=Considerable, 4=High, 5=Extreme)
    danger_alpine = Column(Integer, nullable=True)
    danger_treeline = Column(Integer, nullable=True)
    danger_below_treeline = Column(Integer, nullable=True)

    # Avalanche problems (stored as JSON text for v1 simplicity)
    problems_json = Column(Text, nullable=True)

    # Full discussion text from forecast center
    discussion = Column(Text, nullable=True)

    # Metadata
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
    source_url = Column(String(500), nullable=True)

    __table_args__ = (
        UniqueConstraint("region_id", "forecast_date", name="uq_forecast_region_date"),
    )

    region = relationship("Region", back_populates="forecasts")


class WeatherSnapshot(Base):
    __tablename__ = "weather_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    forecast_date = Column(Date, nullable=False)

    # Snow
    new_snow_24h_in = Column(Float, nullable=True)   # inches
    new_snow_72h_in = Column(Float, nullable=True)

    # Wind
    wind_speed_mph = Column(Float, nullable=True)
    wind_direction = Column(String(10), nullable=True)  # e.g. "NW"
    wind_gust_mph = Column(Float, nullable=True)

    # Temperature
    temp_high_f = Column(Float, nullable=True)
    temp_low_f = Column(Float, nullable=True)
    temp_trend = Column(String(20), nullable=True)  # "rising", "falling", "steady"

    fetched_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("region_id", "forecast_date", name="uq_weather_region_date"),
    )

    region = relationship("Region", back_populates="weather")