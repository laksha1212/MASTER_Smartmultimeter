/**
 * dataDetector.js
 * Intelligent classification of AC vs DC datasets and flexible column mapping.
 */

// Dictionary of known aliases mapped to standardized internal parameter names
export const PARAMETER_ALIASES = {
  timestamp: [
    'timestamp', 'time', 'date_time', 'datetime', 't', 'time_stamp', 
    'log_time', 'sample_time', 'record_time', 'clock'
  ],
  voltage: [
    'voltage', 'v', 'rms_voltage', 'v_rms', 'vrms', 'dc_voltage', 
    'vdc', 'volt', 'volts', 'v_in', 'vin', 'vbus', 'bus_voltage', 'pzem_voltage'
  ],
  current: [
    'current', 'i', 'rms_current', 'i_rms', 'irms', 'dc_current', 
    'idc', 'amp', 'amps', 'amperes', 'i_in', 'iin', 'load_current', 'pzem_current'
  ],
  power: [
    'power', 'p', 'active_power', 'p_active', 'p_w', 'watts', 
    'watt', 'activepower', 'pzem_power', 'load_power', 'dc_power'
  ],
  powerFactor: [
    'powerfactor', 'power_factor', 'pf', 'cos_phi', 'p_factor', 
    'cosphi', 'pzem_pf', 'power_fact'
  ],
  frequency: [
    'frequency', 'freq', 'hz', 'f', 'grid_frequency', 'pzem_frequency', 'grid_freq'
  ],
  energy: [
    'energy', 'wh', 'kwh', 'accumulated_energy', 'e', 'watt_hours', 
    'pzem_energy', 'total_energy', 'accum_wh'
  ],
  temperature: [
    'temperature', 'temp', 'temp_c', 'temp_deg_c', 'celsius'
  ],
  rpm: [
    'rpm', 'speed_rpm', 'rotations', 'hall_rpm'
  ],
  distance: [
    'distance', 'distance_mm', 'dist', 'tof_distance', 'range_mm'
  ]
};

// Parameter metadata including units, display labels, and defaults
export const PARAMETER_META = {
  voltage: { label: 'Voltage', unit: 'V', acLabel: 'RMS Voltage', dcLabel: 'DC Voltage', color: '#2563eb' },
  current: { label: 'Current', unit: 'A', acLabel: 'RMS Current', dcLabel: 'DC Current', color: '#0891b2' },
  power: { label: 'Active Power', unit: 'W', acLabel: 'Active Power', dcLabel: 'DC Power', color: '#7c3aed' },
  powerFactor: { label: 'Power Factor', unit: '', acLabel: 'Power Factor', dcLabel: 'Power Factor', color: '#ea580c' },
  frequency: { label: 'Frequency', unit: 'Hz', acLabel: 'Grid Frequency', dcLabel: 'Frequency', color: '#16a34a' },
  energy: { label: 'Energy', unit: 'Wh', acLabel: 'Accumulated Energy', dcLabel: 'Accumulated Energy', color: '#d97706' },
  temperature: { label: 'Temperature', unit: '°C', acLabel: 'Temperature', dcLabel: 'Temperature', color: '#dc2626' },
  rpm: { label: 'RPM', unit: 'RPM', acLabel: 'Rotation Speed', dcLabel: 'Rotation Speed', color: '#4f46e5' },
  distance: { label: 'Distance', unit: 'mm', acLabel: 'Distance (ToF)', dcLabel: 'Distance (ToF)', color: '#059669' }
};

/**
 * Normalizes a raw column header string to lower case alphanumeric format
 */
export function sanitizeHeader(header) {
  if (!header) return '';
  return header.toString().trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}

/**
 * Finds the standardized parameter key for a given raw CSV header
 */
export function mapHeaderToParameter(rawHeader) {
  const clean = sanitizeHeader(rawHeader);
  if (!clean) return '';

  // 1. Exact match check
  for (const [paramKey, aliases] of Object.entries(PARAMETER_ALIASES)) {
    for (const alias of aliases) {
      const cleanAlias = sanitizeHeader(alias);
      if (clean === cleanAlias) {
        return paramKey;
      }
    }
  }

  // 2. Substring check for aliases with length >= 3
  for (const [paramKey, aliases] of Object.entries(PARAMETER_ALIASES)) {
    for (const alias of aliases) {
      const cleanAlias = sanitizeHeader(alias);
      if (cleanAlias.length >= 3 && (clean.includes(cleanAlias) || cleanAlias.includes(clean))) {
        return paramKey;
      }
    }
  }

  // Return sanitized header if no standard alias matched
  return clean;
}

/**
 * Detects whether a dataset is AC or DC based on headers and sample values
 */
export function detectDatasetType(headers, sampleRows = [], manualType = 'AUTO') {
  if (manualType === 'AC' || manualType === 'DC') {
    return manualType;
  }

  const mapped = headers.map(h => mapHeaderToParameter(h));
  
  // Strong AC indicators: presence of Power Factor or Frequency
  const hasACIndicators = mapped.includes('powerFactor') || mapped.includes('frequency');
  
  // DC indicators: presence of Energy without PF/Frequency, or headers explicitly stating 'dc'
  const hasDCIndicators = headers.some(h => sanitizeHeader(h).includes('dc') || sanitizeHeader(h).includes('ina219'));
  
  if (hasACIndicators) {
    return 'AC';
  }
  
  if (hasDCIndicators) {
    return 'DC';
  }

  // Check voltage values if available
  const voltageIndex = mapped.indexOf('voltage');
  if (voltageIndex !== -1 && sampleRows.length > 0) {
    const values = sampleRows.slice(0, 10).map(r => parseFloat(r[headers[voltageIndex]])).filter(v => !isNaN(v));
    if (values.length > 0) {
      const avgV = values.reduce((a, b) => a + b, 0) / values.length;
      if (avgV > 80) {
        return 'AC'; // typically 110V-240V mains
      } else {
        return 'DC'; // typically 3.3V-48V DC
      }
    }
  }

  return 'AC'; // Default fallback
}
