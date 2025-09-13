const API_BASE_URL = 'http://localhost:8000';

// Generic fetch function
async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Predictions
export async function fetchPredictions(sport = null) {
  const endpoint = sport ? `/predictions/${sport}` : '/predictions';
  return fetchData(endpoint);
}

// Fixtures
export async function fetchFixtures(sport = null, daysAhead = 7) {
  const params = new URLSearchParams({ days_ahead: daysAhead });
  const endpoint = sport 
    ? `/fixtures/${sport}?${params}` 
    : `/fixtures?${params}`;
  return fetchData(endpoint);
}

// Scores
export async function fetchScores(sport = null, date = null) {
  const params = date ? new URLSearchParams({ date }) : '';
  const endpoint = sport 
    ? `/scores/${sport}?${params}` 
    : `/scores?${params}`;
  return fetchData(endpoint);
}

// Refresh cache
export async function refreshCache() {
  return fetchData('/refresh');
}