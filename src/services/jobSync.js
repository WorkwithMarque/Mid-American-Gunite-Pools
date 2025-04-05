import axios from 'axios';
import { syncJobToWorkyard } from './sync';
import config from '../config';
import { logToFile } from '../utils/logging';


const JOBTREAD_ENDPOINT = config.jobTread.endpoint;
const GRANT_KEY = config.jobTread.grantKey;
const ORGANIZATION_ID = config.jobTread.orgId;

const RATE_LIMIT_DELAY_MS = 1000; // 1 request/sec
const RETRY_LIMIT = 3;

/**
 * Utility to wait (delay) for specified ms
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate JobTread JSON query
 */
function buildJobQuery(pageToken = null, size = 10) {
  return {
    "$": {
      "grantKey": GRANT_KEY
    },
    "organization": {
      "$": {
        "id": ORGANIZATION_ID
      },
      "id": {},
      "jobs": {
        "$": {
          "size": size,
          "page": pageToken
        },
        "nextPage": {},
        "previousPage": {},
        "nodes": {
          "id": {},
          "name": {},
          "location": {
            "id": {},
            "name": {},
            "latitude": {},
            "longitude": {}
          }
        }
      }
    }
  };
}

/**
 * Fetch a batch of jobs from JobTread
 */
async function fetchJobBatch(pageToken = null, size = 10) {
  const body = buildJobQuery(pageToken, size);

  try {
    const response = await axios.post(JOBTREAD_ENDPOINT, body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const jobData = response.data?.organization?.jobs || {};
    return {
      jobs: jobData.nodes || [],
      nextPage: jobData.nextPage || null
    };
  } catch (error) {
    console.error('Failed to fetch jobs:', error.message);
    throw error;
  }
}

/**
 * Process and sync one job with retries
 */
async function processJobWithRetry(job, attempt = 1) {
  try {
    const result = await syncJobToWorkyard(job);
    console.log(` Synced job: ${job.name} (${job.id}) - ${result.message}`);
    logToFile(` Synced job: ${job.name} (${job.id}) - ${result.message}`, 'job-sync-backward');
  } catch (error) {
    console.warn(`Error syncing job "${job.name}" on attempt ${attempt}: ${error.message}`);
    logToFile(`Error syncing job "${job.name}" on attempt ${attempt}: ${error.message}`, 'job-sync-backward');

    if (attempt < RETRY_LIMIT) {
      const backoffTime = 1000 * Math.pow(2, attempt);
      console.log(` Retrying in ${backoffTime}ms...`);
      logToFile(` Retrying in ${backoffTime}ms...`, 'job-sync-backward');
      await delay(backoffTime);
      await processJobWithRetry(job, attempt + 1);
    } else {
      console.error(`Failed to sync job "${job.name}" after ${RETRY_LIMIT} attempts.`);
      logToFile(`Failed to sync job "${job.name}" after ${RETRY_LIMIT} attempts.`, 'job-sync-backward');
    }
  }
}

/**
 * Main function to fetch and sync all jobs
 */
export async function syncAllJobs() {
  let pageToken = null;
  let pageCount = 1;

  console.log(`Starting JobTread sync to Workyard...`);
  logToFile(`Starting JobTread sync to Workyard...`, 'job-sync-backward');

  while (true) {
    console.log(` Fetching page ${pageCount}...`);
    logToFile(` Fetching page ${pageCount}...`, 'job-sync-backward');
    const { jobs, nextPage } = await fetchJobBatch(pageToken, 10);

    if (!jobs.length) {
      console.log('No more jobs to process.');
      break;
    }

    for (const job of jobs) {
      await processJobWithRetry(job);
      await delay(RATE_LIMIT_DELAY_MS); // respect rate limit
    }

    if (!nextPage) break;
    pageToken = nextPage;
    pageCount++;
  }

  console.log(' Finished syncing all jobs.');
  logToFile(' Finished syncing all jobs.', 'job-sync-backward');
}

syncAllJobs();
