import React from 'react';
import { useStore, Analytics } from '../store/useStore';

interface BottomBarProps {
  mousePos: { x: number; y: number };
}

export const BottomBar: React.FC<BottomBarProps> = ({ mousePos }) => {
  const zoom = useStore(s => s.zoom);
  const darkMode = useStore(s => s.darkMode);
  const tool = useStore(s => s.tool);
  const gridSize = useStore(s => s.gridSize);
  const gridEnabled = useStore(s => s.gridEnabled);
  const analytics = useStore(s => s.getAnalytics()) as Analytics;

  const TOOL_LABELS: Record<string, string> = {
    select: 'Select',
    booth: 'Draw Booth',
    path: 'Draw Path',
    object: 'Place Object',
  };

  const TOOL_COLORS: Record<string, string> = {
    select: darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600',
    booth: 'bg-green-500/10 text-green-600',
    path: 'bg-indigo-500/10 text-indigo-600',
    object: 'bg-purple-500/10 text-purple-600',
  };

  const Divider = () => (
    <div className={`w-px h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
  );

  return (
    <footer
      className={`h-6 flex items-center px-4 gap-3 text-[10px] font-medium border-t shrink-0 ${
        darkMode ? 'bg-gray-900 border-gray-800 text-gray-500' : 'bg-white border-gray-200 text-gray-400'
      }`}
    >
      {/* Zoom */}
      <span className={`font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {Math.round(zoom * 100)}%
      </span>

      <Divider />

      {/* Cursor position */}
      <span className="font-mono">
        {mousePos.x}, {mousePos.y}
      </span>

      {gridEnabled && (
        <>
          <Divider />
          <span>Grid {gridSize}px</span>
        </>
      )}

      <Divider />

      {/* Stats */}
      <span>{analytics.total} booths</span>
      {analytics.available > 0 && (
        <span className="text-green-500">{analytics.available} free</span>
      )}
      {analytics.reserved > 0 && (
        <span className="text-yellow-500">{analytics.reserved} reserved</span>
      )}
      {analytics.sold > 0 && (
        <span className="text-red-500">{analytics.sold} sold</span>
      )}

      <div className="flex-1" />

      {/* Active tool */}
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${TOOL_COLORS[tool] || TOOL_COLORS.select}`}>
        {TOOL_LABELS[tool] || tool}
      </span>
    </footer>
  );
};
