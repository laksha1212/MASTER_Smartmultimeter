import React from 'react';
import { 
  Zap, 
  Activity, 
  Gauge, 
  Flame, 
  Clock, 
  Battery, 
  Radio, 
  Compass, 
  Thermometer,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { PARAMETER_META } from '../utils/dataDetector.js';

export function KPICard({
  paramKey,
  stats,
  datasetType = 'AC',
  customTitle,
  customUnit,
  customAccentColor
}) {
  const meta = PARAMETER_META[paramKey] || {
    label: customTitle || paramKey,
    unit: customUnit || '',
    acLabel: customTitle || paramKey,
    dcLabel: customTitle || paramKey,
    color: customAccentColor || '#2563eb'
  };

  const title = customTitle || (datasetType === 'AC' ? (meta.acLabel || meta.label) : (meta.dcLabel || meta.label));
  const unit = customUnit !== undefined ? customUnit : meta.unit;
  const accentColor = customAccentColor || meta.color || '#2563eb';

  // Icon mapping
  const getIcon = () => {
    switch (paramKey) {
      case 'voltage': return <Zap size={16} />;
      case 'current': return <Activity size={16} />;
      case 'power': return <Flame size={16} />;
      case 'powerFactor': return <Gauge size={16} />;
      case 'frequency': return <Radio size={16} />;
      case 'energy': return <Battery size={16} />;
      case 'temperature': return <Thermometer size={16} />;
      case 'rpm': return <Compass size={16} />;
      default: return <Zap size={16} />;
    }
  };

  if (!stats || stats.count === 0) {
    return (
      <div className="kpi-card kpi-card-empty" style={{ '--card-accent': '#cbd5e1' }}>
        <div className="kpi-header">
          <span className="kpi-title">{title}</span>
          <div className="kpi-icon-wrap" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
            {getIcon()}
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-unavailable">Not in Dataset</span>
        </div>
        <div className="kpi-footer">
          <span className="text-muted">No measurements recorded</span>
        </div>
        <style>{`
          .kpi-card-empty {
            opacity: 0.75;
          }
          .kpi-unavailable {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-muted);
          }
        `}</style>
      </div>
    );
  }

  // Determine trend relative to average
  const isAboveAvg = stats.latest > stats.avg * 1.005;
  const isBelowAvg = stats.latest < stats.avg * 0.995;

  // Format decimals appropriately
  const formatVal = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '-';
    if (paramKey === 'powerFactor') return num.toFixed(3);
    if (paramKey === 'frequency') return num.toFixed(2);
    if (paramKey === 'energy') return num.toFixed(2);
    if (Math.abs(num) >= 1000) return num.toFixed(1);
    return num.toFixed(2);
  };

  return (
    <div className="kpi-card animate-fade-in" style={{ '--card-accent': accentColor }}>
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <div 
          className="kpi-icon-wrap" 
          style={{ 
            backgroundColor: `${accentColor}15`, 
            color: accentColor 
          }}
        >
          {getIcon()}
        </div>
      </div>

      <div className="kpi-value-row">
        <span className="kpi-value">{formatVal(stats.latest)}</span>
        {unit && <span className="kpi-unit">{unit}</span>}
      </div>

      <div className="kpi-subtext-row">
        <span className="kpi-label-tag">Latest measurement</span>
        <span className="kpi-trend-pill">
          {isAboveAvg ? (
            <span className="trend-up"><ArrowUpRight size={12} /> Above Avg</span>
          ) : isBelowAvg ? (
            <span className="trend-down"><ArrowDownRight size={12} /> Below Avg</span>
          ) : (
            <span className="trend-neutral"><Minus size={12} /> Steady</span>
          )}
        </span>
      </div>

      <div className="kpi-footer">
        <span className="kpi-stat-chip" title="Minimum recorded value">
          <span className="stat-dim">Min:</span> {formatVal(stats.min)} {unit}
        </span>
        <span className="kpi-stat-chip" title="Maximum recorded value">
          <span className="stat-dim">Max:</span> {formatVal(stats.max)} {unit}
        </span>
      </div>

      <style>{`
        .kpi-subtext-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .kpi-label-tag {
          font-size: 11px;
          color: var(--text-muted);
        }

        .kpi-trend-pill {
          font-size: 11px;
          font-weight: 600;
        }

        .trend-up {
          color: #2563eb;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }

        .trend-down {
          color: #d97706;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }

        .trend-neutral {
          color: #16a34a;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }

        .stat-dim {
          color: var(--text-light);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
