// import { writeFile } from 'fs/promises';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const logsDir = path.join(__dirname, '..', '..', 'logs');

// /**
//  * Log data to a file for debugging
//  * @param {Object} data - Data to log
//  * @param {string} prefix - Prefix for the log filename
//  */
// export async function logToFile(data, prefix = 'request') {
//   try {
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const filename = `${prefix}-${timestamp}.json`;
    
//     await writeFile(path.join(logsDir, filename), JSON.stringify(data, null, 2));
//   } catch (error) {
//     console.error('Error writing log file:', error);
//     // Continue execution even if logging fails
//   }
// }

import { appendFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '..', '..', 'logs');
const singleLogFile = path.join(logsDir, 'app.log'); // Define your single log filename

/**
 * Log data to a single file.
 * @param {any} data - Data to log (will be converted to string).
 * @param {string} prefix - Optional prefix for the log entry.
 */
export async function logToFile(data, prefix = '') {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${prefix ? `[${prefix}] ` : ''}${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}\n`;

    // Ensure the logs directory exists
    // await fs.mkdir(logsDir, { recursive: true });

    await appendFile(singleLogFile, logEntry, 'utf8');
  } catch (error) {
    console.error('Error writing to log file:', error);
    // Continue execution even if logging fails
  }
}

// Import the 'fs' module for directory creation
// import * as fs from 'fs/promises';