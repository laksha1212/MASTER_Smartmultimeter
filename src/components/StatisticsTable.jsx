import React from 'react';
import { Table, Download, BarChart2 } from 'lucide-react';
import { PARAMETER_META } from '../utils/dataDetector.js';

export function StatisticsTable({
  metrics = {},
  detectedParameters = [],
  datasetType = 'AC',
  fileName = 'dataset.csv'
}) {
  const formatNum = (val, param) => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    if (param === 'powerFactor') return val.toFixed(3);
    if (param === 'frequency') return val.toFixed(2);
    if (param === 'energy') return val.toFixed(3);
    if (Math.abs(val) >= 1000) return val.toFixed(1);
    return val.toFixed(2);
  };

  const handleExportCSV = () => {
    const headers = ['Parameter', 'Latest', 'Average', 'Minimum', 'Maximum', 'Median', 'Std Dev', 'Range', 'Unit'];
    const rows = detectedParameters.map(param => {
      const stat = metrics[param];
      const meta = PARAMETER_META[param] || { label: param, unit: '' };
      const label = datasetType === 'AC' ? (meta.acLabel || meta.label) : (meta.dcLabel || meta.label);

      if (!stat) return [label, '', '', '', '', '', '', '', meta.unit];
      return [
        label,
        formatNum(stat.latest, param),
        formatNum(stat.avg, param),
        formatNum(stat.min, param),
        formatNum(stat.max, param),
        formatNum(stat.median, param),
        formatNum(stat.stdDev, param),
        formatNum(stat.range, param),
        meta.unit
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MASTER_Statistics_Summary_${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="master-card">
      <div className="card-header-row">
        <div>
          <div className="card-header-title">
            <BarChart2 size={18} className="text-primary" />
            Parametric Statistical Analysis
          </div>
          <div className="card-header-subtitle">
            Comprehensive central tendency and dispersion metrics for all recorded signals
          </div>
        </div>

        <button 
          type="button" 
          className="btn btn-sm btn-secondary"
          onClick={handleExportCSV}
          title="Download statistical metrics as CSV"
        >
          <Download size={14} />
          <span>Export Summary CSV</span>
        </button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Latest</th>
              <th>Average</th>
              <th>Minimum</th>
              <th>Maximum</th>
              <th>Median</th>
              <th>Std. Dev.</th>
              <th>Range (Δ)</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {detectedParameters.map(param => {
              const stat = metrics[param];
              const meta = PARAMETER_META[param] || { label: param, unit: '' };
              const label = datasetType === 'AC' ? (meta.acLabel || meta.label) : (meta.dcLabel || meta.label);

              if (!stat || stat.count === 0) {
                return (
                  <tr key={param}>
                    <td style={{ fontWeight: 600 }}>{label}</td>
                    <td colSpan="7" className="text-muted" style={{ fontStyle: 'italic' }}>
                      No data recorded
                    </td>
                    <td className="text-muted">{meta.unit || '-'}</td>
                  </tr>
                );
              }

              return (
                <tr key={param}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span 
                        style={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: meta.color || '#2563eb' 
                        }}
                      ></span>
                      {label}
                    </div>
                  </td>
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {formatNum(stat.latest, param)}
                  </td>
                  <td className="mono">{formatNum(stat.avg, param)}</td>
                  <td className="mono">{formatNum(stat.min, param)}</td>
                  <td className="mono">{formatNum(stat.max, param)}</td>
                  <td className="mono">{formatNum(stat.median, param)}</td>
                  <td className="mono">{formatNum(stat.stdDev, param)}</td>
                  <td className="mono">{formatNum(stat.range, param)}</td>
                  <td className="mono text-muted">{meta.unit || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
