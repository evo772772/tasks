const knex   = require('knex');
const config = require('./config/index');

module.exports = knex({
	client: 'mysql2',
	connection: config.db
})