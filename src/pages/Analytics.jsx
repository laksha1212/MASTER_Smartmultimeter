import React from 'react';
import { 
  BarChart3, 
  Sliders, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  UploadCloud, 
  Download,
  AlertTriangle
} from 'lucide-react';
import { StatisticsTable } from '../components/StatisticsTable.jsx';
import { DonutChart } from '../components/DonutChart.jsx';
import { InsightCard } from '../components/InsightCard.jsx';
import { MultiParamChart } from '../components/MultiParamChart.jsx';

export function Analytics({
  dataset,
  onOpenUpload,
  onLoadSampleAC,
  onOpenThresholds,
  thresholds
}) {
  if (!dataset) {
    return (
      <div className="page-container">
        <div className="master-card empty-view animate-fade-in">
          <BarChart3 size={36} className="text-primary" />
          <h2>No Measurement Dataset Loaded</h2>
          <p>Please upload a CSV file or load sample data to perform statistical dispersion and stability analysis.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={onOpenUpload}>
              <UploadCloud size={15} />
              <span>Upload CSV</span>
            </button>
            <button className="btn btn-secondary" onClick={onLoadSampleAC}>
              <span>Load Sample AC</span>
            </button>
          </div>
        </div>
        <style>{`
          .empty-view {
            padding: 48px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            margin-top: 20px;
          }
          .empty-view h2 { font-size: 20px; color: var(--text-primary); }
          .empty-view p { color: var(--text-secondary); max-width: 480px; }
        `}</style>
      </div>
    );
  }

  const { metrics, detectedParameters, datasetType, stability, conditionDistribution, insights, fileName, downsampledData, type } = dataset;

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <BarChart3 size={22} className="text-primary" />
            Parametric Analytics & Quality Engine
            <span className={`badge ${type === 'AC' ? 'badge-ac' : 'badge-dc'}`}>{type} Dataset</span>
          </h1>
          <p>
            Statistical dispersion, stability classification, and tolerance boundary compliance • <strong>{fileName}</strong>
          </p>
        </div>

        <div className="page-actions">
          <button 
            type="button" 
            className="btn btn-outline-primary"
            onClick={onOpenThresholds}
          >
            <Sliders size={14} />
            <span>Configure Alert Limits</span>
          </button>
        </div>
      </div>

      {/* Stability & Operating Condition Charts */}
      <div className="charts-grid-2">
        <DonutChart 
          type="stability" 
          data={stability} 
          title="Measurement Stability Distribution" 
          subtitle="Proportion of points within tight ±2% band vs moderate and high variation"
        />
        <DonutChart 
          type="operating" 
          data={conditionDistribution} 
          title="Operating Threshold Compliance" 
          subtitle="Classification against configured warning and critical limit bounds"
        />
      </div>

      {/* Multi-Parameter Cross-Correlation */}
      <div style={{ marginBottom: 24 }}>
        <MultiParamChart 
          data={downsampledData}
          detectedParameters={detectedParameters}
          datasetType={type}
        />
      </div>

      {/* Automated Diagnostic Observations */}
      <div style={{ marginBottom: 24 }}>
        <InsightCard insights={insights} />
      </div>

      {/* Detailed Statistics Table */}
      <div style={{ marginBottom: 24 }}>
        <StatisticsTable 
          metrics={metrics} 
          detectedParameters={detectedParameters} 
          datasetType={type} 
          fileName={fileName}
        />
      </div>

      {/* Current Configured Thresholds Card */}
      <div className="master-card threshold-status-card">
        <div className="card-header-row">
          <div className="card-header-title">
            <Sliders size={18} className="text-primary" />
            Active Alert Threshold Configuration
          </div>
          <button className="btn btn-sm btn-secondary" onClick={onOpenThresholds}>
            Modify Thresholds
          </button>
        </div>

        <div className="threshold-pills-grid">
          {type === 'AC' ? (
            <>
              <div className="th-pill">
                <span className="th-name">AC Voltage Normal:</span>
                <span className="th-val mono">{thresholds.acVoltageMin} V – {thresholds.acVoltageMax} V</span>
              </div>
              <div className="th-pill">
                <span className="th-name">AC Frequency Normal:</span>
                <span className="th-val mono">{thresholds.acFreqMin} Hz – {thresholds.acFreqMax} Hz</span>
              </div>
              <div className="th-pill">
                <span className="th-name">Power Factor Warning:</span>
                <span className="th-val mono">&lt; {thresholds.acPfWarning}</span>
              </div>
            </>
          ) : (
            <>
              <div className="th-pill">
                <span className="th-name">DC Voltage Normal:</span>
                <span className="th-val mono">{thresholds.dcVoltageMin} V – {thresholds.dcVoltageMax} V</span>
              </div>
              <div className="th-pill">
                <span className="th-name">DC Current Limit:</span>
                <span className="th-val mono">&gt; {thresholds.dcCurrentMax} A</span>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .threshold-status-card {
          margin-bottom: 24px;
        }

        .threshold-pills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-top: 10px;
        }

        .th-pill {
          background: var(--bg-subtle);
          border: 1px solid var(--border-light);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .th-name {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .th-val {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
