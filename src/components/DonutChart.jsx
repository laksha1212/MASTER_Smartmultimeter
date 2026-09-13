import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart as PieIcon, ShieldCheck, Activity } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export function DonutChart({
  type = 'stability', // 'stability' | 'operating'
  data = {},
  title,
  subtitle
}) {
  let labels = [];
  let values = [];
  let bgColors = [];
  let centerScore = '100%';
  let centerLabel = 'Stability';

  if (type === 'stability') {
    labels = ['Stable (±2%)', 'Moderate (±5%)', 'High Variation (>5%)'];
    values = [
      data.stablePct !== undefined ? data.stablePct : 100,
      data.moderatePct !== undefined ? data.moderatePct : 0,
      data.highPct !== undefined ? data.highPct : 0
    ];
    bgColors = ['#16a34a', '#d97706', '#dc2626']; // Green, Amber, Red
    centerScore = `${data.stablePct || 100}%`;
    centerLabel = 'Stable';
  } else {
    // Operating Condition
    labels = ['Normal Zone', 'Warning Margin', 'Critical Boundary'];
    values = [
      data.normalPct !== undefined ? data.normalPct : 100,
      data.warningPct !== undefined ? data.warningPct : 0,
      data.criticalPct !== undefined ? data.criticalPct : 0
    ];
    bgColors = ['#2563eb', '#d97706', '#dc2626']; // Blue, Amber, Red
    centerScore = `${data.normalPct || 100}%`;
    centerLabel = 'In Tolerance';
  }

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: bgColors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleColor: '#ffffff',
        bodyColor: '#f1f5f9',
        bodyFont: {
          family: "'JetBrains Mono', monospace",
          size: 12
        },
        padding: 8,
        cornerRadius: 6,
        callbacks: {
          label: (item) => ` ${item.label}: ${item.raw}%`
        }
      }
    }
  };

  return (
    <div className="chart-card donut-card">
      <div className="chart-header">
        <div className="donut-title-block">
          <span className="card-header-title">
            {type === 'stability' ? <ShieldCheck size={17} className="text-success" /> : <Activity size={17} className="text-primary" />}
            {title || (type === 'stability' ? 'Measurement Stability' : 'Operating Condition Distribution')}
          </span>
          <span className="chart-subtitle">
            {subtitle || (type === 'stability' ? 'Percentage deviation within regulation band' : 'Sample distribution against alert thresholds')}
          </span>
        </div>
      </div>

      <div className="donut-body">
        <div className="donut-canvas-container">
          <Doughnut data={chartData} options={options} />
          <div className="donut-center-stat">
            <span className="center-score">{centerScore}</span>
            <span className="center-label">{centerLabel}</span>
          </div>
        </div>

        {/* Breakdown Legend List */}
        <div className="donut-legend-list">
          {labels.map((lbl, idx) => (
            <div key={lbl} className="legend-row">
              <div className="legend-indicator-group">
                <span className="legend-dot" style={{ backgroundColor: bgColors[idx] }}></span>
                <span className="legend-text">{lbl}</span>
              </div>
              <span className="legend-pct mono">{values[idx]}%</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .donut-title-block {
          display: flex;
          flex-direction: column;
        }

        .text-success { color: #16a34a; }

        .donut-body {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 8px;
        }

        @media (max-width: 480px) {
          .donut-body {
            flex-direction: column;
          }
        }

        .donut-canvas-container {
          position: relative;
          width: 150px;
          height: 150px;
          flex-shrink: 0;
        }

        .donut-center-stat {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
        }

        .center-score {
          font-family: var(--font-mono);
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .center-label {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .donut-legend-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          background: var(--bg-subtle);
          border-radius: var(--radius-sm);
          font-size: 12px;
        }

        .legend-indicator-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-text {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .legend-pct {
          font-weight: 700;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
