import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { ThresholdModal, DEFAULT_THRESHOLDS } from './components/ThresholdModal.jsx';
import { ExportReportModal } from './components/ExportReportModal.jsx';

import { Dashboard } from './pages/Dashboard.jsx';
import { ACAnalysis } from './pages/ACAnalysis.jsx';
import { DCAnalysis } from './pages/DCAnalysis.jsx';
import { UploadPage } from './pages/UploadPage.jsx';
import { HistoricalData } from './pages/HistoricalData.jsx';
import { Analytics } from './pages/Analytics.jsx';
import { About } from './pages/About.jsx';

import { parseCSVData } from './utils/csvParser.js';
import { generateSampleACData, generateSampleDCData } from './utils/sampleDataGenerator.js';
import { 
  saveDatasetToStorage, 
  getAllStoredDatasets, 
  deleteDatasetFromStorage, 
  clearAllStoredDatasets, 
  getUserPreferences, 
  saveUserPreferences 
} from './utils/storage.js';

export function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [activeDataset, setActiveDataset] = useState(null);
  const [historyDatasets, setHistoryDatasets] = useState([]);
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  
  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Initial load from storage
  useEffect(() => {
    async function loadInitialData() {
      try {
        const stored = await getAllStoredDatasets();
        if (stored && stored.length > 0) {
          setHistoryDatasets(stored);
          // Set latest dataset as active by default
          setActiveDataset(stored[0]);
        } else {
          // If completely fresh session, auto-load Sample AC for instant wow demonstration
          const sampleAC = generateSampleACData(1200);
          const parsed = await parseCSVData(sampleAC, 'MASTER_AC_001.csv', 'AC');
          await saveDatasetToStorage(parsed);
          setHistoryDatasets([parsed]);
          setActiveDataset(parsed);
        }

        const savedPrefs = getUserPreferences();
        if (savedPrefs?.thresholds) {
          setThresholds(savedPrefs.thresholds);
        }
      } catch (err) {
        console.warn('Could not load stored datasets:', err);
      }
    }

    loadInitialData();
  }, []);

  // Handle newly uploaded / parsed dataset
  const handleDatasetLoaded = async (newDataset) => {
    setActiveDataset(newDataset);
    
    // Save to IndexedDB
    try {
      await saveDatasetToStorage(newDataset);
      const all = await getAllStoredDatasets();
      setHistoryDatasets(all);
      showToast(`Loaded ${newDataset.fileName} (${newDataset.type} • ${newDataset.recordCount.toLocaleString()} pts)`, 'success');
    } catch (e) {
      console.warn('Error saving to storage:', e);
    }

    // Auto navigate to relevant page if on upload page
    if (activePage === 'upload') {
      setActivePage(newDataset.type === 'AC' ? 'ac-analysis' : 'dc-analysis');
    }
  };

  // Load Built-in Sample AC
  const handleLoadSampleAC = async () => {
    try {
      const csv = generateSampleACData(1500);
      const parsed = await parseCSVData(csv, 'MASTER_AC_DEMO_2026.csv', 'AC', thresholds);
      await handleDatasetLoaded(parsed);
      setActivePage('ac-analysis');
    } catch (err) {
      showToast(`Failed to load Sample AC: ${err.message}`, 'error');
    }
  };

  // Load Built-in Sample DC
  const handleLoadSampleDC = async () => {
    try {
      const csv = generateSampleDCData(1500);
      const parsed = await parseCSVData(csv, 'MASTER_DC_SOLAR_DEMO.csv', 'DC', thresholds);
      await handleDatasetLoaded(parsed);
      setActivePage('dc-analysis');
    } catch (err) {
      showToast(`Failed to load Sample DC: ${err.message}`, 'error');
    }
  };

  // Switch active dataset from history
  const handleSelectHistoryDataset = (ds) => {
    setActiveDataset(ds);
    showToast(`Switched active dataset to ${ds.fileName}`, 'info');
    setActivePage(ds.type === 'AC' ? 'ac-analysis' : 'dc-analysis');
  };

  // Delete dataset
  const handleDeleteDataset = async (id) => {
    try {
      await deleteDatasetFromStorage(id);
      const all = await getAllStoredDatasets();
      setHistoryDatasets(all);

      if (activeDataset?.id === id) {
        setActiveDataset(all.length > 0 ? all[0] : null);
      }
      showToast('Dataset deleted from local storage', 'info');
    } catch (err) {
      showToast(`Could not delete dataset: ${err.message}`, 'error');
    }
  };

  // Rename dataset
  const handleRenameDataset = async (id, newName) => {
    try {
      const ds = historyDatasets.find(d => d.id === id);
      if (ds) {
        ds.fileName = newName;
        await saveDatasetToStorage(ds);
        const all = await getAllStoredDatasets();
        setHistoryDatasets(all);
        if (activeDataset?.id === id) {
          setActiveDataset({ ...ds, fileName: newName });
        }
        showToast('Dataset renamed', 'success');
      }
    } catch (err) {
      showToast(`Rename failed: ${err.message}`, 'error');
    }
  };

  // Clear all datasets
  const handleClearAllDatasets = async () => {
    if (window.confirm('Are you sure you want to clear all stored measurement datasets from browser memory?')) {
      await clearAllStoredDatasets();
      setHistoryDatasets([]);
      setActiveDataset(null);
      showToast('All stored historical datasets cleared', 'info');
    }
  };

  // Save new thresholds & recalculate
  const handleSaveThresholds = (newThresholds) => {
    setThresholds(newThresholds);
    saveUserPreferences({ thresholds: newThresholds });

    // Recalculate conditions on active dataset
    if (activeDataset) {
      parseCSVData(
        activeDataset.cleanData.map(r => r).toString(), 
        activeDataset.fileName, 
        activeDataset.type, 
        newThresholds
      ).catch(() => {});
    }

    showToast('Alert thresholds updated & saved', 'success');
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        activePage={activePage}
        setActivePage={setActivePage}
        activeDataset={activeDataset}
        historyCount={historyDatasets.length}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Navbar 
          activeDataset={activeDataset}
          onOpenUpload={() => setActivePage('upload')}
          onLoadSampleAC={handleLoadSampleAC}
          onLoadSampleDC={handleLoadSampleDC}
          onOpenThresholds={() => setThresholdModalOpen(true)}
          onExportReport={() => setExportModalOpen(true)}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        <main className="content-outlet">
          {activePage === 'dashboard' && (
            <Dashboard 
              dataset={activeDataset}
              onOpenUpload={() => setActivePage('upload')}
              onLoadSampleAC={handleLoadSampleAC}
              onLoadSampleDC={handleLoadSampleDC}
              onNavigatePage={setActivePage}
              thresholds={thresholds}
            />
          )}

          {activePage === 'ac-analysis' && (
            <ACAnalysis 
              dataset={activeDataset?.type === 'AC' ? activeDataset : null}
              onOpenUpload={() => setActivePage('upload')}
              onLoadSampleAC={handleLoadSampleAC}
              thresholds={thresholds}
            />
          )}

          {activePage === 'dc-analysis' && (
            <DCAnalysis 
              dataset={activeDataset?.type === 'DC' ? activeDataset : null}
              onOpenUpload={() => setActivePage('upload')}
              onLoadSampleDC={handleLoadSampleDC}
              thresholds={thresholds}
            />
          )}

          {activePage === 'upload' && (
            <UploadPage 
              onDatasetLoaded={handleDatasetLoaded}
              onLoadSampleAC={handleLoadSampleAC}
              onLoadSampleDC={handleLoadSampleDC}
              activeDataset={activeDataset}
              onNavigatePage={setActivePage}
            />
          )}

          {activePage === 'history' && (
            <HistoricalData 
              historyDatasets={historyDatasets}
              activeDataset={activeDataset}
              onSelectDataset={handleSelectHistoryDataset}
              onDeleteDataset={handleDeleteDataset}
              onRenameDataset={handleRenameDataset}
              onClearAllDatasets={handleClearAllDatasets}
              onOpenUpload={() => setActivePage('upload')}
            />
          )}

          {activePage === 'analytics' && (
            <Analytics 
              dataset={activeDataset}
              onOpenUpload={() => setActivePage('upload')}
              onLoadSampleAC={handleLoadSampleAC}
              onOpenThresholds={() => setThresholdModalOpen(true)}
              thresholds={thresholds}
            />
          )}

          {activePage === 'about' && (
            <About />
          )}
        </main>
      </div>

      {/* Threshold Modal */}
      <ThresholdModal 
        isOpen={thresholdModalOpen}
        onClose={() => setThresholdModalOpen(false)}
        currentThresholds={thresholds}
        onSaveThresholds={handleSaveThresholds}
      />

      {/* Export Report Modal */}
      <ExportReportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        dataset={activeDataset}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`toast-notification toast-${toastMessage.type} animate-fade-in`}>
          <span>{toastMessage.msg}</span>
        </div>
      )}

      <style>{`
        .toast-notification {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 12px 18px;
          background: var(--bg-surface);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          z-index: 99999;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toast-success {
          border-left: 4px solid var(--success);
        }

        .toast-error {
          border-left: 4px solid var(--danger);
          color: var(--danger);
        }

        .toast-info {
          border-left: 4px solid var(--primary);
        }

        .content-outlet {
          min-height: calc(100vh - var(--navbar-height));
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
