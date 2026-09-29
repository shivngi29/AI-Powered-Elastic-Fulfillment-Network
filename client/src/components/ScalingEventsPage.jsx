import useApiData from '../hooks/useApiData.js';
import DataState from './DataState.jsx';

const number = (value) => value == null ? 'Not available' : value.toLocaleString();
const time = (value) => value ? new Date(value).toLocaleString() : 'Not executed';

export default function ScalingEventsPage() {
  const state = useApiData('/scaling/events');
  return <>
    <section className="page-heading"><p className="eyebrow">CAPACITY ACTIVITY</p><h1>Scaling Events</h1><p className="page-description">Recorded decisions and their status. This view does not generate or execute scaling actions.</p></section>
    <section className="content-panel"><div className="panel-header"><h2>Event history</h2><button onClick={state.reload} disabled={state.loading}>Refresh</button></div>
      <DataState {...state} label="scaling events" />
      {!state.loading && !state.error && !state.data.length && <div className="data-state" role="status"><h2>No scaling events recorded</h2><p>Events will appear when a producer records them. The Python intelligence engine is not connected yet.</p></div>}
      {!state.loading && !state.error && state.data.length > 0 && <div className="scaling-list">{state.data.map((event) => <article className="scaling-event" key={event._id}>
        <header className="event-heading"><div><span className={`event-action ${event.action.toLowerCase()}`}>{event.action.replaceAll('_', ' ')}</span><strong>{event.node_id || 'Cluster-wide'} · {event.cluster_id}</strong></div><span className="node-status">{event.status}</span></header>
        {event.source === 'demo' && <p className="event-demo">DEMO RECORD · not a live intelligence decision</p>}
        <p className="event-reason">{event.reason}</p>
        <dl className="event-values">
          <div><dt>Predicted demand · units/day</dt><dd>{number(event.predicted_demand_units_per_day)}</dd></div>
          <div><dt>Available capacity · units/day</dt><dd>{number(event.available_capacity_units_per_day)}</dd></div>
          <div><dt>Required capacity · units/day</dt><dd>{number(event.required_capacity_units_per_day)}</dd></div>
          <div><dt>Estimated cost · INR</dt><dd>{number(event.estimated_cost_inr)}</dd></div>
          <div><dt>Expected savings · INR</dt><dd>{number(event.expected_savings_inr)}</dd></div>
        </dl>
        <footer className="event-times"><span>Created: <time dateTime={event.created_at}>{time(event.created_at)}</time></span><span>Executed: {event.executed_at ? <time dateTime={event.executed_at}>{time(event.executed_at)}</time> : 'Not executed'}</span></footer>
      </article>)}</div>}
    </section><p className="table-note">Newest records first. Timestamps use your browser’s local timezone. Missing estimates are shown as unavailable.</p>
  </>;
}
