const winston = require('winston');
const config  = require('./../config');
require('winston-daily-rotate-file');

const transport = new(winston.transports.DailyRotateFile)({
	dirname       : config.logs,
	filename      : '%DATE%.log',
	datePattern   : 'DD-MM-YYYY',
	zippedArchive : true,
	maxFiles      : '1d'
});

const winstonLogger = winston.createLogger({
	transports: [ transport ]
});

const logger = async (ctx, next) => {

	await next();

	const date   = new Date().toLocaleDateString();
	const url    = ctx.request.url;
	const method = ctx.request.method;
	const status = ctx.response.status;
	const state  = ctx.state;
	const error  = state.error;

	delete state.error;

	let level = 'info';

	if (status >= 400 && status < 500) level = 'warn';
	else if (status >= 500)            level = 'error';

	winstonLogger.log({ level, date, url, method, status, state, error });

}

module.exports = logger;