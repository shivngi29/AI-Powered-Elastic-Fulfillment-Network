import { useState } from 'react';
import useApiData from '../hooks/useApiData.js';
import DataState from './DataState.jsx';

export default function InventoryPage() {
  const [nodeId, setNodeId] = useState('');
  const [productId, setProductId] = useState('');
  const [query, setQuery] = useState('');
  const state = useApiData(`/inventory${query}`);
  function applyFilters(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (nodeId.trim()) params.set('nodeId', nodeId.trim());
    if (productId.trim()) params.set('productId', productId.trim());
    const next = params.size ? `?${params}` : '';
    if (next === query) state.reload(); else setQuery(next);
  }
  return <>
    <section className="page-heading"><p className="eyebrow">STOCK VISIBILITY</p><h1>Inventory</h1><p className="page-description">Available stock is unreserved on-hand stock. Safety stock is a target, not additional inventory.</p></section>
    <form className="inventory-filters" onSubmit={applyFilters}>
      <label>Node ID<input value={nodeId} onChange={(event) => setNodeId(event.target.value)} placeholder="e.g. N01" /></label>
      <label>Product ID<input value={productId} onChange={(event) => setProductId(event.target.value)} placeholder="e.g. P01" /></label>
      <button type="submit">Apply filters</button><button type="button" onClick={() => { setNodeId(''); setProductId(''); if (!query) state.reload(); else setQuery(''); }}>Clear</button>
    </form>
    <section className="content-panel"><div className="panel-header"><h2>Inventory records</h2><button onClick={state.reload} disabled={state.loading}>Refresh</button></div>
      <DataState {...state} empty={!state.data.length} label="inventory records" />
      {!state.loading && !state.error && state.data.length > 0 && <div className="table-scroll" tabIndex={0} role="region" aria-label="Inventory table"><table>
        <thead><tr>{['Product ID', 'Node ID', 'Available', 'Reserved', 'In transit', 'Safety stock'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{state.data.map((row) => <tr key={`${row.node_id}/${row.product_id}`}><td>{row.product_id}</td><td>{row.node_id}</td><td>{row.available_qty}</td><td>{row.reserved_qty}</td><td>{row.in_transit_qty}</td><td>{row.safety_stock}</td></tr>)}</tbody>
      </table></div>}
    </section><p className="table-note">Quantities are in units. Product IDs are shown because the existing API does not provide product names.</p>
  </>;
}
