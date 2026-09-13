import React, { useState } from 'react';
import { Sliders, X, Check, RotateCcw, AlertTriangle } from 'lucide-react';

export const DEFAULT_THRESHOLDS = {
  acVoltageMin: 220,
  acVoltageMax: 240,
  acFreqMin: 49.5,
  acFreqMax: 50.5,
  acPfWarning: 0.85,
  dcVoltageMin: 11.0,
  dcVoltageMax: 14.5,
  dcCurrentMax: 5.0
};

export function ThresholdModal({
  isOpen,
  onClose,
  currentThresholds = DEFAULT_THRESHOLDS,
  onSaveThresholds
}) {
  const [formData, setFormData] = useState({ ...DEFAULT_THRESHOLDS, ...currentThresholds });

  if (!isOpen) return null;

  const handleChange = (key, val) => {
    setFormData(prev => ({
      ...prev,
      [key]: parseFloat(val) || 0
    }));
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_THRESHOLDS });
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveThresholds(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={18} className="text-primary" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Diagnostic Thresholds & Alert Limits</h3>
          </div>
          <button className="btn-icon" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 18 }}>
              Configure operating limits used for classifying measurements into Normal, Warning, and Critical states.
            </p>

            {/* AC Limits Section */}
            <div className="threshold-section">
              <h4 className="section-title">Single-Phase AC Operating Limits</h4>
              
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">AC Voltage Min (V)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    className="form-input" 
                    value={formData.acVoltageMin} 
                    onChange={(e) => handleChange('acVoltageMin', e.target.value)} 
                  />
                  <span className="field-hint">Standard nominal: 220 V</span>
                </div>

                <div className="form-group">
                  <label className="form-label">AC Voltage Max (V)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    className="form-input" 
                    value={formData.acVoltageMax} 
                    onChange={(e) => handleChange('acVoltageMax', e.target.value)} 
                  />
                  <span className="field-hint">Standard nominal: 240 V</span>
                </div>

                <div className="form-group">
                  <label className="form-label">AC Frequency Min (Hz)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    value={formData.acFreqMin} 
                    onChange={(e) => handleChange('acFreqMin', e.target.value)} 
                  />
                  <span className="field-hint">Standard: 49.5 Hz</span>
                </div>

                <div className="form-group">
                  <label className="form-label">AC Frequency Max (Hz)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    value={formData.acFreqMax} 
                    onChange={(e) => handleChange('acFreqMax', e.target.value)} 
                  />
                  <span className="field-hint">Standard: 50.5 Hz</span>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Power Factor Warning Threshold (cos φ)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0.5" 
                    max="1.0" 
                    className="form-input" 
                    value={formData.acPfWarning} 
                    onChange={(e) => handleChange('acPfWarning', e.target.value)} 
                  />
                  <span className="field-hint">Triggers warning below this value (Default: 0.85)</span>
                </div>
              </div>
            </div>

            {/* DC Limits Section */}
            <div className="threshold-section" style={{ marginTop: 20 }}>
              <h4 className="section-title">DC Sensing Limits (12V Base)</h4>
              
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">DC Voltage Min (V)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    value={formData.dcVoltageMin} 
                    onChange={(e) => handleChange('dcVoltageMin', e.target.value)} 
                  />
                  <span className="field-hint">Cutoff warning: 11.0 V</span>
                </div>

                <div className="form-group">
                  <label className="form-label">DC Voltage Max (V)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    value={formData.dcVoltageMax} 
                    onChange={(e) => handleChange('dcVoltageMax', e.target.value)} 
                  />
                  <span className="field-hint">Overvoltage: 14.5 V</span>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">DC Current Max Limit (A)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    value={formData.dcCurrentMax} 
                    onChange={(e) => handleChange('dcCurrentMax', e.target.value)} 
                  />
                  <span className="field-hint">INA219 sensor max trip current</span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              <RotateCcw size={14} />
              <span>Defaults</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={14} />
              <span>Save & Recalculate</span>
            </button>
          </div>
        </form>

        <style>{`
          .threshold-section {
            background: var(--bg-subtle);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-md);
            padding: 16px;
          }

          .section-title {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 12px;
          }

          .form-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          @media (max-width: 500px) {
            .form-grid-2 {
              grid-template-columns: 1fr;
            }
          }

          .field-hint {
            font-size: 11px;
            color: var(--text-muted);
            margin-top: 3px;
            display: block;
          }
        `}</style>
      </div>
    </div>
  );
}
