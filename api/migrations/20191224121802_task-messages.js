exports.up = async (knex) => {

	await knex.schema.createTable('task_messages', (t) => {

		t.increments('id').primary();
		t.integer('id_task').unsigned().notNull();
		t.integer('id_user').unsigned().notNull();
		t.text('body').notNull();
		t.integer('is_read').defaultTo(0);
		t.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));

		t.foreign('id_task').references('tasks.id');
		t.foreign('id_user').references('users.id');

	});

	await knex.raw(`
		CREATE TRIGGER task_messages_before_insert BEFORE INSERT ON task_messages
		FOR EACH ROW BEGIN
			SET NEW.created_at = NOW(6);
		END
	`);

}

exports.down = (knex) => knex.schema.dropTable('task_messages');