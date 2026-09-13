import React, { useRef, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  Download, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Grid,
  Dot
} from 'lucide-react';
import { PARAMETER_META } from '../utils/dataDetector.js';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function TimeSeriesChart({
  data = [],
  paramKey = 'voltage',
  datasetType = 'AC',
  customTitle,
  customUnit,
  customColor,
  thresholds = {},
  height = 280,
  showThresholdLines = true
}) {
  const chartRef = useRef(null);
  const [zoomRange, setZoomRange] = useState({ start: 0, end: 100 });
  const [showGrid, setShowGrid] = useState(true);
  const [showPoints, setShowPoints] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const meta = PARAMETER_META[paramKey] || {
    label: customTitle || paramKey,
    unit: customUnit || '',
    acLabel: customTitle || paramKey,
    dcLabel: customTitle || paramKey,
    color: customColor || '#2563eb'
  };

  const title = customTitle || (datasetType === 'AC' ? (meta.acLabel || meta.label) : (meta.dcLabel || meta.label));
  const unit = customUnit !== undefined ? customUnit : meta.unit;
  const strokeColor = customColor || meta.color || '#2563eb';

  // Filter and downsample within zoom range
  const visibleData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const total = data.length;
    const startIdx = Math.floor((zoomRange.start / 100) * total);
    const endIdx = Math.min(total, Math.ceil((zoomRange.end / 100) * total));
    return data.slice(startIdx, endIdx);
  }, [data, zoomRange]);

  // ChartJS Data setup
  const chartData = useMemo(() => {
    const labels = visibleData.map(d => d.timestampStr || '');
    const values = visibleData.map(d => (d[paramKey] !== undefined && d[paramKey] !== null) ? d[paramKey] : null);

    return {
      labels,
      datasets: [
        {
          label: `${title} (${unit || '-'})`,
          data: values,
          borderColor: strokeColor,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return `${strokeColor}10`;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, `${strokeColor}33`); // 20% opacity
            gradient.addColorStop(1, `${strokeColor}03`); // 1% opacity
            return gradient;
          },
          borderWidth: 2,
          pointRadius: showPoints ? 3 : (visibleData.length <= 40 ? 3 : 0),
          pointHoverRadius: 5,
          pointBackgroundColor: strokeColor,
          tension: 0.25, // smooth curve
          fill: true
        }
      ]
    };
  }, [visibleData, paramKey, title, unit, strokeColor, showPoints]);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 300
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          titleColor: '#ffffff',
          bodyColor: '#f1f5f9',
          bodyFont: {
            family: "'JetBrains Mono', monospace",
            size: 12
          },
          padding: 10,
          cornerRadius: 6,
          displayColors: false,
          callbacks: {
            title: (items) => `Time: ${items[0]?.label || ''}`,
            label: (item) => {
              const val = item.raw;
              if (val === null || val === undefined) return 'No data';
              return `${title}: ${typeof val === 'number' ? val.toFixed(2) : val} ${unit}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: showGrid,
            color: '#f1f5f9'
          },
          ticks: {
            color: '#64748b',
            font: {
              family: "'JetBrains Mono', monospace",
              size: 10
            },
            maxTicksLimit: 8,
            maxRotation: 0
          }
        },
        y: {
          grid: {
            display: showGrid,
            color: '#e2e8f0'
          },
          ticks: {
            color: '#64748b',
            font: {
              family: "'JetBrains Mono', monospace",
              size: 10.5
            },
            callback: (val) => `${val} ${unit ? unit.substring(0, 3) : ''}`
          }
        }
      }
    };
  }, [showGrid, title, unit]);

  // Zoom Actions
  const handleZoomIn = () => {
    setZoomRange(prev => {
      const span = prev.end - prev.start;
      if (span <= 20) return prev;
      const delta = span * 0.2;
      return {
        start: Math.min(prev.start + delta / 2, 80),
        end: Math.max(prev.end - delta / 2, 20)
      };
    });
  };

  const handleZoomOut = () => {
    setZoomRange(prev => {
      const span = prev.end - prev.start;
      if (span >= 100) return { start: 0, end: 100 };
      const delta = span * 0.25;
      return {
        start: Math.max(0, prev.start - delta / 2),
        end: Math.min(100, prev.end + delta / 2)
      };
    });
  };

  const handleResetZoom = () => {
    setZoomRange({ start: 0, end: 100 });
  };

  // Download Chart PNG
  const handleDownloadPNG = () => {
    if (!chartRef.current) return;
    const url = chartRef.current.toBase64Image();
    const link = document.createElement('a');
    link.download = `MASTER_${paramKey}_timeseries.png`;
    link.href = url;
    link.click();
  };

  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <span className="card-header-title">{title} vs Time</span>
        </div>
        <div className="chart-empty-state" style={{ height }}>
          <span>No measurement data available for this parameter.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`chart-card ${isFullscreen ? 'chart-card-fullscreen' : ''}`}>
      <div className="chart-header">
        <div className="chart-title-group">
          <span className="card-header-title">
            <span className="color-indicator-dot" style={{ backgroundColor: strokeColor }}></span>
            {title} vs Time
          </span>
          <span className="chart-subtitle">
            {visibleData.length.toLocaleString()} points • {visibleData[0]?.timestampStr} – {visibleData[visibleData.length - 1]?.timestampStr}
          </span>
        </div>

        <div className="chart-controls">
          <button 
            type="button" 
            className="chart-btn" 
            onClick={handleZoomIn} 
            title="Zoom in on timeline"
          >
            <ZoomIn size={14} />
          </button>
          <button 
            type="button" 
            className="chart-btn" 
            onClick={handleZoomOut} 
            title="Zoom out on timeline"
          >
            <ZoomOut size={14} />
          </button>
          <button 
            type="button" 
            className="chart-btn" 
            onClick={handleResetZoom} 
            title="Reset zoom to 100%"
          >
            <RotateCcw size={14} />
          </button>
          <button 
            type="button" 
            className={`chart-btn ${showGrid ? 'active' : ''}`} 
            onClick={() => setShowGrid(!showGrid)} 
            title="Toggle grid lines"
          >
            <Grid size={14} />
          </button>
          <button 
            type="button" 
            className={`chart-btn ${showPoints ? 'active' : ''}`} 
            onClick={() => setShowPoints(!showPoints)} 
            title="Toggle point markers"
          >
            <Dot size={16} />
          </button>
          <button 
            type="button" 
            className="chart-btn" 
            onClick={handleDownloadPNG} 
            title="Download high-resolution chart image (PNG)"
          >
            <Download size={14} />
          </button>
          <button 
            type="button" 
            className="chart-btn" 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            title={isFullscreen ? 'Exit fullscreen' : 'Expand full screen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div className="chart-wrapper" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

      {/* Slider for smooth timeline navigation if zoomed */}
      {(zoomRange.start > 0 || zoomRange.end < 100) && (
        <div className="zoom-indicator-bar">
          <span>Viewing {zoomRange.start.toFixed(0)}% – {zoomRange.end.toFixed(0)}% of timeline</span>
          <button className="btn-link" onClick={handleResetZoom}>Reset Zoom</button>
        </div>
      )}

      <style>{`
        .chart-title-group {
          display: flex;
          flex-direction: column;
        }

        .color-indicator-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }

        .chart-subtitle {
          font-size: 11.5px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          margin-top: 2px;
        }

        .chart-controls {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .chart-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: var(--bg-surface);
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .chart-btn:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }

        .chart-btn.active {
          background: var(--primary-light);
          color: var(--primary);
          border-color: var(--primary-border);
        }

        .chart-wrapper {
          position: relative;
          width: 100%;
        }

        .chart-empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 13px;
        }

        .chart-card-fullscreen {
          position: fixed;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          z-index: 9999;
          box-shadow: var(--shadow-lg);
          border: 2px solid var(--primary);
          overflow: hidden;
        }

        .zoom-indicator-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          background: var(--bg-subtle);
          border-radius: var(--radius-sm);
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 8px;
        }

        .btn-link {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
