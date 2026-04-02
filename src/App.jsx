import { useState, useEffect, useCallback } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Sidebar from './components/Sidebar';
import TransformerFaultCurrent from './calculators/TransformerFaultCurrent';
import CableImpedance from './calculators/CableImpedance';
import MotorContribution from './calculators/MotorContribution';
import IncidentEnergy from './calculators/IncidentEnergy';
import QuickReference from './quickref/QuickReference';
import SavedCalculations from './pages/SavedCalculations';
import { Menu, X } from 'lucide-react';

const STORAGE_KEY = 'arc-flash-calc-history';

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

const QUICK_REF_IDS = new Set(['ref-equipment', 'ref-ppe', 'ref-approach', 'ref-protective']);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('transformer');
  const [saved, setSaved] = useState(loadSaved);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persist saved calculations
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  const handleSave = useCallback((calc) => {
    setSaved((prev) => [...prev, calc]);
  }, []);

  const handleDelete = useCallback((index) => {
    setSaved((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClear = useCallback(() => {
    setSaved([]);
  }, []);

  const handleSelect = (id) => {
    setActive(id);
    setSidebarOpen(false);
  };

  const isQuickRef = QUICK_REF_IDS.has(active);

  const renderContent = () => {
    if (isQuickRef) return <QuickReference activeTab={active} />;
    switch (active) {
      case 'transformer': return <TransformerFaultCurrent onSave={handleSave} />;
      case 'cable':       return <CableImpedance onSave={handleSave} />;
      case 'motor':       return <MotorContribution onSave={handleSave} />;
      case 'arcflash':    return <IncidentEnergy onSave={handleSave} />;
      case 'saved':       return <SavedCalculations saved={saved} onDelete={handleDelete} onClear={handleClear} />;
      default:            return <TransformerFaultCurrent onSave={handleSave} />;
    }
  };

  if (loading) {
    return <LoadingScreen onDone={() => setLoading(false)} />;
  }

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 lg:z-auto
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar active={active} onSelect={handleSelect} savedCount={saved.length} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0f1117] shrink-0">
          <button
            className="lg:hidden text-slate-400 hover:text-amber-400 transition-colors p-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] text-slate-600 tracking-widest uppercase">
              IEEE 1584 · NEC 2023 · NFPA 70E 2021
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-result text-slate-700">
              {saved.length > 0 ? `${saved.length} saved` : 'No saved calcs'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
