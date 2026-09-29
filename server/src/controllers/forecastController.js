import { getForecasts } from '../services/mockForecastService.js';

export function getForecast(req, res) {
  res.json({ data: getForecasts() });
}
