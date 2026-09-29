import useApiData from '../hooks/useApiData.js';
import DataState from './DataState.jsx';

export default function NodesPage({ page }) {
  const state = useApiData('/nodes');
  const ready = !state.loading && !state.error;
  const statuses = ['ACTIVE', 'STANDBY', 'INACTIVE'];
  return <>
    <section className="page-heading"><p className="eyebrow">FULFILLMENT OPERATIONS</p><h1>{page.label}</h1><p className="page-description">Node records from the backend. Counts reflect the current database snapshot.</p></section>
    {ready && page.id === 'dashboard' && <div className="summary-grid">
      <article className="summary-card"><span>Total nodes</span><strong>{state.data.length}</strong></article>
      {statuses.map((status) => <article className="summary-card" key={status}><span className={`node-status ${status.toLowerCase()}`}>{status}</span><strong>{state.data.filter((node) => node.status === status).length}</strong></article>)}
    </div>}
    <section className="content-panel">
      <div className="panel-header"><h2>Fulfillment nodes</h2><button onClick={state.reload} disabled={state.loading}>Refresh</button></div>
      <DataState {...state} empty={!state.data.length} label="fulfillment nodes" />
      {ready && state.data.length > 0 && <div className="table-scroll" tabIndex={0} role="region" aria-label="Fulfillment node table"><table>
        <thead><tr>{['Node', 'Location / cluster', 'Type', 'Status', 'Storage (units)', 'Processing (units/hour)', 'Operating hours/day'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{state.data.map((node) => <tr key={node.node_id}><td><strong>{node.name}</strong><span className="cell-detail">{node.node_id}</span></td><td>{node.city}<span className="cell-detail">{node.cluster_id}</span></td><td>{node.type}</td><td><span className={`node-status ${statuses.includes(node.status) ? node.status.toLowerCase() : ''}`}>{node.status}</span></td><td>{node.storage_capacity_units}</td><td>{node.processing_capacity_units_per_hour}</td><td>{node.operating_hours_per_day}</td></tr>)}</tbody>
      </table></div>}
    </section>
  </>;
}
