// DEVELOPMENT FIXTURE ONLY. No forecasting algorithm or Chronos integration.
const demoValues = [327, 274, 269, 284, 319, 386, 413];

export function getForecasts() {
  return [{
    contractVersion: 1,
    regionId: 'NCR',
    source: 'mock',
    sourceLabel: 'Development fixture from observed NCR prototype values; not live predictions.',
    unit: 'units/day',
    horizonDays: 7,
    generatedAt: null,
    points: demoValues.map((value, index) => ({ day: index + 1, date: null, value })),
  }];
}
