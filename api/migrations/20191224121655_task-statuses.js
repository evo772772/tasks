exports.up = async (knex) => {

	await knex.schema.createTable('task_statuses', (t) => {

		t.increments('id').primary();
		t.string('title').notNull();

	});

	await knex.batchInsert(
		'task_statuses',
		[
			{ id: 10, title: 'Проект' },
			{ id: 20, title: 'В работе' },
			{ id: 30, title: 'Архив' }
		]
	);

}

exports.down = (knex) => knex.schema.dropTable('task_statuses');