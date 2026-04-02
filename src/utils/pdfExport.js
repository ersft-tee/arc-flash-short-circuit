import jsPDF from 'jspdf';

const AMBER = [245, 158, 11];
const DARK  = [15, 17, 23];
const GRAY  = [51, 65, 85];
const WHITE = [226, 232, 240];
const GREEN = [34, 197, 94];
const RED   = [239, 68, 68];

function addHeader(doc, title) {
  doc.setFillColor(...DARK);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFillColor(...AMBER);
  doc.rect(0, 0, 210, 18, 'F');

  doc.setTextColor(15, 17, 23);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('⚡ ARC FLASH & SHORT CIRCUIT REFERENCE', 10, 11);

  doc.setTextColor(...WHITE);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 10, 32);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 39);

  return 48; // return y position after header
}

function sectionHeader(doc, text, y) {
  doc.setFillColor(...GRAY);
  doc.rect(10, y, 190, 7, 'F');
  doc.setTextColor(...AMBER);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(text.toUpperCase(), 13, y + 5);
  return y + 11;
}

function row(doc, label, value, y, unit = '', pass = null) {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...WHITE);
  doc.text(label, 13, y);

  if (pass !== null) {
    doc.setTextColor(...(pass ? GREEN : RED));
  } else {
    doc.setTextColor(...AMBER);
  }
  doc.setFont('courier', 'bold');
  doc.text(String(value), 120, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(unit, 165, y);
  return y + 7;
}

export function exportTransformerPDF(inputs, results) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = addHeader(doc, 'Transformer Fault Current Calculation');

  y = sectionHeader(doc, 'Input Parameters', y);
  y = row(doc, 'Transformer Rating', inputs.kva, y, 'kVA');
  y = row(doc, 'Primary Voltage', inputs.vPrimary, y, 'V');
  y = row(doc, 'Secondary Voltage', inputs.vSecondary, y, 'V');
  y = row(doc, 'Impedance (%Z)', inputs.zPercent.toFixed(2), y, '%');
  y = row(doc, 'Phase Configuration', inputs.phases + '-Phase', y);
  if (inputs.utilityFaultKA) {
    y = row(doc, 'Utility Available Fault', inputs.utilityFaultKA.toFixed(2), y, 'kA');
  }

  y += 4;
  y = sectionHeader(doc, 'Results', y);
  y = row(doc, 'Full Load Amps (Secondary)', results.flaSecondary.toFixed(1), y, 'A');
  y = row(doc, 'Full Load Amps (Primary)', results.flaPrimary.toFixed(1), y, 'A');
  y = row(doc, 'Fault Current (Infinite Bus)', results.iscInfiniteKA.toFixed(3), y, 'kA sym');
  if (results.iscWithUtilityKA) {
    y = row(doc, 'Fault Current (w/ Utility Z)', results.iscWithUtilityKA.toFixed(3), y, 'kA sym');
  }

  doc.save('transformer-fault-current.pdf');
}

export function exportCablePDF(inputs, results) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = addHeader(doc, 'Cable Impedance & Voltage Drop Calculation');

  y = sectionHeader(doc, 'Input Parameters', y);
  y = row(doc, 'Conductor Size', inputs.size, y);
  y = row(doc, 'Material', inputs.material.charAt(0).toUpperCase() + inputs.material.slice(1), y);
  y = row(doc, 'Conduit Type', inputs.conduit === 'steel' ? 'Steel (Magnetic)' : 'PVC (Non-magnetic)', y);
  y = row(doc, 'Circuit Length', inputs.lengthFt.toFixed(0), y, 'ft');
  y = row(doc, 'Load Current', inputs.loadAmps.toFixed(1), y, 'A');
  y = row(doc, 'System Voltage', inputs.voltage.toFixed(0), y, 'V');
  y = row(doc, 'Phase Configuration', inputs.phases + '-Phase', y);
  y = row(doc, 'Power Factor', (inputs.pf * 100).toFixed(0), y, '%');

  y += 4;
  y = sectionHeader(doc, 'Cable Properties (per 1000 ft)', y);
  y = row(doc, 'Resistance (R)', results.rPer1000.toFixed(4), y, 'Ω/1000ft');
  y = row(doc, 'Reactance (X)', results.xPer1000.toFixed(4), y, 'Ω/1000ft');
  y = row(doc, 'Impedance (Z)', results.zPer1000.toFixed(4), y, 'Ω/1000ft');

  y += 4;
  y = sectionHeader(doc, 'Results', y);
  y = row(doc, 'Total Resistance', results.rTotal.toFixed(4), y, 'Ω');
  y = row(doc, 'Total Reactance', results.xTotal.toFixed(4), y, 'Ω');
  y = row(doc, 'Total Impedance', results.zTotal.toFixed(4), y, 'Ω');
  y = row(doc, 'Voltage Drop', results.vdTotal.toFixed(2), y, 'V');

  const isFeeder = inputs.isFeeder;
  const limit = isFeeder ? 5 : 3;
  const pass = results.vdPct <= limit;
  y = row(doc, `Voltage Drop % (Limit: ${limit}%)`, results.vdPct.toFixed(2), y, '%', pass);
  y = row(doc, 'RESULT', pass ? 'PASS' : 'FAIL', y, '', pass);

  doc.save('cable-voltage-drop.pdf');
}

export function exportMotorPDF(inputs, results, combinedKA) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = addHeader(doc, 'Motor Contribution Estimation');

  y = sectionHeader(doc, 'Input Parameters', y);
  y = row(doc, 'Motor Rating', inputs.hp, y, 'HP');
  y = row(doc, 'System Voltage', inputs.voltage, y, 'V');
  y = row(doc, 'Efficiency', (inputs.efficiency * 100).toFixed(0), y, '%');
  y = row(doc, 'Power Factor', (inputs.pf * 100).toFixed(0), y, '%');
  y = row(doc, 'Fault Multiplier', inputs.multiplier + 'x', y);

  y += 4;
  y = sectionHeader(doc, 'Results', y);
  y = row(doc, 'Motor Full Load Amps', results.fla.toFixed(1), y, 'A');
  y = row(doc, 'Contribution Current', results.contributionAmps.toFixed(1), y, 'A');
  y = row(doc, 'Contribution (kA)', results.contributionKA.toFixed(3), y, 'kA');
  if (combinedKA) {
    y = row(doc, 'Base Fault Current', combinedKA.base.toFixed(3), y, 'kA');
    y = row(doc, 'Combined Fault Current', combinedKA.total.toFixed(3), y, 'kA sym');
  }

  doc.save('motor-contribution.pdf');
}

export function exportArcFlashPDF(inputs, results) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = addHeader(doc, 'Arc Flash Incident Energy Calculation');

  // Warning banner
  doc.setFillColor(127, 29, 29);
  doc.rect(10, y, 190, 10, 'F');
  doc.setTextColor(254, 202, 202);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠  IEEE 1584-2002 Method — For Reference Only. Verify with site-specific arc flash study.', 14, y + 6.5);
  y += 14;

  y = sectionHeader(doc, 'Input Parameters', y);
  y = row(doc, 'Bolted Fault Current', inputs.ibfKA.toFixed(3), y, 'kA');
  y = row(doc, 'System Voltage', (inputs.voltageKV * 1000).toFixed(0), y, 'V');
  y = row(doc, 'Conductor Gap', inputs.gapMM.toFixed(0), y, 'mm');
  y = row(doc, 'Arc Duration', inputs.durationCycles.toFixed(1), y, 'cycles');
  y = row(doc, 'Working Distance', inputs.workingDistanceIn.toFixed(1), y, 'in');
  y = row(doc, 'Electrode Config', inputs.config === 'box' ? 'In Enclosure (Box)' : 'Open Air', y);
  y = row(doc, 'System Grounding', inputs.grounded ? 'Solidly Grounded' : 'Ungrounded / HRG', y);

  y += 4;
  y = sectionHeader(doc, 'Results', y);
  y = row(doc, 'Arcing Current', results.arcingCurrentKA.toFixed(3), y, 'kA');

  const isSafe = results.incidentEnergyCalCm2 < 40;
  y = row(doc, 'Incident Energy', results.incidentEnergyCalCm2.toFixed(2), y, 'cal/cm²', isSafe);
  y = row(doc, 'Arc Flash Boundary', results.afbFt.toFixed(1), y, 'ft');
  y = row(doc, 'Arc Flash Boundary', results.afbIn.toFixed(1), y, 'in');

  const catLabels = ['Below Threshold', 'CAT 1', 'CAT 2', 'CAT 3', 'CAT 4', 'DANGEROUS'];
  y = row(doc, 'PPE Category', catLabels[Math.min(results.ppeCategory, 5)], y, '', isSafe);

  y += 4;
  y = sectionHeader(doc, 'Standard Reference', y);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('• IEEE 1584-2002 Guide for Performing Arc Flash Hazard Calculations', 13, y); y += 5;
  doc.text('• NFPA 70E-2021 Standard for Electrical Safety in the Workplace', 13, y); y += 5;
  doc.text('• PPE categories per NFPA 70E Table 130.5(G)', 13, y);

  doc.save('arc-flash-calculation.pdf');
}
