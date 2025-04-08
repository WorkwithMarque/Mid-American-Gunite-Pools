import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

import webhookRoutes from './routes/webhooks.js';
import { scheduleHoursSync } from './services/sync.js';
import { syncWorkyardMetricsToJobTread } from './services/cron.js';
import config from './config.js';
import cron from 'node-cron';
import { logToFile } from './utils/logging.js';

// Load environment variables
dotenv.config();

// Create logs directory if it doesn't exist
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/webhook', webhookRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Middleware server running on port ${PORT}`);
  console.log(`Webhook URL: http://your-server-address:${PORT}/webhook/projects`);
  
  // Schedule hours sync if configured
  if (process.env.ENABLE_HOURS_SYNC === 'true') {
    const syncInterval = parseInt(process.env.HOURS_SYNC_INTERVAL || '6', 10);
    scheduleHoursSync(syncInterval);
    console.log(`Automatic hours sync enabled, running every ${syncInterval} hours`);
  }
});

cron.schedule('*/5 * * * *', async () => {
  try {
    logToFile('Running cron job','cron-info');
    await syncWorkyardMetricsToJobTread();
    logToFile('Cron job completed successfully','cron-info');
    console.log('Cron job completed successfully');
  } catch (error) {
    console.error('Error in cron job:', error);
    logToFile(`Error in cron job: ${error.message}`, 'cron-error');
  }

});

export default app;