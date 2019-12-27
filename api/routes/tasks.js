const uuidv4 = require('uuid/v4');
const knex   = require('./../db');
const e      = require('http-errors');
const v      = require('validator');
const { all, one, val } = require('./../libs/knex-post-process-response');

module.exports = {

	async select(ctx) {

		const statuses = await knex('task_statuses').select().then(all);
		const data     = v.validate(
			{
				search     : v.string({ required: false }),
				manager    : v.number({ required: false, int: true, min: 1 }),
				executor   : v.number({ required: false, int: true, min: 1 }),
				readStatus : v.oneOf({ values: [1, 2] }),
				status     : v.oneOf({ values: statuses.reduce((ar, i) => { if (i.id !== 10) ar.push(i.id); return ar; }, []) })
			},
			ctx.request.body
		);

		const where = (builder) => {

			builder.where('tasks.id_status', data.status);

			if (data.search)   builder.where('tasks.theme', 'like', `$${data.search}$`);
			if (data.manager)  builder.where('tasks.id_manager', data.manager);
			if (data.executor) builder.where('tasks.id_executor', data.executor);

		}

		const [ tasks, total ] = await Promise.all([

			knex('tasks')
				.select(
					'tasks.id',
					'tasks.uuid',
					'tasks.theme',
					{ 'dtt__createdAt'      : 'tasks.created_at' },
					{ 'status__id'          : 'status.id' },
					{ 'status__title'       : 'status.title' },
					{ 'manager__id'         : 'manager.id' },
					{ 'manager__firstName'  : 'manager.first_name' },
					{ 'manager__lastName'   : 'manager.last_name' },
					{ 'executor__id'        : 'executor.id' },
					{ 'executor__firstName' : 'executor.first_name' },
					{ 'executor__lastName'  : 'executor.last_name' },
				)
				.count({ messagesCount: 'messages.id' })
				.innerJoin('task_statuses AS status', 'status.id', 'tasks.id_status')
				.innerJoin('users AS manager', 'manager.id', 'tasks.id_manager')
				.innerJoin('users AS executor', 'executor.id', 'tasks.id_executor')
				.leftJoin('task_messages AS messages', {
					'messages.id_task': 'tasks.id',
					'messages.is_read': 0
				})
				.where(where)
				.having('messagesCount', '>=', data.readStatus === 1 ? 1 : 0)
				.groupBy('tasks.id')
				.then(all),

			knex('tasks')
				.count({ total: '*' })
				.where(where)
				.then(val)

		]);

		ctx.body = { data: tasks, total };

	},

	async create(ctx) {

		const data = v.validate(
			{
				theme    : v.string(),
				executor : v.number({ int: true, min: 1 })
			},
			ctx.request.body
		);

		const uuid = uuidv4();

		await knex('tasks')
			.insert({
				uuid,
				theme       : data.theme,
				id_manager  : ctx.state.user.id,
				id_executor : data.executor,
				id_status   : 10
			});

		ctx.body = { uuid };

	},

	async complete(ctx) {

		const { id } = v.validate(
			{ id: v.number({ int: true, min: 1 }) },
			ctx.request.body
		);

		const { idManager, idExecutor } = await knex('tasks').select('id_manager', 'id_executor').where({ id }).then(one);
		if (ctx.state.user.id !== idManager) throw e.forbidden();

		await Promise.all([
			knex('tasks').update({ 'id_status': 30 }).where({ id }),
			knex('task_messages').insert({
				id_user : 1,
				is_read : 1,
				id_task : id,
				body    : 'Статус изменен на "Архив"'
			})
		]);

		ctx.body = {};

	},

	async restore(ctx) {

		const { id } = v.validate(
			{ id: v.number({ int: true, min: 1 }) },
			ctx.request.body
		);

		const { idManager, idExecutor } = await knex('tasks').select('id_manager', 'id_executor').where({ id }).then(one);
		if (ctx.state.user.id !== idManager) throw e.forbidden();

		await Promise.all([
			knex('tasks').update({ 'id_status': 20 }).where({ id }),
			knex('task_messages').insert({
				id_user : 1,
				is_read : 1,
				id_task : id,
				body    : 'Статус изменен на "В работе"'
			})
		]);

		ctx.body = {};

	},

	async selectUsers(ctx) {

		const { search } = v.validate(
			{ search: v.string() },
			ctx.request.body
		);

		ctx.body = await knex('users')
			.select('id', 'first_name', 'last_name')
			.where((builder) => {

				builder.where('deleted', 0);
				builder.where('id', '!=',  ctx.state.user.id);

				builder.where('login', 'like', `%${search}%`)
					.orWhere('first_name', 'like', `%${search}%`)
					.orWhere('last_name', 'like', `%${search}%`);

			})
			.limit(10)
			.then(all);

	},

	async allStatuses(ctx) {
		ctx.body = await knex('task_statuses').select();
	},

	async allMessages(ctx) {

		const { uuid } = v.validate(
			{ uuid: v.uuid() },
			ctx.request.body
		);

		const task = await knex('tasks')
			.select(
				'tasks.id',
				'tasks.uuid',
				'tasks.theme',
				{ 'dtt__createdAt'      : 'tasks.created_at' },
				{ 'status__id'          : 'status.id' },
				{ 'status__title'       : 'status.title' },
				{ 'manager__id'         : 'manager.id' },
				{ 'manager__firstName'  : 'manager.first_name' },
				{ 'manager__lastName'   : 'manager.last_name' },
				{ 'executor__id'        : 'executor.id' },
				{ 'executor__firstName' : 'executor.first_name' },
				{ 'executor__lastName'  : 'executor.last_name' },
			)
			.innerJoin('task_statuses AS status', 'status.id', 'tasks.id_status')
			.innerJoin('users AS manager', 'manager.id', 'tasks.id_manager')
			.innerJoin('users AS executor', 'executor.id', 'tasks.id_executor')
			.where('tasks.uuid', uuid).then(one);

		if (!task) throw e.notFound();

		const messages = await knex('task_messages')
			.select(
				'id',
				{ 'idUser'         : 'id_user' },
				{ 'dtt__createdAt' : 'created_at' },
				{ 'bool__isRead'   : 'is_read' },
				{ 'message'        : 'body' }
			)
			.where('id_task', task.id)
			.orderBy('created_at')
			.then(all);

		ctx.body = { ...task, messages };

	},

	async updateMessages(ctx) {

		const { idTask, idLastMsg } = v.validate(
			{
				idTask    : v.number({ int: true, min: 1 }),
				idLastMsg : v.number({ int: true, min: 1, required: false })
			},
			ctx.request.body
		);

		const messages = await knex('task_messages')
			.select(
				'id',
				{ 'idUser'         : 'id_user' },
				{ 'dtt__createdAt' : 'created_at' },
				{ 'message'        : 'body' }
			)
			.where((builder) => {
				builder.where('id_task', idTask);
				if (idLastMsg) builder.where('id', '>', idLastMsg);
			})
			.orderBy('id')
			.then(all);

		ctx.body = messages;

	},

	async createMessage(ctx) {

		const data = v.validate(
			{
				id      : v.number({ int: true, min: 1 }),
				message : v.string()
			},
			ctx.request.body
		);

		const task = await knex('tasks')
			.select('id_status', 'id_manager', 'id_executor')
			.where('id', data.id)
			.then(one);

		if (!task) throw e.notFound();
		if (task.idStatus === 30) throw e.badData('bbb');
		if (![task.idManager, task.idExecutor].includes(ctx.state.user.id)) throw e.forbidden();

		await knex('task_messages').insert({
			id_task : data.id,
			id_user : ctx.state.user.id,
			body    : data.message
		});

		if (task.idStatus === 10) await knex('tasks').update({ id_status: 20 }).where('id', data.id);

		ctx.body = {};

	},

	async readMessage(ctx) {

		const { id } = v.validate(
			{ id: v.number({ int: true, min: 1 }) },
			ctx.request.body
		);

		await knex('task_messages').update({ 'is_read': 1 }).where({ id });

		ctx.body = {};

	}

}