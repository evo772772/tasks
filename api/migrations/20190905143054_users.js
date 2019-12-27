const crypto = require('crypto');
const config = require('./../config');

exports.up = async (knex) => {

	await knex.schema.createTable('users', (t) => {

		t.increments('id').primary();
		t.integer('id_role').unsigned().notNull();
		t.string('login').notNull();
		t.string('password').notNull();
		t.string('first_name').notNull();
		t.string('last_name').notNull();
		t.integer('deleted').notNull().defaultTo(0);
		t.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
		t.datetime('updated_at', { precision: 6 }).defaultTo(knex.fn.now(6));

		t.foreign('id_role').references('user_roles.id');
		t.unique('login');

	});

	await knex.raw(`
		CREATE TRIGGER users_before_insert BEFORE INSERT ON users
		FOR EACH ROW BEGIN
			SET NEW.created_at = NOW(6);
			SET NEW.updated_at = NOW(6);
		END
	`);

	await knex.raw(`
		CREATE TRIGGER users_before_update BEFORE UPDATE ON users
		FOR EACH ROW BEGIN
			SET NEW.updated_at = NOW(6);
		END
	`);

	const hmac = crypto.createHmac('sha256', config.session.salt);
	const password = hmac.update('z').digest('hex');

	await knex.batchInsert(
		'users',
		[
			{ id_role: 1, login: 'system', password: '', first_name: 'System', last_name: 'Process' },
			{ id_role: 1, login: 'admin',  password, first_name: 'Администратор', last_name: 'Администратор' }
		]
	);

}

exports.down = (knex) => knex.schema.dropTable('users');