const knex = require('./../db');
const { all } = require('./../libs/knex-post-process-response');

module.exports = {

	async all(ctx) {
		ctx.body = await knex('user_roles').select().then(all);
	}

}