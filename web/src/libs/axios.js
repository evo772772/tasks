import axios from 'axios';
import { notification } from 'antd';

const handler = (result) => {

	let response = result.response ? result.response : result;
	let { form } = result.config;
	let { id, fields, message, type } = response.data;

	if (form && fields) {

		Object.keys(fields).forEach((key) => {

			let field = fields[key];
			let value;
			let errors;

			if (!field) return;

			if (field.constructor.name === 'Object') {

				value  = fields[field].value;
				errors = fields[field].errors;

			} else errors = [field];

			if (value === void 0) value = form.getFieldValue(key);
			if (errors) errors = errors.map((e) => new Error(e));

			fields[key] = { value, ...errors && { errors } };

		});

		form.setFields(fields);

	}

	if (response.status >= 400) {

		let msg;
		let des;

		if (response.status >= 500) msg = `Ошибка номер ${id}`;
		if (message && response.status <  500) msg = message;
		if (message && response.status >= 500) des = message;

		if (msg || des) notification.error({ message: msg, description: des });

	}

	if (response.status !== 200) throw response.data;

	return response.data;

}

axios.defaults.baseURL = '/api';
axios.defaults.method  = 'post';
axios.defaults.headers.post['Content-Type'] = 'application/json';

axios.interceptors.response.use(handler, handler);