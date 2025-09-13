import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
from datetime import date, datetime
import json

def scrape_scores_all(date_str: str = None):
    today = date_str or date.today().isoformat()
    all_matches = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }

    session = requests.Session()
    session.headers.update(headers)

    # Soccer (FBref) with retries
    soccer_competitions = [
        (9, "Premier League", "https://fbref.com/en/comps/9/schedule/Premier-League-Scores-and-Fixtures"),
        (12, "La Liga", "https://fbref.com/en/comps/12/schedule/La-Liga-Scores-and-Fixtures"),
        (20, "Bundesliga", "https://fbref.com/en/comps/20/schedule/Bundesliga-Scores-and-Fixtures"),
        (11, "Serie A", "https://fbref.com/en/comps/11/schedule/Serie-A-Scores-and-Fixtures"),
        (13, "Ligue 1", "https://fbref.com/en/comps/13/schedule/Ligue-1-Scores-and-Fixtures"),
        (22, "MLS", "https://fbref.com/en/comps/22/schedule/Major-League-Soccer-Scores-and-Fixtures"),
    ]

    for code, league_name, url in soccer_competitions:
        for attempt in range(3):  # Retry up to 3 times
            try:
                res = session.get(url, timeout=10)
                res.raise_for_status()
                soup = BeautifulSoup(res.text, "html.parser")
                
                table = soup.find("table", id="sched_all")
                if table:
                    rows = table.find("tbody").find_all("tr")
                    for row in rows:
                        if any(cls in row.get("class", []) for cls in ["thead", "over_header"]):
                            continue
                        
                        date_cell = row.find("td", {"data-stat": "date"})
                        home_cell = row.find("td", {"data-stat": "home_team"})
                        away_cell = row.find("td", {"data-stat": "away_team"})
                        score_cell = row.find("td", {"data-stat": "score"})
                        
                        match_date = date_cell.text.strip() if date_cell else None
                        home = home_cell.text.strip() if home_cell else None
                        away = away_cell.text.strip() if away_cell else None
                        score = score_cell.text.strip() if score_cell else "TBD"
                        
                        if home and away and match_date:
                            # Convert date format for comparison
                            try:
                                parsed_date = datetime.strptime(match_date, "%Y-%m-%d").date()
                                target_date = datetime.strptime(today, "%Y-%m-%d").date() if today else date.today()
                                
                                if not date_str or parsed_date == target_date:
                                    all_matches.append({
                                        "sport": "Soccer",
                                        "league": league_name,
                                        "date": match_date,
                                        "home_team": home,
                                        "away_team": away,
                                        "score": score
                                    })
                            except ValueError:
                                # Date format doesn't match, skip filtering
                                if not date_str:
                                    all_matches.append({
                                        "sport": "Soccer",
                                        "league": league_name,
                                        "date": match_date,
                                        "home_team": home,
                                        "away_team": away,
                                        "score": score
                                    })
                time.sleep(2)  # Increased delay
                break  # Success
            except Exception as e:
                print(f"Attempt {attempt+1} failed for Soccer {league_name}: {e}")
                time.sleep(5 * attempt)  # Backoff
                continue
        else:
            print(f"Failed to scrape Soccer {league_name} after 3 attempts")

    # MLB
    try:
        mlb_url = f"https://statsapi.mlb.com/api/v1/schedule?hydrate=game(content(summary)),team&date={today}&sportId=1"
        res = session.get(mlb_url, timeout=10)
        res.raise_for_status()
        mlb_data = res.json()
        
        for game_date in mlb_data.get('dates', []):
            for game in game_date.get('games', []):
                status = game.get('status', {}).get('abstractGameState', '')
                if status in ['Preview', 'Live', 'Final']:
                    teams = game.get('teams', {})
                    home_team = teams.get('home', {}).get('team', {}).get('name', 'Unknown')
                    away_team = teams.get('away', {}).get('team', {}).get('name', 'Unknown')
                    home_score = teams.get('home', {}).get('score', 0)
                    away_score = teams.get('away', {}).get('score', 0)
                    score = f"{home_score}-{away_score}" if home_score or away_score else "TBD"
                    
                    all_matches.append({
                        "sport": "MLB",
                        "league": "MLB",
                        "date": game_date['date'],
                        "home_team": home_team,
                        "away_team": away_team,
                        "score": score
                    })
        time.sleep(1)
    except Exception as e:
        print(f"Error fetching MLB scores: {e}")

    # NHL via official API
    try:
        nhl_url = f"https://api-web.nhle.com/v1/schedule/{today}"
        res = session.get(nhl_url, timeout=10)
        res.raise_for_status()
        nhl_data = res.json()
        
        if 'gameWeek' in nhl_data:
            for day in nhl_data['gameWeek']:
                for game in day.get('games', []):
                    home_team = game.get('homeTeam', {}).get('name', {}).get('default', 'Unknown')
                    away_team = game.get('awayTeam', {}).get('name', {}).get('default', 'Unknown')
                    
                    # Get scores if game has started
                    if game.get('gameState') == 'OFF' or game.get('gameState') == 'FINAL':
                        home_score = game.get('homeTeam', {}).get('score', 0)
                        away_score = game.get('awayTeam', {}).get('score', 0)
                        score = f"{home_score}-{away_score}"
                    else:
                        score = "TBD"
                    
                    all_matches.append({
                        "sport": "NHL",
                        "league": "NHL",
                        "date": today,
                        "home_team": home_team,
                        "away_team": away_team,
                        "score": score
                    })
        else:
            # Off-season fallback
            all_matches.append({
                "sport": "NHL",
                "league": "NHL",
                "date": today,
                "home_team": None,
                "away_team": None,
                "score": "No games scheduled"
            })
        time.sleep(1)
    except Exception as e:
        print(f"Error fetching NHL scores: {e}")
        all_matches.append({
            "sport": "NHL",
            "league": "NHL",
            "date": today,
            "home_team": None,
            "away_team": None,
            "score": f"Error: {e}"
        })

    if all_matches:
        df = pd.DataFrame(all_matches)
        df = df.sort_values(by=["sport", "league", "date"]).reset_index(drop=True)
        df.to_csv("all_scores.csv", index=False)
        for sport in df['sport'].unique():
            sport_df = df[df['sport'] == sport]
            if not sport_df.empty:
                sport_df.to_csv(f"{sport.lower()}_scores.csv", index=False)
        return df.to_dict('records')
    return []

if __name__ == "__main__":
    data = scrape_scores_all()
    print(pd.DataFrame(data).head(10) if data else "Empty")