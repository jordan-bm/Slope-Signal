from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers import brief

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Slope Signal API",
    description="Avalanche forecast and weather signal aggregation API.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(brief.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "slope-signal-api"}