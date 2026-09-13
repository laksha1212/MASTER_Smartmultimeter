/**
 * dataProcessor.js
 * Parses timestamps, orders records chronologically, downsamples large datasets for smooth rendering,
 * and performs data cleaning and validation.
 */

/**
 * Parses a timestamp string or number into a standard Date or epoch seconds
 */
export function parseTimestamp(value, index = 0, baseDate = null) {
  if (value === null || value === undefined || value === '') {
    // If no timestamp, generate synthetic timestamp at 1s interval
    const base = baseDate || new Date('2026-09-13T10:00:00');
    const synthetic = new Date(base.getTime() + index * 1000);
    return {
      date: synthetic,
      formatted: synthetic.toTimeString().split(' ')[0],
      seconds: synthetic.getTime() / 1000,
      isSynthetic: true
    };
  }

  const str = String(value).trim();
  
  // Case 1: HH:MM:SS or HH:MM:SS.mmm
  if (/^\d{1,2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(str)) {
    const parts = str.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parts[2] ? parseFloat(parts[2]) : 0;
    
    const d = baseDate ? new Date(baseDate) : new Date();
    d.setHours(hours, minutes, Math.floor(seconds), Math.floor((seconds % 1) * 1000));
    
    return {
      date: d,
      formatted: str,
      seconds: hours * 3600 + minutes * 60 + seconds,
      isSynthetic: false
    };
  }

  // Case 2: Unix timestamp (ms or s)
  const numericTime = Number(str);
  if (!isNaN(numericTime) && numericTime > 100000) {
    const ms = numericTime > 1e11 ? numericTime : numericTime * 1000;
    const d = new Date(ms);
    return {
      date: d,
      formatted: d.toLocaleTimeString('en-US', { hour12: false }),
      seconds: ms / 1000,
      isSynthetic: false
    };
  }

  // Case 3: Standard ISO / Date format
  const parsedDate = new Date(str);
  if (!isNaN(parsedDate.getTime())) {
    return {
      date: parsedDate,
      formatted: parsedDate.toLocaleTimeString('en-US', { hour12: false }),
      seconds: parsedDate.getTime() / 1000,
      isSynthetic: false
    };
  }

  // Fallback
  return {
    date: new Date(),
    formatted: str,
    seconds: index,
    isSynthetic: true
  };
}

/**
 * Formats duration in seconds into human-readable string (e.g., "42m 15s")
 */
export function formatDuration(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '0s';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

/**
 * Downsamples time-series data using Min-Max Stride Decimation to preserve peak spikes
 * while reducing points for 60fps canvas chart rendering.
 */
export function downsampleData(data, maxPoints = 800) {
  if (!data || data.length <= maxPoints) return data;

  const sampled = [];
  const factor = Math.ceil(data.length / maxPoints);

  // Always keep first point
  sampled.push(data[0]);

  for (let i = 1; i < data.length - 1; i += factor) {
    const bucket = data.slice(i, Math.min(i + factor, data.length - 1));
    if (bucket.length === 0) continue;

    if (bucket.length === 1) {
      sampled.push(bucket[0]);
      continue;
    }

    // Find min and max points in bucket based on primary parameter (voltage or current)
    let minIdx = 0;
    let maxIdx = 0;
    let minVal = Infinity;
    let maxVal = -Infinity;

    bucket.forEach((item, idx) => {
      const v = item.voltage !== undefined ? item.voltage : (item.current || 0);
      if (v < minVal) {
        minVal = v;
        minIdx = idx;
      }
      if (v > maxVal) {
        maxVal = v;
        maxIdx = idx;
      }
    });

    if (minIdx < maxIdx) {
      sampled.push(bucket[minIdx]);
      if (minIdx !== maxIdx) sampled.push(bucket[maxIdx]);
    } else {
      sampled.push(bucket[maxIdx]);
      if (minIdx !== maxIdx) sampled.push(bucket[minIdx]);
    }
  }

  // Always keep last point
  if (data.length > 1) {
    sampled.push(data[data.length - 1]);
  }

  return sampled;
}
