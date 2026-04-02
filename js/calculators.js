import React from 'react';
import { html } from 'htm/react';
import {
  CONDUCTOR_SIZES, getCableImpedance, getAmpacity,
  calcTransformerFault, calcCableVoltageDrop, calcMotorContribution,
  calcIncidentEnergy, PPE_CATEGORIES,
} from './data.js';
import { exportTransformerPDF, exportCablePDF, exportMotorPDF, exportArcFlashPDF } from './pdf.js';
import {
  InputField, SelectField, Toggle, ResultRow, ResultCard, Badge,
  SectionHeader, SaveButton, ExportButton, InfoBox, Card,
} from './ui.js';

const { useState } = React;

const fmt = (n, d=1) => n == null || isNaN(n) ? '—'
  : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

const VOLTAGE_OPTS = [
  {value:'208',label:'208 V'},{value:'240',label:'240 V'},{value:'277',label:'277 V'},
  {value:'480',label:'480 V'},{value:'600',label:'600 V'},{value:'2400',label:'2,400 V'},
  {value:'4160',label:'4,160 V'},{value:'12470',label:'12,470 V'},
  {value:'13200',label:'13,200 V'},{value:'13800',label:'13,800 V'},
];

// ─── Transformer Fault Current ───────────────────────────────────────────────

const KVA_PRESETS = [45,75,112.5,150,225,300,500,750,1000,1500,2000,2500];
const XFMR_DEF = { kva:500, vPrimary:12470, vSecondary:480, zPercent:4.0, phases:'3', useUtility:false, utilityFaultKA:0 };

export function TransformerFaultCurrent({ onSave }) {
  const [inp, setInp] = useState(XFMR_DEF);
  const set = k => v => setInp(p => ({ ...p, [k]: v }));
  const phases = parseInt(inp.phases);
  const utilKA = inp.useUtility ? inp.utilityFaultKA : null;
  const res = calcTransformerFault({ ...inp, phases, utilityFaultKA: utilKA });
  const iscKA = res.iscFinalKA;
  const faultBadge = iscKA >= 65 ? ['≥65 kA — Check bus rating!','red']
    : iscKA >= 22 ? ['22–65 kA range','yellow'] : ['≤22 kA range','green'];

  return html`
    <div class="max-w-5xl mx-auto">
      ${SectionHeader({ title:'Transformer Fault Current Calculator',
        subtitle:'Full-load amps and symmetrical fault current at secondary terminals', icon:'⚡' })}

      <div class="mb-5">
        <p class="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-semibold">Common Sizes</p>
        <div class="flex flex-wrap gap-1.5">
          ${KVA_PRESETS.map(k => html`
            <button key=${k} onClick=${() => set('kva')(k)}
              class=${`text-xs px-2.5 py-1 rounded border transition-all ${inp.kva===k
                ?'bg-amber-500 border-amber-500 text-black font-bold'
                :'bg-slate-800 border-slate-700 text-slate-400 hover:border-amber-500/50 hover:text-amber-400'}`}>
              ${k} kVA
            </button>`)}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="space-y-4">
          ${Card({ children: html`
            <h3 class="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Transformer Parameters</h3>
            <div class="space-y-4">
              ${InputField({ label:'kVA Rating', unit:'kVA', value:inp.kva, onChange:set('kva'), min:1, step:0.5 })}
              ${SelectField({ label:'Phase Configuration', value:inp.phases, onChange:set('phases'),
                options:[{value:'3',label:'3-Phase (Delta or Wye)'},{value:'1',label:'1-Phase'}] })}
              <div class="grid grid-cols-2 gap-3">
                ${SelectField({ label:'Primary Voltage', value:String(inp.vPrimary), onChange:v=>set('vPrimary')(parseInt(v)), options:VOLTAGE_OPTS })}
                ${SelectField({ label:'Secondary Voltage', value:String(inp.vSecondary), onChange:v=>set('vSecondary')(parseInt(v)), options:VOLTAGE_OPTS })}
              </div>
              ${InputField({ label:'Impedance (%Z)', unit:'%', value:inp.zPercent, onChange:set('zPercent'), min:0.1, max:20, step:0.01, hint:'Nameplate value' })}
            </div>
          ` })}
          ${Card({ children: html`
            <div class="space-y-4">
              ${Toggle({ label:'Include Utility Source Impedance', checked:inp.useUtility, onChange:set('useUtility'), hint:'Accounts for utility fault level at primary' })}
              ${inp.useUtility && InputField({ label:'Utility Available Fault at Primary', unit:'kA', value:inp.utilityFaultKA, onChange:set('utilityFaultKA'), min:0.1, step:0.1 })}
            </div>
          ` })}
        </div>

        <div class="space-y-4">
          ${ResultCard({ title:'Full Load Amps', badge:Badge({ label:phases+'-Phase', color:'gray' }),
            children: html`<div>
              ${ResultRow({ label:'Primary FLA', value:fmt(res.flaPrimary), unit:'A' })}
              ${ResultRow({ label:'Secondary FLA', value:fmt(res.flaSecondary), unit:'A' })}
            </div>` })}

          ${ResultCard({ title:'Available Fault Current', badge:Badge({ label:faultBadge[0], color:faultBadge[1] }),
            children: html`<div>
              ${ResultRow({ label:'Fault (Infinite Bus)', value:fmt(res.iscInfiniteKA,3), unit:'kA sym', highlight:'warn' })}
              ${res.iscWithUtilityKA != null && ResultRow({ label:'Fault (w/ Utility Z)', value:fmt(res.iscWithUtilityKA,3), unit:'kA sym', highlight:'warn' })}
              <div class="mt-3 pt-3 border-t border-slate-800">
                <div class="text-[10px] text-slate-500 mb-1">Design Fault Current</div>
                <div class="mono text-3xl font-bold text-amber-400">
                  ${fmt(res.iscFinalKA,2)} <span class="text-lg text-amber-600">kA</span>
                </div>
                <div class="text-[10px] text-slate-600 mt-1">Symmetrical RMS</div>
              </div>
            </div>` })}

          <div class="flex gap-2 justify-end">
            ${SaveButton({ onClick:() => onSave({ type:'Transformer Fault Current', inputs:{...inp,phases,utilityFaultKA:utilKA}, results:res, timestamp:Date.now() }) })}
            ${ExportButton({ onClick:() => exportTransformerPDF({...inp,phases,utilityFaultKA:utilKA}, res) })}
          </div>
          ${InfoBox({ type:'info', children: html`<span><strong>Note:</strong> Results are bolted fault current at secondary terminals.
            For asymmetrical peak, multiply by ~1.6×. Downstream cable impedance will reduce available fault current.</span>` })}
        </div>
      </div>
    </div>`;
}

// ─── Cable Impedance & Voltage Drop ─────────────────────────────────────────

const CABLE_DEF = { size:'4/0 AWG', material:'copper', conduit:'steel',
  lengthFt:200, loadAmps:200, voltage:480, phases:'3', pf:0.85, isFeeder:true };

export function CableImpedance({ onSave }) {
  const [inp, setInp] = useState(CABLE_DEF);
  const set = k => v => setInp(p => ({ ...p, [k]: v }));
  const imp = getCableImpedance(inp.size, inp.material, inp.conduit);
  const ampacity = getAmpacity(inp.size, inp.material);
  const phases = parseInt(inp.phases);
  const res = imp ? calcCableVoltageDrop({ rPer1000ft:imp.r, xPer1000ft:imp.x,
    lengthFt:inp.lengthFt, loadAmps:inp.loadAmps, voltage:inp.voltage, phases, pf:inp.pf }) : null;
  const limit = inp.isFeeder ? 5 : 3;
  const pass = res ? res.vdPct <= limit : null;
  const ampPass = ampacity ? inp.loadAmps <= ampacity : null;

  return html`
    <div class="max-w-5xl mx-auto">
      ${SectionHeader({ title:'Cable Impedance & Voltage Drop', subtitle:'NEC 2023 Table 9 conductor impedance — 75°C', icon:'🔌' })}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="space-y-4">
          ${Card({ children: html`
            <h3 class="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Conductor Selection</h3>
            <div class="space-y-4">
              ${SelectField({ label:'Conductor Size', value:inp.size, onChange:set('size'),
                options:CONDUCTOR_SIZES.map(s => ({value:s,label:s})) })}
              <div class="grid grid-cols-2 gap-3">
                ${SelectField({ label:'Material', value:inp.material, onChange:set('material'),
                  options:[{value:'copper',label:'Copper (Cu)'},{value:'aluminum',label:'Aluminum (Al)'}] })}
                ${SelectField({ label:'Conduit Type', value:inp.conduit, onChange:set('conduit'),
                  options:[{value:'steel',label:'Steel (Magnetic)'},{value:'pvc',label:'PVC (Non-magnetic)'}] })}
              </div>
            </div>
          ` })}
          ${Card({ children: html`
            <h3 class="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Circuit Parameters</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                ${InputField({ label:'One-Way Length', unit:'ft', value:inp.lengthFt, onChange:set('lengthFt'), min:1 })}
                ${InputField({ label:'Load Current', unit:'A', value:inp.loadAmps, onChange:set('loadAmps'), min:0.1, step:0.5 })}
              </div>
              <div class="grid grid-cols-2 gap-3">
                ${SelectField({ label:'Phase', value:inp.phases, onChange:set('phases'),
                  options:[{value:'3',label:'3-Phase'},{value:'1',label:'1-Phase'}] })}
                ${InputField({ label:'System Voltage', unit:'V', value:inp.voltage, onChange:set('voltage'), min:100 })}
              </div>
              ${InputField({ label:'Power Factor', unit:'p.u.', value:inp.pf, onChange:set('pf'), min:0.5, max:1.0, step:0.01, hint:'0.70–0.95 typical' })}
              ${Toggle({ label:'Feeder Circuit', checked:inp.isFeeder, onChange:set('isFeeder'), hint:'Feeder: 5% limit | Branch: 3% limit' })}
            </div>
          ` })}
        </div>

        <div class="space-y-4">
          ${!imp ? html`
            <div class="bg-[#13151c] border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm">
              Not available for this material/size combination.
            </div>
          ` : html`<div class="space-y-4">
            ${ResultCard({ title:'Conductor Properties (NEC Table 9)', badge:Badge({ label:inp.conduit==='steel'?'Steel Conduit':'PVC Conduit', color:'gray' }),
              children: html`<div>
                ${ResultRow({ label:'Resistance (R)', value:imp.r.toFixed(4), unit:'Ω/1000 ft' })}
                ${ResultRow({ label:'Reactance (X)', value:imp.x.toFixed(4), unit:'Ω/1000 ft' })}
                ${ResultRow({ label:'Impedance |Z|', value:Math.sqrt(imp.r**2+imp.x**2).toFixed(4), unit:'Ω/1000 ft' })}
                ${ResultRow({ label:'Ampacity (75°C)', value:ampacity??'—', unit:'A', highlight:ampPass===false?'fail':ampPass===true?'pass':undefined })}
              </div>` })}

            ${res && html`<div class="space-y-4">
              ${ResultCard({ title:'Total Circuit Impedance',
                children: html`<div>
                  ${ResultRow({ label:`Resistance (${inp.lengthFt} ft)`, value:res.rTotal.toFixed(4), unit:'Ω' })}
                  ${ResultRow({ label:'Reactance', value:res.xTotal.toFixed(4), unit:'Ω' })}
                  ${ResultRow({ label:'Impedance |Z|', value:res.zTotal.toFixed(4), unit:'Ω' })}
                </div>` })}

              ${ResultCard({ title:'Voltage Drop Analysis', badge:Badge({ label:pass?`PASS ≤${limit}%`:`FAIL >${limit}%`, color:pass?'green':'red' }),
                children: html`<div>
                  ${ResultRow({ label:'Voltage Drop', value:res.vdTotal.toFixed(2), unit:'V' })}
                  <div class="mt-2 pt-2 border-t border-slate-800">
                    <div class="flex items-end justify-between">
                      <div>
                        <div class="text-[10px] text-slate-500">Voltage Drop %</div>
                        <div class=${`mono text-3xl font-bold ${pass?'text-emerald-400':'text-red-400'}`}>
                          ${res.vdPct.toFixed(2)}<span class="text-lg ml-1 opacity-60">%</span>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-[10px] text-slate-500">Limit</div>
                        <div class="mono text-lg font-bold text-slate-400">${limit}%</div>
                        <div class="text-[10px] text-slate-600">${inp.isFeeder?'Feeder':'Branch'}</div>
                      </div>
                    </div>
                    <div class="mt-3 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div class=${`h-full rounded-full ${pass?'bg-emerald-500':'bg-red-500'}`}
                        style=${{ width:`${Math.min((res.vdPct/(limit*2))*100,100)}%` }} />
                    </div>
                  </div>
                </div>` })}

              <div class="flex gap-2 justify-end">
                ${SaveButton({ onClick:() => onSave({ type:'Cable Impedance & Voltage Drop', inputs:{...inp}, results:res, timestamp:Date.now() }) })}
                ${ExportButton({ onClick:() => exportCablePDF({...inp}, res) })}
              </div>
            </div>`}
          </div>`}

          ${InfoBox({ type:'info', children: html`<span><strong>Reference:</strong> NEC 2023 Chapter 9, Table 9 at 75°C.
            Two-way length used automatically. NEC recommends ≤3% branch, ≤5% total (feeder + branch).</span>` })}
        </div>
      </div>
    </div>`;
}

// ─── Motor Contribution ──────────────────────────────────────────────────────

const HP_PRESETS = [1,5,10,15,25,50,75,100,150,200,250,350,500];
const MOTOR_DEF = { hp:100, voltage:480, efficiency:0.92, pf:0.88, phases:'3',
  multiplier:'4.0', baseFaultKA:0, includeBase:false };

export function MotorContribution({ onSave }) {
  const [inp, setInp] = useState(MOTOR_DEF);
  const set = k => v => setInp(p => ({ ...p, [k]: v }));
  const phases = parseInt(inp.phases);
  const mult = parseFloat(inp.multiplier);
  const res = calcMotorContribution({ hp:inp.hp, voltage:inp.voltage, efficiency:inp.efficiency, pf:inp.pf, phases, multiplier:mult });
  const combinedKA = inp.includeBase && inp.baseFaultKA > 0
    ? { base:inp.baseFaultKA, total:inp.baseFaultKA + res.contributionKA } : null;

  return html`
    <div class="max-w-5xl mx-auto">
      ${SectionHeader({ title:'Motor Contribution Estimator', subtitle:'Induction motor contribution to fault current', icon:'⚙' })}

      <div class="mb-5">
        <p class="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-semibold">Quick HP Select</p>
        <div class="flex flex-wrap gap-1.5">
          ${HP_PRESETS.map(h => html`
            <button key=${h} onClick=${() => set('hp')(h)}
              class=${`text-xs px-2.5 py-1 rounded border transition-all ${inp.hp===h
                ?'bg-amber-500 border-amber-500 text-black font-bold'
                :'bg-slate-800 border-slate-700 text-slate-400 hover:border-amber-500/50 hover:text-amber-400'}`}>
              ${h} HP
            </button>`)}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="space-y-4">
          ${Card({ children: html`
            <h3 class="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Motor Parameters</h3>
            <div class="space-y-4">
              ${InputField({ label:'Motor Rating', unit:'HP', value:inp.hp, onChange:set('hp'), min:0.5, step:0.5 })}
              <div class="grid grid-cols-2 gap-3">
                ${SelectField({ label:'Phase', value:inp.phases, onChange:set('phases'),
                  options:[{value:'3',label:'3-Phase'},{value:'1',label:'1-Phase'}] })}
                ${InputField({ label:'Voltage', unit:'V', value:inp.voltage, onChange:set('voltage'), min:100 })}
              </div>
              <div class="grid grid-cols-2 gap-3">
                ${InputField({ label:'Efficiency', unit:'p.u.', value:inp.efficiency, onChange:set('efficiency'), min:0.5, max:1, step:0.01 })}
                ${InputField({ label:'Power Factor', unit:'p.u.', value:inp.pf, onChange:set('pf'), min:0.5, max:1, step:0.01 })}
              </div>
              ${SelectField({ label:'Fault Contribution Multiplier', value:inp.multiplier, onChange:set('multiplier'),
                options:[
                  {value:'3.6',label:'3.6× — IEEE 1584 default (motor terminals)'},
                  {value:'4.0',label:'4.0× — ANSI/IEEE C37 general use'},
                  {value:'4.8',label:'4.8× — Conservative / large synchronous'},
                  {value:'6.0',label:'6.0× — Synchronous generators'},
                ] })}
            </div>
          ` })}
          ${Card({ children: html`
            <div class="space-y-3">
              <label class="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input type="checkbox" checked=${inp.includeBase}
                  onChange=${e => set('includeBase')(e.target.checked)}
                  class="accent-amber-500" />
                Combine with utility/transformer fault current
              </label>
              ${inp.includeBase && InputField({ label:'Base System Fault Current', unit:'kA',
                value:inp.baseFaultKA, onChange:set('baseFaultKA'), min:0, step:0.1, hint:'From transformer calculator' })}
            </div>
          ` })}
        </div>

        <div class="space-y-4">
          ${ResultCard({ title:'Motor Full Load Amps',
            children: html`<div>
              ${ResultRow({ label:'Full Load Amps (FLA)', value:fmt(res.fla), unit:'A' })}
              <div class="text-[10px] text-slate-600 mt-1">
                = (${inp.hp} HP × 746) / (${phases===3?'√3 × ':''}${inp.voltage}V × ${(inp.efficiency*100).toFixed(0)}% × ${(inp.pf*100).toFixed(0)}%)
              </div>
            </div>` })}

          ${ResultCard({ title:'Fault Contribution', badge:Badge({ label:`${inp.multiplier}× FLA`, color:'yellow' }),
            children: html`<div>
              ${ResultRow({ label:'Contribution (A)', value:fmt(res.contributionAmps), unit:'A' })}
              <div class="mt-3 pt-3 border-t border-slate-800">
                <div class="text-[10px] text-slate-500 mb-1">Motor Contribution</div>
                <div class="mono text-3xl font-bold text-amber-400">
                  ${fmt(res.contributionKA,3)} <span class="text-lg text-amber-600">kA</span>
                </div>
              </div>
            </div>` })}

          ${combinedKA && ResultCard({ title:'Combined System Fault Current', badge:Badge({ label:'Utility + Motor', color:'orange' }),
            children: html`<div>
              ${ResultRow({ label:'Utility/Transformer Base', value:fmt(combinedKA.base,3), unit:'kA' })}
              ${ResultRow({ label:'Motor Contribution', value:fmt(res.contributionKA,3), unit:'kA' })}
              <div class="mt-3 pt-3 border-t border-slate-800">
                <div class="text-[10px] text-slate-500 mb-1">Total Available Fault</div>
                <div class="mono text-3xl font-bold text-red-400">
                  ${fmt(combinedKA.total,3)} <span class="text-lg text-red-600">kA</span>
                </div>
              </div>
            </div>` })}

          <div class="flex gap-2 justify-end">
            ${SaveButton({ onClick:() => onSave({ type:'Motor Contribution', inputs:{...inp}, results:res, combinedKA, timestamp:Date.now() }) })}
            ${ExportButton({ onClick:() => exportMotorPDF({...inp}, res, combinedKA) })}
          </div>
          ${InfoBox({ type:'warning', children: html`<span><strong>Note:</strong> Induction motor contribution decays in 5–8 cycles.
            Use 4.0× for initial symmetrical studies. Synchronous motors require separate treatment per IEEE C37.010.</span>` })}
        </div>
      </div>
    </div>`;
}

// ─── Incident Energy (IEEE 1584-2002) ────────────────────────────────────────

const GAP_PRESETS = [
  {label:'LV Switchgear (≤600V)',gap:32},{label:'MV Switchgear 5kV',gap:104},
  {label:'MV Switchgear 15kV',gap:152},{label:'480V MCC',gap:25},
  {label:'480V Panelboard',gap:25},{label:'600V Switchboard',gap:32},
];
const WORK_DIST = [{v:18,l:'18 in — Panelboard'},{v:24,l:'24 in — LV Switchgear'},
  {v:36,l:'36 in — MV Switchgear'},{v:48,l:'48 in — MV Open Bus'}];
const ARC_DEF = { ibfKA:20, voltageKV:0.48, gapMM:32, durationCycles:6, workingDistanceIn:24, config:'box', grounded:true };

const PPE_BG = ['bg-emerald-900/20 border-emerald-700/30','bg-yellow-900/20 border-yellow-700/30',
  'bg-orange-900/20 border-orange-800/20','bg-red-900/20 border-red-800/20',
  'bg-red-900/30 border-red-700/30','bg-red-900/40 border-red-600/40'];
const PPE_TEXT_COL = ['text-emerald-400','text-yellow-400','text-orange-400','text-red-400','text-red-300','text-red-300'];
const E_COL = (cat) => cat>=3?'text-red-400':cat>=2?'text-orange-400':cat>=1?'text-yellow-400':'text-emerald-400';

export function IncidentEnergy({ onSave }) {
  const [inp, setInp] = useState(ARC_DEF);
  const set = k => v => setInp(p => ({ ...p, [k]: v }));
  const valid = inp.ibfKA >= 0.7 && inp.ibfKA <= 106 && inp.voltageKV >= 0.208 && inp.voltageKV <= 15;
  const res = valid ? calcIncidentEnergy(inp) : null;
  const cat = res ? Math.min(res.ppeCategory, 5) : null;
  const ppeInfo = cat != null ? PPE_CATEGORIES[cat] : null;

  return html`
    <div class="max-w-5xl mx-auto">
      ${SectionHeader({ title:'Incident Energy Calculator',
        subtitle:'IEEE 1584-2002 simplified method — scoping estimates only', icon:'⚠' })}

      ${InfoBox({ type:'danger', children: html`<span><strong>⚠ Important:</strong> IEEE 1584-2002 simplified equations.
        A complete arc flash study per IEEE 1584-2018 is required for labeling and PPE selection.
        Valid: 0.208–15 kV, 0.7–106 kA.</span>` })}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <div class="space-y-4">
          ${Card({ children: html`
            <h3 class="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">System Parameters</h3>
            <div class="space-y-4">
              ${InputField({ label:'Available Bolted Fault Current', unit:'kA', value:inp.ibfKA, onChange:set('ibfKA'), min:0.7, max:106, step:0.1, hint:'0.7–106 kA' })}
              ${SelectField({ label:'System Voltage', value:String(inp.voltageKV), onChange:v=>set('voltageKV')(parseFloat(v)),
                options:[{value:'0.208',label:'208 V'},{value:'0.24',label:'240 V'},{value:'0.48',label:'480 V'},
                  {value:'0.6',label:'600 V'},{value:'2.4',label:'2,400 V'},{value:'4.16',label:'4,160 V'},
                  {value:'7.2',label:'7,200 V'},{value:'12.47',label:'12,470 V'},{value:'13.2',label:'13,200 V'},{value:'13.8',label:'13,800 V'}] })}
              ${SelectField({ label:'Electrode Configuration', value:inp.config, onChange:set('config'),
                options:[{value:'box',label:'In Enclosure / Box (switchgear, MCC, panelboard)'},
                  {value:'open',label:'Open Air / Bus (exposed conductors)'}] })}
              ${Toggle({ label:'Solidly Grounded System', checked:inp.grounded, onChange:set('grounded'), hint:'Uncheck for ungrounded or HRG systems' })}
            </div>
          ` })}

          ${Card({ children: html`
            <h3 class="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Gap & Working Distance</h3>
            <div class="space-y-4">
              <div>
                <p class="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Gap Presets</p>
                <div class="flex flex-wrap gap-1.5">
                  ${GAP_PRESETS.map(g => html`
                    <button key=${g.label} onClick=${()=>set('gapMM')(g.gap)}
                      class=${`text-[10px] px-2 py-1 rounded border transition-all ${inp.gapMM===g.gap
                        ?'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        :'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'}`}>
                      ${g.label} (${g.gap}mm)
                    </button>`)}
                </div>
              </div>
              ${InputField({ label:'Conductor Gap', unit:'mm', value:inp.gapMM, onChange:set('gapMM'), min:6.35, max:250, step:1 })}
              ${InputField({ label:'Arc Duration', unit:'cycles', value:inp.durationCycles, onChange:set('durationCycles'), min:0.5, max:120, step:0.5, hint:'1 cycle = 16.7 ms at 60 Hz' })}
              <div>
                <p class="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Working Distance Presets</p>
                <div class="flex flex-wrap gap-1.5">
                  ${WORK_DIST.map(d => html`
                    <button key=${d.v} onClick=${()=>set('workingDistanceIn')(d.v)}
                      class=${`text-[10px] px-2 py-1 rounded border transition-all ${inp.workingDistanceIn===d.v
                        ?'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        :'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'}`}>
                      ${d.l}
                    </button>`)}
                </div>
              </div>
              ${InputField({ label:'Working Distance', unit:'in', value:inp.workingDistanceIn, onChange:set('workingDistanceIn'), min:6, step:1, hint:'NFPA 70E Table 130.7(C)(15)(a)' })}
            </div>
          ` })}
        </div>

        <div class="space-y-4">
          ${!valid && InfoBox({ type:'warning', children: html`<span>Input values outside IEEE 1584-2002 valid range.
            Fault current: 0.7–106 kA, Voltage: 0.208–15 kV.</span>` })}

          ${valid && res && html`<div class="space-y-4">
            ${ppeInfo && html`
              <div class=${`border rounded-xl p-4 ${PPE_BG[cat]}`}>
                <div class="flex items-center gap-3 mb-3">
                  <span class=${`text-2xl ${PPE_TEXT_COL[cat]}`}>🛡</span>
                  <div>
                    <div class=${`text-xs font-bold uppercase tracking-wider ${PPE_TEXT_COL[cat]}`}>${ppeInfo.label}</div>
                    <div class="text-[10px] text-slate-500">${ppeInfo.calCm2} cal/cm² — Min Rating: ${ppeInfo.minRating}</div>
                  </div>
                </div>
                ${ppeInfo.clothing.map((c,i) => html`
                  <div key=${i} class="flex items-start gap-1.5 text-[11px] text-slate-400 mb-1">
                    <span class=${`${PPE_TEXT_COL[cat]} text-[8px] mt-1`}>▶</span>${c}
                  </div>`)}
                ${ppeInfo.equipment.map((c,i) => html`
                  <div key=${i} class="flex items-start gap-1.5 text-[11px] text-slate-500 mb-1">
                    <span class="text-slate-700 text-[8px] mt-1">▶</span>${c}
                  </div>`)}
              </div>`}

            ${ResultCard({ title:'Arc Flash Results',
              children: html`<div>
                ${ResultRow({ label:'Arcing Current', value:res.arcingCurrentKA.toFixed(3), unit:'kA' })}
                ${ResultRow({ label:'Arc Duration', value:(res.arcDurationSec*1000).toFixed(1), unit:'ms' })}
                ${ResultRow({ label:'Arc Flash Boundary', value:res.afbFt.toFixed(1), unit:'ft', highlight:'warn' })}
                ${ResultRow({ label:'Arc Flash Boundary', value:res.afbIn.toFixed(1), unit:'in' })}
                <div class="mt-3 pt-3 border-t border-slate-800">
                  <div class="text-[10px] text-slate-500 mb-1">Incident Energy at ${inp.workingDistanceIn}" distance</div>
                  <div class=${`mono text-4xl font-bold ${E_COL(cat)}`}>
                    ${res.incidentEnergyCalCm2.toFixed(2)}
                    <span class="text-lg ml-1 opacity-60">cal/cm²</span>
                  </div>
                </div>
              </div>` })}

            <div class="flex gap-2 justify-end">
              ${SaveButton({ onClick:() => onSave({ type:'Arc Flash Incident Energy', inputs:{...inp}, results:res, timestamp:Date.now() }) })}
              ${ExportButton({ onClick:() => exportArcFlashPDF(inp, res) })}
            </div>
          </div>`}

          ${InfoBox({ type:'warning', children: html`<span><strong>Method:</strong> IEEE 1584-2002 equations.
            Arc flash duration is the critical variable — verify protective device clearing times separately.
            The 2018 revision is more accurate but requires additional inputs.</span>` })}
        </div>
      </div>
    </div>`;
}
