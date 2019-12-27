exports.up = async (knex) => {

	await knex.schema.createTable('user_roles', (t) => {
		t.increments('id').unsigned().primary();
		t.string('title').notNull();
	});

	await knex('user_roles').insert('user_roles').insert([
		{ id: 1, title: 'Администратор' },
		{ id: 2, title: 'Пользователь' }
	]);

}

exports.down = (knex) => knex.schema.dropTable('user_roles');