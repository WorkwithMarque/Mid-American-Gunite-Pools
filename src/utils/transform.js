/**
 * Map JobTread job data to Workyard project format
 * @param {Object} jobTreadData - Job data from JobTread
 * @returns {Object} - Formatted data for Workyard project
 */
export function mapJobTreadToWorkyardProject(jobTreadData) {
  return {
    // Use external_id to track the JobTread ID in Workyard
    external_id: jobTreadData.id?.toString() || '',
    
    // Basic project information
    name: jobTreadData.name || jobTreadData.title || '',
    description: jobTreadData.description || '',
    
    // Status mapping
    status: mapStatus(jobTreadData.status),
    
    // Location information
    address: extractAddress(jobTreadData),
    
    // Client information
    client_name: jobTreadData.client?.name || jobTreadData.customer?.name || '',
    
    // Dates
    start_date: jobTreadData.start_date || jobTreadData.startDate || null,
    end_date: jobTreadData.end_date || jobTreadData.endDate || null,
    
    // Additional fields as needed
    // budget: jobTreadData.budget?.amount || 0,
  };
}

/**
 * Map JobTread status to Workyard status
 * @param {string} jobTreadStatus - Status from JobTread
 * @returns {string} - Mapped status for Workyard
 */
export function mapStatus(jobTreadStatus) {
  if (!jobTreadStatus) return 'active'; // Default status
  
  const statusMap = {
    'active': 'active',
    'in_progress': 'active',
    'on_hold': 'on_hold',
    'completed': 'completed',
    'cancelled': 'cancelled',
    // Add other status mappings as needed
  };
  
  return statusMap[jobTreadStatus.toLowerCase()] || 'active';
}

/**
 * Extract address from JobTread data
 * @param {Object} jobTreadData - Job data from JobTread
 * @returns {string} - Formatted address
 */
export function extractAddress(jobTreadData) {
  if (jobTreadData.location?.address) {
    return jobTreadData.location.address;
  }
  
  if (jobTreadData.address) {
    return jobTreadData.address;
  }
  
  // Try to construct address from components if available
  const addressParts = [];
  const location = jobTreadData.location || jobTreadData.site || {};
  
  if (location.street) addressParts.push(location.street);
  if (location.city) addressParts.push(location.city);
  if (location.state) addressParts.push(location.state);
  if (location.zip || location.postal_code) addressParts.push(location.zip || location.postal_code);
  
  return addressParts.join(', ');
}


export function transformData(inputData) {
  return {
    name: inputData.job.name,//inputData.job.name,
    org_customer_id: 196460, // No mapping provided, set to default
    // manager_ids: [], // No mapping provided
    // cost_code_ids: [], // No mapping provided
    // project_group_ids: [], // No mapping provided
    // geofence_ids: [], // No mapping provided
    // locations: [
    //   {       
    //     "name": "Main Street 3",
    //     "latitude": "43.68794949999998",
    //     "longitude": "-79.30171109999998",
    //     "geofence_radius_meters": 8
    //   }
    // ]

    locations: [
      {       
        "name": inputData.location.name,
        "latitude": inputData.location.latitude,
        "longitude": inputData.location.longitude,
        "geofence_radius_meters": 20
      }
    ]
    // google_places: [
    //   {
    //     uuid: inputData.location.id,
    //     name: inputData.location.name,
    //     ext_address_id: inputData.location.id,
    //     geofence_radius_meters: 0.1
    //   }
    // ],
    // locations: [
    //   {
    //     uuid: inputData.location.id,
    //     name: inputData.location.name,
    //     latitude: parseFloat(inputData.location.latitude),
    //     longitude: parseFloat(inputData.location.longitude),
    //     geofence_radius_meters: 0.1
    //   }
    // ],
    // polygon_geofences: [] // No mapping provided
  };
}