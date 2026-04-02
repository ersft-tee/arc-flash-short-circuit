// ─────────────────────────────────────────────────────────────────────────────
// Transformer Fault Current Calculator
// ─────────────────────────────────────────────────────────────────────────────

export function calcTransformerFault({
  kva, vPrimary, vSecondary, zPercent, phases = 3, utilityFaultKA = null,
}) {
  const Z = zPercent / 100;
  const sqrt3 = Math.sqrt(3);

  let flaSecondary, flaPrimary;
  if (phases === 3) {
    flaSecondary = (kva * 1000) / (sqrt3 * vSecondary);
    flaPrimary   = (kva * 1000) / (sqrt3 * vPrimary);
  } else {
    flaSecondary = (kva * 1000) / vSecondary;
    flaPrimary   = (kva * 1000) / vPrimary;
  }

  // Transformer-limited fault (infinite bus at primary)
  const iscInfinite = flaSecondary / Z;

  let iscWithUtility = null;
  let iscFinal = iscInfinite;

  if (utilityFaultKA && utilityFaultKA > 0) {
    // Per-unit method on transformer MVA base
    // Z_utility_pu = (kva/1000) / MVAsc_utility
    const mvascUtility = sqrt3 * (vPrimary / 1000) * utilityFaultKA; // MVA
    const zUtilityPU = (kva / 1000) / mvascUtility;
    const zTotalPU = zUtilityPU + Z;
    iscWithUtility = flaSecondary / zTotalPU;
    iscFinal = iscWithUtility;
  }

  return {
    flaSecondary,
    flaPrimary,
    iscInfiniteKA: iscInfinite / 1000,
    iscWithUtilityKA: iscWithUtility ? iscWithUtility / 1000 : null,
    iscFinalKA: iscFinal / 1000,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cable Impedance & Voltage Drop
// ─────────────────────────────────────────────────────────────────────────────

export function calcCableVoltageDrop({
  rPer1000ft, xPer1000ft, lengthFt, loadAmps, voltage, phases = 3, pf = 0.85,
}) {
  const len = lengthFt;
  const R = rPer1000ft * len / 1000;
  const X = xPer1000ft * len / 1000;
  const Z = Math.sqrt(R * R + X * X);

  // Effective impedance method (exact pf-corrected voltage drop)
  const theta = Math.acos(pf);
  const sinTheta = Math.sin(theta);

  // VD per conductor = I * (R*pf + X*sin)
  const vdPerConductor = loadAmps * (R * pf + X * sinTheta);

  let vdTotal;
  if (phases === 1) {
    vdTotal = 2 * vdPerConductor;           // send + return
  } else {
    vdTotal = Math.sqrt(3) * vdPerConductor; // line-to-line
  }

  const vdPct = (vdTotal / voltage) * 100;

  return {
    rTotal: R,
    xTotal: X,
    zTotal: Z,
    vdPerConductor,
    vdTotal,
    vdPct,
    rPer1000: rPer1000ft,
    xPer1000: xPer1000ft,
    zPer1000: Math.sqrt(rPer1000ft ** 2 + xPer1000ft ** 2),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Motor Contribution Estimator
// ─────────────────────────────────────────────────────────────────────────────

export function calcMotorContribution({ hp, voltage, efficiency, pf, phases = 3, multiplier = 4.0 }) {
  const sqrt3 = Math.sqrt(3);
  let fla;
  if (phases === 3) {
    fla = (hp * 746) / (sqrt3 * voltage * efficiency * pf);
  } else {
    fla = (hp * 746) / (voltage * efficiency * pf);
  }

  const contribution = fla * multiplier;

  return {
    fla,
    contributionAmps: contribution,
    contributionKA: contribution / 1000,
    multiplierUsed: multiplier,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// IEEE 1584-2002 Arc Flash Calculator
// ─────────────────────────────────────────────────────────────────────────────

// Distance exponent x by configuration & voltage (IEEE 1584 Table 4)
const DISTANCE_EXPONENTS = {
  'open':    { low: 2.000, high: 2.000 },
  'box':     { low: 1.473, high: 0.973 },
  'LV_480':  { low: 1.641, high: 2.000 },
};

// Configuration constants K1, K2
// K1: -0.792 open, -0.555 box
// K2: 0 ungrounded, -0.113 grounded

export function calcIncidentEnergy({
  ibfKA,           // bolted fault current kA
  voltageKV,       // system voltage kV
  gapMM,           // gap between conductors mm
  durationCycles,  // arc duration in cycles at 60Hz
  workingDistanceIn, // working distance inches
  config,          // 'open' or 'box'
  grounded,        // boolean
}) {
  const Ibf = ibfKA;
  const V   = voltageKV;
  const G   = gapMM;
  const t   = durationCycles / 60;   // seconds
  const D   = workingDistanceIn * 25.4; // mm

  const K1 = config === 'box' ? -0.555 : -0.792;
  const K2 = grounded ? -0.113 : 0;

  // Arcing current (kA) - IEEE 1584-2002 Eq 1
  const lnIa = K1 + K2
    + 0.662 * Math.log(Ibf)
    + 0.0966 * V
    + 0.000526 * G
    + 0.5588 * V * Math.log(Ibf)
    - 0.00304 * G * Math.log(Ibf);
  const Ia = Math.exp(lnIa);

  // Normalized incident energy at 610mm, 0.2s (IEEE 1584-2002 Eq 2)
  const lnEn = K1 + K2 + 1.081 * Math.log(Ia) + 0.0011 * G;
  const En = Math.exp(lnEn);

  // Distance factor x
  const isLowV = V <= 1.0;
  let x;
  if (config === 'box') {
    x = isLowV ? 1.473 : 0.973;
  } else {
    x = 2.000;
  }

  // Correction factor Cf
  const Cf = V <= 1.0 ? 1.5 : 1.0;

  // Incident energy (cal/cm²) IEEE 1584-2002 Eq 3
  const E = 4.184 * Cf * En * (t / 0.2) * Math.pow(610 / D, x);

  // Arc flash boundary (mm) where E = 1.2 cal/cm²
  const afbMM = Math.pow((4.184 * Cf * En * (t / 0.2) * Math.pow(610, x)) / 1.2, 1 / x);
  const afbIn = afbMM / 25.4;
  const afbFt = afbIn / 12;

  // PPE Category (NFPA 70E 2021 Table 130.5(G))
  let ppeCategory;
  if (E < 1.2) {
    ppeCategory = 0; // No arc flash PPE required (below ignition threshold)
  } else if (E <= 4) {
    ppeCategory = 1;
  } else if (E <= 8) {
    ppeCategory = 2;
  } else if (E <= 25) {
    ppeCategory = 3;
  } else if (E <= 40) {
    ppeCategory = 4;
  } else {
    ppeCategory = 5; // Dangerous - exceeds PPE Cat 4 maximum
  }

  return {
    arcingCurrentKA: Ia,
    incidentEnergyCalCm2: E,
    normalizedEnergy: En,
    afbMM,
    afbIn,
    afbFt,
    ppeCategory,
    arcDurationSec: t,
  };
}

// PPE Category info
export const PPE_CATEGORIES = {
  0: {
    label: 'Below Threshold',
    calCm2: '< 1.2',
    minRating: 'N/A',
    color: 'green',
    clothing: ['Normal work clothes (untreated cotton or wool OK)', 'No arc-rated PPE required'],
    equipment: [],
  },
  1: {
    label: 'CAT 1',
    calCm2: '1.2 – 4',
    minRating: '4 cal/cm²',
    color: 'yellow',
    clothing: [
      'Arc-rated long-sleeve shirt and pants OR arc-rated coverall (min 4 cal/cm²)',
      'Arc-rated faceshield (min 4 cal/cm²) OR arc flash hood',
    ],
    equipment: [
      'Hard hat', 'Safety glasses or goggles', 'Leather gloves (Class 00 or 0 rubber insulating)',
      'Leather work shoes',
    ],
  },
  2: {
    label: 'CAT 2',
    calCm2: '4 – 8',
    minRating: '8 cal/cm²',
    color: 'orange',
    clothing: [
      'Arc-rated long-sleeve shirt and pants PLUS arc-rated faceshield or arc flash hood (min 8 cal/cm²)',
      'OR arc-rated coverall (min 8 cal/cm²) with hood',
    ],
    equipment: [
      'Hard hat', 'Safety glasses or goggles', 'Rubber insulating gloves (Class 0) + leather protectors',
      'Leather work shoes',
    ],
  },
  3: {
    label: 'CAT 3',
    calCm2: '8 – 25',
    minRating: '25 cal/cm²',
    color: 'red',
    clothing: [
      'Arc-rated jacket, pants, hood (layered system, min 25 cal/cm²)',
      'Arc flash suit required with min 25 cal/cm² rating',
    ],
    equipment: [
      'Hard hat inside hood', 'Safety glasses or goggles', 'Rubber insulating gloves (Class 2) + leather protectors',
      'Leather work boots',
    ],
  },
  4: {
    label: 'CAT 4',
    calCm2: '25 – 40',
    minRating: '40 cal/cm²',
    color: 'red',
    clothing: [
      'Full arc flash suit (min 40 cal/cm²)',
      'Multi-layer flash suit with hood',
    ],
    equipment: [
      'Hard hat inside hood', 'Safety glasses or goggles', 'Rubber insulating gloves (Class 2 or higher) + leather protectors',
      'Leather work boots',
    ],
  },
  5: {
    label: 'DANGEROUS',
    calCm2: '> 40',
    minRating: 'Exceeds Cat 4',
    color: 'red',
    clothing: ['DO NOT PERFORM WORK — Incident energy exceeds Cat 4 maximum', 'De-energize equipment before working'],
    equipment: [],
  },
};
