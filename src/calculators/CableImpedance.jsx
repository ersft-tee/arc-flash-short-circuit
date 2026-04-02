import { useState } from 'react';
import { Cable } from 'lucide-react';
import { CONDUCTOR_SIZES, getCableImpedance, getAmpacity } from '../utils/cableData';
import { calcCableVoltageDrop } from '../utils/calculations';
import { exportCablePDF } from '../utils/pdfExport';
import {
  InputField, SelectField, Toggle, ResultRow, ResultCard, Badge,
  SectionHeader, SaveButton, ExportButton, InfoBox,
} from '../components/ui';

const DEFAULT = {
  size: '4/0 AWG', material: 'copper', insulation: 'THHN', conduit: 'steel',
  lengthFt: 200, loadAmps: 200, voltage: 480, phases: '3', pf: 0.85, isFeeder: true,
};

function fmt(n, dec = 4) {
  if (n == null || isNaN(n)) return '—';
  return n.toFixed(dec);
}

export default function CableImpedance({ onSave }) {
  const [inputs, setInputs] = useState(DEFAULT);
  const set = (key) => (val) => setInputs((p) => ({ ...p, [key]: val }));

  const imp = getCableImpedance(inputs.size, inputs.material, inputs.conduit);
  const ampacity = getAmpacity(inputs.size, inputs.material);

  let results = null;
  if (imp && imp.r != null) {
    results = calcCableVoltageDrop({
      rPer1000ft: imp.r,
      xPer1000ft: imp.x,
      lengthFt: inputs.lengthFt,
      loadAmps: inputs.loadAmps,
      voltage: inputs.voltage,
      phases: parseInt(inputs.phases),
      pf: inputs.pf,
    });
  }

  const limit = inputs.isFeeder ? 5 : 3;
  const pass = results ? results.vdPct <= limit : null;
  const ampPass = ampacity ? inputs.loadAmps <= ampacity : null;

  const handleSave = () => onSave({
    type: 'Cable Impedance & Voltage Drop',
    inputs: { ...inputs },
    results,
    timestamp: Date.now(),
  });

  const handleExport = () => exportCablePDF({ ...inputs, isFeeder: inputs.isFeeder }, results);

  return (
    <div className="max-w-5xl mx-auto">
      <SectionHeader
        title="Cable Impedance & Voltage Drop Calculator"
        subtitle="NEC Table 9 conductor impedance — THHN/XHHW in steel or PVC conduit"
        icon={Cable}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="bg-[#13151c] border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Conductor Selection</h3>

            <SelectField
              label="Conductor Size"
              value={inputs.size}
              onChange={set('size')}
              options={CONDUCTOR_SIZES.map((s) => ({ value: s, label: s }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Material"
                value={inputs.material}
                onChange={set('material')}
                options={[
                  { value: 'copper', label: 'Copper (Cu)' },
                  { value: 'aluminum', label: 'Aluminum (Al)' },
                ]}
              />
              <SelectField
                label="Insulation"
                value={inputs.insulation}
                onChange={set('insulation')}
                options={[
                  { value: 'THHN', label: 'THHN/THWN-2' },
                  { value: 'XHHW', label: 'XHHW-2' },
                ]}
              />
            </div>

            <SelectField
              label="Conduit Type"
              value={inputs.conduit}
              onChange={set('conduit')}
              options={[
                { value: 'steel', label: 'Steel (EMT / IMC / RGC) — Magnetic' },
                { value: 'pvc', label: 'PVC / Aluminum — Non-magnetic' },
              ]}
            />
          </div>

          <div className="bg-[#13151c] border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Circuit Parameters</h3>

            <div className="grid grid-cols-2 gap-3">
              <InputField label="One-Way Length" unit="ft" value={inputs.lengthFt} onChange={set('lengthFt')} min={1} />
              <InputField label="Load Current" unit="A" value={inputs.loadAmps} onChange={set('loadAmps')} min={0.1} step={0.5} />
            </div>

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
              <InputField label="System Voltage" unit="V" value={inputs.voltage} onChange={set('voltage')} min={100} />
            </div>

            <InputField
              label="Power Factor"
              unit="PF"
              value={inputs.pf}
              onChange={set('pf')}
              min={0.5}
              max={1.0}
              step={0.01}
              hint="0.70–0.95 typical"
            />

            <Toggle
              label="Feeder Circuit"
              checked={inputs.isFeeder}
              onChange={set('isFeeder')}
              hint="Feeder: 5% limit | Branch: 3% limit"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {imp && imp.r != null ? (
            <>
              <ResultCard
                title="Conductor Properties (NEC Table 9)"
                badge={<Badge label={inputs.conduit === 'steel' ? 'Steel Conduit' : 'PVC Conduit'} color="gray" />}
              >
                <ResultRow label="Resistance (R)" value={fmt(imp.r, 4)} unit="Ω/1000 ft" />
                <ResultRow label="Reactance (X)" value={fmt(imp.x, 4)} unit="Ω/1000 ft" />
                <ResultRow
                  label="Impedance (Z)"
                  value={fmt(Math.sqrt(imp.r ** 2 + imp.x ** 2), 4)}
                  unit="Ω/1000 ft"
                />
                <ResultRow
                  label="Ampacity (75°C)"
                  value={ampacity ?? '—'}
                  unit="A"
                  highlight={ampPass === false ? 'fail' : ampPass === true ? 'pass' : undefined}
                />
              </ResultCard>

              {results && (
                <>
                  <ResultCard title="Total Circuit Impedance">
                    <ResultRow label={`Resistance (${inputs.lengthFt} ft one-way)`} value={fmt(results.rTotal)} unit="Ω" />
                    <ResultRow label="Reactance" value={fmt(results.xTotal)} unit="Ω" />
                    <ResultRow label="Impedance |Z|" value={fmt(results.zTotal)} unit="Ω" />
                  </ResultCard>

                  <ResultCard
                    title="Voltage Drop Analysis"
                    badge={
                      <Badge
                        label={pass ? `PASS ≤${limit}%` : `FAIL >${limit}%`}
                        color={pass ? 'green' : 'red'}
                      />
                    }
                  >
                    <ResultRow label="Voltage Drop" value={fmt(results.vdTotal, 2)} unit="V" />
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500">Voltage Drop %</div>
                          <div className={`font-mono-result text-3xl font-bold ${pass ? 'text-emerald-400' : 'text-red-400'}`}>
                            {fmt(results.vdPct, 2)}
                            <span className="text-lg ml-1 opacity-60">%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500">Limit</div>
                          <div className="font-mono-result text-lg font-bold text-slate-400">{limit}%</div>
                          <div className="text-[10px] text-slate-600">{inputs.isFeeder ? 'Feeder' : 'Branch'}</div>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pass ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min((results.vdPct / (limit * 2)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </ResultCard>

                  <div className="flex gap-2 justify-end">
                    <SaveButton onClick={handleSave} />
                    <ExportButton onClick={handleExport} />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="bg-[#13151c] border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm">
              This conductor size is not available for the selected material.
              <br />
              <span className="text-xs text-slate-600">Aluminum not available in 14 AWG.</span>
            </div>
          )}

          <InfoBox type="info">
            <strong>Reference:</strong> Impedance values per NEC 2023 Chapter 9, Table 9, at 75°C conductor temperature.
            Voltage drop calculated using the effective impedance method (pf-corrected). Two-way length used automatically.
            NEC recommends ≤3% for branch circuits and ≤5% total for feeder + branch.
          </InfoBox>
        </div>
      </div>
    </div>
  );
}
