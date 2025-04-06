import { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import config from './src/config';

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true, // Required for SQLite
    migrations: {
      tableName: 'knex_migrations',
      directory: `${__dirname}/migrations`
    }
  },

  // production: {
  //   client: 'sqlite3',
  //   connection: {
  //     filename: './dev.sqlite3'
  //   },
  //   useNullAsDefault: true, // Required for SQLite
  //   migrations: {
  //     tableName: 'knex_migrations',
  //     directory: `${__dirname}/migrations`
  //   }
  // },

  // staging: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'american',
  //     user: 'user',
  //     password: 'password'
  //   },
  //   pool: { min: 2, max: 10 },
  //   migrations: {
  //     tableName: 'knex_migrations',
  //     directory: `${__dirname}/migrations`
  //   }
  // },

  production: {
    client: 'mysql2',
    connection: {
      host: config.mysql.host,
      database: config.mysql.database,
      user: config.mysql.user,
      password: config.mysql.password,
      port: config.mysql.port
    },
    pool: { min: 2, max: 10 },
    migrations: {
      tableName: 'knex_migrations',
      directory: `${__dirname}/migrations`
    }
  }

};
