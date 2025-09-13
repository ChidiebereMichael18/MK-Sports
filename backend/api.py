from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from functools import lru_cache
from datetime import date
import uvicorn

# Import the scraping functions
from scraper_scores import scrape_scores_all
from scraper_predictions import scrape_predictions_all
from scraper_fixtures import scrape_fixtures_all

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Sports API - Scores, Predictions & Fixtures"}

@lru_cache(maxsize=1)
def cached_scores_all(date_str: str = None):
    return scrape_scores_all(date_str)

@app.get("/scores")
def get_all_scores(date: str = Query(None)):
    today = date or date.today().isoformat()
    data = cached_scores_all(today)
    if not data:
        return JSONResponse(status_code=404, content={"error": f"No scores for {today}"})
    return sorted(data, key=lambda x: (x.get("sport", ""), x.get("date", "")))

@app.get("/scores/{sport}")
def get_scores(sport: str, date: str = Query(None)):
    today = date or date.today().isoformat()
    data = cached_scores_all(today)
    # Convert sport parameter to proper case for matching
    sport_map = {
        "soccer": "Soccer",
        "mlb": "MLB", 
        "nhl": "NHL",
        "nba": "NBA",
        "nfl": "NFL"
    }
    sport_name = sport_map.get(sport.lower(), sport)
    filtered = [m for m in data if m.get("sport", "").lower() == sport_name.lower()]
    if not filtered:
        return JSONResponse(status_code=404, content={"error": f"No {sport} scores for {today} (check season)"})
    return filtered

@lru_cache(maxsize=1)
def cached_predictions_all():
    return scrape_predictions_all()

@app.get("/predictions")
def get_all_predictions():
    data = cached_predictions_all()
    if data and all("error" in d for d in data):
        return JSONResponse(status_code=503, content={"error": "Predictions sources down; retry later"})
    return sorted(data, key=lambda x: (x.get("sport", ""), x.get("league", "")))

@app.get("/predictions/{sport}")
def get_predictions(sport: str):
    data = cached_predictions_all()
    # Convert sport parameter to proper case for matching
    sport_map = {
        "soccer": "Soccer",
        "mlb": "MLB", 
        "nhl": "NHL",
        "nba": "NBA",
        "nfl": "NFL"
    }
    sport_name = sport_map.get(sport.lower(), sport)
    filtered = [p for p in data if p.get("sport", "").lower() == sport_name.lower()]
    if not filtered:
        return JSONResponse(status_code=404, content={"error": f"No predictions for {sport}"})
    return filtered

@app.get("/predictions/soccer/{league}")
def get_soccer_predictions(league: str):
    data = [p for p in cached_predictions_all() if p.get("sport") == "Soccer"]
    filtered = [p for p in data if league.lower() in p.get("league", "").lower()]
    if not filtered:
        return JSONResponse(status_code=404, content={"error": f"No {league} predictions"})
    return filtered

# Fixtures endpoints
@lru_cache(maxsize=1)
def cached_fixtures_all(days_ahead: int = 7):
    return scrape_fixtures_all(days_ahead)

@app.get("/fixtures")
def get_all_fixtures(days_ahead: int = Query(7, ge=1, le=30)):
    data = cached_fixtures_all(days_ahead)
    if not data:
        return JSONResponse(status_code=404, content={"error": f"No fixtures found for next {days_ahead} days"})
    return sorted(data, key=lambda x: (x.get("sport", ""), x.get("date", ""), x.get("time", "")))

@app.get("/fixtures/{sport}")
def get_fixtures(sport: str, days_ahead: int = Query(7, ge=1, le=30)):
    data = cached_fixtures_all(days_ahead)
    if not data:
        return JSONResponse(status_code=404, content={"error": f"No fixtures found for next {days_ahead} days"})
    
    # Convert sport parameter to proper case for matching
    sport_map = {
        "soccer": "Soccer",
        "mlb": "MLB", 
        "nhl": "NHL",
        "nba": "NBA",
        "nfl": "NFL"
    }
    sport_name = sport_map.get(sport.lower(), sport)
    filtered = [m for m in data if m.get("sport", "").lower() == sport_name.lower()]
    if not filtered:
        return JSONResponse(status_code=404, content={"error": f"No {sport} fixtures for next {days_ahead} days"})
    return filtered

@app.get("/fixtures/soccer/{league}")
def get_soccer_fixtures(league: str, days_ahead: int = Query(7, ge=1, le=30)):
    data = cached_fixtures_all(days_ahead)
    if not data:
        return JSONResponse(status_code=404, content={"error": f"No fixtures found for next {days_ahead} days"})
    
    soccer_data = [p for p in data if p.get("sport") == "Soccer"]
    filtered = [p for p in soccer_data if league.lower() in p.get("league", "").lower()]
    if not filtered:
        return JSONResponse(status_code=404, content={"error": f"No {league} fixtures for next {days_ahead} days"})
    return filtered

# Allow GET for refresh (simple cache clear)
@app.get("/refresh")
@app.post("/refresh")
def refresh_cache():
    cached_scores_all.cache_clear()
    cached_predictions_all.cache_clear()
    cached_fixtures_all.cache_clear()
    return {"message": "Cache refreshed"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)