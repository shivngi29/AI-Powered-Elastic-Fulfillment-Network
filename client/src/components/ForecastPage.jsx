import useApiData from '../hooks/useApiData.js';
import DataState from './DataState.jsx';

function validForecast(forecast) {
  return forecast?.contractVersion === 1 && forecast.regionId === 'NCR'
    && ['mock', 'intelligence'].includes(forecast.source)
    && typeof forecast.sourceLabel === 'string' && forecast.unit === 'units/day'
    && forecast.horizonDays === 7 && Array.isArray(forecast.points) && forecast.points.length === 7
    && forecast.points.every((point, index) => point.day === index + 1 && Number.isFinite(point.value) && point.value >= 0);
}

export default function ForecastPage() {
  const state = useApiData('/forecasts');
  const forecast = state.data.find((item) => item?.regionId === 'NCR');
  const invalid = forecast && !validForecast(forecast);
  const error = state.error || (invalid ? 'Unsupported forecast response. Check the backend forecast contract.' : '');
  const ready = !state.loading && !error && forecast;
  const ceiling = ready ? Math.max(100, Math.ceil(Math.max(...forecast.points.map((point) => point.value)) / 100) * 100) : 100;
  const x = (day) => 65 + (day - 1) * 105;
  const y = (value) => 270 - value / ceiling * 220;
  return <>
    <section className="page-heading"><p className="eyebrow">DEMAND FORECAST · NCR</p><h1>Demand Forecast</h1><p className="page-description">Seven-day demand outlook for the NCR service cluster.</p></section>
    <section className="content-panel">
      <div className="panel-header"><h2>NCR · 7-day forecast</h2><button onClick={state.reload} disabled={state.loading}>Refresh</button></div>
      <DataState {...state} error={error} label="NCR forecast" />
      {!state.loading && !error && !forecast && <p className="data-state" role="status">No NCR forecast is available.</p>}
      {ready && <>
        <div className="forecast-notice"><strong>{forecast.source === 'mock' ? 'MOCK / DEVELOPMENT DATA — not live predictions' : 'Intelligence output'}</strong><p>{forecast.sourceLabel}</p></div>
        <figure className="forecast-chart">
          <svg viewBox="0 0 760 325" role="img" aria-labelledby="forecast-title forecast-description">
            <title id="forecast-title">NCR seven-day demand forecast{forecast.source === 'mock' ? ' — mock fixture' : ''}</title>
            <desc id="forecast-description">{forecast.points.map((point) => `Day ${point.day}: ${point.value} units`).join('; ')}. Forecast only; no historical data shown.</desc>
            {[0, 1, 2, 3, 4].map((tick) => <g key={tick}><line x1="65" x2="695" y1={y(ceiling * tick / 4)} y2={y(ceiling * tick / 4)} stroke="#e0e8eb" /><text x="54" y={y(ceiling * tick / 4) + 4} textAnchor="end">{ceiling * tick / 4}</text></g>)}
            <text x="65" y="24">Demand ({forecast.unit})</text>
            <polyline points={forecast.points.map((point) => `${x(point.day)},${y(point.value)}`).join(' ')} fill="none" stroke="#287d6c" strokeWidth="3" />
            {forecast.points.map((point) => <g key={point.day}><circle cx={x(point.day)} cy={y(point.value)} r="5" fill="#287d6c" /><text x={x(point.day)} y={y(point.value) - 13} textAnchor="middle">{point.value}</text><text x={x(point.day)} y="300" textAnchor="middle">Day {point.day}</text></g>)}
          </svg>
          <figcaption>{forecast.source === 'mock' ? 'Demo forecast fixture' : 'Forecast'} · {forecast.unit} · Day indices, not calendar dates. No historical series shown.</figcaption>
        </figure>
      </>}
    </section>
  </>;
}
