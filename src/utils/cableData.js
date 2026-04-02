// NEC Table 9 values - Impedance of conductors (Ω/1000 ft) at 75°C
// Based on NEC 2023 Table 9

export const CONDUCTOR_SIZES = [
  '14 AWG', '12 AWG', '10 AWG', '8 AWG', '6 AWG', '4 AWG', '3 AWG', '2 AWG',
  '1 AWG', '1/0 AWG', '2/0 AWG', '3/0 AWG', '4/0 AWG',
  '250 kcmil', '300 kcmil', '350 kcmil', '400 kcmil', '500 kcmil',
  '600 kcmil', '750 kcmil',
];

// Ampacity (copper, 75°C, conduit) - NEC Table 310.15(B)(16)
export const COPPER_AMPACITY = {
  '14 AWG': 15, '12 AWG': 20, '10 AWG': 30, '8 AWG': 50,
  '6 AWG': 65, '4 AWG': 85, '3 AWG': 100, '2 AWG': 115,
  '1 AWG': 130, '1/0 AWG': 150, '2/0 AWG': 175, '3/0 AWG': 200,
  '4/0 AWG': 230, '250 kcmil': 255, '300 kcmil': 285, '350 kcmil': 310,
  '400 kcmil': 335, '500 kcmil': 380, '600 kcmil': 420, '750 kcmil': 475,
};

export const ALUMINUM_AMPACITY = {
  '12 AWG': 20, '10 AWG': 25, '8 AWG': 40,
  '6 AWG': 50, '4 AWG': 65, '3 AWG': 75, '2 AWG': 90,
  '1 AWG': 100, '1/0 AWG': 120, '2/0 AWG': 135, '3/0 AWG': 155,
  '4/0 AWG': 180, '250 kcmil': 205, '300 kcmil': 230, '350 kcmil': 250,
  '400 kcmil': 270, '500 kcmil': 310, '600 kcmil': 340, '750 kcmil': 385,
};

// Resistance (Ω/1000 ft) at 75°C
// [copper_steel, copper_pvc, aluminum_steel, aluminum_pvc]
const RESISTANCE_TABLE = {
  '14 AWG':   [3.14,  3.14,  null,  null],
  '12 AWG':   [1.98,  1.98,  3.25,  3.25],
  '10 AWG':   [1.24,  1.24,  2.04,  2.04],
  '8 AWG':    [0.778, 0.778, 1.28,  1.28],
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

// Reactance (Ω/1000 ft)
// [steel_conduit, pvc_conduit] (same for cu/al)
const REACTANCE_TABLE = {
  '14 AWG':   [0.058, 0.050],
  '12 AWG':   [0.054, 0.050],
  '10 AWG':   [0.050, 0.044],
  '8 AWG':    [0.052, 0.045],
  '6 AWG':    [0.051, 0.044],
  '4 AWG':    [0.048, 0.043],
  '3 AWG':    [0.047, 0.042],
  '2 AWG':    [0.045, 0.040],
  '1 AWG':    [0.046, 0.041],
  '1/0 AWG':  [0.044, 0.040],
  '2/0 AWG':  [0.043, 0.039],
  '3/0 AWG':  [0.042, 0.038],
  '4/0 AWG':  [0.041, 0.037],
  '250 kcmil':[0.041, 0.037],
  '300 kcmil':[0.041, 0.036],
  '350 kcmil':[0.040, 0.036],
  '400 kcmil':[0.040, 0.035],
  '500 kcmil':[0.039, 0.035],
  '600 kcmil':[0.039, 0.034],
  '750 kcmil':[0.038, 0.034],
};

export function getCableImpedance(size, material, conduit) {
  const rRow = RESISTANCE_TABLE[size];
  const xRow = REACTANCE_TABLE[size];
  if (!rRow || !xRow) return null;

  let r, x;
  if (material === 'copper') {
    r = conduit === 'steel' ? rRow[0] : rRow[1];
  } else {
    r = conduit === 'steel' ? rRow[2] : rRow[3];
  }
  x = conduit === 'steel' ? xRow[0] : xRow[1];

  return { r, x };  // Ω/1000 ft
}

export function getAmpacity(size, material) {
  if (material === 'copper') return COPPER_AMPACITY[size] || null;
  return ALUMINUM_AMPACITY[size] || null;
}
