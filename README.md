# Slope Signal

A decision-support web app that consolidates public avalanche forecast and weather data into a simple **Daily Zone Brief** for backcountry and sidecountry riders.

> ⚠️ **Disclaimer:** Slope Signal is not a safety tool. It does not make go/no-go recommendations. All data is sourced from public avalanche forecast centers and weather APIs. Always consult your regional avalanche center and make your own informed decisions in the field.

## What it does

- Pulls forecast data from public avalanche centers (CAIC, NWAC, UAC)
- Pulls weather signals for the same regions
- Computes a transparent, heuristic-based Risk Index (0–100) with a full factor breakdown
- Shows what changed since yesterday
- Displays a confidence meter based on data freshness and completeness

## Stack

- **Frontend:** Next.js (TypeScript)
- **Backend API:** Python + FastAPI
- **Ingestion:** Python scheduled jobs via GitHub Actions
- **Database:** PostgreSQL (Supabase/Neon compatible)
- **Infra:** Docker Compose (local + Codespaces)

## Status

Active development — MVP in progress