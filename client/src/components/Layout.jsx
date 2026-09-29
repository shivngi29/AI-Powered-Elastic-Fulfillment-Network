import { API_BASE_URL } from '../config/api.js';

export default function Layout({ pages, currentPage, children }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="sidebar">
        <a className="brand" href="#/dashboard" aria-label="Elastic Fulfillment dashboard">
          <span className="brand-mark" aria-hidden="true">EF</span>
          <span>Elastic<span className="brand-subtitle">Fulfillment Network</span></span>
        </a>
        <p className="nav-caption">WORKSPACE</p>
        <nav aria-label="Primary navigation">
          {pages.map((page, index) => (
            <a key={page.id} href={`#/${page.id}`} className={`nav-link ${currentPage?.id === page.id ? 'active' : ''}`} aria-current={currentPage?.id === page.id ? 'page' : undefined}>
              <span className="nav-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              {page.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-note"><span className="note-label">COLLEGE PROJECT</span><p>AI-Powered Elastic Fulfillment Network for E-Commerce</p></div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">Operations <span aria-hidden="true">/</span> <strong>{currentPage?.short ?? 'Page not found'}</strong></div>
          <span className="environment-label">Development workspace</span>
        </header>
        <main id="main-content" tabIndex={-1} key={currentPage?.id ?? 'not-found'}>{children}</main>
        <footer className="footer"><span>Elastic Fulfillment · Operations workspace</span><span>{API_BASE_URL ? 'Data refreshes on page load or Refresh' : 'API URL not configured'}</span></footer>
      </div>
    </div>
  );
}
