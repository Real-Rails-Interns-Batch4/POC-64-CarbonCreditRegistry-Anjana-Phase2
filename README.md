# Carbon Credit Registry Explorer (PoC 64)

A modern, high-end fintech terminal dashboard for auditing and visualizing carbon offset registries (Verra and Gold Standard), under the "Governance & Trust" rail category.

## Project Structure

```text
├── backend/
│   ├── app/
│   │   └── main.py          # FastAPI application & Pandas data orchestration
│   ├── Dockerfile
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx     # Main dashboard interface
│   │   │   └── globals.css  # Theme tokens, styles, and custom scrollbars
│   │   └── components/
│   │       └── MapComponent.tsx # Dynamically loaded Leaflet map engine
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── VAR_REPORT.md
└── UAT_CHECKLIST.md
```

## Setup & Running Instructions

### Direct Installation

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --port 8000
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run dev
   ```
   Open [http://localhost:3001](http://localhost:3001) in your browser.

### Docker Compose

Build and run both services in containers:
```bash
docker-compose up --build
```

## Architecture Summary

- **Frontend**: Next.js 14 (App Router) styled with Tailwind CSS to conform to the Obsidian Black theme (`#030712`). Displays geographic data on an interactive Leaflet map overlays, paired with Recharts volumetric and trust index charts.
- **Backend**: FastAPI web server with Pandas orchestrating data inputs. Computes governance trust scores, regional pricing metrics, and exposes clean GeoJSON for mapping. Includes an automatic offline mock fallback on the client side.
