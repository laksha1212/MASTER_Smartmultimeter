import React from 'react';
import { 
  Zap, 
  Activity, 
  Flame, 
  Gauge, 
  Radio, 
  UploadCloud, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { KPICard } from '../components/KPICard.jsx';
import { TimeSeriesChart } from '../components/TimeSeriesChart.jsx';
import { MultiParamChart } from '../components/MultiParamChart.jsx';
import { DonutChart } from '../components/DonutChart.jsx';
import { StatisticsTable } from '../components/StatisticsTable.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { InsightCard } from '../components/InsightCard.jsx';

export function ACAnalysis({
  dataset,
  onOpenUpload,
  onLoadSampleAC,
  thresholds
}) {
  if (!dataset) {
    return (
      <div className="page-container">
        <div className="master-card empty-view animate-fade-in">
          <Zap size={36} className="text-primary" />
          <h2>No AC Dataset Loaded</h2>
          <p>Please upload an AC measurement CSV or load the built-in demo AC dataset to begin analysis.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={onOpenUpload}>
              <UploadCloud size={15} />
              <span>Upload AC CSV</span>
            </button>
            <button className="btn btn-secondary" onClick={onLoadSampleAC}>
              <Zap size={15} className="text-primary" />
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

  const { metrics, cleanData, downsampledData, detectedParameters, stability, conditionDistribution, fileName, insights } = dataset;

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Zap size={22} className="text-primary" />
            AC Measurement Analysis Suite
            <span className="badge badge-ac">AC Mains</span>
          </h1>
          <p>
            Real-time diagnostics for single-phase alternating current electrical parameters • <strong>{fileName}</strong>
          </p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={onOpenUpload}>
            <UploadCloud size={14} />
            <span>Upload AC CSV</span>
          </button>
        </div>
      </div>

      {/* AC KPI Cards */}
      <div className="kpi-grid">
        <KPICard paramKey="voltage" stats={metrics.voltage} datasetType="AC" />
        <KPICard paramKey="current" stats={metrics.current} datasetType="AC" />
        <KPICard paramKey="power" stats={metrics.power} datasetType="AC" />
        <KPICard paramKey="powerFactor" stats={metrics.powerFactor} datasetType="AC" />
        <KPICard paramKey="frequency" stats={metrics.frequency} datasetType="AC" />
      </div>

      {/* 5 Dedicated AC Time-Series Graphs */}
      <div className="charts-grid-2">
        <TimeSeriesChart 
          data={downsampledData} 
          paramKey="voltage" 
          datasetType="AC" 
          customTitle="RMS Voltage" 
          thresholds={thresholds}
        />
        <TimeSeriesChart 
          data={downsampledData} 
          paramKey="current" 
          datasetType="AC" 
          customTitle="RMS Current" 
          thresholds={thresholds}
        />
      </div>

      <div className="charts-grid-2">
        <TimeSeriesChart 
          data={downsampledData} 
          paramKey="power" 
          datasetType="AC" 
          customTitle="Active Power" 
          thresholds={thresholds}
        />
        <TimeSeriesChart 
          data={downsampledData} 
          paramKey="powerFactor" 
          datasetType="AC" 
          customTitle="Power Factor (cos φ)" 
          thresholds={thresholds}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <TimeSeriesChart 
          data={downsampledData} 
          paramKey="frequency" 
          datasetType="AC" 
          customTitle="Grid Frequency" 
          height={300}
          thresholds={thresholds}
        />
      </div>

      {/* Multi-Parameter View */}
      <div style={{ marginBottom: 24 }}>
        <MultiParamChart 
          data={downsampledData}
          detectedParameters={detectedParameters}
          datasetType="AC"
        />
      </div>

      {/* Stability & Conditions */}
      <div className="charts-grid-2">
        <DonutChart 
          type="stability" 
          data={stability} 
          title="AC Mains Voltage Stability" 
          subtitle="Proportion of samples maintaining nominal 230V ±2% regulation"
        />
        <DonutChart 
          type="operating" 
          data={conditionDistribution} 
          title="AC Operating Quality Distribution" 
          subtitle="Compliance with configured voltage, frequency and PF thresholds"
        />
      </div>

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <InsightCard insights={insights} />
        </div>
      )}

      {/* Statistical Table */}
      <div style={{ marginBottom: 24 }}>
        <StatisticsTable 
          metrics={metrics} 
          detectedParameters={detectedParameters} 
          datasetType="AC" 
          fileName={fileName}
        />
      </div>

      {/* Raw Data Table */}
      <div style={{ marginBottom: 24 }}>
        <DataTable 
          cleanData={cleanData} 
          detectedParameters={detectedParameters} 
          datasetType="AC" 
          fileName={fileName}
        />
      </div>
    </div>
  );
}
