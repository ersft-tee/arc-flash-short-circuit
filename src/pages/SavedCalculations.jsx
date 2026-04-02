import { useState } from 'react';
import { BookMarked, Trash2, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { SectionHeader } from '../components/ui';
import { exportTransformerPDF, exportCablePDF, exportMotorPDF, exportArcFlashPDF } from '../utils/pdfExport';

function fmt(n, dec = 3) {
  if (n == null || isNaN(n)) return '—';
  if (typeof n === 'string') return n;
  return n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

const TYPE_COLORS = {
  'Transformer Fault Current': 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  'Cable Impedance & Voltage Drop': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  'Motor Contribution': 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  'Arc Flash Incident Energy': 'bg-red-500/10 border-red-500/20 text-red-400',
};

function ResultSummary({ calc }) {
  const { type, inputs, results, combinedKA } = calc;

  if (type === 'Transformer Fault Current') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <Metric label="kVA" value={inputs.kva} unit="kVA" />
        <Metric label="Secondary" value={inputs.vSecondary} unit="V" />
        <Metric label="%Z" value={inputs.zPercent} unit="%" />
        <Metric label="Fault Current" value={fmt(results.iscFinalKA, 2)} unit="kA" highlight />
      </div>
    );
  }
  if (type === 'Cable Impedance & Voltage Drop') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <Metric label="Size" value={inputs.size} />
        <Metric label="Length" value={inputs.lengthFt} unit="ft" />
        <Metric label="Load" value={inputs.loadAmps} unit="A" />
        <Metric label="VD%" value={fmt(results?.vdPct, 2)} unit="%" highlight pass={results?.vdPct <= (inputs.isFeeder ? 5 : 3)} />
      </div>
    );
  }
  if (type === 'Motor Contribution') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <Metric label="HP" value={inputs.hp} unit="HP" />
        <Metric label="Voltage" value={inputs.voltage} unit="V" />
        <Metric label="FLA" value={fmt(results.fla, 1)} unit="A" />
        <Metric label="Contribution" value={fmt(results.contributionKA, 3)} unit="kA" highlight />
      </div>
    );
  }
  if (type === 'Arc Flash Incident Energy') {
    const cats = ['Below Threshold', 'CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'DANGEROUS'];
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <Metric label="Fault Current" value={inputs.ibfKA} unit="kA" />
        <Metric label="Voltage" value={`${(inputs.voltageKV * 1000).toFixed(0)}V`} />
        <Metric label="Arc Duration" value={inputs.durationCycles} unit="cycles" />
        <Metric label="Incident Energy" value={fmt(results.incidentEnergyCalCm2, 2)} unit="cal/cm²" highlight danger={results.ppeCategory >= 3} />
      </div>
    );
  }
  return null;
}

function Metric({ label, value, unit, highlight, pass, danger }) {
  return (
    <div className="bg-slate-800/50 rounded-lg px-3 py-2">
      <div className="text-[10px] text-slate-600 mb-0.5">{label}</div>
      <div className={`font-mono-result font-bold text-sm ${
        danger ? 'text-red-400' :
        highlight ? (pass === false ? 'text-red-400' : pass === true ? 'text-emerald-400' : 'text-amber-400') :
        'text-slate-300'
      }`}>
        {value} {unit && <span className="text-[10px] text-slate-600 font-normal">{unit}</span>}
      </div>
    </div>
  );
}

function CalcCard({ calc, onDelete, index }) {
  const [expanded, setExpanded] = useState(false);
  const typeColor = TYPE_COLORS[calc.type] || 'bg-slate-800 border-slate-700 text-slate-400';
  const date = new Date(calc.timestamp);

  const handleExport = () => {
    const { type, inputs, results, combinedKA } = calc;
    if (type === 'Transformer Fault Current') exportTransformerPDF(inputs, results);
    else if (type === 'Cable Impedance & Voltage Drop') exportCablePDF(inputs, results);
    else if (type === 'Motor Contribution') exportMotorPDF(inputs, results, combinedKA);
    else if (type === 'Arc Flash Incident Energy') exportArcFlashPDF(inputs, results);
  };

  return (
    <div className="bg-[#13151c] border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${typeColor}`}>
            {calc.type}
          </span>
          <span className="text-[10px] text-slate-600 shrink-0">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button
            onClick={handleExport}
            className="text-amber-400 hover:text-amber-300 p-1.5 rounded hover:bg-amber-500/10 transition-colors"
            title="Export PDF"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => onDelete(index)}
            className="text-slate-600 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-slate-500 p-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      <ResultSummary calc={calc} />

      {expanded && (
        <div className="border-t border-slate-800 p-4 mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Inputs</div>
              <div className="space-y-1">
                {Object.entries(calc.inputs).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[11px]">
                    <span className="text-slate-600">{k}:</span>
                    <span className="font-mono-result text-slate-400">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Results</div>
              <div className="space-y-1">
                {calc.results && Object.entries(calc.results).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[11px]">
                    <span className="text-slate-600">{k}:</span>
                    <span className="font-mono-result text-amber-400">
                      {typeof v === 'number' ? v.toFixed(4) : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SavedCalculations({ saved, onDelete, onClear }) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <SectionHeader
        title="Saved Calculations"
        subtitle="Calculation history stored in browser localStorage"
        icon={BookMarked}
      />

      {saved.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <BookMarked size={40} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm">No saved calculations yet.</p>
          <p className="text-xs mt-1">Use the Save button in any calculator to save results here.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-slate-500">{saved.length} calculation{saved.length !== 1 ? 's' : ''} saved</div>
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-xs text-slate-600 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400">Delete all?</span>
                <button onClick={onClear} className="text-xs text-red-400 font-bold hover:text-red-300">Yes</button>
                <button onClick={() => setConfirmClear(false)} className="text-xs text-slate-500">Cancel</button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {[...saved].reverse().map((calc, i) => (
              <CalcCard
                key={saved.length - 1 - i}
                calc={calc}
                index={saved.length - 1 - i}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
