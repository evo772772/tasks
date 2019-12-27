const crypto = require('crypto');
const config = require('./../config');
const knex   = require('./../db');
const { all, one } = require('./../libs/knex-post-process-response');
const e = require('http-errors');
const v = require('validator');

const get = async (id) => {

	const data = await knex('users')
		.select(
			'users.id',
			'users.login',
			'users.first_name',
			'users.last_name',
			{ 'dtt__createdAt' : 'users.created_at' },
			{ 'dtt__updatedAt' : 'users.updated_at' },
			{ role__id      : 'user_roles.id' },
			{ role__title   : 'user_roles.title' },
			{ bool__deleted : 'users.deleted' }
		)
		.innerJoin('user_roles', 'user_roles.id', 'users.id_role')
		.where({ 'users.id': id, 'users.deleted': 0 })
		.then(one);

	if (!data) throw e.notFound();

	return data;

}

module.exports = {

	async select(ctx) {

		const roles = await knex('user_roles').select();

		let { page, filter } = v.validate(
			{
				page   : v.number({ int: true, min: 1 }),
				filter : {
					search : v.string({ required: false }),
					role   : v.oneOf({ required: false, values: roles.map(i => i.id) }),
					show   : v.oneOf({ required: false, values: [1, 2, 3] })
				}
			},
			ctx.request.body
		);

		const offset = page * config.limit - config.limit;

		const where = (builder) => {

			if (filter.role) builder.where('id_role', filter.role);

			if (filter.show === 1) builder.where('deleted', 0);
			if (filter.show === 2) builder.where('deleted', 1);

			if (filter.search) builder.where('login', 'like', `%${filter.search}%`)
				.orWhere('first_name', 'like', `%${filter.search}%`)
				.orWhere('last_name', 'like', `%${filter.search}%`);

			return builder;

		}

		const [ users, total ] = await Promise.all([

			knex('users')
				.select(
					'users.id',
					'users.login',
					'users.first_name',
					'users.last_name',
					{ 'dtt__createdAt' : 'users.created_at' },
					{ 'dtt__updatedAt' : 'users.updated_at' },
					{ role__id      : 'user_roles.id' },
					{ role__title   : 'user_roles.title' },
					{ bool__deleted : 'users.deleted' }
				)
				.innerJoin('user_roles', 'user_roles.id', 'users.id_role')
				.where(where)
				.limit(config.limit)
				.offset(offset)
				.then(all),

			knex('users')
				.count({ total: '*' })
				.innerJoin('user_roles', 'user_roles.id', 'users.id_role')
				.where(where)
				.then(one)

		]);

		ctx.body = { data: users, ...total };

	},

	async get(ctx) {

		let { id } = v.validate(
			{ id: v.number({ int: true, min: 1 }) },
			ctx.request.body
		);

		ctx.body = await get(id);

	},

	async create(ctx) {

		if (!ctx.state.user.isAdmin) throw e.forbidden('Доступ запрещен');

		const roles = await knex('user_roles').select();
		const data  = v.validate(
			{
				role      : v.oneOf({ values: roles.map(i => i.id) }),
				login     : v.string(),
				firstName : v.string(),
				lastName  : v.string(),
				password  : v.string()
			},
			ctx.request.body
		);

		const hmac = crypto.createHmac('sha256', config.session.salt);
		const password = hmac.update(data.password).digest('hex');

		let id;

		try {

			id = await knex('users')
				.returning('id')
				.insert({
					id_role    : data.role,
					login      : data.login,
					first_name : data.firstName,
					last_name  : data.lastName,
					password
				});

		} catch(err) {
			throw (err.code === 'ER_DUP_ENTRY') ? e.badData(null, { fields: { login: 'Пользователь с таким логином уже существует' } }) : err;
		}

		ctx.body = await get(id[0]);

	},

	async update(ctx) {

		const isAdmin = ctx.state.user.isAdmin;
		const roles   = await knex('user_roles').select('*');
		const data    = v.validate(
			{
				id             : v.number({ int: true, min: 1 }),
				login          : v.string(),
				...isAdmin && { role: v.oneOf({ values: roles.map((i) => i.id) }) },
				firstName      : v.string(),
				lastName       : v.string(),
				changePassword : v.bool(),
				oldPassword    : (value, values) => values.changePassword ? v.string()(value) : null,
				newPassword    : (value, values) => values.changePassword ? v.string()(value) : null,
				repeatPassword : (value, values) => {

					if (values.changePassword) {

						value = v.string({ required: true })(value);
						if (value !== values.newPassword) throw 'Пароли не совпадают';

						return value;

					}

					return null;

				}
			},
			ctx.request.body
		);

		if (!ctx.state.user.isAdmin) {
			if (ctx.state.user.id !== data.id) throw e.forbidden('Доступ запрещен');
		}

		try {

			await knex.transaction(async (trx) => {

				if (data.changePassword) {

					const hmac1 = crypto.createHmac('sha256', config.session.salt);
					const oldPassword = hmac1.update(data.oldPassword).digest('hex');

					if (
						await knex('users')
							.select()
							.where({ id: data.id, password: oldPassword, deleted: 0 })
							.then(one)
					) {

						const hmac2 = crypto.createHmac('sha256', config.session.salt);
						const newPassword = hmac2.update(data.newPassword).digest('hex');

						await knex('users')
							.transacting(trx)
							.update({ password: newPassword })
							.where({ id: data.id });

					} else throw e.badData(null, { fields: { oldPassword: 'Неверный пароль' } });

				}

				await knex('users')
					.transacting(trx)
					.update({
						login      : data.login,
						...isAdmin && { id_role: data.role },
						first_name : data.firstName,
						last_name  : data.lastName
					})
					.where({ id: data.id });

			});

		} catch(error) { console.log(error);
			throw (error.code === 'ER_DUP_ENTRY') ? e.badData(null, { fields: { login: 'Пользователь с таким логином уже существует' } }) : error;
		}

		ctx.body = await get(data.id);

	},

	async delete(ctx) {

		if (!ctx.state.user.isAdmin) throw e.forbidden();

		const { id } = v.validate(
			{ id: v.number({ int: true, min: 1 }) },
			ctx.request.body
		);

		await knex('users').update({ deleted: 1 }).where({ id });

		ctx.body = {};

	},

	async restore(ctx) {

		if (!ctx.state.user.isAdmin) throw e.forbidden();

		const { id } = v.validate(
			{ id: v.number({ int: true, min: 1 }) },
			ctx.request.body
		);

		await knex('users').update({ deleted: 0 }).where({ id });

		ctx.body = {};

	}

}