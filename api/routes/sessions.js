const crypto = require('crypto');
const config = require('./../config/index');
const knex   = require('./../db');
const e      = require('http-errors');
const v      = require('validator');
const { all, one } = require('./../libs/knex-post-process-response');

module.exports = {

	get(ctx) {

		ctx.body = ctx.state.user;

	},

	async create(ctx) {

		let { login, password } = v.validate(
			{
				login    : v.string(),
				password : v.string()
			},
			ctx.request.body
		);

		const hmac  = crypto.createHmac('sha256', config.session.salt);
		password = hmac.update(password).digest('hex');

		let user = await knex('users')
			.select(
				'users.id',
				'users.login',
				'users.first_name',
				'users.last_name',
				{ role__id      : 'user_roles.id' },
				{ role__title   : 'user_roles.title' },
				{ bool__deleted : 'users.deleted' } 
			)
			.innerJoin('user_roles', 'user_roles.id', 'users.id_role')
			.where({ login, password, deleted: 0 })
			.then(one);

		if (!user) throw e.badData('Неверный email и/или пароль');

		let token = crypto.randomBytes(32).toString('hex');

		await knex('sessions').insert({
			token,
			fingerprint : ctx.state.fingerprintHash,
			id_user     : user.id
		});

		ctx.cookies.set(config.session.name, token, { httpOnly: true });
		ctx.body = user;

	},

	async delete(ctx) {

		await knex('sessions').where('token', ctx.cookies.get(config.session.name)).del();

		ctx.cookies.set(config.session.name, null);
		ctx.body = {};

	}

}