/**
 * statistics.js
 * Comprehensive statistical engine for electrical engineering parameters.
 */

/**
 * Calculates standard statistical metrics for an array of numerical values
 */
export function calculateSeriesStats(values = []) {
  const cleanValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
  const n = cleanValues.length;

  if (n === 0) {
    return {
      count: 0,
      latest: 0,
      min: 0,
      max: 0,
      avg: 0,
      median: 0,
      stdDev: 0,
      variance: 0,
      range: 0,
      p25: 0,
      p75: 0,
      iqr: 0
    };
  }

  const sorted = [...cleanValues].sort((a, b) => a - b);
  const latest = cleanValues[cleanValues.length - 1];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const avg = sum / n;

  // Median
  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  // Percentiles
  const p25 = sorted[Math.floor(n * 0.25)];
  const p75 = sorted[Math.floor(n * 0.75)];
  const iqr = p75 - p25;

  // Variance & Standard Deviation
  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance);
  const range = max - min;

  return {
    count: n,
    latest,
    min,
    max,
    avg,
    median,
    stdDev,
    variance,
    range,
    p25,
    p75,
    iqr
  };
}

/**
 * Computes stability percentage distribution for a key parameter (typically Voltage)
 * Stable: within ±2% of nominal/mean
 * Moderate: between ±2% and ±5%
 * High Variation: > ±5% variation
 */
export function calculateStabilityMetrics(values = [], nominalValue = null) {
  const cleanValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
  const n = cleanValues.length;
  if (n === 0) {
    return { stablePct: 100, moderatePct: 0, highPct: 0, stableCount: 0, moderateCount: 0, highCount: 0, score: '100%' };
  }

  const avg = cleanValues.reduce((a, b) => a + b, 0) / n;
  // Use nominal if provided and mean is within 10% of nominal, otherwise use actual mean
  let reference = avg;
  if (nominalValue && Math.abs(avg - nominalValue) / nominalValue <= 0.10) {
    reference = nominalValue;
  }
  let stableCount = 0;
  let moderateCount = 0;
  let highCount = 0;

  cleanValues.forEach(val => {
    const diffPct = Math.abs(val - reference) / (reference || 1) * 100;
    if (diffPct <= 2.0) {
      stableCount++;
    } else if (diffPct <= 5.0) {
      moderateCount++;
    } else {
      highCount++;
    }
  });

  const stablePct = parseFloat(((stableCount / n) * 100).toFixed(1));
  const moderatePct = parseFloat(((moderateCount / n) * 100).toFixed(1));
  const highPct = parseFloat(((highCount / n) * 100).toFixed(1));

  return {
    stablePct,
    moderatePct,
    highPct,
    stableCount,
    moderateCount,
    highCount,
    score: `${stablePct}%`
  };
}

/**
 * Computes operating condition distribution based on user-configured thresholds
 */
export function calculateOperatingConditions(records = [], thresholds = {}, datasetType = 'AC') {
  const n = records.length;
  if (n === 0) {
    return { normalPct: 100, warningPct: 0, criticalPct: 0, normalCount: 0, warningCount: 0, criticalCount: 0 };
  }

  let normalCount = 0;
  let warningCount = 0;
  let criticalCount = 0;

  records.forEach(row => {
    let status = 'normal';

    if (datasetType === 'AC') {
      const v = row.voltage;
      const f = row.frequency;
      const pf = row.powerFactor;

      // Voltage bounds check
      const vMin = thresholds.acVoltageMin ?? 220;
      const vMax = thresholds.acVoltageMax ?? 240;
      const fMin = thresholds.acFreqMin ?? 49.5;
      const fMax = thresholds.acFreqMax ?? 50.5;
      const pfWarn = thresholds.acPfWarning ?? 0.85;

      if (v !== undefined) {
        if (v < vMin - 10 || v > vMax + 10) status = 'critical';
        else if (v < vMin || v > vMax) if (status !== 'critical') status = 'warning';
      }

      if (f !== undefined) {
        if (f < fMin - 0.8 || f > fMax + 0.8) status = 'critical';
        else if (f < fMin || f > fMax) if (status !== 'critical') status = 'warning';
      }

      if (pf !== undefined && pf < pfWarn) {
        if (status !== 'critical') status = 'warning';
      }
    } else {
      // DC
      const v = row.voltage;
      const i = row.current;
      const vMin = thresholds.dcVoltageMin ?? 11.0;
      const vMax = thresholds.dcVoltageMax ?? 14.5;
      const iMax = thresholds.dcCurrentMax ?? 5.0;

      if (v !== undefined) {
        if (v < vMin - 1.5 || v > vMax + 1.5) status = 'critical';
        else if (v < vMin || v > vMax) if (status !== 'critical') status = 'warning';
      }

      if (i !== undefined && i > iMax) {
        status = 'critical';
      }
    }

    if (status === 'critical') criticalCount++;
    else if (status === 'warning') warningCount++;
    else normalCount++;
  });

  return {
    normalPct: parseFloat(((normalCount / n) * 100).toFixed(1)),
    warningPct: parseFloat(((warningCount / n) * 100).toFixed(1)),
    criticalPct: parseFloat(((criticalCount / n) * 100).toFixed(1)),
    normalCount,
    warningCount,
    criticalCount
  };
}
