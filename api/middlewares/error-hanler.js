const crypto = require('crypto');
const e      = require('http-errors');

const errorHanler = async (ctx, next) => {

	try { await next(); }
	catch (originalError) {
console.log({ originalError });
		let error =  originalError.isHttpError ? originalError : e.internalServerError();
		error.payload.id = crypto.randomBytes(4).toString('hex');

		ctx.state.error = originalError;
		ctx.status = error.status;
		ctx.body   = error.payload;

	}

}

module.exports = errorHanler;