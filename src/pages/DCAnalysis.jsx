import React from 'react';
import { 
  BatteryCharging, 
  Zap, 
  Flame, 
  Battery, 
  UploadCloud, 
  FileSpreadsheet 
} from 'lucide-react';
import { KPICard } from '../components/KPICard.jsx';
import { TimeSeriesChart } from '../components/TimeSeriesChart.jsx';
import { MultiParamChart } from '../components/MultiParamChart.jsx';
import { DonutChart } from '../components/DonutChart.jsx';
import { StatisticsTable } from '../components/StatisticsTable.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { InsightCard } from '../components/InsightCard.jsx';

export function DCAnalysis({
  dataset,
  onOpenUpload,
  onLoadSampleDC,
  thresholds
}) {
  if (!dataset) {
    return (
      <div className="page-container">
        <div className="master-card empty-view animate-fade-in">
          <BatteryCharging size={36} className="text-cyan" />
          <h2>No DC Dataset Loaded</h2>
          <p>Please upload a DC measurement CSV or load the built-in demo DC dataset to begin analysis.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={onOpenUpload}>
              <UploadCloud size={15} />
              <span>Upload DC CSV</span>
            </button>
            <button className="btn btn-secondary" onClick={onLoadSampleDC}>
              <BatteryCharging size={15} className="text-cyan" />
              <span>Load Sample DC</span>
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
            <BatteryCharging size={22} className="text-cyan" />
            DC Sensing & Energy Diagnostics
            <span className="badge badge-dc">DC System</span>
          </h1>
          <p>
            Real-time diagnostics for DC bus voltage, load current, power, and accumulated energy • <strong>{fileName}</strong>
          </p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={onOpenUpload}>
            <UploadCloud size={14} />
            <span>Upload DC CSV</span>
          </button>
        </div>
      </div>

      {/* DC KPI Cards */}
      <div className="kpi-grid">
        <KPICard paramKey="voltage" stats={metrics.voltage} datasetType="DC" />
        <KPICard paramKey="current" stats={metrics.current} datasetType="DC" />
        <KPICard paramKey="power" stats={metrics.power} datasetType="DC" />
        <KPICard paramKey="energy" stats={metrics.energy} datasetType="DC" />
      </div>

      {/* 4 Dedicated DC Time-Series Graphs */}
      <div className="charts-grid-2">
        <TimeSeriesChart 
          data={downsampledData} 
          paramKey="voltage" 
          datasetType="DC" 
          customTitle="DC Bus Voltage" 
          thresholds={thresholds}
        />
        <TimeSeriesChart 
          data={downsampledData} 
          paramKey="current" 
          datasetType="DC" 
          customTitle="DC Load Current" 
          thresholds={thresholds}
        />
      </div>

      <div className="charts-grid-2">
        <TimeSeriesChart 
          data={downsampledData} 
          paramKey="power" 
          datasetType="DC" 
          customTitle="DC Power Dissipation" 
          thresholds={thresholds}
        />
        <TimeSeriesChart 
          data={downsampledData} 
          paramKey="energy" 
          datasetType="DC" 
          customTitle="Accumulated Energy" 
          thresholds={thresholds}
        />
      </div>

      {/* Multi-Parameter View */}
      <div style={{ marginBottom: 24 }}>
        <MultiParamChart 
          data={downsampledData}
          detectedParameters={detectedParameters}
          datasetType="DC"
        />
      </div>

      {/* Stability & Conditions */}
      <div className="charts-grid-2">
        <DonutChart 
          type="stability" 
          data={stability} 
          title="DC Supply Stability Index" 
          subtitle="Proportion of samples maintaining nominal ±2% voltage regulation"
        />
        <DonutChart 
          type="operating" 
          data={conditionDistribution} 
          title="DC Operating Condition Distribution" 
          subtitle="Compliance with configured DC voltage & current limit thresholds"
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
          datasetType="DC" 
          fileName={fileName}
        />
      </div>

      {/* Raw Data Table */}
      <div style={{ marginBottom: 24 }}>
        <DataTable 
          cleanData={cleanData} 
          detectedParameters={detectedParameters} 
          datasetType="DC" 
          fileName={fileName}
        />
      </div>
    </div>
  );
}
