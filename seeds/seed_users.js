export function seed(knex) {
  return knex('users').del() // Deletes existing data
    .then(() => {
      return knex('users').insert([
        { email: 'test@example.com', workyard_user_id: '12345' }
      ]);
    });
}
