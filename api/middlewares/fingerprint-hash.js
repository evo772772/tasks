const crypto = require('crypto');

const fingerprintHash = async (ctx, next) => {

	const ip             = ctx.request.ip                        || '';
	const userAgent      = ctx.request.header['user-agent']      || '';
	const accept         = ctx.request.header['accept']          || '';
	const acceptLanguage = ctx.request.header['accept-language'] || '';

	const sha256 = crypto.createHash('sha256');
	sha256.update(ip + userAgent + accept + acceptLanguage);

	const hash = sha256.digest('hex');

	ctx.state.ip              = ip;
	ctx.state.userAgent       = userAgent;
	ctx.state.fingerprintHash = hash;

	await next();

}

module.exports = fingerprintHash;