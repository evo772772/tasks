// koa
const knex          = require('./db');
const koa           = require('koa');
const koaHelmet     = require('koa-helmet');
const koaBodyParser = require('koa-bodyparser');

// config
const config = require('./config');

// middlewares
const logger          = require('./middlewares/logger');
const errorHanler     = require('./middlewares/error-hanler');
const checkRequest    = require('./middlewares/check-request');
const fingerprintHash = require('./middlewares/fingerprint-hash');

// routes
const routes = require('./routes');

// app
const app = new koa();

app
	.use(koaHelmet())
	.use(logger)
	.use(errorHanler)
	.use(fingerprintHash)
	.use(checkRequest)
	.use(koaBodyParser())
	.use(routes.public.routes())
	.use(routes.public.allowedMethods())
	.use(routes.private.routes())
	.use(routes.private.allowedMethods());

(async () => {

	console.log('Start app');
	console.log(`ENV: ${process.env.NODE_ENV}`);
	console.log(`App name: ${config.package.name}`);
	console.log(`App version: ${config.package.version}`);
	console.log(`App port: ${config.port}`);

	try { await knex.migrate.latest(); }
	catch(error) {

		console.log(error);
		await knex.migrate.rollback();

	}

	console.log('DB version: ' + (await knex.migrate.currentVersion()));

	app.listen(config.port);

})();