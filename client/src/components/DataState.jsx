export default function DataState({ loading, error, reload, empty, label }) {
  if (loading) return <div className="data-state" role="status">Loading {label}…</div>;
  if (error) return <div className="data-state api-error" role="alert"><h2>Unable to load {label}</h2><p>{error}</p><button onClick={reload}>Retry</button></div>;
  if (empty) return <div className="data-state" role="status"><h2>No {label} found</h2><p>No records match this view. Check your filters or the development database seed.</p></div>;
  return null;
}
