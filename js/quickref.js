import React from 'react';
import { html } from 'htm/react';
import { EQUIPMENT_DATA, PPE_TABLE_DATA, APPROACH_DATA, DEVICE_DATA } from './data.js';
import { SectionHeader } from './ui.js';

const TH = ({ children }) => html`
  <th class="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2.5 border-b border-slate-800 whitespace-nowrap">
    ${children}
  </th>`;

const TD = ({ children, accent, small }) => html`
  <td class=${`px-3 py-2.5 border-b border-slate-800/50 ${
    accent ? 'mono font-bold text-amber-400 text-xs' :
    small  ? 'text-[10px] text-slate-600' : 'text-xs text-slate-400'}`}>
    ${children}
  </td>`;

// ─── Equipment Bus Ratings ───────────────────────────────────────────────────

function EquipmentRatings() {
  return html`<div>
    <p class="text-xs text-slate-500 mb-4 leading-relaxed">
      Standard short circuit current ratings (SCCR / AIC) per UL 67, UL 891, UL 845, and IEEE C37.
      Verify with equipment nameplate — AIC ratings vary by manufacturer and configuration.
    </p>
    <div class="overflow-x-auto rounded-xl border border-slate-800">
      <table class="w-full bg-[#13151c]">
        <thead>
          <tr>
            ${TH({ children:'Equipment Type' })}
            ${TH({ children:'Example Products' })}
            ${TH({ children:'Voltage' })}
            ${TH({ children:'Standard AIC Ratings' })}
            ${TH({ children:'Notes' })}
          </tr>
        </thead>
        <tbody>
          ${EQUIPMENT_DATA.map((row, i) => html`
            <tr key=${i} class="hover:bg-slate-800/30 transition-colors">
              <td class="px-3 py-2.5 border-b border-slate-800/50">
                <span class="font-semibold text-slate-300 text-xs">${row.type}</span>
              </td>
              <td class="px-3 py-2.5 border-b border-slate-800/50 text-[10px] text-slate-500">${row.examples}</td>
              ${TD({ children:row.voltage, accent:true })}
              <td class="px-3 py-2.5 border-b border-slate-800/50">
                <div class="flex flex-wrap gap-1">
                  ${row.ratings.map(r => html`
                    <span key=${r} class="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] mono font-bold px-1.5 py-0.5 rounded">
                      ${r}
                    </span>`)}
                </div>
              </td>
              ${TD({ children:row.notes, small:true })}
            </tr>`)}
        </tbody>
      </table>
    </div>
    <div class="mt-3 text-[10px] text-slate-600 leading-relaxed">
      Standard ratings: 10 kA · 14 kA · 22 kA · 42 kA · 65 kA · 85 kA · 100 kA (UL 489).
      Equipment must be rated ≥ available fault current at its installation point.
    </div>
  </div>`;
}

// ─── PPE Categories ──────────────────────────────────────────────────────────

function PPECategories() {
  return html`<div class="space-y-4">
    <p class="text-xs text-slate-500">
      PPE categories per NFPA 70E-2021 Table 130.5(G). When incident energy exceeds 40 cal/cm²,
      engineering controls or de-energizing are required — Category 4 equipment is insufficient.
    </p>
    ${PPE_TABLE_DATA.map(d => html`
      <div key=${d.cat} class=${`border rounded-xl p-4 ${d.bg}`}>
        <div class="flex items-center gap-3 mb-3">
          <div class=${`text-4xl mono font-black ${d.color} leading-none`}>${d.cat}</div>
          <div>
            <div class=${`text-sm font-bold ${d.color}`}>PPE Category ${d.cat}</div>
            <div class="text-xs text-slate-500">${d.range} — Min AR clothing: <span class="mono font-bold text-slate-300">${d.minAR}</span></div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Body Protection</div>
            ${d.clothing.map((c,i) => html`<div key=${i} class="flex gap-1.5 text-[11px] text-slate-400 mb-1"><span class=${`${d.color} text-[8px] mt-1`}>▶</span>${c}</div>`)}
          </div>
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Face / Head</div>
            ${d.face.map((c,i) => html`<div key=${i} class="flex gap-1.5 text-[11px] text-slate-400 mb-1"><span class=${`${d.color} text-[8px] mt-1`}>▶</span>${c}</div>`)}
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 mt-2">Other PPE</div>
            ${d.other.map((c,i) => html`<div key=${i} class="flex gap-1.5 text-[11px] text-slate-400 mb-1"><span class="text-slate-700 text-[8px] mt-1">▶</span>${c}</div>`)}
          </div>
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Example Tasks</div>
            ${d.tasks.map((t,i) => html`<div key=${i} class="flex gap-1.5 text-[11px] text-slate-500 mb-1"><span class="text-slate-700 text-[8px] mt-1">—</span>${t}</div>`)}
          </div>
        </div>
      </div>`)}
  </div>`;
}

// ─── Approach Boundaries ─────────────────────────────────────────────────────

function ApproachBoundaries() {
  return html`<div>
    <p class="text-xs text-slate-500 mb-4 leading-relaxed">
      NFPA 70E-2021 Table 130.4(E)(a) — Approach limit distances from energized conductors or circuit parts.
      Distances include body, tools, equipment, and lead wires.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      ${[
        { b:'Limited Approach Boundary', col:'text-yellow-400 bg-yellow-900/10 border-yellow-800/20',
          d:'Unqualified persons must not cross without escort by a qualified person.' },
        { b:'Restricted Approach Boundary', col:'text-orange-400 bg-orange-900/10 border-orange-800/20',
          d:'Qualified persons only. Shock protection required. Insulated tools, rubber insulating equipment.' },
        { b:'Prohibited Approach Boundary', col:'text-red-400 bg-red-900/10 border-red-800/20',
          d:'Treated as direct contact. Full PPE required. Special work permits.' },
      ].map(x => html`
        <div key=${x.b} class=${`border rounded-lg p-3 ${x.col}`}>
          <div class=${`text-xs font-bold mb-1 ${x.col.split(' ')[0]}`}>${x.b}</div>
          <div class="text-[11px] text-slate-500">${x.d}</div>
        </div>`)}
    </div>
    <div class="overflow-x-auto rounded-xl border border-slate-800">
      <table class="w-full bg-[#13151c]">
        <thead>
          <tr>
            ${TH({ children:'Nominal Voltage (Phase-to-Phase)' })}
            ${TH({ children:'Limited Approach' })}
            ${TH({ children:'Restricted Approach' })}
            ${TH({ children:'Prohibited Approach' })}
          </tr>
        </thead>
        <tbody>
          ${APPROACH_DATA.map((r,i) => html`
            <tr key=${i} class="hover:bg-slate-800/30">
              <td class="px-3 py-2.5 border-b border-slate-800/50 mono font-bold text-slate-300 text-xs">${r.v}</td>
              <td class="px-3 py-2.5 border-b border-slate-800/50 mono text-yellow-500 text-xs">${r.lim}</td>
              <td class="px-3 py-2.5 border-b border-slate-800/50 mono text-orange-500 text-xs">${r.res}</td>
              <td class="px-3 py-2.5 border-b border-slate-800/50 mono text-red-400 text-xs">${r.proh}</td>
            </tr>`)}
        </tbody>
      </table>
    </div>
    <div class="mt-3 text-[10px] text-slate-600">
      Source: NFPA 70E-2021 Table 130.4(E)(a). State regulations may differ.
      Verify with current NFPA 70E and OSHA 29 CFR 1910.333 / 1926.403.
    </div>
  </div>`;
}

// ─── Protective Device Times ──────────────────────────────────────────────────

const TYPE_COL = {
  Fuse:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Breaker: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Relay:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Recloser:'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

function ProtectiveDevice() {
  return html`<div>
    <p class="text-xs text-slate-500 mb-4 leading-relaxed">
      Typical protective device clearing times. Incident energy ∝ arc duration — shorter clearing = less energy.
    </p>
    <div class="overflow-x-auto rounded-xl border border-slate-800">
      <table class="w-full bg-[#13151c]">
        <thead>
          <tr>
            ${TH({ children:'Device' })}${TH({ children:'Type' })}
            ${TH({ children:'Instantaneous' })}${TH({ children:'Short-Time Delay' })}
            ${TH({ children:'Long-Time Delay' })}${TH({ children:'Notes' })}
          </tr>
        </thead>
        <tbody>
          ${DEVICE_DATA.map((r,i) => html`
            <tr key=${i} class="hover:bg-slate-800/30 transition-colors">
              <td class="px-3 py-2.5 border-b border-slate-800/50 text-slate-300 font-medium text-[11px]">${r.device}</td>
              <td class="px-3 py-2.5 border-b border-slate-800/50">
                <span class=${`text-[9px] font-bold px-1.5 py-0.5 rounded border ${TYPE_COL[r.type]||''}`}>${r.type}</span>
              </td>
              <td class="px-3 py-2.5 border-b border-slate-800/50">
                <span class=${`mono text-[10px] ${r.inst==='—'?'text-slate-700':'text-emerald-400'}`}>${r.inst}</span>
              </td>
              <td class="px-3 py-2.5 border-b border-slate-800/50">
                <span class=${`mono text-[10px] ${r.st==='—'?'text-slate-700':'text-yellow-400'}`}>${r.st}</span>
              </td>
              <td class="px-3 py-2.5 border-b border-slate-800/50">
                <span class=${`mono text-[10px] ${r.lt==='—'?'text-slate-700':'text-orange-400'}`}>${r.lt}</span>
              </td>
              <td class="px-3 py-2.5 border-b border-slate-800/50 text-[10px] text-slate-600">${r.notes}</td>
            </tr>`)}
        </tbody>
      </table>
    </div>
    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      ${[
        { title:'Arc Flash Reduction Strategies', items:[
          'Zone-selective interlocking (ZSI) — removes ST delay for zone faults',
          'Maintenance mode — reduces instantaneous pickup temporarily',
          'Bus differential protection — fastest bus fault clearing',
          'Current-limiting fuses — < ¼ cycle; best arc flash reduction',
          'High-resistance grounding (HRG) — limits ground fault arc to < 1A',
        ]},
        { title:'Common Arc Duration Assumptions', items:[
          '2 cycles (33 ms) — CL fuse, instantaneous breaker at high IF',
          '6 cycles (100 ms) — Well-coordinated LV system',
          '12 cycles (200 ms) — Relay + breaker combination (MV)',
          '30 cycles (500 ms) — Short-time delay with coordination',
          '60+ cycles (≥1 s) — Over-fused or improperly coordinated',
        ]},
      ].map(b => html`
        <div key=${b.title} class="bg-[#13151c] border border-slate-800 rounded-xl p-3">
          <div class="text-xs font-bold text-slate-400 mb-2">${b.title}</div>
          ${b.items.map((t,i) => html`
            <div key=${i} class="flex gap-1.5 text-[11px] text-slate-500 mb-1">
              <span class="text-amber-600 text-[8px] mt-0.5 shrink-0">▶</span>${t}
            </div>`)}
        </div>`)}
    </div>
  </div>`;
}

// ─── Main QuickReference ─────────────────────────────────────────────────────

const TABS = {
  'ref-equipment':  { label:'Equipment Bus Ratings',  icon:'🔲', subtitle:'UL 67 · UL 891 · UL 845 · IEEE C37', Component:EquipmentRatings },
  'ref-ppe':        { label:'PPE Categories',          icon:'🛡', subtitle:'NFPA 70E-2021 Table 130.5(G)',    Component:PPECategories },
  'ref-approach':   { label:'Approach Boundaries',     icon:'📏', subtitle:'NFPA 70E-2021 Table 130.4(E)(a)', Component:ApproachBoundaries },
  'ref-protective': { label:'Protective Device Times', icon:'⏱', subtitle:'IEEE C37 · ANSI device time reference', Component:ProtectiveDevice },
};

export function QuickReference({ activeTab }) {
  const tab = TABS[activeTab] || TABS['ref-equipment'];
  return html`
    <div class="max-w-6xl mx-auto">
      ${SectionHeader({ title:tab.label, subtitle:tab.subtitle, icon:tab.icon })}
      ${tab.Component()}
    </div>`;
}
