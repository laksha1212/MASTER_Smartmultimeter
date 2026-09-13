import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  Zap,
  Activity,
  Gauge
} from 'lucide-react';

export function InsightCard({ insights = [] }) {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle2 size={16} className="text-success" />;
      case 'good':
        return <CheckCircle2 size={16} className="text-primary" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-warning" />;
      case 'info':
      default:
        return <Info size={16} className="text-info" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'optimal':
        return <span className="badge badge-success">Optimal</span>;
      case 'good':
        return <span className="badge badge-ac">Nominal</span>;
      case 'warning':
        return <span className="badge badge-warning">Caution</span>;
      case 'info':
      default:
        return <span className="badge badge-neutral">Observation</span>;
    }
  };

  return (
    <div className="master-card insights-card">
      <div className="card-header-row">
        <div>
          <div className="card-header-title">
            <Sparkles size={18} className="text-primary" />
            Automated Diagnostic Insights
          </div>
          <div className="card-header-subtitle">
            Real-time data-driven engineering observations computed from historical measurements
          </div>
        </div>
        <span className="badge badge-neutral">{insights.length} Observations</span>
      </div>

      <div className="insights-grid">
        {insights.map((item) => (
          <div key={item.id} className={`insight-item status-${item.status}`}>
            <div className="insight-item-header">
              <div className="insight-header-left">
                {getStatusIcon(item.status)}
                <span className="insight-title">{item.title}</span>
              </div>
              <div className="insight-header-right">
                {getStatusBadge(item.status)}
                {item.metricValue && (
                  <span className="insight-metric-pill mono">{item.metricValue}</span>
                )}
              </div>
            </div>

            <p className="insight-description">
              {item.description}
            </p>

            <div className="insight-footer">
              <span className="insight-category-tag">{item.category}</span>
              {item.trend && (
                <span className="insight-trend-tag">
                  <Activity size={12} /> {item.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 14px;
        }

        .insight-item {
          background: var(--bg-subtle);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 8px;
          transition: all 0.15s ease;
        }

        .insight-item:hover {
          border-color: #cbd5e1;
          background: #ffffff;
          box-shadow: var(--shadow-sm);
        }

        .insight-item.status-warning {
          border-left: 3px solid var(--warning);
        }

        .insight-item.status-optimal {
          border-left: 3px solid var(--success);
        }

        .insight-item.status-good {
          border-left: 3px solid var(--primary);
        }

        .insight-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }

        .insight-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .insight-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .insight-header-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .insight-metric-pill {
          font-size: 11px;
          font-weight: 600;
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          padding: 2px 7px;
          border-radius: 4px;
          color: var(--text-primary);
        }

        .insight-description {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .insight-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 6px;
          border-top: 1px solid var(--border-subtle);
          font-size: 11px;
          color: var(--text-muted);
        }

        .insight-category-tag {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .insight-trend-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono);
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
}
