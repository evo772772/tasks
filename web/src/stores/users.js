import { observable, computed, action } from 'mobx';
import axios from 'axios';

class Users {

	@observable data  = [];
	@observable total = 0;

	tokens = {};

	@action.bound async select(page, filter) {

		try {

			if (filter.search.trim().length === 0) { delete filter.search; }
			if (filter.role === -1) { delete filter.role; }

			let idx    = Object.keys(this.tokens).length + 1;
			let source = axios.CancelToken.source();

			this.tokens[idx] = source;

			let result = await axios({ url: '/users/select', data: { page, filter }, cancelToken: source.token });

			delete this.tokens[idx];

			this.data  = result.data;
			this.total = result.total;

			return true;

		} catch(e) { console.error(e); }

		return false;

	}

	@action.bound async get(id) {

		try { return await axios({ url: '/users/get', data: { id } }); } catch(e) { console.error(e); }
		return null;

	}

	@action.bound async create(values, form) {

		try {

			let idx    = Object.keys(this.tokens).length + 1;
			let source = axios.CancelToken.source();

			this.tokens[idx] = source;

			let data = await axios({ url: '/users/create', data: values, form, cancelToken: source.token });

			delete this.tokens[idx];

			return data;

		} catch(e) {}

	}

	@action.bound async update(id, values, form) {

		try {

			let idx    = Object.keys(this.tokens).length + 1;
			let source = axios.CancelToken.source();

			this.tokens[idx] = source;

			let data = await axios({ url: '/users/update', data: { id, ...values }, form, cancelToken: source.token });

			delete this.tokens[idx];

			return data;

		} catch(e) { console.error(e); }

	}

	@action.bound async delete(id) {

		let idx    = Object.keys(this.tokens).length + 1;
		let source = axios.CancelToken.source();

		await axios({ url: '/users/delete', data: { id }, cancelToken: source.token });

		return true;

	}

	@action.bound async restore(id) {

		let idx    = Object.keys(this.tokens).length + 1;
		let source = axios.CancelToken.source();

		await axios({ url: '/users/restore', data: { id }, cancelToken: source.token });

		return true;

	}

	@action.bound unmount() {
		Object.values(this.tokens).forEach((source) => source.cancel());
	}

}

export default new Users;