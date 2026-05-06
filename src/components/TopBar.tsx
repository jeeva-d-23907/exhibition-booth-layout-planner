import React from 'react';
import {
  LayoutGrid, Save, FolderOpen, Image, FileText, Undo2, Redo2,
  Grid3X3, Moon, Sun, ZoomIn, ZoomOut, BarChart2, Search, Trash2,
  RefreshCw, Copy,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import Konva from 'konva';
import toast from 'react-hot-toast';

interface TopBarProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

export const TopBar: React.FC<TopBarProps> = ({ stageRef }) => {
  const darkMode = useStore(s => s.darkMode);
  const toggleDarkMode = useStore(s => s.toggleDarkMode);
  const toggleGrid = useStore(s => s.toggleGrid);
  const gridEnabled = useStore(s => s.gridEnabled);
  const undo = useStore(s => s.undo);
  const redo = useStore(s => s.redo);
  const history = useStore(s => s.history);
  const future = useStore(s => s.future);
  const zoom = useStore(s => s.zoom);
  const setZoom = useStore(s => s.setZoom);
  const toggleAnalytics = useStore(s => s.toggleAnalytics);
  const showAnalytics = useStore(s => s.showAnalytics);
  const searchQuery = useStore(s => s.searchQuery);
  const setSearchQuery = useStore(s => s.setSearchQuery);
  const saveToLocalStorage = useStore(s => s.saveToLocalStorage);
  const loadFromLocalStorage = useStore(s => s.loadFromLocalStorage);
  const resetCanvas = useStore(s => s.resetCanvas);
  const deleteSelected = useStore(s => s.deleteSelected);
  const selectedElement = useStore(s => s.selectedElement);
  const duplicateBooth = useStore(s => s.duplicateBooth);

  const handleExportPNG = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const dataUrl = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'exhibition-layout.png';
    link.href = dataUrl;
    link.click();
    toast.success('Exported as PNG!');
  };

  const handleExportPDF = async () => {
    const stage = stageRef.current;
    if (!stage) return;
    try {
      toast.loading('Generating PDF...', { id: 'pdf' });
      const { jsPDF } = await import('jspdf');
      const dataUrl = stage.toDataURL({ pixelRatio: 2 });
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(dataUrl, 'PNG', 5, 5, pdfWidth - 10, pdfHeight - 10);
      pdf.save('exhibition-layout.pdf');
      toast.success('PDF exported!', { id: 'pdf' });
    } catch {
      toast.error('PDF export failed', { id: 'pdf' });
    }
  };

  const handleSave = () => {
    saveToLocalStorage();
    toast.success('Layout saved!');
  };

  const handleLoad = () => {
    loadFromLocalStorage();
    toast.success('Layout loaded!');
  };

  const handleNew = () => {
    if (confirm('Create new layout? Unsaved changes will be lost.')) {
      resetCanvas();
      toast.success('New layout created');
    }
  };

  // Base button style
  const btn = `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap ${
    darkMode
      ? 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

  const btnActive = `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap ${
    darkMode
      ? 'text-indigo-400 bg-indigo-900/30 hover:bg-indigo-900/50'
      : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
  }`;

  const btnDisabled = `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium opacity-30 cursor-not-allowed ${
    darkMode ? 'text-gray-500' : 'text-gray-400'
  }`;

  const divider = (
    <div className={`w-px h-5 mx-0.5 shrink-0 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
  );

  return (
    <header
      className={`h-11 flex items-center px-3 gap-1 border-b shrink-0 ${
        darkMode
          ? 'bg-gray-900 border-gray-700'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2 shrink-0">
        <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/30">
          <LayoutGrid size={15} className="text-white" />
        </div>
        <span className={`font-bold text-sm hidden sm:block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ExhibiPlan
        </span>
      </div>

      {divider}

      {/* File group */}
      <button className={btn} onClick={handleNew} title="New layout">
        <RefreshCw size={13} />
        <span className="hidden md:inline">New</span>
      </button>
      <button className={btn} onClick={handleSave} title="Save to browser (Ctrl+S)">
        <Save size={13} />
        <span className="hidden md:inline">Save</span>
      </button>
      <button className={btn} onClick={handleLoad} title="Load from browser">
        <FolderOpen size={13} />
        <span className="hidden md:inline">Load</span>
      </button>

      {divider}

      {/* Export group */}
      <button className={btn} onClick={handleExportPNG} title="Export as PNG image">
        <Image size={13} />
        <span className="hidden lg:inline">PNG</span>
      </button>
      <button className={btn} onClick={handleExportPDF} title="Export as PDF">
        <FileText size={13} />
        <span className="hidden lg:inline">PDF</span>
      </button>

      {divider}

      {/* Edit group */}
      <button
        className={history.length === 0 ? btnDisabled : btn}
        onClick={undo}
        title="Undo (Ctrl+Z)"
        disabled={history.length === 0}
      >
        <Undo2 size={13} />
      </button>
      <button
        className={future.length === 0 ? btnDisabled : btn}
        onClick={redo}
        title="Redo (Ctrl+Y)"
        disabled={future.length === 0}
      >
        <Redo2 size={13} />
      </button>
      {selectedElement?.kind === 'booth' && (
        <button
          className={btn}
          onClick={() => duplicateBooth((selectedElement as { kind: 'booth'; id: string }).id)}
          title="Duplicate selected (Ctrl+D)"
        >
          <Copy size={13} />
        </button>
      )}
      {selectedElement && (
        <button
          className={`${btn} !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20`}
          onClick={deleteSelected}
          title="Delete selected (Delete)"
        >
          <Trash2 size={13} />
        </button>
      )}

      {divider}

      {/* View group */}
      <button
        className={gridEnabled ? btnActive : btn}
        onClick={toggleGrid}
        title="Toggle Grid (G)"
      >
        <Grid3X3 size={13} />
      </button>

      {/* Zoom */}
      <div className={`flex items-center rounded-lg border overflow-hidden text-xs ${
        darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <button
          className={`px-2 py-1.5 transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          onClick={() => setZoom(Math.max(zoom / 1.2, 0.1))}
          title="Zoom Out"
        >
          <ZoomOut size={13} />
        </button>
        <span className={`px-2 min-w-[3.5rem] text-center font-mono font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          className={`px-2 py-1.5 transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          onClick={() => setZoom(Math.min(zoom * 1.2, 5))}
          title="Zoom In"
        >
          <ZoomIn size={13} />
        </button>
      </div>

      <button className={btn} onClick={toggleDarkMode} title="Toggle Dark Mode">
        {darkMode ? <Sun size={13} /> : <Moon size={13} />}
      </button>

      {divider}

      <button
        className={showAnalytics ? btnActive : btn}
        onClick={toggleAnalytics}
        title="Toggle Analytics Panel"
      >
        <BarChart2 size={13} />
        <span className="hidden lg:inline">Analytics</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
          darkMode
            ? 'bg-gray-800 border-gray-700 text-gray-300 focus-within:border-indigo-500'
            : 'bg-gray-50 border-gray-200 text-gray-600 focus-within:border-indigo-400 focus-within:bg-white'
        }`}
      >
        <Search size={12} className={darkMode ? 'text-gray-500 shrink-0' : 'text-gray-400 shrink-0'} />
        <input
          type="text"
          placeholder="Search booths..."
          className="bg-transparent outline-none w-28 text-xs placeholder-gray-400"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
    </header>
  );
};
