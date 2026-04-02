import React from 'react';
import { html } from 'htm/react';
const { useState } = React;

export function InputField({ label, unit, value, onChange, type='number', min, max, step, disabled, hint }) {
  return html`
    <div class="flex flex-col gap-1">
      <label class="text-xs font-semibold text-slate-400 flex items-center justify-between">
        <span>${label}</span>
        ${hint && html`<span class="text-[10px] text-slate-600 font-normal">${hint}</span>`}
      </label>
      <div class="flex">
        <input
          type=${type}
          value=${value}
          onInput=${e => onChange(type==='number' ? parseFloat(e.target.value)||0 : e.target.value)}
          min=${min} max=${max} step=${step} disabled=${disabled}
          class=${`flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-sm px-3 py-2
            focus:outline-none focus:border-amber-500 mono placeholder:text-slate-700
            ${disabled?'opacity-40 cursor-not-allowed':''} ${unit?'rounded-l':'rounded'}`}
        />
        ${unit && html`
          <span class="bg-slate-800 border border-l-0 border-slate-700 rounded-r px-3 py-2 text-xs text-slate-500 flex items-center whitespace-nowrap">
            ${unit}
          </span>
        `}
      </div>
    </div>`;
}

export function SelectField({ label, value, onChange, options, hint }) {
  return html`
    <div class="flex flex-col gap-1">
      <label class="text-xs font-semibold text-slate-400 flex items-center justify-between">
        <span>${label}</span>
        ${hint && html`<span class="text-[10px] text-slate-600 font-normal">${hint}</span>`}
      </label>
      <select value=${value} onChange=${e => onChange(e.target.value)}
        class="bg-slate-900 border border-slate-700 rounded text-slate-100 text-sm px-3 py-2
          focus:outline-none focus:border-amber-500 cursor-pointer">
        ${options.map(o => html`<option key=${o.value} value=${o.value}>${o.label}</option>`)}
      </select>
    </div>`;
}

export function Toggle({ label, checked, onChange, hint }) {
  return html`
    <div class="flex items-center justify-between gap-3">
      <div>
        <div class="text-xs font-semibold text-slate-400">${label}</div>
        ${hint && html`<div class="text-[10px] text-slate-600">${hint}</div>`}
      </div>
      <button onClick=${() => onChange(!checked)}
        class=${`relative w-10 h-5 rounded-full transition-colors shrink-0 ${checked?'bg-amber-500':'bg-slate-700'}`}>
        <span class=${`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked?'translate-x-5':''}`} />
      </button>
    </div>`;
}

export function ResultRow({ label, value, unit, highlight, size='normal' }) {
  const sz = size==='large'?'text-2xl':size==='xl'?'text-3xl':'text-sm';
  const col = highlight==='pass'?'text-emerald-400':highlight==='fail'?'text-red-400':
              highlight==='warn'?'text-amber-400':highlight==='danger'?'text-red-400':'text-amber-300';
  return html`
    <div class="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
      <span class="text-xs text-slate-500">${label}</span>
      <div class="flex items-center gap-1.5">
        <span class=${`mono font-bold ${sz} ${col}`}>${value}</span>
        ${unit && html`<span class="text-[10px] text-slate-600">${unit}</span>`}
      </div>
    </div>`;
}

export function ResultCard({ title, children, badge }) {
  return html`
    <div class="bg-[#13151c] border border-slate-800 rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-bold text-slate-400 tracking-wider uppercase">${title}</h3>
        ${badge}
      </div>
      ${children}
    </div>`;
}

export function Badge({ label, color }) {
  const c = color==='green'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':
            color==='red'  ?'bg-red-500/10 text-red-400 border-red-500/20':
            color==='yellow'?'bg-amber-500/10 text-amber-400 border-amber-500/20':
            color==='orange'?'bg-orange-500/10 text-orange-400 border-orange-500/20':
                             'bg-slate-700/50 text-slate-400 border-slate-700';
  return html`<span class=${`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c}`}>${label}</span>`;
}

export function SectionHeader({ title, subtitle, icon }) {
  return html`
    <div class="flex items-start gap-3 mb-6">
      ${icon && html`
        <div class="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 shrink-0 text-amber-400 text-lg">
          ${icon}
        </div>
      `}
      <div>
        <h2 class="text-lg font-bold text-slate-100">${title}</h2>
        ${subtitle && html`<p class="text-xs text-slate-500 mt-0.5">${subtitle}</p>`}
      </div>
    </div>`;
}

export function SaveButton({ onClick }) {
  return html`
    <button onClick=${onClick}
      class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded border border-slate-700 transition-colors">
      Save
    </button>`;
}

export function ExportButton({ onClick }) {
  return html`
    <button onClick=${onClick}
      class="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded border border-amber-500/20 transition-colors font-semibold">
      Export PDF
    </button>`;
}

export function InfoBox({ children, type='info' }) {
  const s = type==='danger'?'bg-red-500/5 border-red-500/20 text-red-400':
            type==='warning'?'bg-amber-500/5 border-amber-500/20 text-amber-400':
                             'bg-blue-500/5 border-blue-500/20 text-blue-400';
  return html`<div class=${`border rounded-lg p-3 text-xs leading-relaxed ${s}`}>${children}</div>`;
}

export function Card({ children, className='' }) {
  return html`<div class=${`bg-[#13151c] border border-slate-800 rounded-xl p-4 ${className}`}>${children}</div>`;
}
