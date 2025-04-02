import workyardClient from '../api/workyard.js';
import db from '../db.js'; 
import axios from 'axios';
import { formatDuration, formatPay, convertMetersToMiles } from './sync.js'; // from earlier
import config from '../config.js';

// const workyardClient = new workyardClient();

const customFieldMap = {
    time: '22P7N26yTY7E',   
    pay: '22P7N2FRXgsN',    
    miles: '22P7N2JVBpNA',  
    travel: '22P7N2NMGu8D'  
};

const grantKey = config.jobTread.grantKey;

// async function syncWorkyardMetricsToJobTread() {
//   console.log('🔄 Running Workyard → JobTread sync task...');

//   try {
//     const allProjects = await workyardClient.request(`/orgs/${workyardClient.orgId}/projects`, 'GET');

//     for (const project of allProjects) {
//       const { id: workyardProjectId } = project;

//       // Get corresponding JobThread job ID from DB
//       const localProject = await db('projects').where({ workyard_project_id: workyardProjectId.toString() }).first();
//       if (!localProject || !localProject.jobthread_job_id) {
//         console.log(`⚠️ Skipping project ${workyardProjectId} — no matching JobThread job found.`);
//         continue;
//       }

//       const formattedMetrics = {
//         [customFieldMap.time]: formatDuration(project.total_time_allocated_secs),
//         [customFieldMap.pay]: formatPay(project.total_pay_allocated),
//         [customFieldMap.miles]: convertMetersToMiles(project.total_mileage_assigned_meters),
//         [customFieldMap.travel]: formatDuration(project.total_travel_duration_secs)
//       };

//       const payload = {
//         query: {
//           $: { grantKey },
//           updateJob: {
//             $: {
//               id: localProject.jobthread_job_id,
//               customFieldValues: formattedMetrics
//             },
//             job: {
//               $: { id: localProject.jobthread_job_id },
//               id: {},
//               name: {},
//               customFieldValues: {
//                 $: { size: 25 },
//                 nodes: {
//                   id: {},
//                   value: {},
//                   customField: { id: {} }
//                 }
//               }
//             }
//           }
//         }
//       };

//       try {
//         const res = await axios.post('https://api.jobtread.com/pave', payload, {
//           headers: { 'Content-Type': 'application/json' }
//         });

//         console.log(`✅ Synced job ${localProject.jobthread_job_id}:`, res.data);
//       } catch (err) {
//         console.error(`❌ Error updating job ${localProject.jobthread_job_id}:`, err.response?.data || err.message);
//       }
//     }

//   } catch (error) {
//     console.error('❌ Failed to sync metrics:', error.message);
//   }
// }


export async function syncWorkyardMetricsToJobTread() {
    console.log('🔄 Running Workyard → JobTread sync task...');
    
    let page = 323;
    const limit = 1; // Adjust if needed
    let totalPages = 324;
  
    try {
      do {
        const response = await workyardClient.request(
          `/orgs/${workyardClient.orgId}/projects?limit=${limit}&page=${page}`,
          'GET'
        );
  
        const allProjects = response.data;
        // totalPages = response.meta?.last_page || 1; // Extract total pages from metadata
  
        for (const project of allProjects) {
          const { id: workyardProjectId } = project;
  
          // Get corresponding JobThread job ID from DB
          const localProject = await db('projects')
            .where({ workyard_project_id: workyardProjectId.toString() })
            .first();
  
          if (!localProject || !localProject.jobthread_job_id) {
            console.log(`Skipping project ${workyardProjectId} — no matching JobThread job found.`);
            continue;
          }
  
          const formattedMetrics = {
            [customFieldMap.time]: formatDuration(project.total_time_allocated_secs),
            [customFieldMap.pay]: formatPay(project.total_pay_allocated),
            [customFieldMap.miles]: convertMetersToMiles(project.total_mileage_assigned_meters),
            [customFieldMap.travel]: formatDuration(project.total_travel_duration_secs),
          };
  
          const payload = {
            query: {
              $: { grantKey },
              updateJob: {
                $: {
                  id: localProject.jobthread_job_id,
                  customFieldValues: formattedMetrics,
                },
                job: {
                  $: { id: localProject.jobthread_job_id },
                  id: {},
                  name: {},
                  customFieldValues: {
                    $: { size: 25 },
                    nodes: { id: {}, value: {}, customField: { id: {} } },
                  },
                },
              },
            },
          };
  
          try {
            const res = await axios.post('https://api.jobtread.com/pave', payload, {
              headers: { 'Content-Type': 'application/json' },
            });
  
            console.log(`Synced job ${localProject.jobthread_job_id}:`, res.data);
          } catch (err) {
            console.error(`Error updating job ${localProject.jobthread_job_id}:`, err.response?.data || err.message);
          }
        }
  
        page++; // Move to the next page
      } while (page <= totalPages);
  
    } catch (error) {
      console.error(' Failed to sync metrics:', error.message);
    }
  }
  