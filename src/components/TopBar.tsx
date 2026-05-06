import React from 'react';
import { LayoutGrid, Save, FolderOpen, Image, FileText, Undo2, Redo2, Grid3X3, Moon, Sun, ZoomIn, ZoomOut, BarChart2, Search, Trash2, RefreshCw, Copy } from 'lucide-react';
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
    } catch (e) {
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

  const btnClass = `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
    darkMode
      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

  const divider = <div className={`w-px h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />;

  return (
    <div className={`h-12 flex items-center px-3 gap-1 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Logo */}
      <div className="flex items-center gap-2 mr-3">
        <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <LayoutGrid size={16} className="text-white" />
        </div>
        <span className={`font-bold text-sm hidden sm:block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ExhibiPlan
        </span>
      </div>

      {divider}

      {/* File */}
      <button className={btnClass} onClick={handleNew} title="New">
        <RefreshCw size={14} /> New
      </button>
      <button className={btnClass} onClick={handleSave} title="Save">
        <Save size={14} /> Save
      </button>
      <button className={btnClass} onClick={handleLoad} title="Load">
        <FolderOpen size={14} /> Load
      </button>
      <button className={btnClass} onClick={handleExportPNG} title="Export PNG">
        <Image size={14} /> PNG
      </button>
      <button className={btnClass} onClick={handleExportPDF} title="Export PDF">
        <FileText size={14} /> PDF
      </button>

      {divider}

      {/* Edit */}
      <button className={`${btnClass} ${history.length === 0 ? 'opacity-40' : ''}`} onClick={undo} title="Undo (Ctrl+Z)" disabled={history.length === 0}>
        <Undo2 size={14} />
      </button>
      <button className={`${btnClass} ${future.length === 0 ? 'opacity-40' : ''}`} onClick={redo} title="Redo (Ctrl+Y)" disabled={future.length === 0}>
        <Redo2 size={14} />
      </button>
      {selectedElement?.kind === 'booth' && (
        <button className={btnClass} onClick={() => duplicateBooth(selectedElement.id)} title="Duplicate (Ctrl+D)">
          <Copy size={14} />
        </button>
      )}
      {selectedElement && (
        <button className={`${btnClass} text-red-500`} onClick={deleteSelected} title="Delete">
          <Trash2 size={14} />
        </button>
      )}

      {divider}

      {/* View */}
      <button
        className={`${btnClass} ${gridEnabled ? (darkMode ? 'text-indigo-400' : 'text-indigo-600') : ''}`}
        onClick={toggleGrid}
        title="Toggle Grid (G)"
      >
        <Grid3X3 size={14} />
      </button>
      <button className={btnClass} onClick={() => setZoom(Math.min(zoom * 1.2, 5))} title="Zoom In">
        <ZoomIn size={14} />
      </button>
      <button className={btnClass} onClick={() => setZoom(Math.max(zoom / 1.2, 0.1))} title="Zoom Out">
        <ZoomOut size={14} />
      </button>
      <button className={btnClass} onClick={toggleDarkMode} title="Toggle Dark Mode">
        {darkMode ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      {divider}

      {/* Analytics toggle */}
      <button
        className={`${btnClass} ${showAnalytics ? (darkMode ? 'text-indigo-400 bg-gray-700' : 'text-indigo-600 bg-indigo-50') : ''}`}
        onClick={toggleAnalytics}
        title="Analytics"
      >
        <BarChart2 size={14} />
        <span className="hidden md:block">Analytics</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200'}`}>
        <Search size={14} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
        <input
          type="text"
          placeholder="Search booths..."
          className="bg-transparent outline-none w-36 text-sm placeholder-gray-400"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};
