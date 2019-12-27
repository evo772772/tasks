import { observable, computed, action, transaction } from 'mobx';
import axios from 'axios';

class Session {

	@observable fetching = true;

	@observable id;
	@observable login;
	@observable firstName;
	@observable lastName;
	@observable role;
	@observable deleted;

	@computed get isAdmin() {
		return this.role.id === 1;
	}

	@computed get initials() {
		return this.firstName[0] + this.lastName[0];
	}

	@action.bound async get() {

		let data;
		
		try {
			data = await axios({ url: '/sessions/get', data: {} });
		} catch(e) {}

		if (!data) return this.fetching = false;

		transaction(() => {

			this.id        = data.id;
			this.login     = data.login;
			this.firstName = data.firstName;
			this.lastName  = data.lastName;
			this.role      = data.role;
			this.deleted   = data.deleted;

			this.fetching  = false;

		});

	}

	@action.bound async set(data) {

		transaction(() => {

			this.login     = data.login;
			this.firstName = data.firstName;
			this.lastName  = data.lastName;
			this.role      = data.role;
			this.deleted   = data.deleted;

		});

	}

	@action.bound async singIn(form, values) {

		try {

			let data = await axios({ url: '/sessions/create', data: values, form, values });

			if (!data) return false;

			transaction(() => {

				this.id        = data.id;
				this.login     = data.login;
				this.firstName = data.firstName;
				this.lastName  = data.lastName;
				this.role      = data.role;
				this.deleted   = data.deleted;

			});

			return true;

		} catch(e) {}

		return false;

	}

	@action.bound async signOut() {

		await axios({ url: '/sessions/delete', data: {} });

		transaction(() => {

			this.id        = null;
			this.login     = null;
			this.firstName = null;
			this.lastName  = null;
			this.role      = null;
			this.deleted   = null;

		});

	}

}

export default new Session;