import app from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

try {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`Elastic Fulfillment API listening on port ${config.port}`);
  });

  server.on('error', async (error) => {
    console.error(`Failed to start API: ${error.message}`);
    process.exitCode = 1;
    await disconnectDB();
  });
} catch (error) {
  console.error(`Failed to start API: ${error.message}`);
  process.exitCode = 1;
  await disconnectDB();
}
