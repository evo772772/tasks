const config = require('./../config');
const e      = require('http-errors');

const checkRequest = async (ctx, next) => {

	if (!config.request.methods.includes(ctx.request.method)) throw e.methodNotAllowed();
	if (!ctx.request.is(config.request.types)) throw e.badRequest();

	await next();

}

module.exports = checkRequest;