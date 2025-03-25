import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['WORKYARD_API_KEY', 'WORKYARD_API_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export default {
  workyard: {
    baseUrl: process.env.WORKYARD_API_URL || 'https://api1.workyard.com',
    apiKey: process.env.WORKYARD_API_KEY,
  },
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
  },
  zapier: {
    webhookUrl: process.env.ZAPIER_WEBHOOK_URL || '',
  }
};