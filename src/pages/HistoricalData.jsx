import React, { useState } from 'react';
import { 
  Database, 
  Play, 
  Download, 
  Trash2, 
  Edit2, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Zap, 
  BatteryCharging,
  AlertCircle
} from 'lucide-react';
import { PARAMETER_META } from '../utils/dataDetector.js';

export function HistoricalData({
  historyDatasets = [],
  activeDataset,
  onSelectDataset,
  onDeleteDataset,
  onRenameDataset,
  onClearAllDatasets,
  onOpenUpload
}) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const startRename = (ds) => {
    setEditingId(ds.id);
    setEditName(ds.fileName);
  };

  const saveRename = (id) => {
    if (editName.trim()) {
      onRenameDataset(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleDownloadCSV = (ds) => {
    const headers = ['Timestamp', ...ds.detectedParameters.map(p => PARAMETER_META[p]?.label || p)];
    const rows = ds.cleanData.map(r => [
      r.timestampStr,
      ...ds.detectedParameters.map(p => r[p] !== undefined && r[p] !== null ? r[p] : '')
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = ds.fileName.endsWith('.csv') ? ds.fileName : `${ds.fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Database size={22} className="text-primary" />
            Historical Datasets
            <span className="badge badge-neutral">{historyDatasets.length} Stored in Browser (IndexedDB)</span>
          </h1>
          <p>
            Manage and switch between previous MicroSD measurement logs stored locally in persistent browser memory
          </p>
        </div>

        <div className="page-actions">
          {historyDatasets.length > 0 && (
            <button 
              type="button" 
              className="btn btn-danger btn-sm"
              onClick={onClearAllDatasets}
              title="Delete all stored datasets from browser memory"
            >
              <Trash2 size={14} />
              <span>Clear All History</span>
            </button>
          )}
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={onOpenUpload}
          >
            <UploadCloud size={14} />
            <span>Upload New CSV</span>
          </button>
        </div>
      </div>

      {/* History Table Card */}
      <div className="master-card">
        {historyDatasets.length === 0 ? (
          <div className="empty-history-state">
            <Database size={36} className="text-muted" />
            <h3>No Historical Datasets Stored</h3>
            <p>Upload a CSV file or load sample datasets to store records in persistent browser memory.</p>
            <button className="btn btn-primary" onClick={onOpenUpload} style={{ marginTop: 12 }}>
              <UploadCloud size={14} />
              <span>Upload Measurement Data</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Signal Type</th>
                  <th>Total Records</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Logged Duration</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyDatasets.map((ds) => {
                  const isActive = activeDataset?.id === ds.id;
                  const isEditing = editingId === ds.id;

                  return (
                    <tr key={ds.id} className={isActive ? 'active-dataset-row' : ''}>
                      <td>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input 
                              type="text" 
                              className="form-input" 
                              style={{ padding: '3px 8px', fontSize: 12 }}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') saveRename(ds.id); }}
                              autoFocus
                            />
                            <button className="btn btn-sm btn-primary" onClick={() => saveRename(ds.id)}>Save</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {ds.fileName}
                            </span>
                            <button 
                              type="button" 
                              className="btn-link-icon" 
                              onClick={() => startRename(ds)}
                              title="Rename dataset"
                            >
                              <Edit2 size={12} />
                            </button>
                          </div>
                        )}
                      </td>

                      <td>
                        <span className={`badge ${ds.type === 'AC' ? 'badge-ac' : 'badge-dc'}`}>
                          {ds.type === 'AC' ? <Zap size={10} /> : <BatteryCharging size={10} />}
                          {ds.type}
                        </span>
                      </td>

                      <td className="mono">{ds.recordCount.toLocaleString()}</td>
                      <td className="mono">{ds.timeRange.startTime}</td>
                      <td className="mono">{ds.timeRange.endTime}</td>
                      <td className="mono">{ds.timeRange.durationFormatted}</td>

                      <td>
                        {isActive ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={11} /> Active
                          </span>
                        ) : (
                          <span className="badge badge-neutral">Loaded</span>
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button 
                            type="button"
                            className={`btn btn-sm ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => onSelectDataset(ds)}
                            title="Open and analyze this dataset"
                          >
                            <Play size={12} />
                            <span>{isActive ? 'Analyzing' : 'Open & Analyze'}</span>
                          </button>

                          <button 
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleDownloadCSV(ds)}
                            title="Download original CSV"
                          >
                            <Download size={12} />
                          </button>

                          <button 
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => onDeleteDataset(ds.id)}
                            title="Delete dataset"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .empty-history-state {
          padding: 48px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .empty-history-state h3 {
          font-size: 17px;
          color: var(--text-primary);
        }

        .empty-history-state p {
          color: var(--text-muted);
          font-size: 13px;
          max-width: 420px;
        }

        .active-dataset-row td {
          background-color: #f0fdf4 !important;
        }

        .btn-link-icon {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          padding: 2px;
        }

        .btn-link-icon:hover {
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
