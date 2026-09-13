/**
 * insightsEngine.js
 * Generates automated, data-driven engineering observations strictly from real CSV numbers.
 */

export function generateDiagnosticInsights(dataset) {
  if (!dataset || !dataset.cleanData || dataset.cleanData.length === 0) {
    return [];
  }

  const { type, metrics, cleanData, timeRange } = dataset;
  const insights = [];

  // 1. Voltage Insight
  if (metrics.voltage && metrics.voltage.count > 0) {
    const v = metrics.voltage;
    const nominal = type === 'AC' ? 230 : 12;
    const variationPct = ((v.max - v.min) / (v.avg || 1) * 100).toFixed(1);
    const deviationFromNominal = Math.abs(v.avg - nominal).toFixed(1);

    let status = 'good';
    let text = '';

    if (type === 'AC') {
      if (variationPct <= 3.0) {
        status = 'optimal';
        text = `Mains voltage exhibited high grid stability averaging ${v.avg.toFixed(1)} V with a narrow ±${(variationPct / 2).toFixed(1)}% total variation window (${v.min.toFixed(1)} V to ${v.max.toFixed(1)} V).`;
      } else if (variationPct <= 6.0) {
        status = 'good';
        text = `Voltage remained well within nominal operating tolerance averaging ${v.avg.toFixed(1)} V with moderate load-induced voltage sag down to ${v.min.toFixed(1)} V.`;
      } else {
        status = 'warning';
        text = `Significant voltage fluctuation detected (${variationPct}% total swing, range: ${v.range.toFixed(1)} V). Peak recorded: ${v.max.toFixed(1)} V, Minimum: ${v.min.toFixed(1)} V.`;
      }
    } else {
      // DC
      if (v.avg >= 11.5 && v.avg <= 14.2) {
        status = 'optimal';
        text = `DC bus voltage maintained steady delivery at ${v.avg.toFixed(2)} V (Min: ${v.min.toFixed(2)} V, Max: ${v.max.toFixed(2)} V) across the ${timeRange.durationFormatted || 'recorded'} test run.`;
      } else {
        status = 'warning';
        text = `DC voltage experienced significant drift from nominal (${v.min.toFixed(2)} V to ${v.max.toFixed(2)} V), indicating variable source supply or heavy battery discharge.`;
      }
    }

    insights.push({
      id: 'voltage_insight',
      category: 'Voltage Regulation',
      parameter: 'Voltage',
      status,
      title: `${type} Voltage Stability`,
      description: text,
      metricValue: `${v.avg.toFixed(1)} V avg`,
      trend: variationPct <= 3.0 ? 'stable' : 'variable'
    });
  }

  // 2. Current Dynamics & Peak Inrush Insight
  if (metrics.current && metrics.current.count > 0) {
    const c = metrics.current;
    
    // Find timestamp of peak current
    let peakRow = cleanData[0];
    cleanData.forEach(r => {
      if (r.current > (peakRow.current || 0)) {
        peakRow = r;
      }
    });

    const peakRatio = c.avg > 0 ? (c.max / c.avg).toFixed(1) : 1;
    let status = 'optimal';
    let desc = '';

    if (peakRatio >= 1.8) {
      status = 'info';
      desc = `Transient current peak of ${c.max.toFixed(2)} A recorded at ${peakRow.timestampStr || 'peak window'} (${peakRatio}x mean load), characteristic of inductive motor inrush or step-load activation.`;
    } else {
      status = 'good';
      desc = `Load current remained steady throughout the session, averaging ${c.avg.toFixed(2)} A (Std Dev: ${c.stdDev.toFixed(2)} A) with highest sustained draw of ${c.max.toFixed(2)} A.`;
    }

    insights.push({
      id: 'current_insight',
      category: 'Current & Load Dynamics',
      parameter: 'Current',
      status,
      title: 'Peak Load & Current Profile',
      description: desc,
      metricValue: `${c.max.toFixed(2)} A peak`,
      trend: peakRatio >= 1.8 ? 'transient' : 'steady'
    });
  }

  // 3. Power Factor Insight (AC)
  if (type === 'AC' && metrics.powerFactor && metrics.powerFactor.count > 0) {
    const pf = metrics.powerFactor;
    let status = 'good';
    let desc = '';

    if (pf.avg >= 0.90) {
      status = 'optimal';
      desc = `Excellent power factor performance averaging ${pf.avg.toFixed(3)} (cos φ). Minimal reactive power penalty was incurred by connected equipment.`;
    } else if (pf.avg >= 0.80) {
      status = 'good';
      desc = `Moderate power factor averaging ${pf.avg.toFixed(3)}. Inductive loads were present during the run, pulling PF down to a minimum of ${pf.min.toFixed(3)}.`;
    } else {
      status = 'warning';
      desc = `Low average power factor (${pf.avg.toFixed(3)}) recorded. High inductive reactive burden detected; power factor correction (PFC) capacitance recommended.`;
    }

    insights.push({
      id: 'pf_insight',
      category: 'Power Quality',
      parameter: 'Power Factor',
      status,
      title: 'Power Factor & Phase Alignment',
      description: desc,
      metricValue: `${pf.avg.toFixed(3)} avg PF`,
      trend: pf.avg >= 0.85 ? 'compliant' : 'sub-optimal'
    });
  }

  // 4. Grid Frequency Insight (AC)
  if (type === 'AC' && metrics.frequency && metrics.frequency.count > 0) {
    const freq = metrics.frequency;
    const isStandard50 = Math.abs(freq.avg - 50.0) < 1.0;
    const nominal = isStandard50 ? 50.0 : 60.0;
    const maxDeviation = Math.max(Math.abs(freq.max - nominal), Math.abs(freq.min - nominal)).toFixed(2);
    
    let status = 'optimal';
    let desc = '';

    if (maxDeviation <= 0.20) {
      status = 'optimal';
      desc = `Mains grid frequency adhered strictly to the ${nominal} Hz standard (Mean: ${freq.avg.toFixed(2)} Hz, Max Jitter: ±${maxDeviation} Hz).`;
    } else {
      status = 'good';
      desc = `Grid frequency showed slight drift between ${freq.min.toFixed(2)} Hz and ${freq.max.toFixed(2)} Hz, averaging ${freq.avg.toFixed(2)} Hz.`;
    }

    insights.push({
      id: 'freq_insight',
      category: 'Grid Compliance',
      parameter: 'Frequency',
      status,
      title: 'Frequency Jitter & Synchronization',
      description: desc,
      metricValue: `${freq.avg.toFixed(2)} Hz`,
      trend: 'stable'
    });
  }

  // 5. Active Power & Energy Insight
  if (metrics.power && metrics.power.count > 0) {
    const p = metrics.power;
    const maxKW = (p.max / 1000).toFixed(2);
    const avgKW = (p.avg / 1000).toFixed(2);
    
    let energyText = '';
    if (metrics.energy && metrics.energy.count > 0) {
      energyText = ` Total accumulated energy during the test was ${metrics.energy.latest.toFixed(2)} Wh.`;
    }

    insights.push({
      id: 'power_insight',
      category: 'Power Consumption',
      parameter: 'Power',
      status: 'optimal',
      title: 'Active Power Demand',
      description: `Peak active power reached ${p.max >= 1000 ? `${maxKW} kW` : `${p.max.toFixed(1)} W`} with mean power dissipation of ${p.avg >= 1000 ? `${avgKW} kW` : `${p.avg.toFixed(1)} W`}.${energyText}`,
      metricValue: p.max >= 1000 ? `${maxKW} kW max` : `${p.max.toFixed(1)} W max`,
      trend: 'normal'
    });
  }

  return insights;
}
