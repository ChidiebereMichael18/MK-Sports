import { useState } from 'react';

const navigationItems = [
  { id: 'fixtures', label: 'Fixtures', icon: '📅' },
  { id: 'scores', label: 'Scores', icon: '⚽' },
  { id: 'predictions', label: 'Predictions', icon: '🔮' },
];

export default function Navigation({ activeTab, setActiveTab }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex space-x-1">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="mr-2 text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}