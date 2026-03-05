# Slope Signal

**Avalanche decision-support for Utah backcountry riders.**

Slope Signal ingests daily forecasts from the Utah Avalanche Center across all 7 zones, computes a composite risk index, and surfaces the signals that matter — danger rating, avalanche problems, bottom line, current conditions, and mountain weather — in a clean, purpose-built interface.

Built because I ride Utah backcountry. Not a recreation of the UAC website — a focused signal layer on top of it.

> ⚠ **NOT A SAFETY TOOL.** Slope Signal presents signals from public UAC forecast data. Always consult [utahavalanchecenter.org](https://utahavalanchecenter.org) and make your own informed decisions.

---

## Screenshots

![Slope Signal — Danger Header & Zone Selector](screenshots/screenshot-1.png)
*Danger rating, zone selector, and avalanche problem badges — Logan zone showing Considerable*

![Slope Signal — Risk Index & Bottom Line](screenshots/screenshot-2.png)
*Composite risk index with signal breakdown, bottom line, and current conditions*

![Slope Signal — Current Conditions & Mountain Weather](screenshots/screenshot-3.png)
*Full forecast detail: current conditions narrative and mountain weather*

---

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=flat-square&logo=githubactions)
![AWS EC2](https://img.shields.io/badge/AWS-EC2-FF9900?style=flat-square&logo=amazonaws)

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend API | FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL 16 |
| Ingest | Python + httpx, scheduled via GitHub Actions |
| Infrastructure | Docker Compose on AWS EC2 |
| CI/CD | GitHub Actions (CI + daily ingest) |
| Weather | OpenWeatherMap API |

---

## How It Works

```
UAC Forecast API (7 zones)          OpenWeatherMap API
        │                                   │
        └──────────── ingest/jobs/uac.py ───┘
                              │
                              ▼
                      PostgreSQL (EC2)
                     ┌────────────────┐
                     │ regions        │
                     │ avalanche_     │
                     │ forecasts      │
                     └───────┬────────┘
                             │
                         FastAPI
                      /api/brief/:slug
                             │
                         Next.js
                      Zone selector
                      Risk index
                      Forecast detail
```

1. **Ingest** — GitHub Actions SSHes into EC2 at 7am MT daily and runs `ingest/jobs/uac.py`. The script fetches the UAC JSON forecast for each of the 7 Utah zones, cleans HTML entities, extracts avalanche problems and discussion fields, and fetches current mountain weather from OpenWeatherMap using each zone's lat/lon. Results are upserted into PostgreSQL.

2. **API** — FastAPI exposes `/api/regions` and `/api/brief/:slug`. The brief endpoint joins the region and latest forecast, computes a composite **Risk Index** (0–100) from danger rating, wind slab signals, new snow load, wet slide indicators, and data freshness, and returns the full forecast payload.

3. **Frontend** — Next.js fetches the brief on zone selection and renders the danger header, zone tabs, avalanche problem badges, risk index breakdown, and full forecast sections. Dark slate + topographic aesthetic, Barlow Condensed display font, monospace data elements, official UAC danger colors.

### Risk Index Components

| Signal | Weight | Source |
|---|---|---|
| Avalanche Danger Rating | 40 pts | UAC `overall_danger_rating` |
| Wind Slab Signals | 20 pts | Keyword scan of forecast text |
| New Snow Load | 20 pts | OpenWeatherMap precipitation |
| Wet Slide / Warming Signals | 10 pts | Keyword scan of forecast text |
| Data Freshness | 10 pts | Time since last ingest |

### UAC Zones Covered

| Zone | Slug |
|---|---|
| Salt Lake | `uac-salt-lake` |
| Ogden | `uac-ogden` |
| Provo | `uac-provo` |
| Moab | `uac-moab` |
| Uintas | `uac-uintas` |
| Skyline | `uac-skyline` |
| Logan | `uac-logan` |

---

## Local Development

### Prerequisites

- Docker + Docker Compose
- Node.js 18+
- Python 3.11+

### Setup

```bash
git clone https://github.com/jordan-bm/Slope-Signal.git
cd Slope-Signal
```

**1. Start the database and API:**

```bash
docker compose up -d db
docker compose up api
```

**2. Run migrations:**

```bash
docker compose exec api alembic upgrade head
```

**3. Run the ingest:**

```bash
cd ingest
DATABASE_URL=postgresql://slope:signal@localhost:5432/slopesignal \
OPENWEATHER_API_KEY=your_key_here \
python3 jobs/uac.py
```

**4. Start the frontend:**

```bash
cd web
npm install
npm run dev
```

App runs at `http://localhost:3000`, API at `http://localhost:8000`.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://slope:signal@db:5432/slopesignal` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key (free tier) | — |
| `NEXT_PUBLIC_API_URL` | API base URL for frontend | `http://localhost:8000` |

---

## Deployment (EC2)

The app is deployed on a single AWS EC2 instance using Docker Compose.

### Infrastructure

- **EC2**: Amazon Linux 2, `t2.micro` (free tier)
- **Docker Compose**: runs `api`, `db`, and `web` containers
- **GitHub Actions**: CI on push to `main` + daily ingest at 7am MT via SSH

### Deploy from scratch

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Clone repo
git clone https://github.com/jordan-bm/Slope-Signal.git
cd Slope-Signal

# Set environment
echo 'export OPENWEATHER_API_KEY=your_key_here' >> ~/.bashrc
source ~/.bashrc

# Start stack
docker compose up -d --build

# Run migrations
docker compose exec api alembic upgrade head

# Run initial ingest
cd ingest
DATABASE_URL=postgresql://slope:signal@localhost:5432/slopesignal \
OPENWEATHER_API_KEY=$OPENWEATHER_API_KEY \
python3 jobs/uac.py
```

### GitHub Actions Secrets Required

| Secret | Value |
|---|---|
| `EC2_SSH_KEY` | Contents of your EC2 `.pem` private key |
| `OPENWEATHER_API_KEY` | Your OpenWeatherMap API key |

### Scheduled Ingest

The daily ingest runs automatically via `.github/workflows/ingest.yml` — SSHes into EC2, pulls latest code, and runs `uac.py` against the live database. Can also be triggered manually from the GitHub Actions UI.

---

## Project Motivation

I snowboard Utah backcountry regularly. The UAC forecast is essential but I wanted a faster, more signal-dense interface for the specific question I ask every morning: *how bad is it, and what's the specific problem today?* Slope Signal is that tool — and a demonstration of a production-grade full-stack system built around a real personal need.

---

*Data sourced from the [Utah Avalanche Center](https://utahavalanchecenter.org). Always check the full forecast before heading out.*