/**
 * storage.js
 * IndexedDB wrapper for storing uploaded datasets and user threshold preferences.
 * Includes graceful localStorage fallback.
 */

const DB_NAME = 'MASTER_Diagnostic_DB';
const DB_VERSION = 1;
const STORE_NAME = 'datasets';
const PREFS_KEY = 'master_dashboard_prefs';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDatasetToStorage(dataset) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataset);
      req.onsuccess = () => resolve(dataset);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // Fallback to localStorage (store condensed metadata if large)
    try {
      const existing = JSON.parse(localStorage.getItem('master_datasets') || '[]');
      const filtered = existing.filter(d => d.id !== dataset.id);
      filtered.unshift(dataset);
      localStorage.setItem('master_datasets', JSON.stringify(filtered.slice(0, 10)));
      return dataset;
    } catch (localErr) {
      console.warn('Storage fallback failed:', localErr);
      return dataset;
    }
  }
}

export async function getAllStoredDatasets() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    try {
      return JSON.parse(localStorage.getItem('master_datasets') || '[]');
    } catch (localErr) {
      return [];
    }
  }
}

export async function deleteDatasetFromStorage(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    try {
      const existing = JSON.parse(localStorage.getItem('master_datasets') || '[]');
      const filtered = existing.filter(d => d.id !== id);
      localStorage.setItem('master_datasets', JSON.stringify(filtered));
      return true;
    } catch (localErr) {
      return false;
    }
  }
}

export async function clearAllStoredDatasets() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    localStorage.removeItem('master_datasets');
    return true;
  }
}

export function saveUserPreferences(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Could not save user preferences', e);
  }
}

export function getUserPreferences() {
  try {
    const data = localStorage.getItem(PREFS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}
