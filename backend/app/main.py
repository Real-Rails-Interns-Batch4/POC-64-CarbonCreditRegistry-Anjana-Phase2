from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json

app = FastAPI(title="Carbon Credit Registry Explorer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock/Synthetic data for Verra & Gold Standard Registry Explorer
# Category: Governance & Trust
projects_data = [
    {
        "id": "VCS-984",
        "title": "Amazon Rainforest Conservation Project",
        "registry": "Verra Registry",
        "methodology": "VM0007 REDD+ Methodology",
        "category": "Governance & Trust",
        "credits_issued": 1250000,
        "credits_retired": 850000,
        "status": "Active",
        "region": "South America",
        "country": "Brazil",
        "lat": -3.4653,
        "lon": -62.2159,
        "price_per_credit": 15.50,
        "regional_avg_price": 12.80,
        "verifier": "SCS Global Services",
        "last_updated": "2026-06-15"
    },
    {
        "id": "GS-4021",
        "title": "Clean Wind Energy Grid Integration",
        "registry": "Gold Standard Registry",
        "methodology": "ACM0002 Grid-connected Renewables",
        "category": "Governance & Trust",
        "credits_issued": 450000,
        "credits_retired": 410000,
        "status": "Active",
        "region": "Asia",
        "country": "India",
        "lat": 20.5937,
        "lon": 78.9629,
        "price_per_credit": 9.20,
        "regional_avg_price": 8.50,
        "verifier": "TÜV NORD",
        "last_updated": "2026-05-10"
    },
    {
        "id": "VCS-1123",
        "title": "Southern Peatland Restoration and Protection",
        "registry": "Verra Registry",
        "methodology": "VM0034 Peatland Rewetting",
        "category": "Governance & Trust",
        "credits_issued": 800000,
        "credits_retired": 320000,
        "status": "Active",
        "region": "Southeast Asia",
        "country": "Indonesia",
        "lat": -0.7893,
        "lon": 113.9213,
        "price_per_credit": 18.00,
        "regional_avg_price": 14.50,
        "verifier": "Vesta Verifiers",
        "last_updated": "2026-07-01"
    },
    {
        "id": "GS-5820",
        "title": "Community Boreholes and Water Purification",
        "registry": "Gold Standard Registry",
        "methodology": "GS-TPDDTEC Safe Water Supply",
        "category": "Governance & Trust",
        "credits_issued": 300000,
        "credits_retired": 285000,
        "status": "Active",
        "region": "Africa",
        "country": "Kenya",
        "lat": -1.2921,
        "lon": 36.8219,
        "price_per_credit": 11.50,
        "regional_avg_price": 10.20,
        "verifier": "Gold Standard Auditor Team",
        "last_updated": "2026-06-28"
    },
    {
        "id": "VCS-2451",
        "title": "Mangrove Blue Carbon Coastal Protection",
        "registry": "Verra Registry",
        "methodology": "VM0033 Tidal Wetland Restoration",
        "category": "Governance & Trust",
        "credits_issued": 620000,
        "credits_retired": 150000,
        "status": "Under Review",
        "region": "Central America",
        "country": "Honduras",
        "lat": 15.2000,
        "lon": -86.2419,
        "price_per_credit": 22.00,
        "regional_avg_price": 16.50,
        "verifier": "SCS Global Services",
        "last_updated": "2026-04-18"
    },
    {
        "id": "GS-3104",
        "title": "Improved Biomass Cookstoves for Rural Households",
        "registry": "Gold Standard Registry",
        "methodology": "GS-COOKSTOVE Improved Thermal Efficiency",
        "category": "Governance & Trust",
        "credits_issued": 950000,
        "credits_retired": 910000,
        "status": "Active",
        "region": "Africa",
        "country": "Rwanda",
        "lat": -1.9403,
        "lon": 29.8739,
        "price_per_credit": 13.00,
        "regional_avg_price": 10.20,
        "verifier": "Carbon Verification Corp",
        "last_updated": "2026-07-05"
    }
]

def calculate_insights(df: pd.DataFrame) -> pd.DataFrame:
    # 1. Price comparison vs regional average
    df["price_vs_regional_pct"] = ((df["price_per_credit"] - df["regional_avg_price"]) / df["regional_avg_price"]) * 100
    
    # 2. Retirement ratio
    df["retirement_ratio_pct"] = (df["credits_retired"] / df["credits_issued"]) * 100
    
    # 3. Governance risk score (0-100 where higher is better trust/governance transparency)
    # Built dynamically from retired ratio, verifier presence, status
    def compute_trust_score(row):
        score = 60.0
        if row["status"] == "Active":
            score += 15
        if row["registry"] == "Gold Standard Registry":
            score += 10 # generally stricter governance premium
        if row["credits_retired"] > 0:
            score += min(15, (row["credits_retired"] / row["credits_issued"]) * 15)
        return min(100.0, score)

    df["trust_score"] = df.apply(compute_trust_score, axis=1)
    return df

@app.get("/api/projects")
def get_projects(registry: str = None, status: str = None):
    df = pd.DataFrame(projects_data)
    df = calculate_insights(df)
    
    if registry and registry != "All":
        df = df[df["registry"] == registry]
    if status and status != "All":
        df = df[df["status"] == status]
        
    # Convert to GeoJSON or structured format
    features = []
    for _, row in df.iterrows():
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(row["lon"]), float(row["lat"])]
            },
            "properties": {
                "id": row["id"],
                "title": row["title"],
                "registry": row["registry"],
                "methodology": row["methodology"],
                "category": row["category"],
                "credits_issued": int(row["credits_issued"]),
                "credits_retired": int(row["credits_retired"]),
                "status": row["status"],
                "region": row["region"],
                "country": row["country"],
                "price_per_credit": float(row["price_per_credit"]),
                "price_vs_regional_pct": round(float(row["price_vs_regional_pct"]), 1),
                "retirement_ratio_pct": round(float(row["retirement_ratio_pct"]), 1),
                "trust_score": round(float(row["trust_score"]), 1),
                "verifier": row["verifier"],
                "last_updated": row["last_updated"]
            }
        }
        features.append(feature)
        
    return {
        "type": "FeatureCollection",
        "features": features
    }

@app.get("/api/stats")
def get_stats():
    df = pd.DataFrame(projects_data)
    df = calculate_insights(df)
    
    total_issued = int(df["credits_issued"].sum())
    total_retired = int(df["credits_retired"].sum())
    avg_retirement_rate = round(float((total_retired / total_issued) * 100), 1)
    avg_trust_score = round(float(df["trust_score"].mean()), 1)
    
    return {
        "total_issued": total_issued,
        "total_retired": total_retired,
        "avg_retirement_rate": avg_retirement_rate,
        "avg_trust_score": avg_trust_score,
        "total_projects": len(df),
        "active_methodologies": int(df["methodology"].nunique())
    }

@app.get("/api/download")
def download_data():
    df = pd.DataFrame(projects_data)
    df = calculate_insights(df)
    csv_data = df.to_csv(index=False)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=carbon_registry_explorer_data.csv"}
    )

# Serve static frontend files from 'static' folder in production
from fastapi.staticfiles import StaticFiles
import os

static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

