from fastapi import FastAPI

app = FastAPI(
    title="Slope Signal API",
    description="Avalanche forecast and weather signal aggregation API.",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "slope-signal-api"}