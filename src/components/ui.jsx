// Shared UI primitives

export function InputField({ label, unit, value, onChange, type = 'number', min, max, step, disabled, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
        <span>{label}</span>
        {hint && <span className="text-[10px] text-slate-600 font-normal">{hint}</span>}
      </label>
      <div className="flex">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`
            flex-1 bg-slate-900 border border-slate-700 rounded-l text-slate-100 text-sm px-3 py-2
            focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20
            font-mono-result placeholder:text-slate-700
            ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
            ${unit ? '' : 'rounded-r'}
          `}
        />
        {unit && (
          <span className="bg-slate-800 border border-l-0 border-slate-700 rounded-r px-3 py-2 text-xs text-slate-500 flex items-center whitespace-nowrap">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function SelectField({ label, value, onChange, options, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
        <span>{label}</span>
        {hint && <span className="text-[10px] text-slate-600 font-normal">{hint}</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-900 border border-slate-700 rounded text-slate-100 text-sm px-3 py-2
          focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 cursor-pointer"
      >
        {options.map(({ value: v, label: l }) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </div>
  );
}

export function Toggle({ label, checked, onChange, hint }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs font-semibold text-slate-400">{label}</div>
        {hint && <div className="text-[10px] text-slate-600">{hint}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-amber-500' : 'bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}

export function ResultRow({ label, value, unit, highlight, mono = true, size = 'normal' }) {
  const textSize = size === 'large' ? 'text-2xl' : size === 'xl' ? 'text-3xl' : 'text-sm';
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <span
          className={`
            ${mono ? 'font-mono-result' : ''} font-bold ${textSize}
            ${highlight === 'pass'   ? 'text-emerald-400' :
              highlight === 'fail'   ? 'text-red-400' :
              highlight === 'warn'   ? 'text-amber-400' :
              highlight === 'danger' ? 'text-red-400' :
              'text-amber-300'}
          `}
        >
          {value}
        </span>
        {unit && <span className="text-[10px] text-slate-600">{unit}</span>}
      </div>
    </div>
  );
}

export function ResultCard({ title, children, badge, className = '' }) {
  return (
    <div className={`bg-[#13151c] border border-slate-800 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">{title}</h3>
        {badge}
      </div>
      {children}
    </div>
  );
}

export function Badge({ label, color }) {
  const colors = {
    green:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    red:    'bg-red-500/10 text-red-400 border border-red-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    gray:   'bg-slate-700/50 text-slate-400 border border-slate-700',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[color] || colors.gray}`}>
      {label}
    </span>
  );
}

export function SectionHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      {Icon && (
        <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 shrink-0">
          <Icon size={18} className="text-amber-400" />
        </div>
      )}
      <div>
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export function SaveButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded border border-slate-700 transition-colors"
    >
      Save
    </button>
  );
}

export function ExportButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded border border-amber-500/20 transition-colors font-semibold"
    >
      Export PDF
    </button>
  );
}

export function InfoBox({ children, type = 'info' }) {
  const styles = {
    info:    'bg-blue-500/5 border-blue-500/20 text-blue-400',
    warning: 'bg-amber-500/5 border-amber-500/20 text-amber-400',
    danger:  'bg-red-500/5 border-red-500/20 text-red-400',
  };
  return (
    <div className={`border rounded-lg p-3 text-xs leading-relaxed ${styles[type]}`}>
      {children}
    </div>
  );
}
