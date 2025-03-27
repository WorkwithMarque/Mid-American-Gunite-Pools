import { dirname } from 'path';
import { fileURLToPath } from 'url';

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

  production: {
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

  // production: {
  //   client: 'mysql2',
  //   connection: {
  //     host: process.env.DB_HOST,
  //     database: process.env.DB_NAME,
  //     user: process.env.DB_USER,
  //     password: process.env.DB_PASSWORD,
  //     port: process.env.DB_PORT || 3306
  //   },
  //   pool: { min: 2, max: 10 },
  //   migrations: {
  //     tableName: 'knex_migrations',
  //     directory: `${__dirname}/migrations`
  //   }
  // }

};
