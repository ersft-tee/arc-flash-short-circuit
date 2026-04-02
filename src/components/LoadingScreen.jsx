import { useEffect, useState } from 'react';

export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('Initializing...');

  useEffect(() => {
    const phases = [
      [0,   'Loading IEEE 1584 tables...'],
      [25,  'Importing NEC conductor data...'],
      [55,  'Building calculator engine...'],
      [80,  'Rendering PPE reference tables...'],
      [95,  'Ready'],
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < phases.length) {
        const [p, msg] = phases[i];
        setProgress(p);
        setPhase(msg);
        i++;
      } else {
        setProgress(100);
        clearInterval(interval);
        setTimeout(onDone, 400);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className="fixed inset-0 bg-[#0f1117] flex flex-col items-center justify-center z-50">
      {/* Lightning bolt */}
      <div className="relative mb-8">
        <div className="absolute inset-0 blur-3xl opacity-40 bg-amber-500 rounded-full scale-150" />
        <svg
          viewBox="0 0 60 80"
          className="w-20 h-24 relative animate-pulse"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="boltGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <polygon
            points="34,2 6,44 26,44 26,78 54,36 34,36"
            fill="url(#boltGrad)"
            stroke="#fcd34d"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-amber-400 tracking-wider mb-1">
        ARC FLASH CALCULATOR
      </h1>
      <p className="text-slate-500 text-sm mb-10 tracking-widest">
        IEEE 1584 · NEC · NFPA 70E
      </p>

      {/* Progress bar */}
      <div className="w-72 bg-slate-800 rounded-full h-1.5 overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-slate-500 text-xs font-mono-result">{phase}</p>
    </div>
  );
}
