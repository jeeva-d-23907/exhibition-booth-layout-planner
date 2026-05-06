import { useRef, useEffect, useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import Konva from 'konva';
import { TopBar } from './components/TopBar';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { BottomBar } from './components/BottomBar';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { useStore } from './store/useStore';

function App() {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { darkMode, showAnalytics, setTool, undo, redo, selectedElement, duplicateBooth, deleteSelected, toggleGrid } = useStore();

  const handleMouseMove = useCallback((x: number, y: number) => {
    setMousePos({ x, y });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        redo();
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (selectedElement?.kind === 'booth') {
          duplicateBooth(selectedElement.id);
        }
      }
      if (e.key === 'g' || e.key === 'G') {
        toggleGrid();
      }
      if (e.key === 'Escape') {
        setTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedElement, duplicateBooth, deleteSelected, toggleGrid, setTool]);

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster position="top-right" />
      <TopBar stageRef={stageRef} />
      <div className="flex flex-1 overflow-hidden relative">
        <Toolbar />
        <Canvas stageRef={stageRef} onMouseMove={handleMouseMove} />
        <PropertiesPanel />
        {showAnalytics && <AnalyticsPanel />}
      </div>
      <BottomBar mousePos={mousePos} />
    </div>
  );
}

export default App;
