/**
 * sampleDataGenerator.js
 * Generates rich, realistic electrical measurement datasets for MASTER
 * 1. AC Single-Phase Mains with Motor Load Transients & Grid Fluctuation
 * 2. DC Solar & Battery System with MPPT charging and discharge cycles
 */

export function generateSampleACData(numPoints = 1200) {
  const rows = [];
  rows.push(['Timestamp', 'Voltage', 'Current', 'PowerFactor', 'Frequency', 'Power']);
  
  const baseTime = new Date('2026-09-13T10:32:00');
  let accumulatedWh = 0;

  for (let i = 0; i < numPoints; i++) {
    const time = new Date(baseTime.getTime() + i * 1000);
    const timeStr = time.toTimeString().split(' ')[0]; // HH:MM:SS

    // Voltage base 230V with realistic small sinusoidal grid breathing + noise
    const vBase = 230.5;
    const vBreathing = 2.4 * Math.sin(i / 150) + 1.1 * Math.cos(i / 40);
    const vNoise = (Math.random() - 0.5) * 0.8;
    
    // Load event: inductive motor switched on at sample 350 to 850
    let isHeavyLoad = i >= 350 && i < 850;
    let isSurge = i >= 350 && i < 370; // Inrush current
    
    let voltage = vBase + vBreathing + vNoise;
    if (isHeavyLoad) {
      voltage -= 1.8; // line drop under load
    }
    if (isSurge) {
      voltage -= 1.5; // inrush dip
    }

    // Current
    let current = 4.35 + 0.4 * Math.sin(i / 60) + (Math.random() - 0.5) * 0.15;
    if (isSurge) {
      current = 9.8 + (Math.random() - 0.5) * 0.4;
    } else if (isHeavyLoad) {
      current = 6.85 + 0.5 * Math.sin(i / 80) + (Math.random() - 0.5) * 0.2;
    }

    // Power Factor
    let pf = 0.94 + 0.02 * Math.sin(i / 100) + (Math.random() - 0.5) * 0.01;
    if (isSurge) {
      pf = 0.72 + (Math.random() - 0.5) * 0.03;
    } else if (isHeavyLoad) {
      pf = 0.86 + 0.02 * Math.sin(i / 70) + (Math.random() - 0.5) * 0.015;
    }
    pf = Math.max(0.65, Math.min(0.99, pf));

    // Frequency base 50.00 Hz with tiny grid drift
    const freq = 50.00 + 0.06 * Math.sin(i / 90) + (Math.random() - 0.5) * 0.03;

    // Active Power P = V * I * PF (Watts)
    const power = voltage * current * pf;

    rows.push([
      timeStr,
      voltage.toFixed(2),
      current.toFixed(2),
      pf.toFixed(3),
      freq.toFixed(2),
      power.toFixed(1)
    ]);
  }

  return rows.map(r => r.join(',')).join('\n');
}

export function generateSampleDCData(numPoints = 1200) {
  const rows = [];
  rows.push(['Timestamp', 'Voltage', 'Current', 'Power', 'Energy']);
  
  const baseTime = new Date('2026-09-13T14:10:00');
  let accumulatedWh = 0;

  for (let i = 0; i < numPoints; i++) {
    const time = new Date(baseTime.getTime() + i * 1000);
    const timeStr = time.toTimeString().split(' ')[0];

    // Phase 1: High Solar MPPT Charging (0 - 500) -> 13.8V, 3.8A
    // Phase 2: Intermittent Cloud Cover (500 - 800) -> 12.9V, 1.6A
    // Phase 3: Battery Discharge with Inverter Load (800 - 1200) -> 12.3V down to 11.9V, 4.2A
    let voltage = 13.8;
    let current = 3.6;

    if (i < 500) {
      voltage = 13.8 + 0.2 * Math.sin(i / 70) + (Math.random() - 0.5) * 0.08;
      current = 3.5 + 0.4 * Math.sin(i / 50) + (Math.random() - 0.5) * 0.12;
    } else if (i < 800) {
      voltage = 12.85 + 0.25 * Math.sin(i / 60) + (Math.random() - 0.5) * 0.06;
      current = 1.65 + 0.3 * Math.cos(i / 40) + (Math.random() - 0.5) * 0.1;
    } else {
      // Discharge slope
      const dischargeProgress = (i - 800) / 400;
      voltage = 12.45 - (0.55 * dischargeProgress) + (Math.random() - 0.5) * 0.05;
      current = 4.15 + 0.3 * Math.sin(i / 80) + (Math.random() - 0.5) * 0.15;
    }

    const power = voltage * current;
    accumulatedWh += (power * (1 / 3600)); // Wh accumulation

    rows.push([
      timeStr,
      voltage.toFixed(2),
      current.toFixed(2),
      power.toFixed(2),
      accumulatedWh.toFixed(3)
    ]);
  }

  return rows.map(r => r.join(',')).join('\n');
}
