import app from './app.js';
import { config } from './config/env.js';

const server = app.listen(config.port, () => {
  console.log(`Elastic Fulfillment API listening on port ${config.port}`);
});

server.on('error', (error) => {
  console.error(`Failed to start API: ${error.message}`);
  process.exitCode = 1;
});
