import { useState } from 'react';
import {
  Zap, Cable, Cpu, AlertTriangle, BookOpen,
  FlaskConical, ChevronDown, ChevronRight, BookMarked,
  LayoutDashboard,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    section: 'Calculators',
    icon: <FlaskConical size={14} />,
    items: [
      { id: 'transformer', label: 'Transformer Fault Current', icon: <Zap size={14} /> },
      { id: 'cable',       label: 'Cable Impedance & VD',      icon: <Cable size={14} /> },
      { id: 'motor',       label: 'Motor Contribution',        icon: <Cpu size={14} /> },
      { id: 'arcflash',    label: 'Incident Energy',           icon: <AlertTriangle size={14} /> },
    ],
  },
  {
    section: 'Quick Reference',
    icon: <BookOpen size={14} />,
    items: [
      { id: 'ref-equipment',  label: 'Equipment Bus Ratings',    icon: <LayoutDashboard size={14} /> },
      { id: 'ref-ppe',        label: 'PPE Categories',           icon: <AlertTriangle size={14} /> },
      { id: 'ref-approach',   label: 'Approach Boundaries',      icon: <BookMarked size={14} /> },
      { id: 'ref-protective', label: 'Protective Device Times',  icon: <Zap size={14} /> },
    ],
  },
  {
    section: 'History',
    icon: <BookMarked size={14} />,
    items: [
      { id: 'saved', label: 'Saved Calculations', icon: <BookMarked size={14} /> },
    ],
  },
];

export default function Sidebar({ active, onSelect, savedCount }) {
  const [collapsed, setCollapsed] = useState({});

  const toggle = (section) =>
    setCollapsed((c) => ({ ...c, [section]: !c[section] }));

  return (
    <aside className="w-56 shrink-0 bg-[#13151c] border-r border-slate-800 flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-800">
        <div className="bg-amber-500 rounded p-1">
          <svg viewBox="0 0 20 26" className="w-4 h-5" fill="none">
            <polygon
              points="11,1 2,14 8,14 8,25 18,12 12,12"
              fill="#0f1117"
              strokeWidth="0"
            />
          </svg>
        </div>
        <div>
          <div className="text-amber-400 font-bold text-xs leading-tight">ARC FLASH</div>
          <div className="text-slate-500 text-[10px] leading-tight">QUICK REFERENCE</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide">
        {NAV_ITEMS.map(({ section, icon, items }) => (
          <div key={section} className="mb-1">
            <button
              className="flex items-center justify-between w-full px-4 py-2 text-[10px] font-bold tracking-widest text-slate-500 hover:text-slate-400 uppercase"
              onClick={() => toggle(section)}
            >
              <span className="flex items-center gap-1.5">{icon} {section}</span>
              {collapsed[section] ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
            </button>
            {!collapsed[section] && (
              <div className="ml-1">
                {items.map(({ id, label, icon: itemIcon }) => (
                  <button
                    key={id}
                    onClick={() => onSelect(id)}
                    className={`
                      flex items-center gap-2 w-full px-4 py-2 text-xs rounded-l-none rounded-r-md transition-all
                      ${active === id
                        ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent'
                      }
                    `}
                  >
                    <span className={active === id ? 'text-amber-500' : 'text-slate-600'}>
                      {itemIcon}
                    </span>
                    <span className="truncate">{label}</span>
                    {id === 'saved' && savedCount > 0 && (
                      <span className="ml-auto bg-amber-500/20 text-amber-400 text-[9px] font-mono px-1.5 py-0.5 rounded-full">
                        {savedCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800">
        <p className="text-[9px] text-slate-600 leading-relaxed">
          IEEE 1584 · NEC 2023<br />
          NFPA 70E 2021 · For reference only.
        </p>
      </div>
    </aside>
  );
}
