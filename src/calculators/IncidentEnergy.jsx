import { useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { calcIncidentEnergy, PPE_CATEGORIES } from '../utils/calculations';
import { exportArcFlashPDF } from '../utils/pdfExport';
import {
  InputField, SelectField, Toggle, ResultRow, ResultCard, Badge,
  SectionHeader, SaveButton, ExportButton, InfoBox,
} from '../components/ui';

// Recommended gap distances by equipment type (mm)
const GAP_PRESETS = [
  { label: 'LV Switchgear (≤600V)', gap: 32 },
  { label: 'MV Switchgear (5kV)',   gap: 104 },
  { label: 'MV Switchgear (15kV)',  gap: 152 },
  { label: '480V MCC',             gap: 25 },
  { label: '480V Panelboard',      gap: 25 },
  { label: '600V Switchboard',     gap: 32 },
  { label: 'Cable Junction Box',   gap: 13 },
];

const WORKING_DISTANCES = [
  { label: '18 in — LV panelboard', value: 18 },
  { label: '24 in — LV switchgear', value: 24 },
  { label: '36 in — MV switchgear', value: 36 },
  { label: '48 in — MV open bus',   value: 48 },
];

const DEFAULT = {
  ibfKA: 20,
  voltageKV: 0.48,
  gapMM: 32,
  durationCycles: 6,
  workingDistanceIn: 24,
  config: 'box',
  grounded: true,
};

function fmt(n, dec = 2) {
  if (n == null || isNaN(n)) return '—';
  return n.toFixed(dec);
}

const PPE_COLORS = {
  0: 'emerald', 1: 'yellow', 2: 'orange', 3: 'red', 4: 'red', 5: 'red',
};
const PPE_BG = {
  0: 'bg-emerald-900/20 border-emerald-700/30',
  1: 'bg-yellow-900/20 border-yellow-700/30',
  2: 'bg-orange-900/20 border-orange-700/30',
  3: 'bg-red-900/20 border-red-700/30',
  4: 'bg-red-900/30 border-red-600/40',
  5: 'bg-red-900/40 border-red-500/50',
};
const PPE_TEXT = {
  0: 'text-emerald-400', 1: 'text-yellow-400', 2: 'text-orange-400',
  3: 'text-red-400', 4: 'text-red-300', 5: 'text-red-300',
};

export default function IncidentEnergy({ onSave }) {
  const [inputs, setInputs] = useState(DEFAULT);
  const set = (key) => (val) => setInputs((p) => ({ ...p, [key]: val }));

  const results = calcIncidentEnergy({
    ibfKA: inputs.ibfKA,
    voltageKV: inputs.voltageKV,
    gapMM: inputs.gapMM,
    durationCycles: inputs.durationCycles,
    workingDistanceIn: inputs.workingDistanceIn,
    config: inputs.config,
    grounded: inputs.grounded,
  });

  const cat = inputs.ibfKA > 0 && inputs.ibfKA <= 106 ? results.ppeCategory : null;
  const ppeInfo = cat != null ? PPE_CATEGORIES[Math.min(cat, 5)] : null;

  const handleSave = () => onSave({
    type: 'Arc Flash Incident Energy',
    inputs: { ...inputs },
    results,
    timestamp: Date.now(),
  });

  const handleExport = () => exportArcFlashPDF(inputs, results);

  const isValidRange = inputs.ibfKA >= 0.7 && inputs.ibfKA <= 106
    && inputs.voltageKV >= 0.208 && inputs.voltageKV <= 15;

  return (
    <div className="max-w-5xl mx-auto">
      <SectionHeader
        title="Incident Energy Calculator"
        subtitle="IEEE 1584-2002 simplified method — for scoping and quick reference only"
        icon={AlertTriangle}
      />

      <InfoBox type="danger">
        <strong>⚠ Important:</strong> This calculator uses the IEEE 1584-2002 simplified equations.
        A complete arc flash study per IEEE 1584-2018 is required for labeling and PPE selection.
        Valid range: 0.208–15 kV, 0.7–106 kA. Results are for preliminary estimates only.
      </InfoBox>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <div className="space-y-4">
          <div className="bg-[#13151c] border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">System Parameters</h3>

            <InputField
              label="Available Bolted Fault Current"
              unit="kA"
              value={inputs.ibfKA}
              onChange={set('ibfKA')}
              min={0.7}
              max={106}
              step={0.1}
              hint="0.7 – 106 kA"
            />

            <SelectField
              label="System Voltage"
              value={String(inputs.voltageKV)}
              onChange={(v) => set('voltageKV')(parseFloat(v))}
              options={[
                { value: '0.208', label: '208 V' },
                { value: '0.24',  label: '240 V' },
                { value: '0.48',  label: '480 V' },
                { value: '0.6',   label: '600 V' },
                { value: '2.4',   label: '2,400 V' },
                { value: '4.16',  label: '4,160 V' },
                { value: '7.2',   label: '7,200 V' },
                { value: '12.47', label: '12,470 V' },
                { value: '13.2',  label: '13,200 V' },
                { value: '13.8',  label: '13,800 V' },
              ]}
            />

            <SelectField
              label="Electrode Configuration"
              value={inputs.config}
              onChange={set('config')}
              options={[
                { value: 'box',  label: 'In Enclosure / Box (switchgear, MCC, panelboard)' },
                { value: 'open', label: 'Open Air / Bus (exposed conductors)' },
              ]}
            />

            <Toggle
              label="Solidly Grounded System"
              checked={inputs.grounded}
              onChange={set('grounded')}
              hint="Uncheck for ungrounded or HRG systems"
            />
          </div>

          <div className="bg-[#13151c] border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Gap & Distance</h3>

            {/* Gap presets */}
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Gap Presets</p>
              <div className="flex flex-wrap gap-1.5">
                {GAP_PRESETS.map(({ label, gap }) => (
                  <button
                    key={label}
                    onClick={() => set('gapMM')(gap)}
                    className={`text-[10px] px-2 py-1 rounded border transition-all ${
                      inputs.gapMM === gap
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {label} ({gap}mm)
                  </button>
                ))}
              </div>
            </div>

            <InputField
              label="Conductor Gap"
              unit="mm"
              value={inputs.gapMM}
              onChange={set('gapMM')}
              min={6.35}
              max={250}
              step={1}
              hint="IEEE 1584 Table 1: typical 13–152mm"
            />

            <InputField
              label="Arc Duration"
              unit="cycles"
              value={inputs.durationCycles}
              onChange={set('durationCycles')}
              min={0.5}
              max={120}
              step={0.5}
              hint="1 cycle = 16.7ms at 60Hz"
            />

            {/* Working distance presets */}
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Working Distance Presets</p>
              <div className="flex flex-wrap gap-1.5">
                {WORKING_DISTANCES.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => set('workingDistanceIn')(value)}
                    className={`text-[10px] px-2 py-1 rounded border transition-all ${
                      inputs.workingDistanceIn === value
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <InputField
              label="Working Distance"
              unit="in"
              value={inputs.workingDistanceIn}
              onChange={set('workingDistanceIn')}
              min={6}
              step={1}
              hint="NFPA 70E Table 130.7(C)(15)(a)"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!isValidRange && (
            <InfoBox type="warning">
              Input values are outside the valid range for IEEE 1584-2002.
              Fault current must be 0.7–106 kA and voltage 0.208–15 kV.
            </InfoBox>
          )}

          {isValidRange && results && (
            <>
              {/* PPE Category Banner */}
              {ppeInfo && (
                <div className={`border rounded-xl p-4 ${PPE_BG[Math.min(cat, 5)]}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldAlert size={24} className={PPE_TEXT[Math.min(cat, 5)]} />
                    <div>
                      <div className={`text-xs font-bold uppercase tracking-wider ${PPE_TEXT[Math.min(cat, 5)]}`}>
                        {ppeInfo.label}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {ppeInfo.calCm2} cal/cm² range — Min Rating: {ppeInfo.minRating}
                      </div>
                    </div>
                  </div>
                  {ppeInfo.clothing.map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-400 mb-1">
                      <span className={`${PPE_TEXT[Math.min(cat, 5)]} mt-0.5 text-[8px]`}>▶</span>
                      {item}
                    </div>
                  ))}
                  {ppeInfo.equipment.map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-500 mb-1">
                      <span className="text-slate-700 mt-0.5 text-[8px]">▶</span>
                      {item}
                    </div>
                  ))}
                </div>
              )}

              <ResultCard title="Arc Flash Results">
                <ResultRow label="Arcing Current" value={fmt(results.arcingCurrentKA, 3)} unit="kA" />
                <ResultRow label="Arc Duration" value={fmt(results.arcDurationSec * 1000, 1)} unit="ms" />
                <ResultRow
                  label="Arc Flash Boundary"
                  value={fmt(results.afbFt, 1)}
                  unit="ft"
                  highlight="warn"
                />
                <ResultRow
                  label="Arc Flash Boundary"
                  value={fmt(results.afbIn, 1)}
                  unit="in"
                />
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="text-[10px] text-slate-500 mb-1">Incident Energy at {inputs.workingDistanceIn}" distance</div>
                  <div className={`font-mono-result text-4xl font-bold ${
                    cat >= 4 ? 'text-red-400' : cat >= 3 ? 'text-red-400' :
                    cat >= 2 ? 'text-orange-400' : cat >= 1 ? 'text-yellow-400' : 'text-emerald-400'
                  }`}>
                    {fmt(results.incidentEnergyCalCm2, 2)}
                    <span className="text-lg ml-1 opacity-60">cal/cm²</span>
                  </div>
                </div>
              </ResultCard>

              <div className="flex gap-2 justify-end">
                <SaveButton onClick={handleSave} />
                <ExportButton onClick={handleExport} />
              </div>
            </>
          )}

          <InfoBox type="warning">
            <strong>Method:</strong> IEEE 1584-2002 equations. The 2018 revision provides more accuracy but
            requires more inputs (electrode dimensions, enclosure geometry). This calculator provides
            conservative estimates for scoping purposes. Arc flash duration is the critical variable —
            verify protective device clearing times separately.
          </InfoBox>
        </div>
      </div>
    </div>
  );
}
