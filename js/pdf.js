import { jsPDF } from 'jspdf';

const AMBER = [245,158,11], DARK=[15,17,23], GRAY=[51,65,85], WHITE=[226,232,240];
const GREEN=[34,197,94], RED=[239,68,68];

function init(title) {
  const doc = new jsPDF({ unit:'mm', format:'a4' });
  doc.setFillColor(...DARK); doc.rect(0,0,210,297,'F');
  doc.setFillColor(...AMBER); doc.rect(0,0,210,18,'F');
  doc.setTextColor(...DARK); doc.setFontSize(10); doc.setFont('helvetica','bold');
  doc.text('\u26A1 ARC FLASH & SHORT CIRCUIT REFERENCE', 10, 11);
  doc.setTextColor(...WHITE); doc.setFontSize(15); doc.text(title, 10, 30);
  doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(...GRAY);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 37);
  return { doc, y: 46 };
}

function sec(doc, text, y) {
  doc.setFillColor(...GRAY); doc.rect(10,y,190,7,'F');
  doc.setTextColor(...AMBER); doc.setFontSize(8); doc.setFont('helvetica','bold');
  doc.text(text.toUpperCase(), 13, y+5);
  return y+11;
}

function row(doc, label, value, y, unit='', pass=null) {
  doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(...WHITE);
  doc.text(label, 13, y);
  if (pass===true) doc.setTextColor(...GREEN);
  else if (pass===false) doc.setTextColor(...RED);
  else doc.setTextColor(...AMBER);
  doc.setFont('courier','bold'); doc.text(String(value), 115, y);
  doc.setFont('helvetica','normal'); doc.setTextColor(...GRAY);
  doc.text(unit, 160, y);
  return y+7;
}

export function exportTransformerPDF(inputs, results) {
  let { doc, y } = init('Transformer Fault Current Calculation');
  y = sec(doc,'Input Parameters',y);
  y = row(doc,'Transformer Rating', inputs.kva, y, 'kVA');
  y = row(doc,'Primary Voltage', inputs.vPrimary, y, 'V');
  y = row(doc,'Secondary Voltage', inputs.vSecondary, y, 'V');
  y = row(doc,'Impedance (%Z)', inputs.zPercent.toFixed(2), y, '%');
  y = row(doc,'Phase Configuration', inputs.phases+'-Phase', y);
  if (inputs.utilityFaultKA) y = row(doc,'Utility Fault at Primary', inputs.utilityFaultKA.toFixed(2), y, 'kA');
  y += 3; y = sec(doc,'Results',y);
  y = row(doc,'Secondary FLA', results.flaSecondary.toFixed(1), y, 'A');
  y = row(doc,'Primary FLA', results.flaPrimary.toFixed(1), y, 'A');
  y = row(doc,'Fault Current (Infinite Bus)', results.iscInfiniteKA.toFixed(3), y, 'kA sym');
  if (results.iscWithUtilityKA) y = row(doc,'Fault Current (w/ Utility Z)', results.iscWithUtilityKA.toFixed(3), y, 'kA sym');
  doc.save('transformer-fault-current.pdf');
}

export function exportCablePDF(inputs, results) {
  let { doc, y } = init('Cable Impedance & Voltage Drop Calculation');
  const limit = inputs.isFeeder ? 5 : 3;
  const pass = results.vdPct <= limit;
  y = sec(doc,'Input Parameters',y);
  y = row(doc,'Conductor Size', inputs.size, y);
  y = row(doc,'Material', inputs.material, y);
  y = row(doc,'Conduit', inputs.conduit==='steel'?'Steel (Magnetic)':'PVC (Non-magnetic)', y);
  y = row(doc,'Length', inputs.lengthFt.toFixed(0), y, 'ft');
  y = row(doc,'Load Current', inputs.loadAmps.toFixed(1), y, 'A');
  y = row(doc,'System Voltage', inputs.voltage.toFixed(0), y, 'V');
  y = row(doc,'Power Factor', (inputs.pf*100).toFixed(0), y, '%');
  y += 3; y = sec(doc,'Results',y);
  y = row(doc,'R (per 1000 ft)', results.rPer1000.toFixed(4), y, 'Ω/1000ft');
  y = row(doc,'X (per 1000 ft)', results.xPer1000.toFixed(4), y, 'Ω/1000ft');
  y = row(doc,'Voltage Drop', results.vdTotal.toFixed(2), y, 'V');
  y = row(doc,`Voltage Drop % (limit: ${limit}%)`, results.vdPct.toFixed(2), y, '%', pass);
  y = row(doc,'RESULT', pass?'PASS':'FAIL', y, '', pass);
  doc.save('cable-voltage-drop.pdf');
}

export function exportMotorPDF(inputs, results, combinedKA) {
  let { doc, y } = init('Motor Contribution Estimation');
  y = sec(doc,'Input Parameters',y);
  y = row(doc,'Motor Rating', inputs.hp, y, 'HP');
  y = row(doc,'System Voltage', inputs.voltage, y, 'V');
  y = row(doc,'Efficiency', (inputs.efficiency*100).toFixed(0), y, '%');
  y = row(doc,'Power Factor', (inputs.pf*100).toFixed(0), y, '%');
  y = row(doc,'Multiplier', inputs.multiplier+'×', y);
  y += 3; y = sec(doc,'Results',y);
  y = row(doc,'Motor FLA', results.fla.toFixed(1), y, 'A');
  y = row(doc,'Contribution', results.contributionAmps.toFixed(1), y, 'A');
  y = row(doc,'Contribution', results.contributionKA.toFixed(3), y, 'kA');
  if (combinedKA) {
    y = row(doc,'Base Fault', combinedKA.base.toFixed(3), y, 'kA');
    y = row(doc,'Combined Fault', combinedKA.total.toFixed(3), y, 'kA sym');
  }
  doc.save('motor-contribution.pdf');
}

export function exportArcFlashPDF(inputs, results) {
  let { doc, y } = init('Arc Flash Incident Energy Calculation');
  doc.setFillColor(127,29,29); doc.rect(10,y,190,10,'F');
  doc.setTextColor(254,202,202); doc.setFontSize(7); doc.setFont('helvetica','bold');
  doc.text('\u26A0  IEEE 1584-2002 Method \u2014 For Reference Only. Verify with site-specific arc flash study.', 13, y+6.5);
  y += 14;
  y = sec(doc,'Input Parameters',y);
  y = row(doc,'Bolted Fault Current', inputs.ibfKA.toFixed(3), y, 'kA');
  y = row(doc,'System Voltage', (inputs.voltageKV*1000).toFixed(0), y, 'V');
  y = row(doc,'Conductor Gap', inputs.gapMM.toFixed(0), y, 'mm');
  y = row(doc,'Arc Duration', inputs.durationCycles.toFixed(1), y, 'cycles');
  y = row(doc,'Working Distance', inputs.workingDistanceIn.toFixed(1), y, 'in');
  y = row(doc,'Configuration', inputs.config==='box'?'Enclosure (Box)':'Open Air', y);
  y = row(doc,'System Grounding', inputs.grounded?'Solidly Grounded':'Ungrounded / HRG', y);
  y += 3; y = sec(doc,'Results',y);
  y = row(doc,'Arcing Current', results.arcingCurrentKA.toFixed(3), y, 'kA');
  y = row(doc,'Incident Energy', results.incidentEnergyCalCm2.toFixed(2), y, 'cal/cm²', results.incidentEnergyCalCm2 <= 40);
  y = row(doc,'Arc Flash Boundary', results.afbFt.toFixed(1), y, 'ft');
  const cats = ['Below Threshold','CAT 1','CAT 2','CAT 3','CAT 4','DANGEROUS'];
  y = row(doc,'PPE Category', cats[Math.min(results.ppeCategory,5)], y);
  doc.save('arc-flash-calculation.pdf');
}
