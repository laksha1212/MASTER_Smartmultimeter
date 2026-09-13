/**
 * pdfGenerator.js
 * Generates an engineering diagnostic test report PDF using jsPDF.
 */

import { jsPDF } from 'jspdf';
import { PARAMETER_META } from './dataDetector.js';

export function generatePDFReport(dataset) {
  if (!dataset) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Background Accent Bar
  doc.setFillColor(37, 99, 235); // #2563EB
  doc.rect(14, y - 6, pageWidth - 28, 2, 'F');

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('MASTER Diagnostic Measurement Report', 14, y + 4);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text('Modular Advanced Sensing and Testing Equipment for Real-time Diagnostics (RP2040)', 14, y + 10);
  
  // Date & Badge
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, y + 10, { align: 'right' });

  y += 18;

  // Metadata Card
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  doc.text('DATASET METADATA', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const col1 = 18;
  const col2 = 75;
  const col3 = 135;

  doc.text(`File Name: `, col1, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(dataset.fileName || 'Untitled.csv', col1 + 18, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Signal Type: `, col2, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(`${dataset.type} Measurement`, col2 + 20, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Records: `, col3, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${dataset.recordCount.toLocaleString()} samples`, col3 + 22, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Time Range: `, col1, y + 19);
  doc.setTextColor(15, 23, 42);
  doc.text(`${dataset.timeRange.startTime} - ${dataset.timeRange.endTime} (${dataset.timeRange.durationFormatted})`, col1 + 20, y + 19);

  y += 30;

  // Key Parameters Statistics Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Measurement Parameters Summary', 14, y);

  y += 4;

  // Table Headers
  const tableHeaders = ['Parameter', 'Latest', 'Average', 'Min', 'Max', 'Std Dev', 'Unit'];
  const colWidths = [45, 22, 22, 22, 22, 25, 20];
  let curX = 14;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  tableHeaders.forEach((th, i) => {
    doc.text(th, curX + 2, y + 5);
    curX += colWidths[i];
  });

  y += 7;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const params = dataset.detectedParameters || [];
  params.forEach((paramKey, rIdx) => {
    const meta = PARAMETER_META[paramKey] || { label: paramKey, unit: '' };
    const stat = dataset.metrics[paramKey];
    if (!stat) return;

    if (rIdx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 6.5, 'F');
    }

    let rx = 14;
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(dataset.type === 'AC' ? (meta.acLabel || meta.label) : (meta.dcLabel || meta.label), rx + 2, y + 4.5);
    doc.setFont('helvetica', 'normal');

    rx += colWidths[0];
    doc.text(String(stat.latest.toFixed(2)), rx + 2, y + 4.5);
    rx += colWidths[1];
    doc.text(String(stat.avg.toFixed(2)), rx + 2, y + 4.5);
    rx += colWidths[2];
    doc.text(String(stat.min.toFixed(2)), rx + 2, y + 4.5);
    rx += colWidths[3];
    doc.text(String(stat.max.toFixed(2)), rx + 2, y + 4.5);
    rx += colWidths[4];
    doc.text(String(stat.stdDev.toFixed(2)), rx + 2, y + 4.5);
    rx += colWidths[5];
    doc.setTextColor(100, 116, 139);
    doc.text(meta.unit || '-', rx + 2, y + 4.5);

    y += 6.5;
  });

  y += 8;

  // Stability & Operating Conditions Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Operational Quality & Stability Distribution', 14, y);

  y += 5;

  const boxW = (pageWidth - 32) / 2;
  
  // Left Box: Stability
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, boxW, 28, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Signal Stability (±2% band)', 18, y + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`• Stable (±2% variation): ${dataset.stability.stablePct}% (${dataset.stability.stableCount} pts)`, 18, y + 13);
  doc.text(`• Moderate (±2% to ±5%): ${dataset.stability.moderatePct}% (${dataset.stability.moderateCount} pts)`, 18, y + 19);
  doc.text(`• High Variation (> ±5%): ${dataset.stability.highPct}% (${dataset.stability.highCount} pts)`, 18, y + 25);

  // Right Box: Operating Condition
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + boxW + 4, y, boxW, 28, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Operating Zone Compliance', 18 + boxW + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const cond = dataset.conditionDistribution;
  doc.text(`• Normal Operating Zone: ${cond.normalPct}% (${cond.normalCount} pts)`, 18 + boxW + 4, y + 13);
  doc.text(`• Warning Threshold Zone: ${cond.warningPct}% (${cond.warningCount} pts)`, 18 + boxW + 4, y + 19);
  doc.text(`• Critical Boundary: ${cond.criticalPct}% (${cond.criticalCount} pts)`, 18 + boxW + 4, y + 25);

  y += 35;

  // Diagnostic Insights Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Automated Engineering Insights', 14, y);

  y += 5;

  (dataset.insights || []).slice(0, 4).forEach((insight) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 28, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(37, 99, 235);
    doc.text(`[${insight.category.toUpperCase()}] ${insight.title}`, 18, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitText = doc.splitTextToSize(insight.description, pageWidth - 36);
    doc.text(splitText, 18, y + 10);

    y += 16;
  });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('MASTER Instrument • RP2040 Dual-Core ARM Cortex-M0+ • MicroSD Data Logging Platform', pageWidth / 2, 285, { align: 'center' });

  // Save / Download
  const cleanName = (dataset.fileName || 'dataset').replace(/\.[^/.]+$/, '');
  doc.save(`MASTER_Diagnostic_Report_${cleanName}_${dataset.type}.pdf`);
}
