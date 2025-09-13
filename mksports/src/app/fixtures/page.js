'use client';
import { useState, useEffect } from 'react';
import { fetchFixtures } from '@/utils/api';

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState('all');
  const [daysAhead, setDaysAhead] = useState(7);

  useEffect(() => {
    loadFixtures();
  }, [selectedSport, daysAhead]);

  const loadFixtures = async () => {
    try {
      setLoading(true);
      setError(null);
      const sport = selectedSport === 'all' ? null : selectedSport;
      const data = await fetchFixtures(sport, daysAhead);
      setFixtures(data);
    } catch (err) {
      setError('Failed to load fixtures. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sports = ['all', 'soccer', 'mlb', 'nhl', 'nba', 'nfl'];
  const daysOptions = [3, 7, 14, 30];

  // Group fixtures by date
  const groupedFixtures = fixtures.reduce((groups, fixture) => {
    const date = fixture.date || 'Unknown Date';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(fixture);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upcoming Fixtures</h1>
        
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
          <div className="flex gap-2">
            {daysOptions.map(days => (
              <button
                key={days}
                onClick={() => setDaysAhead(days)}
                className={`px-4 py-2 rounded-full ${
                  daysAhead === days
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
            <button 
              onClick={loadFixtures}
              className="ml-4 bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Fixtures by Date */}
        {!loading && !error && Object.entries(groupedFixtures).map(([date, dateFixtures]) => (
          <div key={date} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{date}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dateFixtures.map((fixture, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-500 mb-2">
                    {fixture.sport} - {fixture.league}
                  </div>
                  <div className="font-semibold mb-2">
                    {fixture.home_team || 'TBA'} vs {fixture.away_team || 'TBA'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Time: {fixture.time || 'TBD'}
                  </div>
                  {fixture.status && (
                    <div className="text-sm text-gray-600 mt-1">
                      Status: {fixture.status}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {!loading && !error && fixtures.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No fixtures found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}