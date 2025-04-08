import express from 'express';
import { syncJobToWorkyard, syncWorkedHoursToJobTread,syncMetricsToJobTread } from '../services/sync.js';
import { syncWorkyardMetricsToJobTread } from '../services/cron.js';
import config from '../config.js';

const router = express.Router();

// Webhook endpoint to receive job data from Zapier
router.post('/projects', async (req, res) => {
  try {
    console.log('Received webhook from Zapier with JobTread job data');
    
    // Use the sync service to handle the job data
    const result = await syncJobToWorkyard(req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Log the error but don't expose internal details
    res.status(500).json({
      success: false,
      message: 'Error processing project data',
      error: config.server.environment === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Endpoint to manually trigger time entries sync
router.post('/hours', async (req, res) => {
  try {
    console.log('Manual trigger of worked hours sync');
    
    const { start_date, end_date } = req.body;
    
    // Use the sync service to handle the hours sync
    const result = await syncWorkedHoursToJobTread(start_date, end_date);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error processing hours sync:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error syncing worked hours',
      error: config.server.environment === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.post('/sync-metrics', async (req, res) => {
  try {
    console.log('Manual trigger of metrics sync');
    
    const { workyardProjectId, jobTreadJobId } = req.body;
    console.log("Workyard Project ID:", workyardProjectId);
    console.log("JobTread Job ID:", jobTreadJobId);
    // Use the sync service to handle the hours sync
    const result = await syncMetricsToJobTread(workyardProjectId, jobTreadJobId);
    
    if (res.status(200)) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error processing metrics sync:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error syncing metrics',
      error: config.server.environment === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.post('/sync-all-projects', async (req, res) => {
  try {
    console.log('Manual trigger of all projects sync');
    
    // Use the sync service to handle the hours sync
    const result = await syncWorkyardMetricsToJobTread()
    
    if (res.status(200)) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error processing hours sync:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error syncing worked hours',
      error: config.server.environment === 'development' ? error.message : 'Internal server error'
    });
  }
});


router.post('/sync-all-metrics', async (req, res) => {

  try {
    console.log('Manual trigger of all metrics sync');
    
    // Use the sync service to handle the hours sync
    const result = await syncWorkyardMetricsToJobTread()
    
    if (res.status(200)) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error processing hours sync:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error syncing worked hours',
      error: config.server.environment === 'development' ? error.message : 'Internal server error'
    });
  }
});
export default router;