import React from 'react';
import { MousePointer2, Square, Route, MapPin, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Tool, PathStyle, ObjectType } from '../types';

const OBJECT_ITEMS: { type: ObjectType; label: string; emoji: string }[] = [
  { type: 'entrance', label: 'Entrance', emoji: '🚪' },
  { type: 'exit', label: 'Exit', emoji: '🚪' },
  { type: 'stage', label: 'Stage', emoji: '🎭' },
  { type: 'food-court', label: 'Food Court', emoji: '🍔' },
  { type: 'registration', label: 'Reg.', emoji: '📋' },
  { type: 'washroom', label: 'Washroom', emoji: '🚻' },
  { type: 'emergency-exit', label: 'Emergency', emoji: '🆘' },
  { type: 'seating', label: 'Seating', emoji: '💺' },
  { type: 'pillar', label: 'Pillar', emoji: '🏛️' },
  { type: 'wall', label: 'Wall', emoji: '🧱' },
];

const PATH_STYLES: { style: PathStyle; label: string; color: string; desc: string }[] = [
  { style: 'main-aisle', label: 'Main', desc: 'Main Aisle', color: '#3b82f6' },
  { style: 'secondary-aisle', label: 'Secondary', desc: 'Secondary Aisle', color: '#8b5cf6' },
  { style: 'emergency', label: 'Emergency', desc: 'Emergency Route', color: '#ef4444' },
];

export const Toolbar: React.FC = () => {
  const tool = useStore(s => s.tool);
  const setTool = useStore(s => s.setTool);
  const darkMode = useStore(s => s.darkMode);
  const currentPathStyle = useStore(s => s.currentPathStyle);
  const currentObjectType = useStore(s => s.currentObjectType);

  const toolItems: { id: Tool; icon: React.ReactNode; label: string; title: string }[] = [
    { id: 'select', icon: <MousePointer2 size={18} />, label: 'Select', title: 'Select / Move (V)' },
    { id: 'booth', icon: <Square size={18} />, label: 'Booth', title: 'Draw Booth (drag)' },
    { id: 'path', icon: <Route size={18} />, label: 'Path', title: 'Draw Walkway' },
    { id: 'object', icon: <MapPin size={18} />, label: 'Object', title: 'Place Object' },
  ];

  const base = `flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-xl text-[11px] font-semibold transition-all duration-150 w-full cursor-pointer`;
  const active = `bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]`;
  const inactive = darkMode
    ? 'text-gray-400 hover:bg-gray-700/80 hover:text-gray-100'
    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800';

  return (
    <div
      className={`w-[72px] flex flex-col items-center py-3 gap-1 border-r overflow-y-auto ${
        darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Tool buttons */}
      <div className="flex flex-col gap-1 w-full px-2">
        {toolItems.map(item => (
          <button
            key={item.id}
            className={`${base} ${tool === item.id ? active : inactive}`}
            onClick={() => setTool(item.id)}
            title={item.title}
          >
            <span className={tool === item.id ? 'text-white' : ''}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Path options */}
      {tool === 'path' && (
        <>
          <div className={`w-full h-px my-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
          <div className="w-full px-2">
            <div className={`text-[9px] font-bold uppercase tracking-widest mb-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Style
            </div>
            <div className="flex flex-col gap-1">
              {PATH_STYLES.map(ps => (
                <button
                  key={ps.style}
                  onClick={() => useStore.setState({ currentPathStyle: ps.style })}
                  className={`w-full p-2 rounded-lg text-left transition-all duration-150 flex items-center gap-2 ${
                    currentPathStyle === ps.style
                      ? darkMode
                        ? 'bg-gray-700 ring-1 ring-indigo-500'
                        : 'bg-indigo-50 ring-1 ring-indigo-400'
                      : darkMode
                      ? 'hover:bg-gray-700/60'
                      : 'hover:bg-gray-50'
                  }`}
                  title={ps.desc}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: ps.color }}
                  />
                  <span className={`text-[10px] font-medium leading-tight ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {ps.label}
                  </span>
                  {currentPathStyle === ps.style && (
                    <CheckCircle2 size={10} className="ml-auto text-indigo-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className={`mt-3 text-[9px] leading-relaxed text-center px-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              Click to add<br />points<br />
              <span className={`font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Dbl-click<br />or Esc<br />to finish
              </span>
            </div>
          </div>
        </>
      )}

      {/* Object options */}
      {tool === 'object' && (
        <>
          <div className={`w-full h-px my-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
          <div className="w-full px-2">
            <div className={`text-[9px] font-bold uppercase tracking-widest mb-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Type
            </div>
            <div className="grid grid-cols-2 gap-1">
              {OBJECT_ITEMS.map(item => (
                <button
                  key={item.type}
                  onClick={() => useStore.setState({ currentObjectType: item.type })}
                  className={`flex flex-col items-center p-1.5 rounded-lg transition-all duration-150 ${
                    currentObjectType === item.type
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : darkMode
                      ? 'bg-gray-700/60 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={item.label}
                >
                  <span className="text-base leading-none">{item.emoji}</span>
                  <span className="text-[8px] leading-tight text-center mt-0.5 font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
