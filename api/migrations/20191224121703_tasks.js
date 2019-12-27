exports.up = async (knex) => {

	await knex.schema.createTable('tasks', (t) => {

		t.increments('id').primary();
		t.uuid('uuid').notNull();
		t.integer('id_manager').unsigned().notNull();
		t.integer('id_executor').unsigned().notNull();
		t.integer('id_status').unsigned().notNull();
		t.string('theme').notNull();
		t.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));

		t.foreign('id_manager').references('users.id');
		t.foreign('id_executor').references('users.id');
		t.foreign('id_status').references('task_statuses.id');
		t.unique('uuid');

	});

	await knex.raw(`
		CREATE TRIGGER tasks_before_insert BEFORE INSERT ON tasks
		FOR EACH ROW BEGIN
			SET NEW.created_at = NOW(6);
		END
	`);

}

exports.down = (knex) => knex.schema.dropTable('tasks');