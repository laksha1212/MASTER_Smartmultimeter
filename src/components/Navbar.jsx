import React from 'react';
import { 
  Cpu, 
  Upload, 
  FileText, 
  Sliders, 
  Zap, 
  BatteryCharging, 
  Menu, 
  X,
  FileCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export function Navbar({
  activeDataset,
  onOpenUpload,
  onLoadSampleAC,
  onLoadSampleDC,
  onOpenThresholds,
  onExportReport,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed
}) {
  return (
    <header className="master-navbar">
      <div className="navbar-left">
        <button 
          className="btn-icon mobile-toggle"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          title="Toggle Navigation Menu"
          aria-label="Toggle navigation"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="navbar-brand">
          <div className="brand-logo-icon">
            <Cpu size={20} />
          </div>
          <div className="brand-text-block">
            <div className="brand-title-row">
              <span className="brand-name">MASTER</span>
              <span className="brand-tag">RP2040</span>
            </div>
            <span className="brand-subtitle">Diagnostic Dashboard</span>
          </div>
        </div>
      </div>

      <div className="navbar-center">
        {activeDataset ? (
          <div className="active-dataset-pill">
            <span className={`status-dot ${activeDataset.type === 'AC' ? 'dot-ac' : 'dot-dc'}`}></span>
            <span className="dataset-filename">{activeDataset.fileName}</span>
            <span className="dataset-badge">{activeDataset.type}</span>
            <span className="dataset-records">
              {activeDataset.recordCount.toLocaleString()} pts
            </span>
          </div>
        ) : (
          <div className="no-dataset-pill">
            <span className="status-dot dot-idle"></span>
            <span>No Active Dataset — Upload CSV or Load Demo</span>
          </div>
        )}
      </div>

      <div className="navbar-right">
        {/* Sample Data Quick Buttons */}
        <div className="sample-btn-group">
          <button 
            className="btn btn-sm btn-secondary" 
            onClick={onLoadSampleAC}
            title="Load built-in 1,500-point AC measurement dataset"
          >
            <Zap size={14} className="text-primary" />
            <span>Sample AC</span>
          </button>
          <button 
            className="btn btn-sm btn-secondary" 
            onClick={onLoadSampleDC}
            title="Load built-in 1,500-point DC solar/battery measurement dataset"
          >
            <BatteryCharging size={14} className="text-cyan" />
            <span>Sample DC</span>
          </button>
        </div>

        {/* Upload Button */}
        <button 
          className="btn btn-sm btn-primary"
          onClick={onOpenUpload}
          title="Upload MASTER MicroSD CSV Data"
        >
          <Upload size={14} />
          <span>Upload CSV</span>
        </button>

        {/* Threshold Settings */}
        <button 
          className="btn-icon btn-secondary"
          onClick={onOpenThresholds}
          title="Configure Alert Thresholds"
          aria-label="Threshold Settings"
        >
          <Sliders size={16} />
        </button>

        {/* Export Report */}
        {activeDataset && (
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={onExportReport}
            title="Export PDF Diagnostic Summary Report"
          >
            <FileText size={14} />
            <span className="hide-mobile">Report PDF</span>
          </button>
        )}
      </div>

      <style>{`
        .master-navbar {
          height: var(--navbar-height);
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-light);
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow-sm);
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-logo-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);
        }

        .brand-text-block {
          display: flex;
          flex-direction: column;
        }

        .brand-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .brand-name {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 0.04em;
          color: var(--text-primary);
        }

        .brand-tag {
          background: #eff6ff;
          color: #2563eb;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 4px;
          border: 1px solid #bfdbfe;
        }

        .brand-subtitle {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .navbar-center {
          display: flex;
          align-items: center;
        }

        .active-dataset-pill, .no-dataset-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-subtle);
          border: 1px solid var(--border-light);
          padding: 5px 12px;
          border-radius: var(--radius-full);
          font-size: 12.5px;
          color: var(--text-secondary);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot-ac {
          background-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        .dot-dc {
          background-color: #0891b2;
          box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.2);
        }

        .dot-idle {
          background-color: #94a3b8;
        }

        .dataset-filename {
          font-weight: 600;
          color: var(--text-primary);
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dataset-badge {
          background: #dbeafe;
          color: #1e40af;
          font-weight: 700;
          font-size: 10.5px;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .dataset-records {
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sample-btn-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-icon {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1px solid var(--border-light);
          background: var(--bg-surface);
          color: var(--text-secondary);
          transition: all 0.15s ease;
        }

        .btn-icon:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }

        .text-primary { color: #2563eb; }
        .text-cyan { color: #0891b2; }

        .mobile-toggle {
          display: none;
        }

        @media (max-width: 992px) {
          .navbar-center {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .master-navbar {
            padding: 0 16px;
          }
          .mobile-toggle {
            display: inline-flex;
          }
          .sample-btn-group {
            display: none;
          }
          .hide-mobile {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
