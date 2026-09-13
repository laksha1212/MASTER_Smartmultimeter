import React from 'react';
import { FileText, Download, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { generatePDFReport } from '../utils/pdfGenerator.js';
import { PARAMETER_META } from '../utils/dataDetector.js';

export function ExportReportModal({
  isOpen,
  onClose,
  dataset
}) {
  if (!isOpen || !dataset) return null;

  const handleDownloadPDF = () => {
    generatePDFReport(dataset);
  };

  const handleDownloadCleanCSV = () => {
    const headers = ['Timestamp', ...dataset.detectedParameters.map(p => PARAMETER_META[p]?.label || p)];
    const rows = dataset.cleanData.map(r => [
      r.timestampStr,
      ...dataset.detectedParameters.map(p => r[p] !== undefined && r[p] !== null ? r[p] : '')
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MASTER_Clean_${dataset.fileName}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} className="text-primary" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>MASTER Diagnostic Report Preview</h3>
          </div>
          <button className="btn-icon" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Report Paper Preview Mock */}
          <div className="report-paper-preview">
            <div className="report-doc-header">
              <div>
                <span className="report-doc-title">MASTER DIAGNOSTIC TEST REPORT</span>
                <span className="report-doc-sub">RP2040 MicroSD Historical Data Logger Analysis</span>
              </div>
              <span className="report-doc-badge">{dataset.type} POWER PROFILE</span>
            </div>

            <div className="report-meta-grid">
              <div className="report-meta-item">
                <span className="rm-lbl">File:</span>
                <span className="rm-val mono">{dataset.fileName}</span>
              </div>
              <div className="report-meta-item">
                <span className="rm-lbl">Records:</span>
                <span className="rm-val mono">{dataset.recordCount.toLocaleString()} pts</span>
              </div>
              <div className="report-meta-item">
                <span className="rm-lbl">Time Span:</span>
                <span className="rm-val mono">{dataset.timeRange.startTime} - {dataset.timeRange.endTime}</span>
              </div>
              <div className="report-meta-item">
                <span className="rm-lbl">Duration:</span>
                <span className="rm-val mono">{dataset.timeRange.durationFormatted}</span>
              </div>
            </div>

            {/* Quick Summary Table */}
            <div className="report-summary-table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Latest</th>
                    <th>Average</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset.detectedParameters.map(p => {
                    const stat = dataset.metrics[p];
                    const meta = PARAMETER_META[p] || { label: p, unit: '' };
                    if (!stat) return null;
                    return (
                      <tr key={p}>
                        <td style={{ fontWeight: 600 }}>{meta.label}</td>
                        <td className="mono">{stat.latest.toFixed(2)}</td>
                        <td className="mono">{stat.avg.toFixed(2)}</td>
                        <td className="mono">{stat.min.toFixed(2)}</td>
                        <td className="mono">{stat.max.toFixed(2)}</td>
                        <td className="mono text-muted">{meta.unit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Diagnostic Insights preview */}
            <div className="report-insights-preview">
              <span className="rip-title"><Sparkles size={13} className="text-primary" /> Key Diagnostic Findings:</span>
              <ul className="rip-list">
                {(dataset.insights || []).slice(0, 3).map(ins => (
                  <li key={ins.id}>
                    <strong>{ins.title}:</strong> {ins.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleDownloadCleanCSV}>
            <Download size={14} />
            <span>Download Clean CSV</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={handleDownloadPDF}>
            <Download size={14} />
            <span>Generate Official PDF</span>
          </button>
        </div>

        <style>{`
          .report-paper-preview {
            background: var(--bg-surface);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-md);
            padding: 20px;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.03);
          }

          .report-doc-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--primary);
            margin-bottom: 14px;
          }

          .report-doc-title {
            display: block;
            font-size: 14px;
            font-weight: 800;
            color: var(--text-primary);
            letter-spacing: 0.05em;
          }

          .report-doc-sub {
            font-size: 11px;
            color: var(--text-muted);
          }

          .report-doc-badge {
            font-size: 10px;
            font-weight: 700;
            color: #1e40af;
            background: #dbeafe;
            padding: 2px 8px;
            border-radius: 4px;
          }

          .report-meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 8px;
            background: var(--bg-subtle);
            padding: 10px 12px;
            border-radius: var(--radius-sm);
            margin-bottom: 14px;
          }

          .report-meta-item {
            display: flex;
            flex-direction: column;
          }

          .rm-lbl {
            font-size: 10.5px;
            color: var(--text-muted);
          }

          .rm-val {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .report-summary-table-wrap {
            overflow-x: auto;
            margin-bottom: 14px;
          }

          .report-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11.5px;
          }

          .report-table th {
            background: var(--bg-subtle);
            text-align: left;
            padding: 6px 10px;
            border-bottom: 1px solid var(--border-light);
            font-weight: 600;
          }

          .report-table td {
            padding: 6px 10px;
            border-bottom: 1px solid var(--border-subtle);
          }

          .report-insights-preview {
            background: var(--primary-light);
            border: 1px solid var(--primary-border);
            border-radius: var(--radius-sm);
            padding: 10px 12px;
            font-size: 11.5px;
          }

          .rip-title {
            font-weight: 700;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
          }

          .rip-list {
            padding-left: 18px;
            color: var(--text-secondary);
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
        `}</style>
      </div>
    </div>
  );
}
