from fastapi import FastAPI
from app.database import engine
from app import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Slope Signal API",
    description="Avalanche forecast and weather signal aggregation API.",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "slope-signal-api"}