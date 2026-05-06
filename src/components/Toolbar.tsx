import React from 'react';
import { MousePointer2, Square, Route, MapPin } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Tool, PathStyle, ObjectType } from '../types';

const OBJECT_ITEMS: { type: ObjectType; label: string; emoji: string }[] = [
  { type: 'entrance', label: 'Entrance', emoji: '🚪' },
  { type: 'exit', label: 'Exit', emoji: '🚪' },
  { type: 'stage', label: 'Stage', emoji: '🎭' },
  { type: 'food-court', label: 'Food Court', emoji: '🍔' },
  { type: 'registration', label: 'Registration', emoji: '📋' },
  { type: 'washroom', label: 'Washroom', emoji: '🚻' },
  { type: 'emergency-exit', label: 'Emergency', emoji: '🆘' },
  { type: 'seating', label: 'Seating', emoji: '💺' },
  { type: 'pillar', label: 'Pillar', emoji: '🏛️' },
  { type: 'wall', label: 'Wall', emoji: '🧱' },
];

const PATH_STYLES: { style: PathStyle; label: string; color: string }[] = [
  { style: 'main-aisle', label: 'Main Aisle', color: '#3b82f6' },
  { style: 'secondary-aisle', label: 'Secondary', color: '#8b5cf6' },
  { style: 'emergency', label: 'Emergency', color: '#ef4444' },
];

export const Toolbar: React.FC = () => {
  const tool = useStore(s => s.tool);
  const setTool = useStore(s => s.setTool);
  const darkMode = useStore(s => s.darkMode);
  const currentPathStyle = useStore(s => s.currentPathStyle);
  const currentObjectType = useStore(s => s.currentObjectType);

  const toolBtnClass = (t: Tool) =>
    `flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-xs font-medium transition-all duration-200 w-full ${
      tool === t
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
        : darkMode
        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <div className={`w-20 flex flex-col items-center py-4 gap-2 border-r overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <button className={toolBtnClass('select')} onClick={() => setTool('select')} title="Select (V)">
        <MousePointer2 size={20} />
        <span>Select</span>
      </button>
      <button className={toolBtnClass('booth')} onClick={() => setTool('booth')} title="Draw Booth">
        <Square size={20} />
        <span>Booth</span>
      </button>
      <button className={toolBtnClass('path')} onClick={() => setTool('path')} title="Draw Path">
        <Route size={20} />
        <span>Path</span>
      </button>
      <button className={toolBtnClass('object')} onClick={() => setTool('object')} title="Add Object">
        <MapPin size={20} />
        <span>Object</span>
      </button>

      {tool === 'path' && (
        <div className="w-full px-1 mt-2">
          <div className={`text-xs font-semibold mb-2 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Path Style</div>
          {PATH_STYLES.map(ps => (
            <button
              key={ps.style}
              onClick={() => useStore.setState({ currentPathStyle: ps.style })}
              className={`w-full mb-1 p-2 rounded-lg text-xs text-left transition-all ${
                currentPathStyle === ps.style
                  ? 'ring-2 ring-offset-1 ring-indigo-500'
                  : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              style={{ borderLeft: `4px solid ${ps.color}` }}
            >
              {ps.label}
            </button>
          ))}
          <div className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Click to add points,<br />double-click to finish
          </div>
        </div>
      )}

      {tool === 'object' && (
        <div className="w-full px-1 mt-2">
          <div className={`text-xs font-semibold mb-2 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Objects</div>
          <div className="grid grid-cols-2 gap-1">
            {OBJECT_ITEMS.map(item => (
              <button
                key={item.type}
                onClick={() => useStore.setState({ currentObjectType: item.type })}
                className={`flex flex-col items-center p-2 rounded-lg text-xs transition-all ${
                  currentObjectType === item.type
                    ? 'bg-indigo-600 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={item.label}
              >
                <span className="text-lg">{item.emoji}</span>
                <span className="text-[9px] leading-tight text-center mt-0.5">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
