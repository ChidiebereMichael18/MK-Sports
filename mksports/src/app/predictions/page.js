'use client';
import { useState, useEffect } from 'react';
import { fetchPredictions } from '@/utils/api';

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState('all');

  useEffect(() => {
    loadPredictions();
  }, [selectedSport]);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const sport = selectedSport === 'all' ? null : selectedSport;
      const data = await fetchPredictions(sport);
      
      // Check if data is an array, if not, handle the error
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }
      
      setPredictions(data);
    } catch (err) {
      setError('Failed to load predictions. Please try again later.');
      console.error('Prediction loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sports = ['all', 'soccer', 'mlb', 'nhl', 'nba', 'nfl'];

  // Safely group predictions by league
  const groupedPredictions = predictions.reduce((groups, prediction) => {
    if (!prediction || typeof prediction !== 'object') return groups;
    
    const league = prediction.league || 'Unknown League';
    if (!groups[league]) {
      groups[league] = [];
    }
    groups[league].push(prediction);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Match Predictions</h1>
        
        {/* Filters */}
        <div className="mb-6">
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
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading predictions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
            <button 
              onClick={loadPredictions}
              className="ml-4 bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && predictions.length > 0 && (
          <div className="mb-4 p-2 bg-yellow-50 text-xs">
            API Response: {predictions.length} predictions loaded
          </div>
        )}

        {/* Predictions by League */}
        {!loading && !error && predictions.length > 0 && Object.entries(groupedPredictions).map(([league, leaguePredictions]) => (
          <div key={league} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{league}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaguePredictions.map((prediction, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-500 mb-2">
                    {prediction.sport || 'Unknown Sport'}
                  </div>
                  
                  <div className="font-semibold mb-4 text-center">
                    {prediction.home_team || 'TBA'} vs {prediction.away_team || 'TBA'}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Home Win:</span>
                      <span className="font-semibold text-blue-600">{prediction.home_win_prob || 'N/A'}</span>
                    </div>
                    
                    {prediction.draw_prob && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Draw:</span>
                        <span className="font-semibold text-gray-600">{prediction.draw_prob}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Away Win:</span>
                      <span className="font-semibold text-red-600">{prediction.away_win_prob || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {!loading && !error && predictions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No predictions available</h3>
            <p className="text-gray-500">Try selecting a different sport or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}