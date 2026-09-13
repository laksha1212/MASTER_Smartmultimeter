import React, { useState, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Download, Layers, Sliders, CheckSquare, Square } from 'lucide-react';
import { PARAMETER_META } from '../utils/dataDetector.js';

export function MultiParamChart({
  data = [],
  detectedParameters = ['voltage', 'current'],
  datasetType = 'AC',
  height = 360
}) {
  const chartRef = useRef(null);
  const [selectedParams, setSelectedParams] = useState(() => {
    // Default select voltage and current
    const initial = [];
    if (detectedParameters.includes('voltage')) initial.push('voltage');
    if (detectedParameters.includes('current')) initial.push('current');
    if (initial.length === 0 && detectedParameters.length > 0) initial.push(detectedParameters[0]);
    return initial;
  });

  const [mode, setMode] = useState('multi-axis'); // 'multi-axis' | 'normalized'

  const toggleParam = (param) => {
    setSelectedParams(prev => {
      if (prev.includes(param)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(p => p !== param);
      } else {
        return [...prev, param];
      }
    });
  };

  // Color palette for multi-series
  const colorMap = {
    voltage: '#2563eb', // Blue
    current: '#0891b2', // Cyan
    power: '#7c3aed',   // Purple
    powerFactor: '#ea580c', // Orange
    frequency: '#16a34a', // Green
    energy: '#d97706',   // Amber
    temperature: '#dc2626', // Red
    rpm: '#4f46e5'       // Indigo
  };

  const chartData = useMemo(() => {
    if (!data || data.length === 0 || selectedParams.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = data.map(d => d.timestampStr || '');

    const datasets = selectedParams.map((param, index) => {
      const meta = PARAMETER_META[param] || { label: param, unit: '' };
      const labelName = datasetType === 'AC' ? (meta.acLabel || meta.label) : (meta.dcLabel || meta.label);
      const color = colorMap[param] || meta.color || '#2563eb';

      let values = data.map(d => (d[param] !== undefined && d[param] !== null) ? d[param] : null);

      if (mode === 'normalized') {
        // Normalize 0% - 100%
        const validVals = values.filter(v => v !== null && !isNaN(v));
        const min = Math.min(...validVals);
        const max = Math.max(...validVals);
        const span = max - min || 1;

        values = values.map(v => v !== null ? parseFloat((((v - min) / span) * 100).toFixed(1)) : null);
      }

      return {
        label: `${labelName} ${mode === 'normalized' ? '(0-100% Norm)' : `(${meta.unit || ''})`}`,
        data: values,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.2,
        yAxisID: mode === 'normalized' ? 'y' : (index === 0 ? 'y' : (index === 1 ? 'y1' : 'y'))
      };
    });

    return { labels, datasets };
  }, [data, selectedParams, mode, datasetType]);

  const options = useMemo(() => {
    const scales = {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: {
          color: '#64748b',
          font: { family: "'JetBrains Mono', monospace", size: 10 },
          maxTicksLimit: 10
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: '#e2e8f0' },
        ticks: {
          color: colorMap[selectedParams[0]] || '#2563eb',
          font: { family: "'JetBrains Mono', monospace", size: 10.5 },
          callback: (val) => mode === 'normalized' ? `${val}%` : `${val}`
        },
        title: {
          display: true,
          text: mode === 'normalized' ? 'Normalized Scale (0-100%)' : (PARAMETER_META[selectedParams[0]]?.unit || ''),
          color: colorMap[selectedParams[0]] || '#2563eb',
          font: { size: 11, weight: '600' }
        }
      }
    };

    if (mode === 'multi-axis' && selectedParams.length > 1) {
      scales.y1 = {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false }, // avoid grid line clash
        ticks: {
          color: colorMap[selectedParams[1]] || '#0891b2',
          font: { family: "'JetBrains Mono', monospace", size: 10.5 }
        },
        title: {
          display: true,
          text: PARAMETER_META[selectedParams[1]]?.unit || '',
          color: colorMap[selectedParams[1]] || '#0891b2',
          font: { size: 11, weight: '600' }
        }
      };
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '500' }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          titleColor: '#ffffff',
          bodyColor: '#f1f5f9',
          bodyFont: { family: "'JetBrains Mono', monospace", size: 11.5 },
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            title: (items) => `Timestamp: ${items[0]?.label || ''}`
          }
        }
      },
      scales
    };
  }, [selectedParams, mode]);

  const handleDownloadPNG = () => {
    if (!chartRef.current) return;
    const url = chartRef.current.toBase64Image();
    const link = document.createElement('a');
    link.download = `MASTER_MultiParam_Correlation.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="multi-header-left">
          <span className="card-header-title">
            <Layers size={17} className="text-primary" />
            Multi-Parameter Correlation Analysis
          </span>
          <span className="chart-subtitle">
            Synchronized overlay of electrical measurements across time
          </span>
        </div>

        <div className="multi-header-right">
          {/* Mode Switcher */}
          <div className="mode-toggle-pill">
            <button
              type="button"
              className={`mode-btn ${mode === 'multi-axis' ? 'active' : ''}`}
              onClick={() => setMode('multi-axis')}
            >
              Dual Y-Axes
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'normalized' ? 'active' : ''}`}
              onClick={() => setMode('normalized')}
            >
              Normalized %
            </button>
          </div>

          <button 
            type="button"
            className="chart-btn"
            onClick={handleDownloadPNG}
            title="Download PNG image"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Parameter Selection Checkboxes */}
      <div className="param-checkboxes-bar">
        <span className="checkboxes-label">Toggle Parameters:</span>
        <div className="checkbox-items">
          {detectedParameters.map(param => {
            const isSelected = selectedParams.includes(param);
            const meta = PARAMETER_META[param] || { label: param, unit: '' };
            const label = datasetType === 'AC' ? (meta.acLabel || meta.label) : (meta.dcLabel || meta.label);
            const color = colorMap[param] || '#2563eb';

            return (
              <label 
                key={param} 
                className={`param-checkbox-label ${isSelected ? 'checked' : ''}`}
                style={{ '--param-color': color }}
              >
                <input 
                  type="checkbox" 
                  checked={isSelected} 
                  onChange={() => toggleParam(param)} 
                />
                <span className="checkbox-custom">
                  {isSelected ? <CheckSquare size={14} color={color} /> : <Square size={14} color="#94a3b8" />}
                </span>
                <span className="param-checkbox-text">{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="chart-wrapper" style={{ height }}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

      <style>{`
        .multi-header-left {
          display: flex;
          flex-direction: column;
        }

        .multi-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mode-toggle-pill {
          display: inline-flex;
          background: var(--bg-subtle);
          padding: 3px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
        }

        .mode-btn {
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mode-btn.active {
          background: var(--bg-surface);
          color: var(--primary);
          font-weight: 600;
          box-shadow: var(--shadow-sm);
        }

        .param-checkboxes-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: var(--bg-subtle);
          border-radius: var(--radius-md);
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .checkboxes-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .checkbox-items {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .param-checkbox-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--text-secondary);
          cursor: pointer;
          user-select: none;
        }

        .param-checkbox-label.checked {
          color: var(--text-primary);
          font-weight: 600;
        }

        .param-checkbox-label input {
          display: none;
        }

        .checkbox-custom {
          display: inline-flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
