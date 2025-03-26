import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WORKYARD_API_URL = 'https://api.workyard.com';  // Change this to the actual API

export const createWorkyardUser = async (email, name) => {
  try {
    const response = await axios.post(`${WORKYARD_API_URL}/users`, {
      email,
      name,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.WORKYARD_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.id;  // Workyard returns user_id
  } catch (error) {
    console.error('Error creating Workyard user:', error.response?.data || error.message);
    throw new Error('Failed to create Workyard user');
  }
};
