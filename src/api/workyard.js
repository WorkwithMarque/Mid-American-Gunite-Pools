import config from '../config.js';
import axios from 'axios';

class WorkyardClient {
  constructor() {
    this.baseUrl = config.workyard.baseUrl;
    this.apiKey = config.workyard.apiKey;
    this.orgId = config.workyard.orgId;
  }

  async request(endpoint, method = 'GET', data = null, timeout = 10000) { // 10s timeout
    const url = `${this.baseUrl}${endpoint}`;

    const options = {
        method,
        url,
        headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        timeout, // Set timeout in milliseconds
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        options.data = data;
    }

    try {
      console.log(`Making request to ${url} with data:`, data);
      const response = await axios(options);
      console.log(`Workyard API response:`, response.data);
      return response.data;
  
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error(`Request to ${endpoint} timed out after ${timeout / 1000}s`);
            throw new Error(`Request to ${endpoint} timed out`);
        } else if (error.response) {
            console.error(`Workyard API error (${error.response.status}):`, error.response.data);
            throw new Error(`Workyard API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`Error in Workyard API request to ${endpoint}:`, error.message);
            throw error;
        }
    }
}


  // async request(endpoint, method = 'GET', data = null) {
  //   const url = `${this.baseUrl}${endpoint}`;
  //   const headers = {
  //     'Authorization': `Bearer ${this.apiKey}`,
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json'
  //   };

  //   const options = {
  //     method,
  //     headers
  //   };

  //   if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
  //     options.body = JSON.stringify(data);
  //   }

  //   try {
  //     const response = await fetch(url, options);
      
  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       throw new Error(`Workyard API error (${response.status}): ${errorText}`);
  //     }
      
  //     return await response.json();
  //   } catch (error) {
  //     console.error(`Error in Workyard API request to ${endpoint}:`, error);
  //     throw error;
  //   }
  // }

  async createOrUpdateProject(projectData) {
    return this.request(`/orgs/${this.orgId}/projects`, 'POST', projectData);
  }

  async updateExistingProject(projectId, projectData) {
    return this.request(`/orgs/${this.orgId}/projects/${projectId}`, 'PUT', projectData);
  }

  async getProjects() {
    return this.request(`/orgs/${this.orgId}/projects`);
  }

  async getProjectById(projectId) {
    if (!projectId) throw new Error("Project ID is required");
  
    const endpoint = `/orgs/${this.orgId}/projects?id=eq:${projectId}&include_computed_totals=true`;
    const response = await this.request(endpoint, 'GET');
    // response = response.data
    // console.log('get project by id data',response.data);
    // The response is an array, so return the first item
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0];
    } else {
      throw new Error(`Project with ID ${projectId} not found`);
    }
  }
  
  async getWorkedHours(startDate, endDate) {
    return this.request(`/time-entries?start_date=${startDate}&end_date=${endDate}`);
  }

  async  createWorkyardUser( name){
    const userData = {
      name,
    }
    return this.request(`/orgs/${this.orgId}/customers`, 'POST', userData);
  };
}

export default new WorkyardClient();