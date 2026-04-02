import { useState } from 'react';
import { Cpu } from 'lucide-react';
import { calcMotorContribution } from '../utils/calculations';
import { exportMotorPDF } from '../utils/pdfExport';
import {
  InputField, SelectField, ResultRow, ResultCard, Badge,
  SectionHeader, SaveButton, ExportButton, InfoBox,
} from '../components/ui';

const DEFAULT = {
  hp: 100, voltage: 480, efficiency: 0.92, pf: 0.88, phases: '3',
  multiplier: 4.0, baseFaultKA: 0, includeBase: false,
};

const HP_PRESETS = [1, 5, 10, 15, 25, 50, 75, 100, 150, 200, 250, 350, 500];

function fmt(n, dec = 1) {
  if (n == null || isNaN(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export default function MotorContribution({ onSave }) {
  const [inputs, setInputs] = useState(DEFAULT);
  const set = (key) => (val) => setInputs((p) => ({ ...p, [key]: val }));

  const results = calcMotorContribution({
    hp: inputs.hp,
    voltage: inputs.voltage,
    efficiency: inputs.efficiency,
    pf: inputs.pf,
    phases: parseInt(inputs.phases),
    multiplier: inputs.multiplier,
  });

  const combinedKA = inputs.includeBase && inputs.baseFaultKA > 0
    ? { base: inputs.baseFaultKA, total: inputs.baseFaultKA + results.contributionKA }
    : null;

  const handleSave = () => onSave({
    type: 'Motor Contribution',
    inputs: { ...inputs },
    results,
    combinedKA,
    timestamp: Date.now(),
  });

  const handleExport = () => exportMotorPDF({ ...inputs }, results, combinedKA);

  return (
    <div className="max-w-5xl mx-auto">
      <SectionHeader
        title="Motor Contribution Estimator"
        subtitle="Estimate induction motor contribution to fault current for system studies"
        icon={Cpu}
      />

      {/* HP Presets */}
      <div className="mb-5">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-semibold">Quick HP Select</p>
        <div className="flex flex-wrap gap-1.5">
          {HP_PRESETS.map((hp) => (
            <button
              key={hp}
              onClick={() => set('hp')(hp)}
              className={`text-xs px-2.5 py-1 rounded border transition-all ${
                inputs.hp === hp
                  ? 'bg-amber-500 border-amber-500 text-black font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-amber-500/50 hover:text-amber-400'
              }`}
            >
              {hp} HP
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="bg-[#13151c] border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Motor Parameters</h3>

            <InputField label="Motor Rating" unit="HP" value={inputs.hp} onChange={set('hp')} min={0.5} step={0.5} />

            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Phase"
                value={inputs.phases}
                onChange={set('phases')}
                options={[
                  { value: '3', label: '3-Phase' },
                  { value: '1', label: '1-Phase' },
                ]}
              />
              <InputField label="Voltage" unit="V" value={inputs.voltage} onChange={set('voltage')} min={100} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Efficiency"
                unit="p.u."
                value={inputs.efficiency}
                onChange={set('efficiency')}
                min={0.5}
                max={1.0}
                step={0.01}
                hint="e.g. 0.92 = 92%"
              />
              <InputField
                label="Power Factor"
                unit="p.u."
                value={inputs.pf}
                onChange={set('pf')}
                min={0.5}
                max={1.0}
                step={0.01}
                hint="e.g. 0.88 = 88%"
              />
            </div>
          </div>

          <div className="bg-[#13151c] border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Fault Contribution Multiplier</h3>

            <SelectField
              label="Multiplier (× FLA)"
              value={String(inputs.multiplier)}
              onChange={(v) => set('multiplier')(parseFloat(v))}
              options={[
                { value: '3.6', label: '3.6× — IEEE 1584 default (motors at terminals)' },
                { value: '4.0', label: '4.0× — ANSI/IEEE C37 general use' },
                { value: '4.8', label: '4.8× — Conservative / large synchronous motors' },
                { value: '6.0', label: '6.0× — Synchronous generators' },
              ]}
            />

            <div className="space-y-3 border-t border-slate-800 pt-3">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.includeBase}
                  onChange={(e) => set('includeBase')(e.target.checked)}
                  className="accent-amber-500"
                />
                Combine with utility/transformer fault current
              </label>

              {inputs.includeBase && (
                <InputField
                  label="Base System Fault Current"
                  unit="kA"
                  value={inputs.baseFaultKA}
                  onChange={set('baseFaultKA')}
                  min={0}
                  step={0.1}
                  hint="From transformer calculator"
                />
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <ResultCard title="Motor Nameplate Amps">
            <ResultRow label="Full Load Amps (FLA)" value={fmt(results.fla)} unit="A" />
            <div className="text-[10px] text-slate-600 mt-1">
              = ({inputs.hp} HP × 746) / (√3 × {inputs.voltage}V × {(inputs.efficiency * 100).toFixed(0)}% × {(inputs.pf * 100).toFixed(0)}%)
            </div>
          </ResultCard>

          <ResultCard
            title="Fault Contribution"
            badge={<Badge label={`${inputs.multiplier}× FLA`} color="yellow" />}
          >
            <ResultRow label="Motor Contribution (A)" value={fmt(results.contributionAmps)} unit="A" />
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="text-[10px] text-slate-500 mb-1">Motor Contribution</div>
              <div className="font-mono-result text-3xl font-bold text-amber-400">
                {fmt(results.contributionKA, 3)} <span className="text-lg text-amber-600">kA</span>
              </div>
            </div>
          </ResultCard>

          {combinedKA && (
            <ResultCard
              title="Combined System Fault Current"
              badge={<Badge label="Utility + Motor" color="orange" />}
            >
              <ResultRow label="Utility/Transformer Base" value={fmt(combinedKA.base, 3)} unit="kA" />
              <ResultRow label="Motor Contribution" value={fmt(results.contributionKA, 3)} unit="kA" />
              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 mb-1">Total Available Fault</div>
                <div className="font-mono-result text-3xl font-bold text-red-400">
                  {fmt(combinedKA.total, 3)} <span className="text-lg text-red-600">kA</span>
                </div>
              </div>
            </ResultCard>
          )}

          <div className="flex gap-2 justify-end">
            <SaveButton onClick={handleSave} />
            <ExportButton onClick={handleExport} />
          </div>

          <InfoBox type="warning">
            <strong>Engineering Note:</strong> Motor fault contribution decays rapidly with time (typically
            within 5–8 cycles for induction motors). Use 4.0× FLA for initial symmetrical fault studies.
            NEMA MG-1 and IEEE C37.010 provide detailed guidance. Synchronous motors contribute longer
            and require separate treatment.
          </InfoBox>
        </div>
      </div>
    </div>
  );
}
