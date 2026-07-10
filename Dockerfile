# --- STAGE 1: Build Next.js Static Assets ---
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend

# Build-time environment variable for Mapbox token
ARG NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
ENV NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=$NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

# Copy package configurations
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy frontend source code
COPY frontend/ ./

# Build Next.js static export (outputs to /frontend/out)
RUN npm run build

# --- STAGE 2: Build Production FastAPI Server ---
FROM python:3.10-slim AS runner
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend/ /app/

# Copy static frontend assets from Stage 1 into backend's static directory
COPY --from=frontend-builder /frontend/out /app/static

EXPOSE 8000

# Run Uvicorn server serving both the REST API and the static UI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
