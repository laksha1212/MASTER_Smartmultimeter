/**
 * csvParser.js
 * Robust CSV parser and analyzer using PapaParse.
 * Handles messy headers, missing values, timestamp parsing, statistics, stability, and insights.
 */

import Papa from 'papaparse';
import { mapHeaderToParameter, detectDatasetType, PARAMETER_META } from './dataDetector.js';
import { parseTimestamp, formatDuration, downsampleData } from './dataProcessor.js';
import { calculateSeriesStats, calculateStabilityMetrics, calculateOperatingConditions } from './statistics.js';
import { generateDiagnosticInsights } from './insightsEngine.js';

export function parseCSVData(csvContent, fileName = 'measurement_data.csv', manualType = 'AUTO', customThresholds = {}) {
  return new Promise((resolve, reject) => {
    if (!csvContent || typeof csvContent !== 'string' || csvContent.trim() === '') {
      return reject(new Error('CSV content is empty or invalid. Please upload a valid CSV file.'));
    }

    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false, // We'll parse numbers safely to catch bad formats
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            return reject(new Error('No data rows found in the CSV.'));
          }

          const rawHeaders = results.meta.fields || Object.keys(results.data[0] || {});
          if (rawHeaders.length === 0) {
            return reject(new Error('No column headers detected in the CSV file.'));
          }

          // Map raw headers to standard parameter names
          const headerMapping = {};
          const detectedParameters = [];

          rawHeaders.forEach(raw => {
            const mapped = mapHeaderToParameter(raw);
            headerMapping[raw] = mapped;
            if (!detectedParameters.includes(mapped) && mapped !== 'timestamp') {
              detectedParameters.push(mapped);
            }
          });

          // Detect dataset type (AC vs DC)
          const type = detectDatasetType(rawHeaders, results.data, manualType);

          const warnings = [];
          const cleanData = [];
          const rawRows = results.data;
          let invalidRowCount = 0;
          let missingValueCount = 0;

          // Process each row
          rawRows.forEach((row, idx) => {
            // Find timestamp column value
            let rawTimeVal = null;
            for (const [rawH, mappedH] of Object.entries(headerMapping)) {
              if (mappedH === 'timestamp') {
                rawTimeVal = row[rawH];
                break;
              }
            }

            const parsedTime = parseTimestamp(rawTimeVal, idx);
            const cleanRow = {
              _index: idx + 1,
              timestamp: parsedTime.date,
              timestampStr: parsedTime.formatted,
              timeSeconds: parsedTime.seconds,
              isSyntheticTime: parsedTime.isSynthetic
            };

            let rowHasValidMetric = false;

            for (const [rawH, mappedH] of Object.entries(headerMapping)) {
              if (mappedH === 'timestamp') continue;

              const valStr = row[rawH];
              if (valStr !== null && valStr !== undefined && valStr !== '') {
                const num = parseFloat(String(valStr).replace(/[^0-9.-]/g, ''));
                if (!isNaN(num)) {
                  cleanRow[mappedH] = num;
                  cleanRow[rawH] = num; // Also keep raw header access
                  rowHasValidMetric = true;
                } else {
                  cleanRow[mappedH] = null;
                  missingValueCount++;
                }
              } else {
                cleanRow[mappedH] = null;
                missingValueCount++;
              }
            }

            if (rowHasValidMetric) {
              cleanData.push(cleanRow);
            } else {
              invalidRowCount++;
            }
          });

          if (cleanData.length === 0) {
            return reject(new Error('No valid numerical measurement rows could be parsed from this file.'));
          }

          // Sort chronologically by timeSeconds if needed
          cleanData.sort((a, b) => a.timeSeconds - b.timeSeconds);

          // Calculate time range
          const firstRow = cleanData[0];
          const lastRow = cleanData[cleanData.length - 1];
          const totalDurationSec = Math.max(0, lastRow.timeSeconds - firstRow.timeSeconds);
          
          const timeRange = {
            startTime: firstRow.timestampStr,
            endTime: lastRow.timestampStr,
            totalSeconds: totalDurationSec,
            durationFormatted: formatDuration(totalDurationSec)
          };

          // Calculate statistics for each detected parameter
          const metrics = {};
          detectedParameters.forEach(param => {
            const values = cleanData.map(r => r[param]).filter(v => v !== null && v !== undefined && !isNaN(v));
            metrics[param] = calculateSeriesStats(values);
          });

          // Precompute stability metrics based on primary parameter (voltage or current)
          const primaryParam = detectedParameters.includes('voltage') ? 'voltage' : (detectedParameters[0] || 'current');
          const primaryValues = cleanData.map(r => r[primaryParam]).filter(v => v !== null && !isNaN(v));
          const stability = calculateStabilityMetrics(primaryValues, type === 'AC' ? 230 : (type === 'DC' ? 12 : null));

          // Precompute operating conditions
          const conditionDistribution = calculateOperatingConditions(cleanData, customThresholds, type);

          // Build diagnostic insights
          const datasetObj = {
            id: `dataset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fileName,
            type,
            uploadTimestamp: new Date().toISOString(),
            rawHeaders,
            headerMapping,
            detectedParameters,
            recordCount: cleanData.length,
            timeRange,
            metrics,
            stability,
            conditionDistribution,
            cleanData,
            downsampledData: downsampleData(cleanData, 800),
            warnings: []
          };

          const insights = generateDiagnosticInsights(datasetObj);
          datasetObj.insights = insights;

          // Warnings compilation
          if (invalidRowCount > 0) {
            datasetObj.warnings.push(`${invalidRowCount} empty or unreadable rows were automatically excluded.`);
          }
          if (missingValueCount > 0) {
            datasetObj.warnings.push(`${missingValueCount} individual cells contained null or non-numeric values and were excluded from specific statistics.`);
          }
          if (cleanData.some(r => r.isSyntheticTime)) {
            datasetObj.warnings.push('Explicit timestamp column was missing or partial; continuous interval timestamps were assigned.');
          }

          resolve(datasetObj);
        } catch (err) {
          reject(new Error(`Failed to parse CSV: ${err.message}`));
        }
      },
      error: (err) => {
        reject(new Error(`CSV syntax error: ${err.message}`));
      }
    });
  });
}
