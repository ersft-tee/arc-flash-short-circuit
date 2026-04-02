import { useState } from 'react';
import { Zap } from 'lucide-react';
import { calcTransformerFault } from '../utils/calculations';
import { exportTransformerPDF } from '../utils/pdfExport';
import {
  InputField, SelectField, Toggle, ResultRow, ResultCard, Badge,
  SectionHeader, SaveButton, ExportButton, InfoBox,
} from '../components/ui';

const PRESETS = [
  { kva: 45,   label: '45 kVA'   },
  { kva: 75,   label: '75 kVA'   },
  { kva: 112.5,label: '112.5 kVA'},
  { kva: 150,  label: '150 kVA'  },
  { kva: 225,  label: '225 kVA'  },
  { kva: 300,  label: '300 kVA'  },
  { kva: 500,  label: '500 kVA'  },
  { kva: 750,  label: '750 kVA'  },
  { kva: 1000, label: '1000 kVA' },
  { kva: 1500, label: '1500 kVA' },
  { kva: 2000, label: '2000 kVA' },
  { kva: 2500, label: '2500 kVA' },
];

const COMMON_VOLTAGES = [
  { value: '208',  label: '208 V' },
  { value: '240',  label: '240 V' },
  { value: '277',  label: '277 V' },
  { value: '480',  label: '480 V' },
  { value: '600',  label: '600 V' },
  { value: '2400', label: '2,400 V' },
  { value: '4160', label: '4,160 V' },
  { value: '12470',label: '12,470 V' },
  { value: '13200',label: '13,200 V' },
  { value: '13800',label: '13,800 V' },
];

const DEFAULT = {
  kva: 500, vPrimary: 12470, vSecondary: 480, zPercent: 4.0,
  phases: '3', useUtility: false, utilityFaultKA: 0,
};

function fmt(n, dec = 1) {
  if (n == null || isNaN(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export default function TransformerFaultCurrent({ onSave }) {
  const [inputs, setInputs] = useState(DEFAULT);

  const set = (key) => (val) => setInputs((p) => ({ ...p, [key]: val }));

  const phases = parseInt(inputs.phases);
  const utilityFaultKA = inputs.useUtility ? inputs.utilityFaultKA : null;

  const results = calcTransformerFault({
    kva: inputs.kva,
    vPrimary: inputs.vPrimary,
    vSecondary: inputs.vSecondary,
    zPercent: inputs.zPercent,
    phases,
    utilityFaultKA,
  });

  const handleSave = () => {
    onSave({
      type: 'Transformer Fault Current',
      inputs: { ...inputs },
      results,
      timestamp: Date.now(),
    });
  };

  const handleExport = () => {
    exportTransformerPDF(
      { ...inputs, phases, utilityFaultKA },
      results,
    );
  };

  // Indicate high fault level
  const iscKA = results.iscFinalKA;
  const faultLevel =
    iscKA >= 65 ? { label: '>65 kA — Verify bus rating!', color: 'red' } :
    iscKA >= 42 ? { label: '42–65 kA range', color: 'orange' } :
    iscKA >= 22 ? { label: '22–42 kA range', color: 'yellow' } :
    iscKA >= 14 ? { label: '14–22 kA range', color: 'yellow' } :
    { label: '≤14 kA range', color: 'green' };

  return (
    <div className="max-w-5xl mx-auto">
      <SectionHeader
        title="Transformer Fault Current Calculator"
        subtitle="Full-load amps and available symmetrical fault current at transformer secondary"
        icon={Zap}
      />

      {/* Preset chips */}
      <div className="mb-5">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-semibold">
          Common Transformer Sizes
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.kva}
              onClick={() => set('kva')(p.kva)}
              className={`text-xs px-2.5 py-1 rounded border transition-all ${
                inputs.kva === p.kva
                  ? 'bg-amber-500 border-amber-500 text-black font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-amber-500/50 hover:text-amber-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="bg-[#13151c] border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Transformer Parameters</h3>

            <InputField label="kVA Rating" unit="kVA" value={inputs.kva} onChange={set('kva')} min={1} step={0.5} />

            <SelectField
              label="Phase Configuration"
              value={inputs.phases}
              onChange={set('phases')}
              options={[
                { value: '3', label: '3-Phase (Delta or Wye)' },
                { value: '1', label: '1-Phase' },
              ]}
            />

            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Primary Voltage"
                value={String(inputs.vPrimary)}
                onChange={(v) => set('vPrimary')(parseInt(v))}
                options={COMMON_VOLTAGES}
              />
              <SelectField
                label="Secondary Voltage"
                value={String(inputs.vSecondary)}
                onChange={(v) => set('vSecondary')(parseInt(v))}
                options={COMMON_VOLTAGES}
              />
            </div>

            <InputField
              label="Impedance (%Z)"
              unit="%"
              value={inputs.zPercent}
              onChange={set('zPercent')}
              min={0.1}
              max={20}
              step={0.01}
              hint="Nameplate or standard value"
            />
          </div>

          <div className="bg-[#13151c] border border-slate-800 rounded-xl p-4 space-y-4">
            <Toggle
              label="Include Utility Source Impedance"
              checked={inputs.useUtility}
              onChange={set('useUtility')}
              hint="Accounts for utility fault level at primary"
            />
            {inputs.useUtility && (
              <InputField
                label="Utility Available Fault Current at Primary"
                unit="kA"
                value={inputs.utilityFaultKA}
                onChange={set('utilityFaultKA')}
                min={0.1}
                step={0.1}
                hint="From utility or system study"
              />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <ResultCard
            title="Full Load Amps"
            badge={<Badge label={phases + '-Phase'} color="gray" />}
          >
            <ResultRow label="Primary FLA" value={fmt(results.flaPrimary)} unit="A" />
            <ResultRow label="Secondary FLA" value={fmt(results.flaSecondary)} unit="A" />
          </ResultCard>

          <ResultCard
            title="Available Fault Current"
            badge={<Badge label={faultLevel.label} color={faultLevel.color} />}
          >
            <ResultRow
              label="Fault Current (Infinite Bus)"
              value={fmt(results.iscInfiniteKA, 3)}
              unit="kA sym"
              highlight="warn"
            />
            {results.iscWithUtilityKA != null && (
              <ResultRow
                label="Fault Current (w/ Utility Z)"
                value={fmt(results.iscWithUtilityKA, 3)}
                unit="kA sym"
                highlight="warn"
              />
            )}
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="text-[10px] text-slate-500 mb-1">Design Fault Current</div>
              <div className="font-mono-result text-3xl font-bold text-amber-400">
                {fmt(results.iscFinalKA, 2)} <span className="text-lg text-amber-600">kA</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-1">Symmetrical RMS</div>
            </div>
          </ResultCard>

          <ResultCard title="Transformer Impedance in Ohms (Secondary-Referred)">
            <ResultRow
              label="Zt (secondary-side ohms)"
              value={fmt((inputs.zPercent / 100) * (inputs.vSecondary ** 2) / (inputs.kva * 1000), 4)}
              unit="Ω"
            />
            <ResultRow
              label="%Z"
              value={fmt(inputs.zPercent, 2)}
              unit="%"
            />
          </ResultCard>

          <div className="flex gap-2 justify-end">
            <SaveButton onClick={handleSave} />
            <ExportButton onClick={handleExport} />
          </div>

          <InfoBox type="info">
            <strong>Note:</strong> This calculation assumes an X/R ratio of ∞ (no resistance). For asymmetrical
            fault current multiply by 1.6× (typical). Results represent the available bolted fault current
            at the transformer secondary terminals. Downstream impedance (cable, bus) will reduce this value.
          </InfoBox>
        </div>
      </div>
    </div>
  );
}
