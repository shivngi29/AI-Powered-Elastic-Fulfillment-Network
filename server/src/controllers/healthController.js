export function getHealth(req, res) {
  res.json({ status: 'ok', service: 'elastic-fulfillment-api' });
}
