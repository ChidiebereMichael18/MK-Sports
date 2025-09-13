'use client';
import { useState, useEffect } from 'react';
import { fetchScores } from '@/utils/api';

export default function ScoresPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadScores();
  }, [selectedSport, selectedDate]);

  const loadScores = async () => {
    try {
      setLoading(true);
      setError(null);
      const sport = selectedSport === 'all' ? null : selectedSport;
      const data = await fetchScores(sport, selectedDate);
      
      // Check if data is an array, if not, handle the error
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }
      
      setScores(data);
    } catch (err) {
      setError('Failed to load scores. Please try again later.');
      console.error('Score loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sports = ['all', 'soccer', 'mlb', 'nhl'];

  // Safely group scores by league
  const groupedScores = scores.reduce((groups, score) => {
    if (!score || typeof score !== 'object') return groups;
    
    const league = score.league || 'Unknown League';
    if (!groups[league]) {
      groups[league] = [];
    }
    groups[league].push(score);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Live Scores & Results</h1>
        
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sports.map(sport => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-4 py-2 rounded-full capitalize ${
                  selectedSport === sport
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading scores...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
            <button 
              onClick={loadScores}
              className="ml-4 bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && scores.length > 0 && (
          <div className="mb-4 p-2 bg-yellow-50 text-xs">
            API Response: {scores.length} scores loaded
          </div>
        )}

        {/* Scores by League */}
        {!loading && !error && scores.length > 0 && Object.entries(groupedScores).map(([league, leagueScores]) => (
          <div key={league} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{league}</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {leagueScores.map((score, index) => (
                <div key={index} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 text-right">
                      <p className="font-medium text-gray-900">{score.home_team || 'TBA'}</p>
                    </div>
                    
                    <div className="mx-4 flex flex-col items-center">
                      <span className="text-2xl font-bold text-gray-900">{score.score || 'TBD'}</span>
                      <span className="text-xs text-gray-500 mt-1">{score.status || 'Unknown'}</span>
                    </div>
                    
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{score.away_team || 'TBA'}</p>
                    </div>
                  </div>
                  
                  {score.date && (
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(score.date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {!loading && !error && scores.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">⚽</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No scores found</h3>
            <p className="text-gray-500">Try selecting a different date or sport.</p>
          </div>
        )}
      </div>
    </div>
  );
}