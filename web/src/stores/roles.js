import { observable, action } from 'mobx';
import axios from 'axios';

class Roles {

	@observable data = [];

	cancelSource;

	@action.bound async all() {

		try {

			this.cancelSource = axios.CancelToken.source();

			let data = await axios({ url: '/roles/all', data: {}, cancelToken: this.cancelSource.token });

			this.data = data;
			this.cancelSource = null;

			return true;

		} catch(e) {}

		return false;

	}

	@action.bound unmount() {

		if (this.cancelSource) this.cancelSource.cancel();

	}

}

export default new Roles;