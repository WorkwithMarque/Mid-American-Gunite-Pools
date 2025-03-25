import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '..', '..', 'logs');

/**
 * Log data to a file for debugging
 * @param {Object} data - Data to log
 * @param {string} prefix - Prefix for the log filename
 */
export async function logToFile(data, prefix = 'request') {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${prefix}-${timestamp}.json`;
    
    await writeFile(path.join(logsDir, filename), JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing log file:', error);
    // Continue execution even if logging fails
  }
}