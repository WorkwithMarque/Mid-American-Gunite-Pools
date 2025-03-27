exports.up = function (knex) {
    return knex.schema.createTable("users", function (table) {
      table.increments("id").primary();
      table.string("email", 255).unique().notNullable();
      table.string("workyard_user_id", 255).notNullable();
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists("users");
  };
  