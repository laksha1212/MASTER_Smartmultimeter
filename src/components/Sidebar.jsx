import React from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  BatteryCharging, 
  UploadCloud, 
  Database, 
  BarChart3, 
  Info,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Cpu
} from 'lucide-react';

export function Sidebar({
  activePage,
  setActivePage,
  activeDataset,
  historyCount = 0,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileSidebarOpen,
  setMobileSidebarOpen
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'ac-analysis', 
      label: 'AC Analysis', 
      icon: Zap,
      badge: activeDataset?.type === 'AC' ? 'ACTIVE' : null,
      badgeColor: 'badge-ac'
    },
    { 
      id: 'dc-analysis', 
      label: 'DC Analysis', 
      icon: BatteryCharging,
      badge: activeDataset?.type === 'DC' ? 'ACTIVE' : null,
      badgeColor: 'badge-dc'
    },
    { id: 'upload', label: 'Data Upload', icon: UploadCloud },
    { 
      id: 'history', 
      label: 'Historical Data', 
      icon: Database,
      count: historyCount
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'about', label: 'About MASTER', icon: Info }
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside className={`master-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          {!sidebarCollapsed && (
            <div className="sidebar-branding">
              <span className="sidebar-product-name">MASTER</span>
              <span className="sidebar-product-desc">Diagnostic System</span>
            </div>
          )}
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">
            {!sidebarCollapsed && <span>MAIN NAVIGATION</span>}
          </div>
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <li key={item.id}>
                  <button
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="nav-icon" />
                    {!sidebarCollapsed && (
                      <span className="nav-label">{item.label}</span>
                    )}

                    {!sidebarCollapsed && item.badge && (
                      <span className={`nav-badge ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}

                    {!sidebarCollapsed && item.count !== undefined && item.count > 0 && (
                      <span className="nav-count-badge">
                        {item.count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Hardware Info Box */}
        <div className="sidebar-footer">
          {!sidebarCollapsed ? (
            <div className="hardware-card">
              <div className="hardware-header">
                <Cpu size={15} className="text-primary" />
                <span className="hardware-title">MASTER Hardware</span>
              </div>
              <div className="hardware-badges">
                <span className="hw-chip-badge">RP2040 Powered</span>
                <span className="hw-sd-badge">
                  <HardDrive size={10} /> MicroSD Logger
                </span>
              </div>
              <p className="hw-desc">
                Modular Advanced Sensing & Real-Time Diagnostics
              </p>
            </div>
          ) : (
            <div className="hardware-icon-collapsed" title="MASTER RP2040 MicroSD Logger">
              <Cpu size={20} className="text-primary" />
            </div>
          )}
        </div>

        <style>{`
          .master-sidebar {
            width: var(--sidebar-width);
            background: var(--bg-surface);
            border-right: 1px solid var(--border-light);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100vh;
            position: sticky;
            top: 0;
            z-index: 150;
            transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
          }

          .master-sidebar.collapsed {
            width: var(--sidebar-collapsed-width);
          }

          .sidebar-header {
            height: var(--navbar-height);
            padding: 0 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--border-subtle);
          }

          .sidebar-branding {
            display: flex;
            flex-direction: column;
          }

          .sidebar-product-name {
            font-family: var(--font-heading);
            font-weight: 800;
            font-size: 15px;
            letter-spacing: 0.05em;
            color: var(--primary);
          }

          .sidebar-product-desc {
            font-size: 10.5px;
            color: var(--text-muted);
            font-weight: 500;
          }

          .collapse-btn {
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

          .collapse-btn:hover {
            background: var(--bg-subtle);
            color: var(--text-primary);
          }

          .sidebar-nav {
            flex: 1;
            padding: 16px 10px;
            overflow-y: auto;
          }

          .nav-section-label {
            font-size: 10px;
            font-weight: 700;
            color: var(--text-light);
            letter-spacing: 0.08em;
            padding: 0 10px 8px;
          }

          .nav-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .nav-link {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 9px 12px;
            border-radius: var(--radius-md);
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 13.5px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
            text-align: left;
          }

          .nav-link:hover {
            background-color: var(--bg-subtle);
            color: var(--text-primary);
          }

          .nav-link.active {
            background-color: var(--primary-light);
            color: var(--primary);
            font-weight: 600;
          }

          .nav-icon {
            flex-shrink: 0;
          }

          .nav-label {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .nav-badge {
            font-size: 9.5px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            letter-spacing: 0.04em;
          }

          .nav-count-badge {
            background: var(--bg-subtle);
            color: var(--text-muted);
            font-family: var(--font-mono);
            font-size: 11px;
            font-weight: 600;
            padding: 1px 6px;
            border-radius: 10px;
            border: 1px solid var(--border-light);
          }

          .sidebar-footer {
            padding: 16px 12px;
            border-top: 1px solid var(--border-subtle);
          }

          .hardware-card {
            background: var(--bg-subtle);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-md);
            padding: 12px;
          }

          .hardware-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
          }

          .hardware-title {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-primary);
          }

          .hardware-badges {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-bottom: 8px;
          }

          .hw-chip-badge {
            font-size: 10.5px;
            font-weight: 600;
            color: #1e40af;
            background: #dbeafe;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
          }

          .hw-sd-badge {
            font-size: 10px;
            font-weight: 500;
            color: var(--text-secondary);
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .hw-desc {
            font-size: 10px;
            color: var(--text-muted);
            line-height: 1.35;
          }

          .hardware-icon-collapsed {
            display: flex;
            justify-content: center;
            padding: 8px;
          }

          .sidebar-backdrop {
            display: none;
          }

          @media (max-width: 768px) {
            .master-sidebar {
              position: fixed;
              top: 0;
              left: 0;
              bottom: 0;
              transform: translateX(-100%);
              z-index: 999;
              box-shadow: var(--shadow-lg);
            }

            .master-sidebar.mobile-open {
              transform: translateX(0);
            }

            .sidebar-backdrop {
              display: block;
              position: fixed;
              inset: 0;
              background: rgba(15, 23, 42, 0.4);
              backdrop-filter: blur(2px);
              z-index: 998;
            }
          }
        `}</style>
      </aside>
    </>
  );
}
