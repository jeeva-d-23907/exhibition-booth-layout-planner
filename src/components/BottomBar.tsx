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

  const barClass = `h-7 flex items-center px-4 gap-4 text-xs border-t ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`;

  const Stat: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
    <div className="flex items-center gap-1.5">
      {color && <span className="w-2 h-2 rounded-full" style={{ background: color }} />}
      <span className="font-medium" style={{ color: color || undefined }}>{value}</span>
      <span>{label}</span>
    </div>
  );

  return (
    <div className={barClass}>
      <Stat label="% zoom" value={`${Math.round(zoom * 100)}`} />
      <div className={`w-px h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
      <span>X: {mousePos.x} Y: {mousePos.y}</span>
      <div className={`w-px h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
      {gridEnabled && <span>Grid: {gridSize}px</span>}
      <div className={`w-px h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
      <Stat label="booths" value={analytics.total} />
      <Stat label="available" value={analytics.available} color="#22c55e" />
      <Stat label="reserved" value={analytics.reserved} color="#eab308" />
      <Stat label="sold" value={analytics.sold} color="#ef4444" />
      <div className="flex-1" />
      <span className={`px-2 py-0.5 rounded font-medium capitalize ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        Tool: {tool}
      </span>
    </div>
  );
};
