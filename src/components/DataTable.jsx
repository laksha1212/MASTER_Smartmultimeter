import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { PARAMETER_META } from '../utils/dataDetector.js';

export function DataTable({
  cleanData = [],
  detectedParameters = [],
  datasetType = 'AC',
  fileName = 'dataset.csv'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('_index');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const init = { timestampStr: true };
    detectedParameters.forEach(p => { init[p] = true; });
    return init;
  });
  const [showColPicker, setShowColPicker] = useState(false);

  // Column definitions
  const columns = useMemo(() => {
    const list = [
      { key: '_index', label: '#', isNumeric: true },
      { key: 'timestampStr', label: 'Timestamp', isNumeric: false }
    ];

    detectedParameters.forEach(param => {
      const meta = PARAMETER_META[param] || { label: param, unit: '' };
      const label = datasetType === 'AC' ? (meta.acLabel || meta.label) : (meta.dcLabel || meta.label);
      list.push({
        key: param,
        label: `${label} ${meta.unit ? `(${meta.unit})` : ''}`,
        unit: meta.unit,
        isNumeric: true
      });
    });

    return list;
  }, [detectedParameters, datasetType]);

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return cleanData;
    const term = searchTerm.toLowerCase();

    return cleanData.filter(row => {
      if (row.timestampStr && row.timestampStr.toLowerCase().includes(term)) return true;
      for (const param of detectedParameters) {
        if (row[param] !== undefined && String(row[param]).toLowerCase().includes(term)) {
          return true;
        }
      }
      return false;
    });
  }, [cleanData, searchTerm, detectedParameters]);

  // Sorting
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [filteredData, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortField === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const exportCols = columns.filter(c => c.key === '_index' || visibleColumns[c.key]);
    const headers = exportCols.map(c => c.label);
    const rows = sortedData.map(r => exportCols.map(c => r[c.key] !== undefined ? r[c.key] : ''));

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MASTER_Filtered_Data_${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="master-card data-table-card">
      {/* Table Toolbar */}
      <div className="table-toolbar">
        <div className="toolbar-left">
          <div className="table-search-wrap">
            <Search size={15} className="search-icon" />
            <input 
              type="text" 
              className="table-search-input"
              placeholder="Search timestamp or value..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <span className="results-count">
            Showing <strong>{filteredData.length.toLocaleString()}</strong> of {cleanData.length.toLocaleString()} records
          </span>
        </div>

        <div className="toolbar-right">
          {/* Column Visibility Toggle */}
          <div className="col-picker-container">
            <button 
              type="button" 
              className={`btn btn-sm btn-secondary ${showColPicker ? 'active' : ''}`}
              onClick={() => setShowColPicker(!showColPicker)}
            >
              <SlidersHorizontal size={14} />
              <span>Columns</span>
            </button>

            {showColPicker && (
              <div className="col-picker-dropdown">
                <span className="col-dropdown-title">Toggle Columns</span>
                {columns.filter(c => c.key !== '_index').map(col => (
                  <label key={col.key} className="col-dropdown-item">
                    <input 
                      type="checkbox" 
                      checked={visibleColumns[col.key] ?? true}
                      onChange={() => toggleColumn(col.key)} 
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button 
            type="button" 
            className="btn btn-sm btn-secondary"
            onClick={handleExportCSV}
            title="Export filtered records as CSV"
          >
            <Download size={14} />
            <span>Export Filtered CSV</span>
          </button>
        </div>
      </div>

      {/* Table Responsive Container */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => {
                if (col.key !== '_index' && !visibleColumns[col.key]) return null;

                const isSorted = sortField === col.key;
                return (
                  <th 
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="sortable-th"
                    title={`Click to sort by ${col.label}`}
                  >
                    <div className="th-content">
                      <span>{col.label}</span>
                      <span className="sort-icon-wrap">
                        {isSorted ? (
                          sortDirection === 'asc' ? <ArrowUp size={13} className="text-primary" /> : <ArrowDown size={13} className="text-primary" />
                        ) : (
                          <ArrowUpDown size={12} className="text-muted" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No matching measurement records found for query "{searchTerm}".
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row._index || idx}>
                  {columns.map(col => {
                    if (col.key !== '_index' && !visibleColumns[col.key]) return null;
                    const val = row[col.key];

                    if (col.key === '_index') {
                      return <td key={col.key} className="mono text-muted">{val}</td>;
                    }

                    if (col.key === 'timestampStr') {
                      return <td key={col.key} className="mono" style={{ fontWeight: 600 }}>{val}</td>;
                    }

                    return (
                      <td key={col.key} className="mono">
                        {val !== null && val !== undefined ? (
                          typeof val === 'number' ? (
                            col.key === 'powerFactor' ? val.toFixed(3) : val.toFixed(2)
                          ) : val
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="table-pagination">
        <div className="pagination-left">
          <span className="pagination-label">Rows per page:</span>
          <select 
            className="pagination-select"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="pagination-right">
          <span className="page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <div className="pagination-btn-group">
            <button 
              type="button" 
              className="pagination-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              type="button" 
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .table-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .table-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .table-search-input {
          padding: 6px 12px 6px 32px;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          font-size: 13px;
          width: 240px;
          background: var(--bg-surface);
          color: var(--text-primary);
        }

        .table-search-input:focus {
          outline: none;
          border-color: var(--border-focus);
        }

        .results-count {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .col-picker-container {
          position: relative;
        }

        .col-picker-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 6px;
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-md);
          border-radius: var(--radius-md);
          padding: 10px;
          z-index: 50;
          width: 220px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .col-dropdown-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .col-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-primary);
          cursor: pointer;
        }

        .sortable-th {
          cursor: pointer;
          user-select: none;
          transition: background 0.15s ease;
        }

        .sortable-th:hover {
          background: #e2e8f0;
        }

        .th-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .sort-icon-wrap {
          display: inline-flex;
          align-items: center;
        }

        .table-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          margin-top: 10px;
          border-top: 1px solid var(--border-subtle);
          font-size: 12.5px;
          color: var(--text-secondary);
          flex-wrap: wrap;
          gap: 10px;
        }

        .pagination-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pagination-select {
          padding: 4px 8px;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          background: var(--bg-surface);
          font-size: 12px;
          color: var(--text-primary);
        }

        .pagination-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pagination-btn-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pagination-btn {
          width: 28px;
          height: 28px;
          border: 1px solid var(--border-light);
          background: var(--bg-surface);
          border-radius: var(--radius-sm);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.15s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
