import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  BatteryCharging, 
  FileText,
  Clock,
  Database,
  ArrowRight,
  Info
} from 'lucide-react';
import { parseCSVData } from '../utils/csvParser.js';

export function FileUploader({
  onDatasetLoaded,
  onLoadSampleAC,
  onLoadSampleDC,
  activeDataset
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadType, setUploadType] = useState('AUTO'); // 'AUTO' | 'AC' | 'DC'
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [recentUploadInfo, setRecentUploadInfo] = useState(null);

  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    setIsProcessing(true);
    setUploadError(null);

    try {
      const text = await file.text();
      const parsed = await parseCSVData(text, file.name, uploadType);
      
      setRecentUploadInfo({
        fileName: file.name,
        type: parsed.type,
        recordCount: parsed.recordCount,
        timeRange: `${parsed.timeRange.startTime} – ${parsed.timeRange.endTime}`,
        duration: parsed.timeRange.durationFormatted,
        warnings: parsed.warnings
      });

      onDatasetLoaded(parsed);
    } catch (err) {
      setUploadError(err.message || 'An error occurred while parsing the CSV file.');
      setRecentUploadInfo(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="file-uploader-container">
      {/* Upload Type Switcher */}
      <div className="upload-type-selector">
        <span className="type-label">Measurement Mode:</span>
        <div className="type-toggle-group">
          <button 
            type="button"
            className={`type-btn ${uploadType === 'AUTO' ? 'active' : ''}`}
            onClick={() => setUploadType('AUTO')}
          >
            Auto Detect
          </button>
          <button 
            type="button"
            className={`type-btn ${uploadType === 'AC' ? 'active' : ''}`}
            onClick={() => setUploadType('AC')}
          >
            <Zap size={13} className="text-primary" />
            AC Data
          </button>
          <button 
            type="button"
            className={`type-btn ${uploadType === 'DC' ? 'active' : ''}`}
            onClick={() => setUploadType('DC')}
          >
            <BatteryCharging size={13} className="text-cyan" />
            DC Data
          </button>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div 
        className={`dropzone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".csv,text/csv" 
          style={{ display: 'none' }} 
        />

        <div className="dropzone-content">
          <div className="dropzone-icon-circle">
            <UploadCloud size={32} className="text-primary" />
          </div>

          <h3 className="dropzone-title">Upload MASTER Measurement Data</h3>
          <p className="dropzone-subtitle">
            Drag & drop your MicroSD measurement CSV file here, or <span className="browse-link">Browse Files</span>
          </p>

          <div className="dropzone-hints">
            <span className="hint-pill">Supported format: .CSV</span>
            <span className="hint-pill">From MASTER MicroSD Data Logger</span>
          </div>

          {isProcessing && (
            <div className="processing-indicator">
              <span className="spinner"></span>
              <span>Parsing timestamps, parameters & statistical indices...</span>
            </div>
          )}
        </div>
      </div>

      {/* Demo Sample Quick Access */}
      <div className="sample-loader-box">
        <div className="sample-loader-text">
          <Info size={16} className="text-muted" />
          <span>Don't have a MicroSD CSV on hand? Load built-in realistic test logs:</span>
        </div>
        <div className="sample-loader-actions">
          <button 
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={onLoadSampleAC}
          >
            <Zap size={14} />
            <span>Load Sample AC (1,500 pts)</span>
          </button>
          <button 
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={onLoadSampleDC}
          >
            <BatteryCharging size={14} />
            <span>Load Sample DC (1,500 pts)</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {uploadError && (
        <div className="upload-alert alert-error animate-fade-in">
          <AlertTriangle size={18} className="alert-icon" />
          <div className="alert-body">
            <strong>Unable to parse CSV file:</strong>
            <p>{uploadError}</p>
            <span className="alert-sub">Ensure your CSV contains a timestamp column and numerical parameter fields.</span>
          </div>
        </div>
      )}

      {/* Upload Success Summary Card */}
      {recentUploadInfo && !uploadError && (
        <div className="upload-success-card animate-fade-in">
          <div className="success-header">
            <div className="success-badge-group">
              <CheckCircle2 size={18} className="text-success" />
              <span className="success-title">✓ Successfully Loaded & Classified</span>
            </div>
            <span className={`badge ${recentUploadInfo.type === 'AC' ? 'badge-ac' : 'badge-dc'}`}>
              {recentUploadInfo.type} Measurement
            </span>
          </div>

          <div className="success-grid">
            <div className="success-item">
              <span className="item-label">File Name</span>
              <span className="item-value mono">{recentUploadInfo.fileName}</span>
            </div>
            <div className="success-item">
              <span className="item-label">Signal Type</span>
              <span className="item-value">{recentUploadInfo.type} Power Profile</span>
            </div>
            <div className="success-item">
              <span className="item-label">Total Records</span>
              <span className="item-value mono">{recentUploadInfo.recordCount.toLocaleString()} samples</span>
            </div>
            <div className="success-item">
              <span className="item-label">Time Range</span>
              <span className="item-value mono">{recentUploadInfo.timeRange} ({recentUploadInfo.duration})</span>
            </div>
          </div>

          {recentUploadInfo.warnings && recentUploadInfo.warnings.length > 0 && (
            <div className="validation-warnings-box">
              <span className="warn-title"><AlertTriangle size={13} /> Data Validation Notes:</span>
              <ul className="warn-list">
                {recentUploadInfo.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <style>{`
        .file-uploader-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .upload-type-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .type-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .type-toggle-group {
          display: inline-flex;
          background: var(--bg-subtle);
          padding: 3px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
        }

        .type-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border: none;
          background: transparent;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .type-btn:hover {
          color: var(--text-primary);
        }

        .type-btn.active {
          background: var(--bg-surface);
          color: var(--primary);
          font-weight: 600;
          box-shadow: var(--shadow-sm);
        }

        .dropzone {
          border: 2px dashed var(--border-light);
          border-radius: var(--radius-xl);
          background: var(--bg-surface);
          padding: 40px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dropzone:hover {
          border-color: var(--primary);
          background: #f8fbff;
        }

        .dropzone.dragging {
          border-color: var(--primary);
          background: var(--primary-light);
          transform: scale(1.005);
        }

        .dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .dropzone-icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .dropzone-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .dropzone-subtitle {
          font-size: 13.5px;
          color: var(--text-secondary);
          max-width: 480px;
        }

        .browse-link {
          color: var(--primary);
          font-weight: 600;
          text-decoration: underline;
        }

        .dropzone-hints {
          display: flex;
          gap: 8px;
          margin-top: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .hint-pill {
          font-size: 11px;
          font-weight: 500;
          background: var(--bg-subtle);
          color: var(--text-muted);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }

        .processing-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--primary);
          font-weight: 500;
          margin-top: 10px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #bfdbfe;
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .sample-loader-box {
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .sample-loader-text {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .sample-loader-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .upload-alert {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-radius: var(--radius-md);
        }

        .alert-error {
          background: var(--danger-light);
          border: 1px solid var(--danger-border);
          color: var(--danger);
        }

        .alert-body p {
          font-size: 13px;
          margin: 2px 0 4px;
        }

        .alert-sub {
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .upload-success-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          border-left: 4px solid var(--success);
          border-radius: var(--radius-lg);
          padding: 18px 20px;
          box-shadow: var(--shadow-sm);
        }

        .success-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .success-badge-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .success-title {
          font-weight: 700;
          font-size: 14.5px;
          color: var(--text-primary);
        }

        .success-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .success-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .item-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .item-value {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .item-value.mono {
          font-family: var(--font-mono);
        }

        .validation-warnings-box {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid var(--border-subtle);
          font-size: 12px;
          color: var(--warning);
        }

        .warn-title {
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .warn-list {
          padding-left: 18px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
