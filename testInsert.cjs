// const knex = require('knex')({
//     client: 'sqlite3',
//     connection: {
//       filename: './dev.sqlite3', // Change this if your database file is in a different location
//     },
//     useNullAsDefault: true,

import config from './src/config';

//   });
  const knex = require('knex')({
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
  });
  async function testInsert() {
    try {
      // Insert a test project
      const result = await knex('projects').insert({
        workyard_project_id: 'WY12345',
        jobthread_job_id: 'JT67890',
        name: 'Test Project',
      });
  
      console.log('✅ Insert successful! Inserted ID:', result);
      
      // Fetch and display the inserted record
      const insertedRecord = await knex('projects').where('workyard_project_id', 'WY12345').first();
      console.log('📝 Retrieved Record:', insertedRecord);
  
    } catch (error) {
      console.error('❌ Insert failed:', error.message);
    } finally {
      // Close the database connection
      await knex.destroy();
    }
  }
  
  testInsert();
  