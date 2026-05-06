import React, { useState, useEffect } from 'react';
import { Trash2, Copy, Lock, Unlock, TrendingUp, DollarSign, Hash, User, Tag, FileText, Palette, Ruler } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Analytics } from '../store/useStore';
import { BoothStatus, Company } from '../types';

const STATUS_COLORS: Record<BoothStatus, string> = {
  available: '#22c55e',
  reserved: '#eab308',
  sold: '#ef4444',
};

// ─── Section & Field defined OUTSIDE the component ───────────────────────────
// Defining them inside would create a new component type on every render,
// which causes React to unmount + remount their children (inputs lose focus).

interface SectionProps {
  title: string;
  children: React.ReactNode;
  darkMode: boolean;
}

const Section: React.FC<SectionProps> = ({ title, children, darkMode }) => (
  <div className="mb-5">
    <div
      className={`text-[10px] font-bold uppercase tracking-widest mb-3 pb-2 border-b ${
        darkMode ? 'text-indigo-400 border-gray-700' : 'text-indigo-500 border-gray-100'
      }`}
    >
      {title}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

interface FieldProps {
  label: string;
  children: React.ReactNode;
  darkMode: boolean;
  icon?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, children, darkMode, icon }) => (
  <div>
    <label
      className={`flex items-center gap-1 text-xs font-semibold mb-1.5 ${
        darkMode ? 'text-gray-400' : 'text-gray-500'
      }`}
    >
      {icon && <span className="opacity-60">{icon}</span>}
      {label}
    </label>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

export const PropertiesPanel: React.FC = () => {
  const selectedElement = useStore(s => s.selectedElement);
  const booths = useStore(s => s.booths);
  const paths = useStore(s => s.paths);
  const objects = useStore(s => s.objects);
  const darkMode = useStore(s => s.darkMode);
  const updateBooth = useStore(s => s.updateBooth);
  const deleteBooth = useStore(s => s.deleteBooth);
  const duplicateBooth = useStore(s => s.duplicateBooth);
  const updatePath = useStore(s => s.updatePath);
  const deletePath = useStore(s => s.deletePath);
  const updateObject = useStore(s => s.updateObject);
  const deleteObject = useStore(s => s.deleteObject);

  const analytics = useStore(s => s.getAnalytics()) as Analytics;

  const selectedBooth = selectedElement?.kind === 'booth' ? booths.find(b => b.id === selectedElement.id) : null;
  const selectedPath = selectedElement?.kind === 'path' ? paths.find(p => p.id === selectedElement.id) : null;
  const selectedObject = selectedElement?.kind === 'object' ? objects.find(o => o.id === selectedElement.id) : null;

  // ── Local state for booth form (prevents focus loss on every keystroke) ──
  const [boothNumber, setBoothNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState('');

  // ── Local state for path form ─────────────────────────────────────────────
  const [pathLabel, setPathLabel] = useState('');

  // ── Local state for object form ───────────────────────────────────────────
  const [objectLabel, setObjectLabel] = useState('');

  // Sync local state when selected booth changes
  useEffect(() => {
    if (selectedBooth) {
      setBoothNumber(selectedBooth.number);
      setCompanyName(selectedBooth.company?.name || '');
      setContactPerson(selectedBooth.company?.contactPerson || '');
      setCategory(selectedBooth.company?.category || '');
      setNotes(selectedBooth.company?.notes || '');
      setPrice(selectedBooth.price?.toString() || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBooth?.id]);

  // Sync local state when selected path changes
  useEffect(() => {
    if (selectedPath) {
      setPathLabel(selectedPath.label || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPath?.id]);

  // Sync local state when selected object changes
  useEffect(() => {
    if (selectedObject) {
      setObjectLabel(selectedObject.label);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedObject?.id]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const commitCompanyField = (field: keyof Company, value: string) => {
    if (!selectedBooth) return;
    updateBooth(selectedBooth.id, {
      company: {
        name: selectedBooth.company?.name || '',
        contactPerson: selectedBooth.company?.contactPerson || '',
        category: selectedBooth.company?.category || '',
        notes: selectedBooth.company?.notes || '',
        ...selectedBooth.company,
        [field]: value,
      },
    });
  };

  // ── Shared styles ─────────────────────────────────────────────────────────

  const panelClass = `w-72 border-l overflow-y-auto flex-shrink-0 ${
    darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
  }`;

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
    darkMode
      ? 'bg-gray-700/80 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-indigo-500'
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:bg-white'
  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`;

  const actionBtn = `p-1.5 rounded-lg transition-all duration-150 ${
    darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-100' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
  }`;

  // ── Render: Booth ─────────────────────────────────────────────────────────

  if (selectedBooth) {
    return (
      <div className={panelClass}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-sm">Booth #{selectedBooth.number}</h2>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {selectedBooth.company?.name || 'Unassigned'}
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => updateBooth(selectedBooth.id, { locked: !selectedBooth.locked })}
                className={actionBtn}
                title={selectedBooth.locked ? 'Unlock' : 'Lock'}
              >
                {selectedBooth.locked
                  ? <Lock size={14} className="text-amber-400" />
                  : <Unlock size={14} />}
              </button>
              <button
                onClick={() => duplicateBooth(selectedBooth.id)}
                className={actionBtn}
                title="Duplicate"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={() => deleteBooth(selectedBooth.id)}
                className="p-1.5 rounded-lg transition-all duration-150 hover:bg-red-50 text-red-400 hover:text-red-500"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <Section title="Identity" darkMode={darkMode}>
            <Field label="Booth Number" darkMode={darkMode} icon={<Hash size={10} />}>
              <input
                className={inputClass}
                value={boothNumber}
                onChange={e => setBoothNumber(e.target.value)}
                onBlur={() => updateBooth(selectedBooth.id, { number: boothNumber })}
                placeholder="Booth number"
              />
            </Field>
            <Field label="Status" darkMode={darkMode}>
              <select
                className={inputClass}
                value={selectedBooth.status}
                onChange={e => updateBooth(selectedBooth.id, { status: e.target.value as BoothStatus })}
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </Field>
            <Field label="Custom Color" darkMode={darkMode} icon={<Palette size={10} />}>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5"
                  value={selectedBooth.color || STATUS_COLORS[selectedBooth.status]}
                  onChange={e => updateBooth(selectedBooth.id, { color: e.target.value })}
                />
                <button
                  className={`flex-1 py-2 px-3 text-xs rounded-lg font-medium transition-colors ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  onClick={() => updateBooth(selectedBooth.id, { color: undefined })}
                >
                  Reset to Status Color
                </button>
              </div>
            </Field>
            <Field label="Price (USD)" darkMode={darkMode} icon={<DollarSign size={10} />}>
              <input
                type="number"
                className={inputClass}
                value={price}
                placeholder="0.00"
                onChange={e => setPrice(e.target.value)}
                onBlur={() => updateBooth(selectedBooth.id, { price: price ? parseFloat(price) : undefined })}
              />
            </Field>
          </Section>

          <Section title="Company" darkMode={darkMode}>
            <Field label="Company Name" darkMode={darkMode} icon={<Tag size={10} />}>
              <input
                className={inputClass}
                value={companyName}
                placeholder="Enter company name"
                onChange={e => setCompanyName(e.target.value)}
                onBlur={() => commitCompanyField('name', companyName)}
              />
            </Field>
            <Field label="Contact Person" darkMode={darkMode} icon={<User size={10} />}>
              <input
                className={inputClass}
                value={contactPerson}
                placeholder="Contact person"
                onChange={e => setContactPerson(e.target.value)}
                onBlur={() => commitCompanyField('contactPerson', contactPerson)}
              />
            </Field>
            <Field label="Category" darkMode={darkMode} icon={<Tag size={10} />}>
              <input
                className={inputClass}
                value={category}
                placeholder="e.g. Technology, Food, Fashion"
                onChange={e => setCategory(e.target.value)}
                onBlur={() => commitCompanyField('category', category)}
              />
            </Field>
            <Field label="Notes" darkMode={darkMode} icon={<FileText size={10} />}>
              <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                value={notes}
                placeholder="Additional notes..."
                onChange={e => setNotes(e.target.value)}
                onBlur={() => commitCompanyField('notes', notes)}
              />
            </Field>
          </Section>

          <Section title="Dimensions" darkMode={darkMode}>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'X', value: Math.round(selectedBooth.x) },
                { label: 'Y', value: Math.round(selectedBooth.y) },
                { label: 'W', value: Math.round(selectedBooth.width) },
                { label: 'H', value: Math.round(selectedBooth.height) },
              ].map(dim => (
                <div
                  key={dim.label}
                  className={`p-2.5 rounded-xl ${darkMode ? 'bg-gray-700/60' : 'bg-gray-50'}`}
                >
                  <div className={`text-[10px] font-medium mb-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {dim.label}
                  </div>
                  <div className="font-mono font-semibold text-sm">
                    {dim.value}
                    <span className={`text-[10px] ml-0.5 font-normal ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>px</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    );
  }

  // ── Render: Path ──────────────────────────────────────────────────────────

  if (selectedPath) {
    return (
      <div className={panelClass}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-sm">Path Properties</h2>
              <p className={`text-xs mt-0.5 capitalize ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {selectedPath.style.replace(/-/g, ' ')}
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => updatePath(selectedPath.id, { locked: !selectedPath.locked })}
                className={actionBtn}
              >
                {selectedPath.locked
                  ? <Lock size={14} className="text-amber-400" />
                  : <Unlock size={14} />}
              </button>
              <button
                onClick={() => deletePath(selectedPath.id)}
                className="p-1.5 rounded-lg transition-all hover:bg-red-50 text-red-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <Section title="Style" darkMode={darkMode}>
            <Field label="Path Type" darkMode={darkMode}>
              <select
                className={inputClass}
                value={selectedPath.style}
                onChange={e =>
                  updatePath(selectedPath.id, {
                    style: e.target.value as 'main-aisle' | 'secondary-aisle' | 'emergency',
                  })
                }
              >
                <option value="main-aisle">Main Aisle</option>
                <option value="secondary-aisle">Secondary Aisle</option>
                <option value="emergency">Emergency</option>
              </select>
            </Field>

            <Field label={`Stroke Width — ${selectedPath.strokeWidth}px`} darkMode={darkMode} icon={<Ruler size={10} />}>
              <input
                type="range"
                min={1}
                max={20}
                className="w-full accent-indigo-500"
                value={selectedPath.strokeWidth}
                onChange={e => updatePath(selectedPath.id, { strokeWidth: parseInt(e.target.value) })}
              />
            </Field>

            <Field label="Color" darkMode={darkMode} icon={<Palette size={10} />}>
              <input
                type="color"
                className="w-full h-9 rounded-lg cursor-pointer border-0 p-0.5"
                value={selectedPath.color}
                onChange={e => updatePath(selectedPath.id, { color: e.target.value })}
              />
            </Field>

            <Field label="Label" darkMode={darkMode} icon={<FileText size={10} />}>
              <input
                className={inputClass}
                value={pathLabel}
                placeholder="Path label..."
                onChange={e => setPathLabel(e.target.value)}
                onBlur={() => updatePath(selectedPath.id, { label: pathLabel })}
              />
            </Field>

            <div className="flex items-center justify-between py-1">
              <label className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Arrow at End
              </label>
              <button
                onClick={() => updatePath(selectedPath.id, { arrowEnd: !selectedPath.arrowEnd })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                  selectedPath.arrowEnd ? 'bg-indigo-600' : darkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    selectedPath.arrowEnd ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </Section>
        </div>
      </div>
    );
  }

  // ── Render: Object ────────────────────────────────────────────────────────

  if (selectedObject) {
    return (
      <div className={panelClass}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-sm">Layout Object</h2>
              <p className={`text-xs mt-0.5 capitalize ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {selectedObject.type.replace(/-/g, ' ')}
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => updateObject(selectedObject.id, { locked: !selectedObject.locked })}
                className={actionBtn}
              >
                {selectedObject.locked
                  ? <Lock size={14} className="text-amber-400" />
                  : <Unlock size={14} />}
              </button>
              <button
                onClick={() => deleteObject(selectedObject.id)}
                className="p-1.5 rounded-lg transition-all hover:bg-red-50 text-red-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <Section title="Properties" darkMode={darkMode}>
            <Field label="Label" darkMode={darkMode} icon={<FileText size={10} />}>
              <input
                className={inputClass}
                value={objectLabel}
                onChange={e => setObjectLabel(e.target.value)}
                onBlur={() => updateObject(selectedObject.id, { label: objectLabel })}
              />
            </Field>
            <Field label="Color" darkMode={darkMode} icon={<Palette size={10} />}>
              <input
                type="color"
                className="w-full h-9 rounded-lg cursor-pointer border-0 p-0.5"
                value={selectedObject.color}
                onChange={e => updateObject(selectedObject.id, { color: e.target.value })}
              />
            </Field>
          </Section>

          <Section title="Dimensions" darkMode={darkMode}>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'X', value: Math.round(selectedObject.x) },
                { label: 'Y', value: Math.round(selectedObject.y) },
                { label: 'W', value: Math.round(selectedObject.width) },
                { label: 'H', value: Math.round(selectedObject.height) },
              ].map(dim => (
                <div
                  key={dim.label}
                  className={`p-2.5 rounded-xl ${darkMode ? 'bg-gray-700/60' : 'bg-gray-50'}`}
                >
                  <div className={`text-[10px] font-medium mb-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {dim.label}
                  </div>
                  <div className="font-mono font-semibold text-sm">
                    {dim.value}
                    <span className={`text-[10px] ml-0.5 font-normal ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>px</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    );
  }

  // ── Render: Overview (no selection) ──────────────────────────────────────

  return (
    <div className={panelClass}>
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30">
            <TrendingUp size={15} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Overview</h2>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Booth analytics</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Total', value: analytics.total, colorDot: '#6366f1' },
            { label: 'Available', value: analytics.available, colorDot: '#22c55e' },
            { label: 'Reserved', value: analytics.reserved, colorDot: '#eab308' },
            { label: 'Sold', value: analytics.sold, colorDot: '#ef4444' },
          ].map(stat => (
            <div
              key={stat.label}
              className={`p-3 rounded-xl border ${
                darkMode ? 'bg-gray-700/60 border-gray-700' : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: stat.colorDot }} />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Occupancy bar */}
        {analytics.total > 0 && (
          <div className="mb-4">
            <div className={`flex justify-between text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <span>Occupancy</span>
              <span>{Math.round((analytics.sold + analytics.reserved) / analytics.total * 100)}%</span>
            </div>
            <div className={`h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex h-full">
                <div
                  className="bg-red-500 transition-all duration-500"
                  style={{ width: `${(analytics.sold / analytics.total) * 100}%` }}
                />
                <div
                  className="bg-yellow-400 transition-all duration-500"
                  style={{ width: `${(analytics.reserved / analytics.total) * 100}%` }}
                />
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${(analytics.available / analytics.total) * 100}%` }}
                />
              </div>
            </div>
            <div className={`flex justify-between mt-1.5 text-[10px] font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <span>Sold {Math.round(analytics.sold / analytics.total * 100)}%</span>
              <span>Reserved {Math.round(analytics.reserved / analytics.total * 100)}%</span>
              <span>Free {Math.round(analytics.available / analytics.total * 100)}%</span>
            </div>
          </div>
        )}

        {/* Revenue */}
        {analytics.revenue > 0 && (
          <div
            className={`p-3.5 rounded-xl mb-4 border ${
              darkMode ? 'bg-gray-700/60 border-gray-700' : 'bg-green-50 border-green-100'
            }`}
          >
            <div className={`text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-green-700'}`}>
              Revenue (Sold)
            </div>
            <div className="text-2xl font-bold text-green-500">
              ${analytics.revenue.toLocaleString()}
            </div>
            {analytics.potential > 0 && (
              <div className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-green-600/70'}`}>
                of ${analytics.potential.toLocaleString()} potential
              </div>
            )}
          </div>
        )}

        {/* Getting started */}
        <div
          className={`p-3.5 rounded-xl border ${
            darkMode ? 'bg-gray-700/40 border-gray-700' : 'bg-indigo-50/80 border-indigo-100'
          }`}
        >
          <div className={`text-xs font-bold mb-2.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Getting Started
          </div>
          <ol className={`text-xs space-y-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {[
              ['1', <span>Select <strong>Booth</strong> tool and drag on canvas</span>],
              ['2', <span>Click a booth to assign a company</span>],
              ['3', <span>Use <strong>Path</strong> tool to add walkways</span>],
              ['4', <span>Export as PNG or PDF when done</span>],
            ].map(([num, text]) => (
              <li key={num as string} className="flex gap-2 items-start">
                <span
                  className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                    darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
                  }`}
                >
                  {num}
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
