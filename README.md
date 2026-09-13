# MASTER — Intelligent Measurement & Diagnostic Dashboard

> **Modular Advanced Sensing and Testing Equipment for Real-time Diagnostics**  
> *Hardware Platform: Raspberry Pi Pico (RP2040) • MicroSD FAT32 Data Logger*

---

## 🌟 Overview

**MASTER Diagnostic Dashboard** is a high-performance, professional engineering web application built to analyze historical measurement data recorded by the MASTER instrument onto MicroSD cards.

### Core Philosophy
> *"MASTER doesn't just measure. MASTER remembers, analyzes, and explains."*

---

## ✨ Features & Architecture

### 1. Dual Mode Electrical & Telemetry Diagnostics
- **AC Analysis Suite**:
  - RMS Voltage ($V$), RMS Current ($A$), Active Power ($W$), Power Factor ($\cos \phi$), Grid Frequency ($Hz$).
  - 5 Dedicated interactive time-series charts with Zoom, Pan, Reset, PNG download, and Grid controls.
  - Multi-parameter overlay with **Dual Y-Axes** and **Normalized (0–100%)** modes.
  - Mains Voltage Stability analysis ($\pm 2\%$ nominal band).
- **DC Sensing Suite**:
  - DC Bus Voltage ($V$), DC Load Current ($A$), Power ($W$), Accumulated Energy ($Wh$).
  - 4 Dedicated time-series graphs tracking voltage sag, current draw, power dissipation, and Watt-hour accumulation.
  - Battery/Solar charge & discharge trend characterization.

### 2. Intelligent Data Ingestion Engine
- **Smart Automatic Classification**: Accurately classifies AC vs DC data based on column headers and voltage thresholds.
- **Flexible Header Mapping**: Supports diverse alias naming conventions (`Voltage`, `V`, `V_RMS`, `Current`, `I`, `PowerFactor`, `PF`, `Frequency`, `Hz`, `Energy`, `Wh`, `timestamp`, `time`, etc.).
- **Missing Data & Outlier Resilience**: Gracefully skips malformed rows and collects informative data validation warnings without crashing the interface.
- **Min-Max Stride Decimation**: Smooth 60fps canvas rendering for datasets containing several thousand points.

### 3. Deep Statistical & Categorical Analytics
- **Parametric Central Tendency & Dispersion**: Latest, Minimum, Maximum, Mean Average, Median, Standard Deviation, Variance, Range ($\Delta$), and Interquartile Range (IQR).
- **Measurement Stability Distribution (Donut Chart)**: Percentage of samples classified as Stable ($\pm 2\%$), Moderate Variation ($\pm 5\%$), and High Variation ($> 5\%$).
- **Operating Condition Distribution (Donut Chart)**: Classifies samples into Normal, Warning, and Critical based on user-configurable threshold limits.

### 4. Automated Data-Driven Engineering Insights
- Generates observations calculated from actual measurement records:
  - Voltage regulation stability index.
  - Transient load current surges & inrush timestamps.
  - Power Factor quality and reactive load penalty assessment.
  - Grid frequency compliance against 50Hz standards.
  - Peak active power timing and accumulated energy rate.

### 5. Persistent Browser Memory (IndexedDB)
- Automatically stores uploaded datasets locally in browser `IndexedDB`.
- Datasets survive page refreshes and browser restarts.
- Features: Open & Analyze, Download Original CSV, Rename Dataset, Delete Dataset, and Clear All History.

### 6. Interactive Data Table & Export Capabilities
- **Full Records Table**: Live search, multi-column sorting, pagination (10/25/50/100 rows), and column visibility picker.
- **PDF Diagnostic Report Generator**: Produces formatted test report with MASTER branding, dataset metadata, parameter table, stability distribution, and diagnostic observations.
- **Filtered CSV Export**: Download filtered or sanitized datasets with one click.
- **High-Resolution PNG Exports**: Direct download of time-series canvas graphs.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Local Run
```bash
# 1. Clone or navigate to the repository
cd MASTER_DIGITAL_ANALYTICS

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Sample Datasets & Demo Mode

The dashboard includes two built-in realistic demo datasets accessible with one click from the navigation bar or upload screen:

1. **Sample AC Dataset (1,500 pts)**:
   - 230V 50Hz single-phase mains.
   - Motor inductive load kick-in transient at sample 350 (inrush current surge to 9.8A and PF dip).
   - Grid frequency jitter ($\pm 0.06$ Hz).
2. **Sample DC Dataset (1,500 pts)**:
   - 12V Solar and Battery system.
   - MPPT absorption charging (13.8V, 3.6A).
   - Cloud shading transition.
   - Evening battery discharge slope with accumulated energy ($Wh$).

---

## 🛠️ Hardware Integration (MASTER Platform)

| Module / Sensor | Measurement Parameter | Interface |
|---|---|---|
| **PZEM-004T** | AC Voltage, Current, Power, Energy, PF, Frequency | UART (Serial) |
| **INA219** | DC Bus Voltage, High-Side Current, Power | I²C (0x40) |
| **DC Voltage Divider** | High DC Voltage (0–50V) scaling | ADC (GPIO26) |
| **VL53L0X** | Time-of-Flight Laser Distance (0–2m) | I²C (0x29) |
| **MPU6050** | 6-Axis Motion & Digital Leveling (Acc/Gyro) | I²C (0x68) |
| **Hall-Effect Sensor** | Magnetic RPM & Rotational Speed | GPIO Interrupt |
| **MicroSD Module** | High-Speed FAT32 CSV Logging | SPI DMA |
| **SSD1306 OLED** | 0.96" 128x64 Local Live Status Display | I²C (0x3C) |

---

## 🎨 Design Philosophy
- **Light Theme Only**: Crisp slate-50 background, white elevated cards, subtle shadows, and royal blue accents.
- **Typography**: Outfit for bold headings, Plus Jakarta Sans for clean body text, and JetBrains Mono for measurement numbers and timestamps.
- **Single Source of Truth**: All displayed values, metrics, charts, and insights are computed dynamically from data.
