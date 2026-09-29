export default function PlaceholderPage({ page }) {
  return (
    <>
      <section className="page-heading"><p className="eyebrow">OPERATIONS WORKSPACE</p><h1>{page.label}</h1><p className="page-description">{page.description}</p></section>
      <section className="content-panel" aria-labelledby="workspace-title">
        <div className="panel-header"><h2 id="workspace-title">{page.scope}</h2><span className="status-label">Planned</span></div>
        <div className="empty-state">
          <div className="empty-symbol" aria-hidden="true"><span /><span /><span /></div>
          <h3>Your workspace starts here</h3>
          <p>{page.detail}</p>
          <span className="placeholder-label">Placeholder screen · No live data</span>
        </div>
      </section>
      <aside className="context-note"><span className="context-icon" aria-hidden="true">i</span><div><h2>Built in small, connected steps</h2><p>This release establishes navigation and layout. Data views and operational actions will be added in separate development phases.</p></div></aside>
    </>
  );
}
