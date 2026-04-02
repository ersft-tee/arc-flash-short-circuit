// ─── Cable Data (NEC 2023 Table 9, 75°C) ────────────────────────────────────

export const CONDUCTOR_SIZES = [
  '14 AWG','12 AWG','10 AWG','8 AWG','6 AWG','4 AWG','3 AWG','2 AWG',
  '1 AWG','1/0 AWG','2/0 AWG','3/0 AWG','4/0 AWG',
  '250 kcmil','300 kcmil','350 kcmil','400 kcmil','500 kcmil','600 kcmil','750 kcmil',
];

// [cu_steel, cu_pvc, al_steel, al_pvc]  Ω/1000 ft
const R_TABLE = {
  '14 AWG':   [3.14,  3.14,  null,  null ],
  '12 AWG':   [1.98,  1.98,  3.25,  3.25 ],
  '10 AWG':   [1.24,  1.24,  2.04,  2.04 ],
  '8 AWG':    [0.778, 0.778, 1.28,  1.28 ],
  '6 AWG':    [0.491, 0.491, 0.808, 0.808],
  '4 AWG':    [0.308, 0.308, 0.508, 0.508],
  '3 AWG':    [0.245, 0.245, 0.403, 0.403],
  '2 AWG':    [0.194, 0.194, 0.319, 0.319],
  '1 AWG':    [0.154, 0.154, 0.253, 0.253],
  '1/0 AWG':  [0.122, 0.122, 0.201, 0.201],
  '2/0 AWG':  [0.0967,0.0967,0.159, 0.159],
  '3/0 AWG':  [0.0766,0.0766,0.126, 0.126],
  '4/0 AWG':  [0.0608,0.0608,0.100, 0.100],
  '250 kcmil':[0.0515,0.0515,0.0847,0.0847],
  '300 kcmil':[0.0429,0.0429,0.0707,0.0707],
  '350 kcmil':[0.0367,0.0367,0.0605,0.0605],
  '400 kcmil':[0.0321,0.0321,0.0529,0.0529],
  '500 kcmil':[0.0258,0.0258,0.0424,0.0424],
  '600 kcmil':[0.0214,0.0214,0.0353,0.0353],
  '750 kcmil':[0.0171,0.0171,0.0282,0.0282],
};

// [steel, pvc]  Ω/1000 ft
const X_TABLE = {
  '14 AWG':   [0.058,0.050],'12 AWG':   [0.054,0.050],'10 AWG':   [0.050,0.044],
  '8 AWG':    [0.052,0.045],'6 AWG':    [0.051,0.044],'4 AWG':    [0.048,0.043],
  '3 AWG':    [0.047,0.042],'2 AWG':    [0.045,0.040],'1 AWG':    [0.046,0.041],
  '1/0 AWG':  [0.044,0.040],'2/0 AWG':  [0.043,0.039],'3/0 AWG':  [0.042,0.038],
  '4/0 AWG':  [0.041,0.037],'250 kcmil':[0.041,0.037],'300 kcmil':[0.041,0.036],
  '350 kcmil':[0.040,0.036],'400 kcmil':[0.040,0.035],'500 kcmil':[0.039,0.035],
  '600 kcmil':[0.039,0.034],'750 kcmil':[0.038,0.034],
};

const CU_AMP = {
  '14 AWG':15,'12 AWG':20,'10 AWG':30,'8 AWG':50,'6 AWG':65,'4 AWG':85,
  '3 AWG':100,'2 AWG':115,'1 AWG':130,'1/0 AWG':150,'2/0 AWG':175,'3/0 AWG':200,
  '4/0 AWG':230,'250 kcmil':255,'300 kcmil':285,'350 kcmil':310,'400 kcmil':335,
  '500 kcmil':380,'600 kcmil':420,'750 kcmil':475,
};

const AL_AMP = {
  '12 AWG':20,'10 AWG':25,'8 AWG':40,'6 AWG':50,'4 AWG':65,'3 AWG':75,'2 AWG':90,
  '1 AWG':100,'1/0 AWG':120,'2/0 AWG':135,'3/0 AWG':155,'4/0 AWG':180,
  '250 kcmil':205,'300 kcmil':230,'350 kcmil':250,'400 kcmil':270,
  '500 kcmil':310,'600 kcmil':340,'750 kcmil':385,
};

export function getCableImpedance(size, material, conduit) {
  const r = material === 'copper'
    ? (conduit === 'steel' ? R_TABLE[size]?.[0] : R_TABLE[size]?.[1])
    : (conduit === 'steel' ? R_TABLE[size]?.[2] : R_TABLE[size]?.[3]);
  const x = conduit === 'steel' ? X_TABLE[size]?.[0] : X_TABLE[size]?.[1];
  return (r != null && x != null) ? { r, x } : null;
}

export function getAmpacity(size, material) {
  return material === 'copper' ? (CU_AMP[size] ?? null) : (AL_AMP[size] ?? null);
}

// ─── Calculations ────────────────────────────────────────────────────────────

export function calcTransformerFault({ kva, vPrimary, vSecondary, zPercent, phases = 3, utilityFaultKA = null }) {
  const Z = zPercent / 100;
  const s = Math.sqrt(3);
  const flaS = phases === 3 ? (kva * 1000) / (s * vSecondary) : (kva * 1000) / vSecondary;
  const flaP = phases === 3 ? (kva * 1000) / (s * vPrimary)   : (kva * 1000) / vPrimary;
  const iscInf = flaS / Z;
  let iscUtil = null;
  if (utilityFaultKA > 0) {
    const mvaSys = s * (vPrimary / 1000) * utilityFaultKA;
    const zUtPU  = (kva / 1000) / mvaSys;
    iscUtil = flaS / (zUtPU + Z);
  }
  return {
    flaSecondary: flaS, flaPrimary: flaP,
    iscInfiniteKA: iscInf / 1000,
    iscWithUtilityKA: iscUtil ? iscUtil / 1000 : null,
    iscFinalKA: (iscUtil ?? iscInf) / 1000,
  };
}

export function calcCableVoltageDrop({ rPer1000ft, xPer1000ft, lengthFt, loadAmps, voltage, phases = 3, pf = 0.85 }) {
  const R = rPer1000ft * lengthFt / 1000;
  const X = xPer1000ft * lengthFt / 1000;
  const Z = Math.sqrt(R * R + X * X);
  const sin = Math.sin(Math.acos(pf));
  const vdPerCond = loadAmps * (R * pf + X * sin);
  const vdTotal   = phases === 1 ? 2 * vdPerCond : Math.sqrt(3) * vdPerCond;
  return {
    rTotal: R, xTotal: X, zTotal: Z,
    vdTotal, vdPct: (vdTotal / voltage) * 100,
    rPer1000: rPer1000ft, xPer1000: xPer1000ft,
    zPer1000: Math.sqrt(rPer1000ft ** 2 + xPer1000ft ** 2),
  };
}

export function calcMotorContribution({ hp, voltage, efficiency, pf, phases = 3, multiplier = 4.0 }) {
  const s = Math.sqrt(3);
  const fla = phases === 3
    ? (hp * 746) / (s * voltage * efficiency * pf)
    : (hp * 746) / (voltage * efficiency * pf);
  const contrib = fla * multiplier;
  return { fla, contributionAmps: contrib, contributionKA: contrib / 1000, multiplierUsed: multiplier };
}

export function calcIncidentEnergy({ ibfKA, voltageKV, gapMM, durationCycles, workingDistanceIn, config, grounded }) {
  const Ibf = ibfKA, V = voltageKV, G = gapMM;
  const t = durationCycles / 60;
  const D = workingDistanceIn * 25.4;
  const K1 = config === 'box' ? -0.555 : -0.792;
  const K2 = grounded ? -0.113 : 0;

  const lnIa = K1 + K2 + 0.662 * Math.log(Ibf) + 0.0966 * V + 0.000526 * G
    + 0.5588 * V * Math.log(Ibf) - 0.00304 * G * Math.log(Ibf);
  const Ia = Math.exp(lnIa);

  const lnEn = K1 + K2 + 1.081 * Math.log(Ia) + 0.0011 * G;
  const En = Math.exp(lnEn);

  const x  = config === 'box' ? (V <= 1 ? 1.473 : 0.973) : 2.0;
  const Cf = V <= 1 ? 1.5 : 1.0;
  const E  = 4.184 * Cf * En * (t / 0.2) * Math.pow(610 / D, x);
  const afbMM = Math.pow((4.184 * Cf * En * (t / 0.2) * Math.pow(610, x)) / 1.2, 1 / x);

  const cat = E < 1.2 ? 0 : E <= 4 ? 1 : E <= 8 ? 2 : E <= 25 ? 3 : E <= 40 ? 4 : 5;
  return {
    arcingCurrentKA: Ia, incidentEnergyCalCm2: E, normalizedEnergy: En,
    afbMM, afbIn: afbMM / 25.4, afbFt: afbMM / 25.4 / 12,
    ppeCategory: cat, arcDurationSec: t,
  };
}

// ─── PPE Category Definitions (NFPA 70E 2021) ───────────────────────────────

export const PPE_CATEGORIES = {
  0: {
    label: 'Below Threshold', calCm2: '< 1.2', minRating: 'N/A', color: 'emerald',
    clothing: ['Normal work clothes (untreated cotton/wool OK)', 'No arc-rated PPE required'],
    equipment: [],
  },
  1: {
    label: 'CAT 1', calCm2: '1.2 – 4', minRating: '4 cal/cm²', color: 'yellow',
    clothing: ['Arc-rated shirt & pants OR coverall (min 4 cal/cm²)', 'Arc-rated faceshield OR arc flash hood'],
    equipment: ['Hard hat (Class E)', 'Safety glasses', 'Leather gloves or Class 00/0 RIG + protectors', 'Leather work shoes'],
  },
  2: {
    label: 'CAT 2', calCm2: '4 – 8', minRating: '8 cal/cm²', color: 'orange',
    clothing: ['Arc-rated shirt & pants PLUS coverall (total ≥ 8 cal/cm²)', 'Arc-rated faceshield + balaclava OR arc flash hood'],
    equipment: ['Hard hat', 'Safety glasses', 'Class 0 RIG + leather protectors', 'Leather work shoes', 'Hearing protection'],
  },
  3: {
    label: 'CAT 3', calCm2: '8 – 25', minRating: '25 cal/cm²', color: 'red',
    clothing: ['Arc-rated layered clothing system (min 25 cal/cm²)', 'Arc flash suit hood required'],
    equipment: ['Hard hat inside hood', 'Safety glasses', 'Class 2 RIG + leather protectors', 'Leather work boots', 'Hearing protection'],
  },
  4: {
    label: 'CAT 4', calCm2: '25 – 40', minRating: '40 cal/cm²', color: 'red',
    clothing: ['Full arc flash suit system (min 40 cal/cm²)', 'Multi-layer arc-rated clothing under suit'],
    equipment: ['Hard hat inside hood', 'Safety glasses', 'Class 2+ RIG + leather protectors', 'Leather work boots', 'Hearing protection'],
  },
  5: {
    label: 'DANGEROUS', calCm2: '> 40', minRating: 'Exceeds Cat 4', color: 'red',
    clothing: ['DO NOT PERFORM WORK — Exceeds Cat 4 maximum (40 cal/cm²)', 'De-energize equipment before any work'],
    equipment: [],
  },
};

// ─── Quick Reference Data ────────────────────────────────────────────────────

export const EQUIPMENT_DATA = [
  { type:'Panelboard',      examples:'Square D QO, Eaton CH',            voltage:'120/240V 1φ',    ratings:['10 kA','22 kA','42 kA'],              notes:'Residential & light commercial' },
  { type:'Panelboard',      examples:'Square D NQ, Eaton PRL1a',         voltage:'208Y/120V 3φ',   ratings:['10 kA','14 kA','22 kA'],              notes:'Commercial lighting panels' },
  { type:'Panelboard',      examples:'Square D I-Line, Eaton PRL4',      voltage:'480Y/277V 3φ',   ratings:['14 kA','22 kA','42 kA','65 kA'],      notes:'Power distribution panels' },
  { type:'Switchboard',     examples:'Square D I-Line II, Eaton Pow-R-Line', voltage:'480Y/277V 3φ',ratings:['22 kA','42 kA','65 kA','100 kA'],   notes:'Main distribution' },
  { type:'Switchgear (LV)', examples:'Square D Model 6, Eaton Magnum',   voltage:'480V 3φ',        ratings:['42 kA','65 kA','85 kA','100 kA'],     notes:'Draw-out breaker gear' },
  { type:'MCC (Type B)',    examples:'Allen-Bradley, Square D 8998',      voltage:'480V 3φ',        ratings:['10 kA','14 kA','22 kA','42 kA'],      notes:'Motor control centers' },
  { type:'MCC (Type F)',    examples:'Eaton Freedom, AB 2100',            voltage:'480V 3φ',        ratings:['42 kA','65 kA','100 kA'],             notes:'Industrial motor control' },
  { type:'Switchgear (MV)',examples:'Square D GM-SG, Eaton VacClad',     voltage:'5 – 15 kV',      ratings:['20 kA','25 kA','31.5 kA','40 kA'],   notes:'Primary distribution' },
  { type:'Load Center',    examples:'Square D QO, Eaton CH',             voltage:'120/240V',       ratings:['10 kA','22 kA'],                      notes:'Residential only' },
  { type:'Enclosed Disc.', examples:'Square D H, GE THN',                voltage:'240–600V',       ratings:['10 kA','14 kA','22 kA'],              notes:'Branch circuit only' },
];

export const PPE_TABLE_DATA = [
  {
    cat:1, range:'1.2 – 4 cal/cm²', minAR:'4 cal/cm²', color:'text-yellow-400', bg:'bg-yellow-900/10 border-yellow-800/20',
    clothing:['Arc-rated shirt and pants (min 4 cal/cm²)','OR arc-rated coverall'],
    face:['Arc-rated faceshield (min 4 cal/cm²)','OR arc flash suit hood'],
    other:['Safety glasses (under faceshield)','Hard hat (Class E)','Leather or RIG gloves + leather protectors','Leather work shoes'],
    tasks:['Operating bolted breakers/disconnects','Taking voltage readings','Reading panel meters','Racking breakers (de-energized)'],
  },
  {
    cat:2, range:'4 – 8 cal/cm²', minAR:'8 cal/cm²', color:'text-orange-400', bg:'bg-orange-900/10 border-orange-800/20',
    clothing:['Arc-rated shirt & pants PLUS arc-rated coverall (≥ 8 cal/cm² total)','OR arc-rated coverall over arc-rated shirt/pants'],
    face:['Arc-rated faceshield + balaclava (≥ 8 cal/cm²)','OR arc flash suit hood'],
    other:['Safety glasses','Hard hat','Class 0 RIG + leather protectors','Leather work shoes','Hearing protection'],
    tasks:['Removing covers from energized equipment','Opening/closing 480V MCC buckets','Racking breakers in 480V switchgear','Connecting leads at 480V'],
  },
  {
    cat:3, range:'8 – 25 cal/cm²', minAR:'25 cal/cm²', color:'text-red-400', bg:'bg-red-900/10 border-red-800/20',
    clothing:['Arc-rated jacket + pants + shirt layered (≥ 25 cal/cm² total)','OR arc flash suit (≥ 25 cal/cm²)'],
    face:['Arc flash suit hood (≥ 25 cal/cm²)'],
    other:['Safety glasses inside hood','Hard hat inside hood','Class 2 RIG + leather protectors','Leather work boots','Hearing protection'],
    tasks:['Working on energized 5 kV equipment','Breaker racking in 5 kV switchgear','Bus work on MV equipment','Live testing on 5 kV switchgear'],
  },
  {
    cat:4, range:'25 – 40 cal/cm²', minAR:'40 cal/cm²', color:'text-red-300', bg:'bg-red-900/20 border-red-700/30',
    clothing:['Full arc flash suit system (≥ 40 cal/cm²)','Multi-layer arc-rated clothing under arc flash suit'],
    face:['Arc flash suit hood rated ≥ 40 cal/cm²'],
    other:['Safety glasses inside hood','Hard hat inside hood','Class 2+ RIG + leather protectors','Leather work boots','Hearing protection'],
    tasks:['Working on energized 15 kV equipment','Breaker racking in 15 kV switchgear','Live work near exposed bus at high fault current','Primary voltage splicing and terminations'],
  },
];

export const APPROACH_DATA = [
  { v:'0 – 50 V',        lim:'N/A',         res:'N/A',         proh:'Avoid contact' },
  { v:'51 – 300 V',      lim:'3 ft 6 in',   res:'1 ft 0 in',   proh:'Avoid contact' },
  { v:'301 – 750 V',     lim:'3 ft 6 in',   res:'1 ft 0 in',   proh:'0 ft 1 in' },
  { v:'751 V – 15 kV',   lim:'5 ft 0 in',   res:'2 ft 2 in',   proh:'0 ft 7 in' },
  { v:'15.1 – 36 kV',    lim:'6 ft 0 in',   res:'2 ft 9 in',   proh:'1 ft 5 in' },
  { v:'36.1 – 46 kV',    lim:'8 ft 0 in',   res:'3 ft 4 in',   proh:'2 ft 2 in' },
  { v:'46.1 – 72.5 kV',  lim:'8 ft 0 in',   res:'4 ft 3 in',   proh:'3 ft 0 in' },
  { v:'72.6 – 121 kV',   lim:'8 ft 0 in',   res:'5 ft 8 in',   proh:'4 ft 3 in' },
  { v:'138 – 145 kV',    lim:'10 ft 0 in',  res:'7 ft 0 in',   proh:'5 ft 7 in' },
  { v:'161 – 169 kV',    lim:'11 ft 0 in',  res:'8 ft 0 in',   proh:'6 ft 10 in' },
  { v:'230 – 242 kV',    lim:'13 ft 0 in',  res:'10 ft 0 in',  proh:'8 ft 9 in' },
  { v:'345 – 362 kV',    lim:'15 ft 4 in',  res:'13 ft 0 in',  proh:'12 ft 0 in' },
  { v:'500 – 550 kV',    lim:'19 ft 0 in',  res:'17 ft 6 in',  proh:'16 ft 5 in' },
  { v:'765 – 800 kV',    lim:'23 ft 9 in',  res:'21 ft 8 in',  proh:'20 ft 10 in' },
];

export const DEVICE_DATA = [
  { device:'CL Fuse (Class L, RK1)',         type:'Fuse',    inst:'< 0.25 cyc (< 4 ms)',   st:'—',                    lt:'—',              notes:'Fastest clearing; best current limiting' },
  { device:'CL Fuse (Class J, RK5)',         type:'Fuse',    inst:'< 0.5 cyc (< 8 ms)',    st:'—',                    lt:'—',              notes:'Common for feeder protection' },
  { device:'Non-CL Fuse (Class K5, H)',      type:'Fuse',    inst:'1 – 2 cycles',           st:'—',                    lt:'Up to hours',    notes:'Older design; not current-limiting' },
  { device:'MCCB — Instantaneous Trip',      type:'Breaker', inst:'0.5 – 1.5 cyc (8–25ms)',st:'—',                    lt:'—',              notes:'Magnetic trip, no intentional delay' },
  { device:'MCCB — Long-Time Delay',         type:'Breaker', inst:'—',                      st:'—',                    lt:'6 – 300 sec',    notes:'Thermal-magnetic overload element' },
  { device:'LV PCB — Instantaneous',         type:'Breaker', inst:'< 1 cycle',              st:'—',                    lt:'—',              notes:'Fully adjustable, frame breaker' },
  { device:'LV PCB — Short-Time Delay',      type:'Breaker', inst:'—',                      st:'6–30 cyc (0.1–0.5 s)', lt:'—',              notes:'Intentional delay for coordination' },
  { device:'LV PCB — Long-Time Delay',       type:'Breaker', inst:'—',                      st:'—',                    lt:'30+ cyc (overload)',notes:'Thermal memory element' },
  { device:'MV Relay (50) — Instantaneous',  type:'Relay',   inst:'1.5 – 3 cycles',         st:'—',                    lt:'—',              notes:'High pickup, fast clearing' },
  { device:'MV Relay (51) — Definite Time',  type:'Relay',   inst:'—',                      st:'6 – 3600 cyc (0.1–60s)',lt:'—',             notes:'Fixed delay, independent of current' },
  { device:'MV Relay (51) — Inverse Time',   type:'Relay',   inst:'—',                      st:'Varies (TCC curve)',   lt:'Varies (TCC)',   notes:'ANSI/IEC curve types; current-dependent' },
  { device:'MV Vacuum Breaker',             type:'Breaker', inst:'—',                      st:'3–5 cyc interrupt',    lt:'—',              notes:'Relay + breaker total clearing time' },
  { device:'Recloser',                       type:'Recloser',inst:'Fast: 1–3 cycles',        st:'Delay: 10–60 cycles',  lt:'—',              notes:'Utility distribution; multiple operations' },
];
