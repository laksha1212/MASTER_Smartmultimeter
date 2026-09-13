import React from 'react';
import { 
  Cpu, 
  Layers, 
  HardDrive, 
  Zap, 
  BatteryCharging, 
  Gauge, 
  Radio, 
  Compass, 
  Activity,
  CheckCircle2,
  Terminal,
  Monitor
} from 'lucide-react';

export function About() {
  const sensorList = [
    {
      name: 'PZEM-004T',
      category: 'AC Electrical',
      interface: 'UART (Serial)',
      description: 'Optically isolated AC metering measuring RMS Voltage (80–260V), Current (0–100A), Active Power, Energy, Power Factor, and Grid Frequency.',
      icon: Zap,
      color: '#2563eb'
    },
    {
      name: 'INA219',
      category: 'DC Current & Power',
      interface: 'I²C (0x40)',
      description: 'High-side bidirectional DC current sensor with 12-bit ADC, measuring bus voltages up to 26V and load currents up to ±3.2A with high precision.',
      icon: BatteryCharging,
      color: '#0891b2'
    },
    {
      name: 'DC Voltage Divider',
      category: 'DC High Voltage',
      interface: 'Analog ADC (GPIO26)',
      description: 'Precision metal-film resistor divider scaling DC voltages (0–50V) to RP2040 internal 3.3V 12-bit ADC for battery bank and solar monitoring.',
      icon: Gauge,
      color: '#7c3aed'
    },
    {
      name: 'VL53L0X',
      category: 'Physical / Distance',
      interface: 'I²C (0x29)',
      description: 'Time-of-Flight (ToF) VCSEL laser ranging sensor providing millimeter-accurate distance measurements up to 2 meters independent of target reflectance.',
      icon: Radio,
      color: '#059669'
    },
    {
      name: 'MPU6050',
      category: 'Orientation & Motion',
      interface: 'I²C (0x68)',
      description: '6-Axis motion tracking combining a 3-axis gyroscope and 3-axis accelerometer with digital motion processing (DMP) for digital leveling and vibration analysis.',
      icon: Compass,
      color: '#ea580c'
    },
    {
      name: 'Hall-Effect Sensor',
      category: 'RPM & Speed',
      interface: 'GPIO Interrupt',
      description: 'Digital magnetic switch detecting magnetic rotor passage to calculate high-speed revolutions per minute (RPM) with hardware timer capture.',
      icon: Activity,
      color: '#dc2626'
    },
    {
      name: 'MicroSD Card Module',
      category: 'Persistent Storage',
      interface: 'SPI (DMA)',
      description: 'High-speed FAT32 file system logger writing timestamped CSV records directly at configurable sampling rates without blocking real-time loops.',
      icon: HardDrive,
      color: '#4f46e5'
    },
    {
      name: '0.96" SSD1306 OLED',
      category: 'Live Display',
      interface: 'I²C (0x3C)',
      description: '128x64 pixel monochrome graphical display providing immediate on-field visual feedback, parameter modes, and diagnostic status alerts.',
      icon: Monitor,
      color: '#0284c7'
    }
  ];

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Cpu size={24} className="text-primary" />
            About MASTER Instrument Platform
          </h1>
          <p>
            Modular Advanced Sensing and Testing Equipment for Real-time diagnostics
          </p>
        </div>
      </div>

      {/* Main Overview Card */}
      <div className="master-card about-hero-card">
        <div className="hero-top-row">
          <div>
            <span className="badge badge-ac">Hardware Platform</span>
            <h2 className="about-hero-title">Software-Defined Multifunction Diagnostics</h2>
          </div>
          <span className="rp2040-tag">RP2040 Dual-Core ARM</span>
        </div>

        <p className="about-hero-p">
          <strong>MASTER</strong> is a compact, multifunction diagnostic instrument designed around the <strong>Raspberry Pi Pico (RP2040)</strong>. It integrates electrical sensing, physical telemetry, motion analysis, and high-speed data logging into a single modular platform.
        </p>

        <div className="philosophy-quote">
          <blockquote>
            “The same hardware platform dynamically operates as different diagnostic instruments depending on the selected measurement mode. MASTER doesn't just measure — MASTER remembers, analyzes, and explains.”
          </blockquote>
        </div>
      </div>

      {/* Architecture Flow Diagram Card */}
      <div className="master-card" style={{ marginTop: 24 }}>
        <div className="card-header-row">
          <div className="card-header-title">
            <Layers size={18} className="text-primary" />
            End-to-End System Architecture Flow
          </div>
          <span className="badge badge-neutral">Signal to Analytics Pipeline</span>
        </div>

        <div className="architecture-diagram-container">
          <div className="arch-step">
            <div className="arch-step-badge">1. PHYSICAL SIGNALS</div>
            <div className="arch-box">
              <span className="arch-title">Sensors & Probes</span>
              <span className="arch-sub">AC Mains, DC Bus, Laser ToF, IMU, Hall Magnetic Sensor</span>
            </div>
          </div>

          <div className="arch-arrow">→</div>

          <div className="arch-step">
            <div className="arch-step-badge">2. RP2040 ENGINE</div>
            <div className="arch-box highlight-box">
              <span className="arch-title">RP2040 Firmware</span>
              <span className="arch-sub">Scaling • Digital Filtering • Calibration • Real-Time Math</span>
            </div>
          </div>

          <div className="arch-arrow">→</div>

          <div className="arch-step">
            <div className="arch-step-badge">3. FIELD LOGGING</div>
            <div className="arch-box">
              <span className="arch-title">MicroSD Logger</span>
              <span className="arch-sub">FAT32 SPI DMA Stream • Structured CSV Files</span>
            </div>
          </div>

          <div className="arch-arrow">→</div>

          <div className="arch-step">
            <div className="arch-step-badge">4. INTELLIGENCE</div>
            <div className="arch-box highlight-box-blue">
              <span className="arch-title">MASTER Web Dashboard</span>
              <span className="arch-sub">Visualization • Time-Series • Dispersion • Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Hardware Matrix */}
      <div className="master-card" style={{ marginTop: 24 }}>
        <div className="card-header-row">
          <div className="card-header-title">
            <Cpu size={18} className="text-primary" />
            Hardware Sensor Specifications & Interface Matrix
          </div>
          <span className="badge badge-neutral">{sensorList.length} Integrated Modules</span>
        </div>

        <div className="sensor-cards-grid">
          {sensorList.map((sensor) => {
            const Icon = sensor.icon;
            return (
              <div key={sensor.name} className="sensor-card">
                <div className="sensor-card-top">
                  <div className="sensor-icon" style={{ backgroundColor: `${sensor.color}15`, color: sensor.color }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="sensor-name">{sensor.name}</h3>
                    <span className="sensor-category">{sensor.category}</span>
                  </div>
                </div>

                <p className="sensor-desc">{sensor.description}</p>

                <div className="sensor-footer">
                  <span className="sensor-iface-tag mono">{sensor.interface}</span>
                  <span className="sensor-status"><CheckCircle2 size={12} color="#16a34a" /> Connected</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .about-hero-card {
          padding: 28px 32px;
        }

        .hero-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .about-hero-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 6px;
        }

        .rp2040-tag {
          font-family: var(--font-mono);
          font-size: 11.5px;
          font-weight: 700;
          color: #1e40af;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
        }

        .about-hero-p {
          font-size: 14.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 18px;
        }

        .philosophy-quote {
          background: var(--bg-subtle);
          border-left: 4px solid var(--primary);
          border-radius: var(--radius-sm);
          padding: 14px 18px;
        }

        .philosophy-quote blockquote {
          font-size: 13.5px;
          font-style: italic;
          color: var(--text-primary);
          font-weight: 500;
          line-height: 1.5;
        }

        .architecture-diagram-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 20px 10px;
          overflow-x: auto;
        }

        .arch-step {
          flex: 1;
          min-width: 200px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .arch-step-badge {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.06em;
        }

        .arch-box {
          background: var(--bg-subtle);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          height: 96px;
          justify-content: center;
        }

        .highlight-box {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .highlight-box-blue {
          background: #f0f9ff;
          border-color: #bae6fd;
        }

        .arch-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .arch-sub {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.35;
        }

        .arch-arrow {
          font-size: 20px;
          color: var(--text-light);
          font-weight: 700;
        }

        .sensor-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-top: 14px;
        }

        .sensor-card {
          background: var(--bg-subtle);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 10px;
          transition: all 0.15s ease;
        }

        .sensor-card:hover {
          background: #ffffff;
          box-shadow: var(--shadow-sm);
          border-color: #cbd5e1;
        }

        .sensor-card-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sensor-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sensor-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .sensor-category {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .sensor-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .sensor-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid var(--border-subtle);
          font-size: 11px;
        }

        .sensor-iface-tag {
          color: var(--primary);
          font-weight: 600;
          background: #ffffff;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid var(--border-light);
        }

        .sensor-status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #16a34a;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
