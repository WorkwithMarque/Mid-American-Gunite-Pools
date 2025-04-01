exports.up = function (knex) {
    return knex.schema.createTable("projects", function (table) {
      table.increments("id").primary();
      table.string("workyard_project_id", 255).notNullable();
      table.string("jobthread_job_id", 255);
      table.string("name", 255); 
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists("projects");
  };
  