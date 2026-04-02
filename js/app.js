import React from 'react';
import { createRoot } from 'react-dom/client';
import { html } from 'htm/react';
import { TransformerFaultCurrent, CableImpedance, MotorContribution, IncidentEnergy } from './calculators.js';
import { QuickReference } from './quickref.js';
import { exportTransformerPDF, exportCablePDF, exportMotorPDF, exportArcFlashPDF } from './pdf.js';

const { useState, useEffect, useCallback } = React;
const STORAGE_KEY = 'arc-flash-calc-history';
const QUICK_REF = new Set(['ref-equipment','ref-ppe','ref-approach','ref-protective']);

// ─── Loading Screen ──────────────────────────────────────────────────────────

function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('Initializing...');

  useEffect(() => {
    const phases = [[0,'Loading IEEE 1584 tables...'],[25,'Importing NEC conductor data...'],
      [55,'Building calculator engine...'],[80,'Rendering PPE reference tables...'],[95,'Ready']];
    let i = 0;
    const t = setInterval(() => {
      if (i < phases.length) { setProgress(phases[i][0]); setPhase(phases[i][1]); i++; }
      else { setProgress(100); clearInterval(t); setTimeout(onDone, 400); }
    }, 280);
    return () => clearInterval(t);
  }, [onDone]);

  return html`
    <div class="fixed inset-0 bg-[#0f1117] flex flex-col items-center justify-center z-50">
      <div class="relative mb-8">
        <div class="absolute inset-0 blur-3xl opacity-30 bg-amber-500 rounded-full scale-150"></div>
        <svg viewBox="0 0 60 80" class="w-20 h-24 relative animate-pulse" fill="none">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fbbf24"/>
              <stop offset="100%" stop-color="#d97706"/>
            </linearGradient>
          </defs>
          <polygon points="34,2 6,44 26,44 26,78 54,36 34,36"
            fill="url(#bg)" stroke="#fcd34d" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-amber-400 tracking-wider mb-1">ARC FLASH CALCULATOR</h1>
      <p class="text-slate-500 text-sm mb-10 tracking-widest">IEEE 1584 · NEC · NFPA 70E</p>
      <div class="w-72 bg-slate-800 rounded-full h-1.5 overflow-hidden mb-3">
        <div class="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
          style=${{ width: `${progress}%` }}></div>
      </div>
      <p class="text-slate-500 text-xs mono">${phase}</p>
    </div>`;
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV = [
  { section:'Calculators', items:[
    { id:'transformer', label:'Transformer Fault Current', icon:'⚡' },
    { id:'cable',       label:'Cable Impedance & VD',      icon:'🔌' },
    { id:'motor',       label:'Motor Contribution',        icon:'⚙' },
    { id:'arcflash',    label:'Incident Energy',           icon:'⚠' },
  ]},
  { section:'Quick Reference', items:[
    { id:'ref-equipment',  label:'Equipment Bus Ratings',   icon:'🔲' },
    { id:'ref-ppe',        label:'PPE Categories',          icon:'🛡' },
    { id:'ref-approach',   label:'Approach Boundaries',     icon:'📏' },
    { id:'ref-protective', label:'Protective Device Times', icon:'⏱' },
  ]},
  { section:'History', items:[
    { id:'saved', label:'Saved Calculations', icon:'📋' },
  ]},
];

function Sidebar({ active, onSelect, savedCount }) {
  const [collapsed, setCollapsed] = useState({});
  const toggle = s => setCollapsed(c => ({ ...c, [s]: !c[s] }));

  return html`
    <aside class="w-56 shrink-0 bg-[#13151c] border-r border-slate-800 flex flex-col h-full">
      <div class="flex items-center gap-2 px-4 py-4 border-b border-slate-800">
        <div class="bg-amber-500 rounded p-1 text-black text-xs font-black leading-none">⚡</div>
        <div>
          <div class="text-amber-400 font-bold text-xs leading-tight">ARC FLASH</div>
          <div class="text-slate-500 text-[10px] leading-tight">QUICK REFERENCE</div>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto py-2 scrollbar-hide">
        ${NAV.map(({ section, items }) => html`
          <div key=${section} class="mb-1">
            <button class="flex items-center justify-between w-full px-4 py-2 text-[10px] font-bold tracking-widest text-slate-500 hover:text-slate-400 uppercase"
              onClick=${() => toggle(section)}>
              <span>${section}</span>
              <span>${collapsed[section] ? '›' : '∨'}</span>
            </button>
            ${!collapsed[section] && html`
              <div class="ml-1">
                ${items.map(({ id, label, icon }) => html`
                  <button key=${id} onClick=${() => onSelect(id)}
                    class=${`flex items-center gap-2 w-full px-4 py-2 text-xs rounded-r-md transition-all border-l-2 ${
                      active===id
                        ?'bg-amber-500/10 text-amber-400 border-amber-500 font-semibold'
                        :'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'}`}>
                    <span class=${active===id?'text-amber-500':'text-slate-600'}>${icon}</span>
                    <span class="truncate">${label}</span>
                    ${id==='saved' && savedCount > 0 && html`
                      <span class="ml-auto bg-amber-500/20 text-amber-400 text-[9px] mono px-1.5 py-0.5 rounded-full">
                        ${savedCount}
                      </span>`}
                  </button>`)}
              </div>`}
          </div>`)}
      </nav>

      <div class="px-4 py-3 border-t border-slate-800">
        <p class="text-[9px] text-slate-600 leading-relaxed">
          IEEE 1584 · NEC 2023<br/>NFPA 70E 2021 · For reference only.
        </p>
      </div>
    </aside>`;
}

// ─── Saved Calculations ───────────────────────────────────────────────────────

const TYPE_COL = {
  'Transformer Fault Current':    'bg-amber-500/10 border-amber-500/20 text-amber-400',
  'Cable Impedance & Voltage Drop':'bg-blue-500/10 border-blue-500/20 text-blue-400',
  'Motor Contribution':           'bg-purple-500/10 border-purple-500/20 text-purple-400',
  'Arc Flash Incident Energy':    'bg-red-500/10 border-red-500/20 text-red-400',
};

function Metric({ label, value, unit, amber, pass, danger }) {
  const col = danger?'text-red-400':pass===false?'text-red-400':pass===true?'text-emerald-400':amber?'text-amber-400':'text-slate-300';
  return html`
    <div class="bg-slate-800/50 rounded-lg px-3 py-2">
      <div class="text-[10px] text-slate-600 mb-0.5">${label}</div>
      <div class=${`mono font-bold text-sm ${col}`}>
        ${value}${unit && html` <span class="text-[10px] text-slate-600 font-normal">${unit}</span>`}
      </div>
    </div>`;
}

function CalcCard({ calc, onDelete, index }) {
  const [expanded, setExpanded] = useState(false);
  const { type, inputs, results, combinedKA, timestamp } = calc;
  const date = new Date(timestamp);

  const handleExport = () => {
    if (type==='Transformer Fault Current') exportTransformerPDF(inputs, results);
    else if (type==='Cable Impedance & Voltage Drop') exportCablePDF(inputs, results);
    else if (type==='Motor Contribution') exportMotorPDF(inputs, results, combinedKA);
    else if (type==='Arc Flash Incident Energy') exportArcFlashPDF(inputs, results);
  };

  const summary = () => {
    if (type==='Transformer Fault Current') return html`<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
      ${Metric({ label:'kVA', value:inputs.kva, unit:'kVA' })}
      ${Metric({ label:'Secondary', value:inputs.vSecondary, unit:'V' })}
      ${Metric({ label:'%Z', value:inputs.zPercent, unit:'%' })}
      ${Metric({ label:'Fault Current', value:results.iscFinalKA?.toFixed(2), unit:'kA', amber:true })}
    </div>`;
    if (type==='Cable Impedance & Voltage Drop') {
      const limit = inputs.isFeeder ? 5 : 3;
      return html`<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        ${Metric({ label:'Size', value:inputs.size })}
        ${Metric({ label:'Length', value:inputs.lengthFt, unit:'ft' })}
        ${Metric({ label:'Load', value:inputs.loadAmps, unit:'A' })}
        ${Metric({ label:'VD%', value:results?.vdPct?.toFixed(2), unit:'%', pass:results?.vdPct<=limit })}
      </div>`;
    }
    if (type==='Motor Contribution') return html`<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
      ${Metric({ label:'HP', value:inputs.hp, unit:'HP' })}
      ${Metric({ label:'Voltage', value:inputs.voltage, unit:'V' })}
      ${Metric({ label:'FLA', value:results.fla?.toFixed(1), unit:'A' })}
      ${Metric({ label:'Contribution', value:results.contributionKA?.toFixed(3), unit:'kA', amber:true })}
    </div>`;
    if (type==='Arc Flash Incident Energy') return html`<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
      ${Metric({ label:'Fault', value:inputs.ibfKA, unit:'kA' })}
      ${Metric({ label:'Voltage', value:`${(inputs.voltageKV*1000).toFixed(0)}V` })}
      ${Metric({ label:'Duration', value:inputs.durationCycles, unit:'cyc' })}
      ${Metric({ label:'Energy', value:results.incidentEnergyCalCm2?.toFixed(2), unit:'cal/cm²', danger:results.ppeCategory>=3 })}
    </div>`;
    return null;
  };

  return html`
    <div class="bg-[#13151c] border border-slate-800 rounded-xl overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-3 min-w-0">
          <span class=${`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${TYPE_COL[type]||''}`}>${type}</span>
          <span class="text-[10px] text-slate-600 shrink-0">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span>
        </div>
        <div class="flex items-center gap-1 shrink-0 ml-3">
          <button onClick=${handleExport} title="Export PDF"
            class="text-amber-400 hover:text-amber-300 px-2 py-1.5 rounded hover:bg-amber-500/10 text-xs transition-colors">↓ PDF</button>
          <button onClick=${() => onDelete(index)} title="Delete"
            class="text-slate-600 hover:text-red-400 px-2 py-1.5 rounded hover:bg-red-500/10 text-xs transition-colors">✕</button>
          <button onClick=${() => setExpanded(e => !e)}
            class="text-slate-500 px-2 py-1.5 rounded hover:bg-slate-800 text-xs transition-colors">
            ${expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      ${summary()}
      ${expanded && html`
        <div class="border-t border-slate-800 p-4 mt-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Inputs</div>
              ${Object.entries(inputs).map(([k,v]) => html`
                <div key=${k} class="flex justify-between text-[11px] mb-0.5">
                  <span class="text-slate-600">${k}:</span>
                  <span class="mono text-slate-400">${String(v)}</span>
                </div>`)}
            </div>
            <div>
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Results</div>
              ${results && Object.entries(results).map(([k,v]) => html`
                <div key=${k} class="flex justify-between text-[11px] mb-0.5">
                  <span class="text-slate-600">${k}:</span>
                  <span class="mono text-amber-400">${typeof v==='number'?v.toFixed(4):String(v)}</span>
                </div>`)}
            </div>
          </div>
        </div>`}
    </div>`;
}

function SavedCalculations({ saved, onDelete, onClear }) {
  const [confirmClear, setConfirmClear] = useState(false);
  return html`
    <div class="max-w-4xl mx-auto">
      <div class="flex items-start gap-3 mb-6">
        <div class="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 shrink-0 text-amber-400 text-lg">📋</div>
        <div>
          <h2 class="text-lg font-bold text-slate-100">Saved Calculations</h2>
          <p class="text-xs text-slate-500 mt-0.5">Calculation history stored in browser localStorage</p>
        </div>
      </div>

      ${saved.length === 0 ? html`
        <div class="text-center py-16 text-slate-600">
          <div class="text-4xl mb-4 opacity-20">📋</div>
          <p class="text-sm">No saved calculations yet.</p>
          <p class="text-xs mt-1">Use the Save button in any calculator to save results here.</p>
        </div>
      ` : html`<div>
        <div class="flex items-center justify-between mb-4">
          <div class="text-xs text-slate-500">${saved.length} calculation${saved.length!==1?'s':''} saved</div>
          ${!confirmClear ? html`
            <button onClick=${() => setConfirmClear(true)} class="text-xs text-slate-600 hover:text-red-400 transition-colors">Clear all</button>
          ` : html`
            <div class="flex items-center gap-2">
              <span class="text-xs text-red-400">Delete all?</span>
              <button onClick=${onClear} class="text-xs text-red-400 font-bold hover:text-red-300">Yes</button>
              <button onClick=${() => setConfirmClear(false)} class="text-xs text-slate-500">Cancel</button>
            </div>`}
        </div>
        <div class="space-y-3">
          ${[...saved].reverse().map((calc,i) => CalcCard({
            calc, index: saved.length-1-i,
            onDelete,
            key: saved.length-1-i,
          }))}
        </div>
      </div>`}
    </div>`;
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function App() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('transformer');
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  const handleSave = useCallback(calc => setSaved(p => [...p, calc]), []);
  const handleDelete = useCallback(i => setSaved(p => p.filter((_,j) => j!==i)), []);
  const handleClear = useCallback(() => setSaved([]), []);
  const handleSelect = id => { setActive(id); setSidebarOpen(false); };

  const renderContent = () => {
    if (QUICK_REF.has(active)) return html`${QuickReference({ activeTab:active })}`;
    if (active==='transformer') return html`${TransformerFaultCurrent({ onSave:handleSave })}`;
    if (active==='cable')       return html`${CableImpedance({ onSave:handleSave })}`;
    if (active==='motor')       return html`${MotorContribution({ onSave:handleSave })}`;
    if (active==='arcflash')    return html`${IncidentEnergy({ onSave:handleSave })}`;
    if (active==='saved')       return html`${SavedCalculations({ saved, onDelete:handleDelete, onClear:handleClear })}`;
    return html`${TransformerFaultCurrent({ onSave:handleSave })}`;
  };

  if (loading) return html`${LoadingScreen({ onDone:() => setLoading(false) })}`;

  return html`
    <div class="flex h-screen bg-[#0f1117] overflow-hidden">
      ${sidebarOpen && html`
        <div class="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick=${() => setSidebarOpen(false)}></div>`}

      <div class=${`fixed lg:static inset-y-0 left-0 z-40 lg:z-auto transform transition-transform duration-200
        ${sidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}>
        ${Sidebar({ active, onSelect:handleSelect, savedCount:saved.length })}
      </div>

      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header class="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0f1117] shrink-0">
          <button class="lg:hidden text-slate-400 hover:text-amber-400 transition-colors text-xl"
            onClick=${() => setSidebarOpen(o => !o)}>
            ${sidebarOpen ? '✕' : '☰'}
          </button>
          <div class="hidden lg:flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            <span class="text-[10px] text-slate-600 tracking-widest uppercase">IEEE 1584 · NEC 2023 · NFPA 70E 2021</span>
          </div>
          <span class="text-[10px] mono text-slate-700">${saved.length > 0 ? `${saved.length} saved` : 'No saved calcs'}</span>
        </header>
        <main class="flex-1 overflow-y-auto p-4 md:p-6">${renderContent()}</main>
      </div>
    </div>`;
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')).render(html`${React.createElement(App)}`);
