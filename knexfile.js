import { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    },
    pool: { min: 2, max: 10 },
    migrations: {
      tableName: 'knex_migrations',
      directory: `${__dirname}/migrations`
    }
  }

};
// const { dirname } = require('path');
// const { fileURLToPath } = require('url');
// const dotenv = require('dotenv');
// const config = require('./src/config');

// // Load environment variables
// // dotenv.config();

// const __dirname = dirname(fileURLToPath(import.meta.url));

// module.exports = {
//   development: {
//     client: 'sqlite3',
//     connection: {
//       filename: './dev.sqlite3'
//     },
//     useNullAsDefault: true,
//     migrations: {
//       tableName: 'knex_migrations',
//       directory: `${__dirname}/migrations`
//     }
//   },
//   production: {
//     client: 'mysql2',
//     connection: {
//       host: config.mysql.host,
//       database: config.mysql.database,
//       user: config.mysql.user,
//       password: config.mysql.password,
//       port: config.mysql.port
//     },
//     pool: { min: 2, max: 10 },
//     migrations: {
//       tableName: 'knex_migrations',
//       directory: `${__dirname}/migrations`
//     }
//   }
// };
