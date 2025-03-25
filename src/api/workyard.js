import config from '../config.js';

class WorkyardClient {
  constructor() {
    this.baseUrl = config.workyard.baseUrl;
    this.apiKey = config.workyard.apiKey;
  }

  async request(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const options = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Workyard API error (${response.status}): ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in Workyard API request to ${endpoint}:`, error);
      throw error;
    }
  }

  async createOrUpdateProject(projectData) {
    return this.request('/v1/projects', 'POST', projectData);
  }

  async updateExistingProject(projectId, projectData) {
    return this.request(`/v1/projects/${projectId}`, 'PUT', projectData);
  }

  async getProjects() {
    return this.request('/v1/projects');
  }

  async getWorkedHours(startDate, endDate) {
    return this.request(`/v1/time-entries?start_date=${startDate}&end_date=${endDate}`);
  }
}

export default new WorkyardClient();