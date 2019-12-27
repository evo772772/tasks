const moment = require('moment');
const config = require('./../config/index');

const postProcess = (result) => {

	const toCamelCase = str => {

		let match = /(_[a-zA-Z]{1})/.exec(str);

		return match
			? str.replace(match[0], match[0].replace('_', '').toUpperCase())
			: str;

	}

	result = result.map(item => {

		let groups = {};

		Object.keys(item).forEach(column => {

			let roc   = true; // remove original column
			let value = item[column];

			if (/^(\S{1,})__(\S{1,})$/.test(column)) {

				let type = RegExp.$1;
				let name = toCamelCase(RegExp.$2);

				switch(type) {

					case 'json':
						item[name] = JSON.parse(value);
						break;

					case 'bool':
						item[name] = !!value;
						break;

					case 'dt':
						if (value) item[name] = moment(value).format(config.dt);
						break;

					case 'dtt':
						if (value) item[name] = moment(value).format(config.dtt);
						break;

					default:
						if (!groups[type]) groups[type] = {};
						groups[type][name] = value;

				}

			} else {

				let name = toCamelCase(column);

				if (name === column) roc = false;
				else item[name] = value;

			}

			if (roc) delete item[column];

		});

		return { ...item, ...groups };

	});

	return result;

}

const all = (result) => postProcess(result);

const one = (result) => {

	result = postProcess(result);
	return result.length ? result[0] : null;

}

const val = (result) => {

	result = postProcess(result);
	return result.length ? result[0][Object.keys(result[0])[0]] : null;

}

module.exports = {

	all,
	one,
	val

}