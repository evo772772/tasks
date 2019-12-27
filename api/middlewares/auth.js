const config  = require('./../config');
const knex    = require('./../db');
const { one } = require('./../libs/knex-post-process-response');
const e = require('http-errors');

const auth = async (ctx, next) => {

	const token = ctx.cookies.get(config.session.name);

	if (!token) throw e.unauthorized();

	const user = await knex('sessions')
		.select(
			'users.id',
			'users.login',
			'users.first_name',
			'users.last_name',
			{ role__id      : 'user_roles.id' },
			{ role__title   : 'user_roles.title' },
			{ bool__deleted : 'users.deleted' }
		)
		.innerJoin('users', { 'users.id': 'sessions.id_user', 'users.deleted': 0 })
		.innerJoin('user_roles', 'user_roles.id', 'users.id_role')
		.where((builder) => {
			if (!ctx.state.ws) builder.where({ token, fingerprint: ctx.state.fingerprintHash });
		})
		.then(one);

	if (!user || user.deleted) {
		throw e.unauthorized()
	};

	Object.defineProperty(
		user,
		'isAdmin',
		{ get: function() { return this.role.id === 1; } }
	);

	ctx.state.user = user;

	await next();

}

module.exports = auth;