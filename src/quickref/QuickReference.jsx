import { useState } from 'react';
import { LayoutDashboard, AlertTriangle, BookMarked, Zap } from 'lucide-react';
import { SectionHeader } from '../components/ui';

// ─────────────────────────────────────────────────────────────────────────────
// Equipment Bus Ratings
// ─────────────────────────────────────────────────────────────────────────────

function TH({ children }) {
  return <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2.5 border-b border-slate-800 whitespace-nowrap">{children}</th>;
}
function TD({ children, accent, className = '' }) {
  return (
    <td className={`px-3 py-2.5 text-xs border-b border-slate-800/50 ${accent ? 'font-mono-result font-bold text-amber-400' : 'text-slate-400'} ${className}`}>
      {children}
    </td>
  );
}

const EQUIPMENT_DATA = [
  // [type, manufacturer_example, voltage, aic_ratings]
  { type: 'Panelboard', examples: 'Square D QO, Eaton CH', voltage: '120/240V 1φ', ratings: ['10 kA', '22 kA', '42 kA'], notes: 'Residential & light commercial' },
  { type: 'Panelboard', examples: 'Square D NQ, Eaton PRL1a', voltage: '208Y/120V 3φ', ratings: ['10 kA', '14 kA', '22 kA'], notes: 'Commercial lighting panels' },
  { type: 'Panelboard', examples: 'Square D I-Line, Eaton PRL4', voltage: '480Y/277V 3φ', ratings: ['14 kA', '22 kA', '42 kA', '65 kA'], notes: 'Power distribution panels' },
  { type: 'Switchboard', examples: 'Square D I-Line II, Eaton Pow-R-Line', voltage: '480Y/277V 3φ', ratings: ['22 kA', '42 kA', '65 kA', '100 kA'], notes: 'Main distribution' },
  { type: 'Switchgear (LV)', examples: 'Square D Model 6, Eaton Magnum', voltage: '480V 3φ', ratings: ['42 kA', '65 kA', '85 kA', '100 kA'], notes: 'Draw-out breaker gear' },
  { type: 'MCC (IEC Type B)', examples: 'Allen-Bradley, Square D 8998', voltage: '480V 3φ', ratings: ['10 kA', '14 kA', '22 kA', '42 kA'], notes: 'Motor control centers' },
  { type: 'MCC (IEC Type F)', examples: 'Eaton Freedom, AB 2100', voltage: '480V 3φ', ratings: ['42 kA', '65 kA', '100 kA'], notes: 'Industrial motor control' },
  { type: 'Switchgear (MV)', examples: 'Square D GM-SG, Eaton VacClad', voltage: '5 kV – 15 kV', ratings: ['20 kA', '25 kA', '31.5 kA', '40 kA'], notes: 'Primary distribution' },
  { type: 'Load Center', examples: 'Square D QO, Eaton CH', voltage: '120/240V', ratings: ['10 kA', '22 kA'], notes: 'Residential only' },
  { type: 'Enclosed Disconnect', examples: 'Square D H, GE THN', voltage: '240–600V', ratings: ['10 kA', '14 kA', '22 kA'], notes: 'Branch circuit only' },
];

function EquipmentRatings() {
  return (
    <div>
      <div className="mb-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          Standard short circuit current ratings (SCCR / AIC) per UL 67, UL 891, UL 845, and IEEE C37.
          Verify with equipment nameplate — AIC ratings vary by manufacturer and configuration.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full bg-[#13151c]">
          <thead>
            <tr>
              <TH>Equipment Type</TH>
              <TH>Example Products</TH>
              <TH>Voltage</TH>
              <TH>Standard AIC Ratings</TH>
              <TH>Notes</TH>
            </tr>
          </thead>
          <tbody>
            {EQUIPMENT_DATA.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                <TD><span className="font-semibold text-slate-300">{row.type}</span></TD>
                <TD><span className="text-[10px]">{row.examples}</span></TD>
                <TD accent>{row.voltage}</TD>
                <TD>
                  <div className="flex flex-wrap gap-1">
                    {row.ratings.map((r) => (
                      <span key={r} className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono-result font-bold px-1.5 py-0.5 rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                </TD>
                <TD><span className="text-[10px] text-slate-600">{row.notes}</span></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-[10px] text-slate-600 leading-relaxed">
        Common standard ratings: 10 kA · 14 kA · 22 kA · 42 kA · 65 kA · 85 kA · 100 kA (UL 489 breakers).
        Equipment must be rated ≥ available fault current at its installation point.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PPE Categories
// ─────────────────────────────────────────────────────────────────────────────

const PPE_DATA = [
  {
    cat: 1, range: '1.2 – 4 cal/cm²', minAR: '4 cal/cm²',
    color: 'text-yellow-400', bg: 'bg-yellow-900/10 border-yellow-800/20',
    clothing: ['Arc-rated shirt and pants (min 4 cal/cm²)', 'OR arc-rated coverall'],
    faceProt: ['Arc-rated faceshield (min 4 cal/cm²)', 'OR arc flash suit hood'],
    otherPPE: ['Safety glasses (under faceshield)', 'Hard hat (Class E)', 'Leather gloves or rubber insulating gloves + leather protectors', 'Leather work shoes'],
    tasks: ['Operating breakers/disconnects (bolted, closed)', 'Taking voltage readings', 'Racking breakers (de-energized panel)', 'Reading meters (exterior instruments)'],
  },
  {
    cat: 2, range: '4 – 8 cal/cm²', minAR: '8 cal/cm²',
    color: 'text-orange-400', bg: 'bg-orange-900/10 border-orange-800/20',
    clothing: ['Arc-rated shirt and pants PLUS arc-rated coverall (total ≥ 8 cal/cm²)', 'OR arc-rated coverall over arc-rated shirt/pants'],
    faceProt: ['Arc-rated faceshield + balaclava (≥ 8 cal/cm²)', 'OR arc flash suit hood'],
    otherPPE: ['Safety glasses', 'Hard hat', 'Rubber insulating gloves (Class 0) + leather protectors', 'Leather work shoes', 'Hearing protection'],
    tasks: ['Removing covers from energized equipment', 'Opening/closing 480V MCC buckets', 'Racking breakers in 480V switchgear', 'Connecting/disconnecting leads at 480V'],
  },
  {
    cat: 3, range: '8 – 25 cal/cm²', minAR: '25 cal/cm²',
    color: 'text-red-400', bg: 'bg-red-900/10 border-red-800/20',
    clothing: ['Arc-rated jacket + pants + shirt (layered, total ≥ 25 cal/cm²)', 'OR arc flash suit (≥ 25 cal/cm²)'],
    faceProt: ['Arc flash suit hood (≥ 25 cal/cm²)'],
    otherPPE: ['Safety glasses inside hood', 'Hard hat inside hood', 'Rubber insulating gloves (Class 2) + leather protectors', 'Leather work boots', 'Hearing protection'],
    tasks: ['Working on energized 5 kV equipment', 'Breaker racking in 5 kV switchgear', 'Bus work on medium voltage equipment', 'Live testing on 5 kV switchgear'],
  },
  {
    cat: 4, range: '25 – 40 cal/cm²', minAR: '40 cal/cm²',
    color: 'text-red-300', bg: 'bg-red-900/20 border-red-700/30',
    clothing: ['Arc-rated full arc flash suit system (≥ 40 cal/cm²)', 'Multi-layer arc-rated clothing under arc flash suit'],
    faceProt: ['Arc flash suit hood rated ≥ 40 cal/cm²'],
    otherPPE: ['Safety glasses inside hood', 'Hard hat inside hood', 'Rubber insulating gloves (Class 2+) + leather protectors', 'Leather work boots', 'Hearing protection'],
    tasks: ['Working on energized 15 kV equipment', 'Breaker racking in 15 kV switchgear', 'Live work near exposed bus (high fault current)', 'Primary voltage splicing and terminations'],
  },
];

function PPECategories() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        PPE categories per NFPA 70E-2021 Table 130.5(G). When incident energy exceeds 40 cal/cm², Category 4 equipment
        is insufficient — engineering controls or de-energizing are required.
      </p>
      {PPE_DATA.map(({ cat, range, minAR, color, bg, clothing, faceProt, otherPPE, tasks }) => (
        <div key={cat} className={`border rounded-xl p-4 ${bg}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`text-4xl font-mono-result font-black ${color} leading-none`}>{cat}</div>
            <div>
              <div className={`text-sm font-bold ${color}`}>PPE Category {cat}</div>
              <div className="text-xs text-slate-500">{range} — Min AR clothing: <span className="font-mono-result font-bold text-slate-300">{minAR}</span></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Body Protection</div>
              {clothing.map((c, i) => <div key={i} className="text-[11px] text-slate-400 mb-1 flex gap-1.5"><span className={`${color} text-[8px] mt-1`}>▶</span>{c}</div>)}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Face / Head</div>
              {faceProt.map((c, i) => <div key={i} className="text-[11px] text-slate-400 mb-1 flex gap-1.5"><span className={`${color} text-[8px] mt-1`}>▶</span>{c}</div>)}
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 mt-2">Other PPE</div>
              {otherPPE.map((c, i) => <div key={i} className="text-[11px] text-slate-400 mb-1 flex gap-1.5"><span className="text-slate-700 text-[8px] mt-1">▶</span>{c}</div>)}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Typical Tasks (Examples)</div>
              {tasks.map((t, i) => <div key={i} className="text-[11px] text-slate-500 mb-1 flex gap-1.5"><span className="text-slate-700 text-[8px] mt-1">—</span>{t}</div>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Approach Boundaries (NFPA 70E Table 130.4(E)(a))
// ─────────────────────────────────────────────────────────────────────────────

const APPROACH_DATA = [
  // [voltage, limited, restricted, prohibited]
  { voltage: '0 – 50 V',        limited: 'N/A', restricted: 'N/A',    prohibited: 'Avoid contact' },
  { voltage: '51 – 300 V',      limited: '3 ft 6 in', restricted: '1 ft 0 in', prohibited: 'Avoid contact' },
  { voltage: '301 – 750 V',     limited: '3 ft 6 in', restricted: '1 ft 0 in', prohibited: '0 ft 1 in' },
  { voltage: '751 V – 15 kV',   limited: '5 ft 0 in', restricted: '2 ft 2 in', prohibited: '0 ft 7 in' },
  { voltage: '15.1 – 36 kV',    limited: '6 ft 0 in', restricted: '2 ft 9 in', prohibited: '1 ft 5 in' },
  { voltage: '36.1 – 46 kV',    limited: '8 ft 0 in', restricted: '3 ft 4 in', prohibited: '2 ft 2 in' },
  { voltage: '46.1 – 72.5 kV',  limited: '8 ft 0 in', restricted: '4 ft 3 in', prohibited: '3 ft 0 in' },
  { voltage: '72.6 – 121 kV',   limited: '8 ft 0 in', restricted: '5 ft 8 in', prohibited: '4 ft 3 in' },
  { voltage: '138 – 145 kV',    limited: '10 ft 0 in', restricted: '7 ft 0 in', prohibited: '5 ft 7 in' },
  { voltage: '161 – 169 kV',    limited: '11 ft 0 in', restricted: '8 ft 0 in', prohibited: '6 ft 10 in' },
  { voltage: '230 – 242 kV',    limited: '13 ft 0 in', restricted: '10 ft 0 in', prohibited: '8 ft 9 in' },
  { voltage: '345 – 362 kV',    limited: '15 ft 4 in', restricted: '13 ft 0 in', prohibited: '12 ft 0 in' },
  { voltage: '500 – 550 kV',    limited: '19 ft 0 in', restricted: '17 ft 6 in', prohibited: '16 ft 5 in' },
  { voltage: '765 – 800 kV',    limited: '23 ft 9 in', restricted: '21 ft 8 in', prohibited: '20 ft 10 in' },
];

function ApproachBoundaries() {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        NFPA 70E-2021 Table 130.4(E)(a) — Approach limit distances from energized electrical conductors or circuit parts.
        Distances are to the "closest approach point" and include body, tools, equipment, and lead wires.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {[
          { boundary: 'Limited Approach Boundary', color: 'text-yellow-400 bg-yellow-900/10 border-yellow-800/20', desc: 'Unqualified persons must not cross without escort by a qualified person.' },
          { boundary: 'Restricted Approach Boundary', color: 'text-orange-400 bg-orange-900/10 border-orange-800/20', desc: 'Qualified persons only. Shock protection required. Insulated tools, rubber insulating equipment.' },
          { boundary: 'Prohibited Approach Boundary', color: 'text-red-400 bg-red-900/10 border-red-800/20', desc: 'Treated as direct contact with energized part. Full PPE required. Special work permits.' },
        ].map(({ boundary, color, desc }) => (
          <div key={boundary} className={`border rounded-lg p-3 ${color}`}>
            <div className={`text-xs font-bold mb-1 ${color.split(' ')[0]}`}>{boundary}</div>
            <div className="text-[11px] text-slate-500">{desc}</div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full bg-[#13151c]">
          <thead>
            <tr>
              <TH>Nominal Voltage (Phase-to-Phase)</TH>
              <TH>Limited Approach</TH>
              <TH>Restricted Approach</TH>
              <TH>Prohibited Approach</TH>
            </tr>
          </thead>
          <tbody>
            {APPROACH_DATA.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/30">
                <TD><span className="font-mono-result font-bold text-slate-300">{row.voltage}</span></TD>
                <TD><span className="text-yellow-500 font-mono-result">{row.limited}</span></TD>
                <TD><span className="text-orange-500 font-mono-result">{row.restricted}</span></TD>
                <TD><span className="text-red-400 font-mono-result">{row.prohibited}</span></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-[10px] text-slate-600 leading-relaxed">
        Source: NFPA 70E-2021 Table 130.4(E)(a). Distances apply to qualified workers. State regulations may differ.
        Always verify with the current edition of NFPA 70E and applicable OSHA regulations (29 CFR 1910.333, 1926.403).
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Protective Device Times
// ─────────────────────────────────────────────────────────────────────────────

const DEVICE_DATA = [
  { device: 'Current-Limiting Fuse (Class L, RK1)', type: 'Fuse', instant: '< 0.25 cycles (< 4 ms)', shortTime: '—', longTime: '—', notes: 'Fastest clearing; excellent current limiting' },
  { device: 'Current-Limiting Fuse (Class J, RK5)', type: 'Fuse', instant: '< 0.5 cycles (< 8 ms)', shortTime: '—', longTime: '—', notes: 'Common for feeder protection' },
  { device: 'Non-Current-Limiting Fuse (Class K5, H)', type: 'Fuse', instant: '1 – 2 cycles', shortTime: '—', longTime: 'Up to hours', notes: 'Older design; not current-limiting' },
  { device: 'LV MCCB — Instantaneous Trip', type: 'Breaker', instant: '0.5 – 1.5 cycles (8–25 ms)', shortTime: '—', longTime: '—', notes: 'Magnetic trip; no intentional delay' },
  { device: 'LV MCCB — Long-Time Delay', type: 'Breaker', instant: '—', shortTime: '—', longTime: '6 – 300 sec (overload)', notes: 'Thermal-magnetic element' },
  { device: 'LV Power Circuit Breaker — Inst Zone', type: 'Breaker', instant: '< 1 cycle', shortTime: '—', longTime: '—', notes: 'Frame breaker, fully adjustable' },
  { device: 'LV Power Circuit Breaker — ST Zone', type: 'Breaker', instant: '—', shortTime: '6 – 30 cycles (0.1–0.5 s)', longTime: '—', notes: 'Intentional delay for coordination' },
  { device: 'LV Power Circuit Breaker — LT Zone', type: 'Breaker', instant: '—', shortTime: '—', longTime: '30+ cycles (overload)', notes: 'Thermal memory element' },
  { device: 'MV Relay (51) — Definite Time', type: 'Relay', instant: '—', shortTime: '6 – 3600 cycles (0.1–60 s)', longTime: '—', notes: 'Fixed delay, independent of current' },
  { device: 'MV Relay (50) — Instantaneous', type: 'Relay', instant: '1.5 – 3 cycles', shortTime: '—', longTime: '—', notes: 'High current pickup, fast clearing' },
  { device: 'MV Relay (51) — Inverse Time', type: 'Relay', instant: '—', shortTime: 'Varies (TCC curve)', longTime: 'Varies (TCC curve)', notes: 'ANSI/IEC curve types; current-dependent' },
  { device: 'MV Vacuum Breaker (Mechanical)', type: 'Breaker', instant: '—', shortTime: '3 – 5 cycles interrupt', longTime: '—', notes: 'Relay + breaker total; relay adds time' },
  { device: 'Recloser', type: 'Recloser', instant: 'Fast curve: 1–3 cycles', shortTime: 'Delay curve: 10–60 cycles', longTime: '—', notes: 'Utility distribution; multiple operations' },
];

const TYPE_COLORS = {
  Fuse: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Breaker: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Relay: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Recloser: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

function ProtectiveDevice() {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Typical protective device clearing times. Arc flash incident energy is proportional to arc duration —
        shorter clearing = less energy. Coordinate devices to ensure fastest clearing for arc flash reduction.
      </p>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full bg-[#13151c]">
          <thead>
            <tr>
              <TH>Device</TH>
              <TH>Type</TH>
              <TH>Instantaneous</TH>
              <TH>Short-Time Delay</TH>
              <TH>Long-Time Delay</TH>
              <TH>Notes</TH>
            </tr>
          </thead>
          <tbody>
            {DEVICE_DATA.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                <TD><span className="text-slate-300 font-medium text-[11px]">{row.device}</span></TD>
                <TD>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${TYPE_COLORS[row.type] || ''}`}>
                    {row.type}
                  </span>
                </TD>
                <TD>
                  <span className={row.instant === '—' ? 'text-slate-700 text-[10px]' : 'text-emerald-400 font-mono-result text-[10px]'}>
                    {row.instant}
                  </span>
                </TD>
                <TD>
                  <span className={row.shortTime === '—' ? 'text-slate-700 text-[10px]' : 'text-yellow-400 font-mono-result text-[10px]'}>
                    {row.shortTime}
                  </span>
                </TD>
                <TD>
                  <span className={row.longTime === '—' ? 'text-slate-700 text-[10px]' : 'text-orange-400 font-mono-result text-[10px]'}>
                    {row.longTime}
                  </span>
                </TD>
                <TD><span className="text-[10px] text-slate-600">{row.notes}</span></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-[#13151c] border border-slate-800 rounded-xl p-3">
          <div className="text-xs font-bold text-slate-400 mb-2">Arc Flash Reduction Strategies</div>
          {[
            'Zone-selective interlocking (ZSI) — eliminates ST delay for zone faults',
            'Maintenance mode setting — reduces instantaneous pickup temporarily',
            'Bus differential protection — fastest clearing for bus faults',
            'Current-limiting fuses — < ¼ cycle clearing, excellent for arc flash',
            'High-resistance grounding (HRG) — limits ground fault arc energy to < 1A',
          ].map((t, i) => (
            <div key={i} className="flex gap-1.5 text-[11px] text-slate-500 mb-1">
              <span className="text-amber-600 text-[8px] mt-0.5 shrink-0">▶</span>{t}
            </div>
          ))}
        </div>
        <div className="bg-[#13151c] border border-slate-800 rounded-xl p-3">
          <div className="text-xs font-bold text-slate-400 mb-2">Common Arc Duration Assumptions</div>
          {[
            '2 cycles (33 ms) — Current-limiting fuse, Inst. breaker at high IF',
            '6 cycles (100 ms) — Well-coordinated LV system, first upstream device',
            '12 cycles (200 ms) — Relay + breaker combination (MV)',
            '30 cycles (500 ms) — Short-time delay with coordination',
            '60+ cycles (≥1 s) — Over-fused or improperly coordinated systems',
          ].map((t, i) => (
            <div key={i} className="flex gap-1.5 text-[11px] text-slate-500 mb-1">
              <span className="text-amber-600 text-[8px] mt-0.5 shrink-0">▶</span>{t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main QuickReference component
// ─────────────────────────────────────────────────────────────────────────────

const TABS = {
  'ref-equipment':  { label: 'Equipment Bus Ratings',   icon: LayoutDashboard, Component: EquipmentRatings },
  'ref-ppe':        { label: 'PPE Categories',           icon: AlertTriangle,   Component: PPECategories },
  'ref-approach':   { label: 'Approach Boundaries',      icon: BookMarked,      Component: ApproachBoundaries },
  'ref-protective': { label: 'Protective Device Times',  icon: Zap,             Component: ProtectiveDevice },
};

export default function QuickReference({ activeTab }) {
  const tab = TABS[activeTab] || TABS['ref-equipment'];
  const { label, icon: Icon, Component } = tab;

  return (
    <div className="max-w-6xl mx-auto">
      <SectionHeader
        title={label}
        subtitle="NFPA 70E · IEEE C37 · NEC · UL standards reference"
        icon={Icon}
      />
      <Component />
    </div>
  );
}
