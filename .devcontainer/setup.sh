#!/bin/bash
set -e

echo "--- Installing API dependencies ---"
cd api
pip install -r requirements.txt
cd ..

echo "--- Installing ingest dependencies ---"
cd ingest
pip install -r requirements.txt
cd ..

echo "--- Installing web dependencies ---"
cd web
npm install
cd ..

echo "--- Setup complete. Run 'docker compose up' to start all services. ---"
```

---

**File 5: `api/requirements.txt`**
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
psycopg2-binary==2.9.9
sqlalchemy==2.0.30
alembic==1.13.1
python-dotenv==1.0.1
httpx==0.27.0
pydantic==2.7.1
pydantic-settings==2.2.1