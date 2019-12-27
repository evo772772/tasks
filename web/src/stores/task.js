import { observable, action, transaction } from 'mobx';
import axios from 'axios';

class Task {

	@observable messages = [];
	@observable id;
	@observable uuid;
	@observable theme;
	@observable manager;
	@observable executor;
	@observable status;
	@observable createdAt;

	@action.bound async all(uuid) {

		let data;

		try {
			data = await axios({ url: '/tasks/messages/all', data: { uuid } });
		} catch(e) {}

		if (data) transaction(() => {

			this.id        = data.id;
			this.uuid      = data.uuid;
			this.theme     = data.theme;
			this.manager   = data.manager;
			this.executor  = data.executor;
			this.messages  = data.messages;
			this.status    = data.status;
			this.createdAt = data.createdAt;

		});

	}

	@action.bound async update() {

		let messages;

		try {

			messages = await axios({
				url  : '/tasks/messages/new',
				data : {
					idTask    : this.id,
					idLastMsg : this.messages.length ? this.messages[this.messages.length - 1].id : null
				}
			});

		} catch(e) {}

		if (messages && messages.length > 0) this.messages = this.messages.concat(messages);

	}

	@action.bound async complete() {

		try {
			if (await axios({ url: '/tasks/complete', data: { id: this.id } })) this.status.id = 30;
		} catch(e) { return false; }

		return true;

	}

	@action.bound async restore() {

		try {
			if (await axios({ url: '/tasks/restore', data: { id: this.id } })) this.status.id = 20;
		} catch(e) { return false; }

		return true;
	}

	@action.bound async sendMessage(message) {

		try {
			await axios({ url: '/tasks/messages/create', data: { id: this.id, message } });
		} catch(e) { return false; }

		return true;

	}

	@action.bound async readMessage(id) {

		try {
			await axios({ url: '/tasks/messages/read', data: { id } });
		} catch(e) { return false; }

		return true;

	}

	@action.bound unmount() {

		//

	}

}

export default new Task;