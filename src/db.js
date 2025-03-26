
import knex from 'knex';
import config from '../knexfile.js';

const environment = process.env.NODE_ENV || 'development'; // Use 'development' by default
const db = knex(config[environment]);

export default db;
