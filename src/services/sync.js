import workyardClient from '../api/workyard.js';
import { transformData } from '../utils/transform.js';
import { logToFile } from '../utils/logging.js';
import config from '../config.js';
import db from '../db.js'; 
/**
 * Synchronize a JobTread job to Workyard as a project
 * @param {Object} jobTreadData - Job data from JobTread
 * @returns {Object} - Result of the synchronization
 */


async function syncUser(userEmail, userName) {
  try {
    // Log the input data
    await logToFile({ userEmail, userName }, 'sync-user');

    const existingUser = await db('users').where({ email: userEmail }).first();

    if (existingUser) {
      console.log('User already exists:', existingUser);
      await logToFile(`User already exists: ${JSON.stringify(existingUser)}`, 'sync-user');
      return existingUser.workyard_user_id;
    }

    const workyardResponse = await workyardClient.createWorkyardUser(userName);

    if (!workyardResponse || !workyardResponse.id) {
      throw new Error('Failed to create Workyard user');
    }

    const workyardUserId = workyardResponse.id;

    await db('users').insert({
      email: userEmail,
      workyard_user_id: workyardUserId
    });

    console.log('New Workyard user created and synced:', workyardUserId);
    await logToFile(`New Workyard user created and synced: ${workyardUserId}`, 'sync-user');

    return workyardUserId;
  } catch (error) {
    console.error('Error syncing user:', error.message);
    await logToFile(`Error syncing user: ${error.message}`, 'sync-user');
    throw error;
  }
}

export default syncUser;

export async function syncJobToWorkyard(jobTreadData) {
  try {
    // Log the incoming data
    await logToFile(jobTreadData, 'jobtread-job');

    const rawEmail = jobTreadData.account.primaryContact.customFieldValues.Email;

    // Extract email safely
    const userEmail = rawEmail ? rawEmail.replace(/[\[\]']/g, '') : null;

    console.log('email', userEmail);
    // Extract email
    console.log('primaryContact',jobTreadData.account.primaryContact);
    console.log('email',userEmail);
    const userName = jobTreadData.account.primaryContact?.name || jobTreadData.account.name;

    if (!userEmail) {
      throw new Error('No primary contact email found in webhook data');
    }

    const workyardUserId = await syncUser(userEmail, userName);

    const workyardProjectData = transformData(jobTreadData,workyardUserId);
    // workyardProjectData.org_customer_id = workyardUserId; 

    let existingProject = null;
    try {
      // const projects = await workyardClient.getProjects();
      // existingProject = projects.find(p => p.name === workyardProjectData?.job?.name,);
      console.log("Fetching projects...");

      const response = await workyardClient.getProjects(); // Wait for API response
      console.log("API Response:", response);

      const projectsArray = response?.data || []; // Ensure it's an array
      // console.log("Extracted Projects Array:", projectsArray);

      if (!Array.isArray(projectsArray)) {
        console.error("Error: Projects data is not an array!");
        return null;
      }

      console.log("Searching for project with name:", workyardProjectData?.name);

      const existingProject = projectsArray.find(
        (p) => p.name === workyardProjectData?.name
      );

      console.log("Found Project:", existingProject || "No match found");
      } catch (error) {
        console.warn('Could not check for existing projects:', error.message);
      }

    let result;
    if (existingProject) {
      result = await workyardClient.updateExistingProject(existingProject.id, workyardProjectData);
      console.log(`Updated existing project ${existingProject.id} in Workyard`);
    } else {
      result = await workyardClient.createOrUpdateProject(workyardProjectData);
      console.log('Created new project in Workyard');
    }

    return {
      success: true,
      message: existingProject ? 'Project updated in Workyard' : 'Project created in Workyard',
      workyard_project_id: result.id || null,
      data: result
    };
  } catch (error) {
    console.error('Error syncing job to Workyard:', error);
    return {
      success: false,
      message: 'Failed to sync job to Workyard',
      error: error.message
    };
  }
}

/**
 * Synchronize worked hours from Workyard to JobTread
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Object} - Result of the synchronization
 */
export async function syncWorkedHoursToJobTread(startDate, endDate) {
  try {
    // Get date range if not provided
    if (!startDate) {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    
    if (!endDate) {
      endDate = new Date().toISOString().split('T')[0];
    }
    
    // Get worked hours from Workyard
    const workedHours = await workyardClient.getWorkedHours(startDate, endDate);
    console.log(`Retrieved ${workedHours.length} time entries from Workyard`);
    
    // Log the time entries
    await logToFile(workedHours, 'workyard-hours');
    
    // If no Zapier webhook URL is configured, just return the data
    if (!config.zapier.webhookUrl) {
      console.log('No Zapier webhook URL configured for sending time entries');
      return {
        success: true,
        message: 'Retrieved time entries but no webhook URL configured for sending to JobTread',
        count: workedHours.length,
        data: workedHours
      };
    }
    
    // Send to Zapier webhook
    const response = await fetch(config.zapier.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeEntries: workedHours })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error sending data to Zapier: ${errorText}`);
    }
    
    console.log(`Successfully sent ${workedHours.length} time entries to Zapier`);
    
    return {
      success: true,
      message: 'Successfully sent time entries to JobTread via Zapier',
      count: workedHours.length
    };
  } catch (error) {
    console.error('Error syncing worked hours to JobTread:', error);
    return {
      success: false,
      message: 'Failed to sync worked hours to JobTread',
      error: error.message
    };
  }
}

/**
 * Schedule regular sync of worked hours
 * This function can be called to set up a recurring sync
 * @param {number} intervalHours - Hours between syncs
 */
export function scheduleHoursSync(intervalHours = 6) {
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  console.log(`Scheduling worked hours sync every ${intervalHours} hours`);
  
  // Initial sync
  syncWorkedHoursToJobTread().catch(error => {
    console.error('Error in scheduled hours sync:', error);
  });
  
  // Set up recurring sync
  setInterval(() => {
    syncWorkedHoursToJobTread().catch(error => {
      console.error('Error in scheduled hours sync:', error);
    });
  }, intervalMs);
}