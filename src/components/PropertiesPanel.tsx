import React from 'react';
import { Trash2, Copy, Lock, Unlock, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { BoothStatus } from '../types';

const STATUS_COLORS: Record<BoothStatus, string> = {
  available: '#22c55e',
  reserved: '#eab308',
  sold: '#ef4444',
};

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

  const analytics = useStore(s => s.getAnalytics()) as {
    total: number; available: number; reserved: number; sold: number; revenue: number; potential: number; categories: Record<string, number>;
  };

  const panelClass = `w-72 border-l overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`;
  const labelClass = `text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`;
  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  const selectedBooth = selectedElement?.kind === 'booth' ? booths.find(b => b.id === selectedElement.id) : null;
  const selectedPath = selectedElement?.kind === 'path' ? paths.find(p => p.id === selectedElement.id) : null;
  const selectedObject = selectedElement?.kind === 'object' ? objects.find(o => o.id === selectedElement.id) : null;

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-4">
      <div className={`text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b ${darkMode ? 'text-indigo-400 border-gray-700' : 'text-indigo-600 border-gray-100'}`}>
        {title}
      </div>
      {children}
    </div>
  );

  const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="mb-3">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );

  if (selectedBooth) {
    return (
      <div className={panelClass}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base">Booth Properties</h2>
            <div className="flex gap-1">
              <button
                onClick={() => updateBooth(selectedBooth.id, { locked: !selectedBooth.locked })}
                className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title={selectedBooth.locked ? 'Unlock' : 'Lock'}
              >
                {selectedBooth.locked ? <Lock size={15} className="text-amber-500" /> : <Unlock size={15} />}
              </button>
              <button
                onClick={() => duplicateBooth(selectedBooth.id)}
                className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Duplicate"
              >
                <Copy size={15} />
              </button>
              <button
                onClick={() => deleteBooth(selectedBooth.id)}
                className="p-1.5 rounded-lg transition-colors hover:bg-red-50 text-red-500"
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          <Section title="Identity">
            <Field label="Booth Number">
              <input
                className={inputClass}
                value={selectedBooth.number}
                onChange={e => updateBooth(selectedBooth.id, { number: e.target.value })}
              />
            </Field>
            <Field label="Status">
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
            <Field label="Custom Color">
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  className="w-10 h-9 rounded cursor-pointer border-0"
                  value={selectedBooth.color || STATUS_COLORS[selectedBooth.status]}
                  onChange={e => updateBooth(selectedBooth.id, { color: e.target.value })}
                />
                <button
                  className={`flex-1 py-2 px-3 text-xs rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => updateBooth(selectedBooth.id, { color: undefined })}
                >
                  Reset to Status Color
                </button>
              </div>
            </Field>
            <Field label="Price ($)">
              <input
                type="number"
                className={inputClass}
                value={selectedBooth.price || ''}
                placeholder="0"
                onChange={e => updateBooth(selectedBooth.id, { price: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </Field>
          </Section>

          <Section title="Company">
            <Field label="Company Name">
              <input
                className={inputClass}
                value={selectedBooth.company?.name || ''}
                placeholder="Enter company name"
                onChange={e => updateBooth(selectedBooth.id, { company: { ...selectedBooth.company, name: e.target.value, contactPerson: selectedBooth.company?.contactPerson || '', category: selectedBooth.company?.category || '', notes: selectedBooth.company?.notes || '' } })}
              />
            </Field>
            <Field label="Contact Person">
              <input
                className={inputClass}
                value={selectedBooth.company?.contactPerson || ''}
                placeholder="Contact person"
                onChange={e => updateBooth(selectedBooth.id, { company: { ...selectedBooth.company, name: selectedBooth.company?.name || '', contactPerson: e.target.value, category: selectedBooth.company?.category || '', notes: selectedBooth.company?.notes || '' } })}
              />
            </Field>
            <Field label="Category">
              <input
                className={inputClass}
                value={selectedBooth.company?.category || ''}
                placeholder="e.g. Technology, Food, Fashion"
                onChange={e => updateBooth(selectedBooth.id, { company: { ...selectedBooth.company, name: selectedBooth.company?.name || '', contactPerson: selectedBooth.company?.contactPerson || '', category: e.target.value, notes: selectedBooth.company?.notes || '' } })}
              />
            </Field>
            <Field label="Notes">
              <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                value={selectedBooth.company?.notes || ''}
                placeholder="Additional notes..."
                onChange={e => updateBooth(selectedBooth.id, { company: { ...selectedBooth.company, name: selectedBooth.company?.name || '', contactPerson: selectedBooth.company?.contactPerson || '', category: selectedBooth.company?.category || '', notes: e.target.value } })}
              />
            </Field>
          </Section>

          <Section title="Dimensions">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: 'X', value: Math.round(selectedBooth.x) },
                { label: 'Y', value: Math.round(selectedBooth.y) },
                { label: 'Width', value: Math.round(selectedBooth.width) },
                { label: 'Height', value: Math.round(selectedBooth.height) },
              ].map(dim => (
                <div key={dim.label} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{dim.label}</div>
                  <div className="font-mono font-semibold">{dim.value}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    );
  }

  if (selectedPath) {
    return (
      <div className={panelClass}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base">Path Properties</h2>
            <div className="flex gap-1">
              <button
                onClick={() => updatePath(selectedPath.id, { locked: !selectedPath.locked })}
                className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {selectedPath.locked ? <Lock size={15} className="text-amber-500" /> : <Unlock size={15} />}
              </button>
              <button
                onClick={() => deletePath(selectedPath.id)}
                className="p-1.5 rounded-lg transition-colors hover:bg-red-50 text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          <Section title="Style">
            <Field label="Path Style">
              <select
                className={inputClass}
                value={selectedPath.style}
                onChange={e => updatePath(selectedPath.id, { style: e.target.value as 'main-aisle' | 'secondary-aisle' | 'emergency' })}
              >
                <option value="main-aisle">Main Aisle</option>
                <option value="secondary-aisle">Secondary Aisle</option>
                <option value="emergency">Emergency</option>
              </select>
            </Field>
            <Field label="Stroke Width">
              <input
                type="range" min={1} max={20}
                className="w-full"
                value={selectedPath.strokeWidth}
                onChange={e => updatePath(selectedPath.id, { strokeWidth: parseInt(e.target.value) })}
              />
              <div className="text-xs text-right">{selectedPath.strokeWidth}px</div>
            </Field>
            <Field label="Color">
              <input
                type="color"
                className="w-full h-9 rounded cursor-pointer"
                value={selectedPath.color}
                onChange={e => updatePath(selectedPath.id, { color: e.target.value })}
              />
            </Field>
            <Field label="Label">
              <input
                className={inputClass}
                value={selectedPath.label || ''}
                placeholder="Path label..."
                onChange={e => updatePath(selectedPath.id, { label: e.target.value })}
              />
            </Field>
            <div className="flex items-center justify-between">
              <label className={labelClass}>Arrow at End</label>
              <button
                onClick={() => updatePath(selectedPath.id, { arrowEnd: !selectedPath.arrowEnd })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${selectedPath.arrowEnd ? 'bg-indigo-600' : darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selectedPath.arrowEnd ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </Section>
        </div>
      </div>
    );
  }

  if (selectedObject) {
    return (
      <div className={panelClass}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base">Object Properties</h2>
            <div className="flex gap-1">
              <button
                onClick={() => updateObject(selectedObject.id, { locked: !selectedObject.locked })}
                className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {selectedObject.locked ? <Lock size={15} className="text-amber-500" /> : <Unlock size={15} />}
              </button>
              <button
                onClick={() => deleteObject(selectedObject.id)}
                className="p-1.5 rounded-lg transition-colors hover:bg-red-50 text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          <Section title="Properties">
            <Field label="Label">
              <input
                className={inputClass}
                value={selectedObject.label}
                onChange={e => updateObject(selectedObject.id, { label: e.target.value })}
              />
            </Field>
            <Field label="Color">
              <input
                type="color"
                className="w-full h-9 rounded cursor-pointer"
                value={selectedObject.color}
                onChange={e => updateObject(selectedObject.id, { color: e.target.value })}
              />
            </Field>
          </Section>
        </div>
      </div>
    );
  }

  // No selection - show analytics summary
  return (
    <div className={panelClass}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-indigo-500" />
          <h2 className="font-bold text-base">Overview</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Total', value: analytics.total, color: 'bg-indigo-500' },
            { label: 'Available', value: analytics.available, color: 'bg-green-500' },
            { label: 'Reserved', value: analytics.reserved, color: 'bg-yellow-500' },
            { label: 'Sold', value: analytics.sold, color: 'bg-red-500' },
          ].map(stat => (
            <div key={stat.label} className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`w-2 h-2 rounded-full ${stat.color} mb-2`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {analytics.total > 0 && (
          <div className="mb-4">
            <div className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Occupancy</div>
            <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex h-full">
                <div className="bg-red-500 transition-all" style={{ width: `${(analytics.sold / analytics.total) * 100}%` }} />
                <div className="bg-yellow-500 transition-all" style={{ width: `${(analytics.reserved / analytics.total) * 100}%` }} />
                <div className="bg-green-500 transition-all" style={{ width: `${(analytics.available / analytics.total) * 100}%` }} />
              </div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Sold {analytics.total > 0 ? Math.round(analytics.sold / analytics.total * 100) : 0}%</span>
              <span>Free {analytics.total > 0 ? Math.round(analytics.available / analytics.total * 100) : 0}%</span>
            </div>
          </div>
        )}

        {analytics.revenue > 0 && (
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} mb-4`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Revenue (Sold)</div>
            <div className="text-xl font-bold text-green-500">${analytics.revenue.toLocaleString()}</div>
            {analytics.potential > 0 && (
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>of ${analytics.potential.toLocaleString()} potential</div>
            )}
          </div>
        )}

        <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Getting Started</div>
          <div className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>1. Select the <strong>Booth</strong> tool and drag on canvas to create booths</p>
            <p>2. Click a booth to assign a company</p>
            <p>3. Use <strong>Path</strong> tool to add walkways</p>
            <p>4. Export as PNG or PDF when done</p>
          </div>
        </div>
      </div>
    </div>
  );
};
