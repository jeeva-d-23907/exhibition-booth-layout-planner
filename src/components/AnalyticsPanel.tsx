import React from 'react';
import { X, TrendingUp, DollarSign, Package } from 'lucide-react';
import { useStore, Analytics } from '../store/useStore';

export const AnalyticsPanel: React.FC = () => {
  const darkMode = useStore(s => s.darkMode);
  const toggleAnalytics = useStore(s => s.toggleAnalytics);
  const analytics = useStore(s => s.getAnalytics()) as Analytics;

  const panelClass = `absolute top-16 right-80 w-72 rounded-2xl shadow-2xl border z-50 overflow-hidden ${
    darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
  }`;

  const pct = (n: number) => analytics.total ? Math.round(n / analytics.total * 100) : 0;

  return (
    <div className={panelClass}>
      <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-indigo-500" />
          <span className="font-bold text-sm">Analytics</span>
        </div>
        <button onClick={toggleAnalytics} className={`p-1 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Total */}
        <div className={`text-center p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="text-4xl font-black text-indigo-500">{analytics.total}</div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Booths</div>
        </div>

        {/* Status bars */}
        {[
          { label: 'Available', value: analytics.available, color: '#22c55e', bg: 'bg-green-500' },
          { label: 'Reserved', value: analytics.reserved, color: '#eab308', bg: 'bg-yellow-500' },
          { label: 'Sold', value: analytics.sold, color: '#ef4444', bg: 'bg-red-500' },
        ].map(stat => (
          <div key={stat.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium" style={{ color: stat.color }}>{stat.label}</span>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{stat.value} ({pct(stat.value)}%)</span>
            </div>
            <div className={`h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${stat.bg}`}
                style={{ width: `${pct(stat.value)}%` }}
              />
            </div>
          </div>
        ))}

        {/* Revenue */}
        {analytics.potential > 0 && (
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign size={14} className="text-green-500" />
              <span className="text-xs font-semibold">Revenue</span>
            </div>
            <div className="text-xl font-bold text-green-500">${analytics.revenue.toLocaleString()}</div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              of ${analytics.potential.toLocaleString()} potential ({analytics.potential > 0 ? Math.round(analytics.revenue / analytics.potential * 100) : 0}%)
            </div>
          </div>
        )}

        {/* Categories */}
        {Object.keys(analytics.categories).length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Package size={14} className="text-purple-500" />
              <span className="text-xs font-semibold">Categories</span>
            </div>
            <div className="space-y-1.5">
              {Object.entries(analytics.categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} className="flex justify-between text-xs">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{cat}</span>
                  <span className={`font-semibold px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
