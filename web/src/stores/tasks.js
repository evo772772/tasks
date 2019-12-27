import { observable, action } from 'mobx';
import axios from 'axios';

class Tasks {

	@observable usersFetching = false;
	@observable users = [];
	@observable data  = [];
	@observable total = 0;

	tokens = {};

	@action.bound async select(props) {

		try {

			const idx    = Object.keys(this.tokens).length + 1;
			const source = axios.CancelToken.source();

			this.tokens[idx] = source;

			const { data, total } = await axios({ url: '/tasks/select', data: props, cancelToken: source.token });

			delete this.tokens[idx];

			this.data  = data;
			this.total = total;

		} catch(e) {}

	}

	@action.bound async create(values, form) {

		try {

			const idx    = Object.keys(this.tokens).length + 1;
			const source = axios.CancelToken.source();

			this.tokens[idx] = source;

			const { uuid } = await axios({ url: '/tasks/create', data: values, form, cancelToken: source.token });

			delete this.tokens[idx];

			return uuid;

		} catch(e) { console.error(e); }

	}

	@action.bound async selectUsers(search) {

		if (search.length > 2) {

			this.usersFetching = true;
			this.users = await axios({ url: '/tasks/users/select', data: { search } });
			this.usersFetching = false;

		}

	}

}

export default new Tasks;