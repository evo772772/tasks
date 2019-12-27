exports.up = async (knex) => {

	await knex.schema.createTable('sessions', (t) => {

		t.string('token').primary();
		t.string('fingerprint').notNull();
		t.integer('id_user').unsigned().notNull();
		t.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
		t.datetime('updated_at', { precision: 6 }).defaultTo(knex.fn.now(6));
		t.integer('deleted').defaultTo(0);

		t.index(['fingerprint', 'id_user']);
		t.foreign('id_user').references('users.id');

	});

	await knex.raw(`
		CREATE TRIGGER sessions_before_insert BEFORE INSERT ON sessions
		FOR EACH ROW BEGIN
			SET NEW.created_at = NOW(6);
			SET NEW.updated_at = NOW(6);
		END
	`);

	await knex.raw(`
		CREATE TRIGGER sessions_before_update BEFORE UPDATE ON sessions
		FOR EACH ROW BEGIN
			SET NEW.updated_at = NOW(6);
		END
	`);

}

exports.down = (knex) => knex.schema.dropTable('sessions');