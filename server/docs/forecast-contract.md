# Forecast contract v1

`GET /api/forecasts` returns `{ "data": [forecast, ...] }`; an empty array means
no forecast is available. Errors use the existing API error middleware.

Each forecast has:

- `contractVersion`: integer `1`.
- `regionId`: service-cluster identifier; currently `NCR`.
- `source`: `mock` for fixtures; `intelligence` reserved for future actual output.
- `sourceLabel`: human-readable provenance, displayed by the frontend.
- `unit`: `units/day` (normalized synthetic-network daily demand).
- `horizonDays`: `7` for this seven-day view.
- `generatedAt`: ISO timestamp or null if unknown. Never use request time as model-run time.
- `points`: seven ordered `{ day, date, value }` entries. Day is 1–7; date is an
  ISO calendar date or null; value is a finite nonnegative number.

The current source is exclusively `src/services/mockForecastService.js`.
Values are the user-supplied NCR prototype fixture, not a new model run.
No historical observations, forecast dates, confidence bands, or freshness
claims are fabricated. This temporary endpoint always identifies itself as mock.

A future intelligence adapter can replace the service while preserving the
contract, changing source/provenance and filling timestamps only when known.
It must supply normalized values in the stated units; raw M5 volumes must not
silently replace normalized demand. No intelligence integration exists yet.
