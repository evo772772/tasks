import React, { Component } from 'react';
import { observer } from 'mobx-react';
import keydown from 'react-keydown';
import pageTitle from './../../libs/page-title';
import { PageHeader, Drawer, Modal, Table } from './../../components/reant';

import FilterForm from './filter-form';
import UserForm from './user-form';

import session from './../../stores/session';
import roles from './../../stores/roles';
import users from './../../stores/users';

import './style.less';

@observer
class Users extends Component {

	state = {

		fetching : true,
		page     : 1,

		usersUpdate: false,

		userFormFetching   : false,
		userFormEditing    : false,
		userFormVisible    : false,
		userFormChanged    : false,
		userFormChangedPwd : false,
		userFormData       : null,

	}

	async componentDidMount() {

		await roles.all();
		await this.select();

	}

	componentWillUnmount() {

		users.unmount();
		roles.unmount();

	}

	async select() {

		let filter = this.filterForm.props.form.getFieldsValue();

		this.setState({ fetching: true });
		await users.select(this.state.page, filter);
		this.setState({ fetching: false });

	}

	filter() { this.setState({ page: 1}, this.select); }

	setPage(page) { this.setState({ page }, this.select); }

	@keydown('ctrl+c')
	userFormShow() {
		this.setState({ userFormVisible: true, userFormEditing: true });
	}

	userFormHide() {

		const hide = () => {

			this.userForm.props.form.resetFields();
			this.setState({
				userFormVisible    : false,
				userFormChanged    : false,
				userFormChangedPwd : false,
				userFormEditing    : false,
				userFormData       : null
			});

			if (this.state.usersUpdate) this.setState(
				{ usersUpdate: false },
				() => this.select()
			);

		}

		if (this.state.userFormFetching) return;

		if (this.state.userFormChanged) Modal.warning({ title: 'Изменения будут утрачены, продолжить?', onOk: hide });
		else hide();

	}

	userFormToggle() {
		this.setState({ userFormEditing: !this.state.userFormEditing, userFormChanged: false, userFormChangedPwd: false });
	}

	userFormChange() {
		this.setState({ userFormChanged: true });
	}

	userFormChangePwd() {
		this.setState({ userFormChangedPwd: !this.state.userFormChangedPwd });
	}

	userFormSubmit(e) {

		e.preventDefault();

		const form = this.userForm.props.form;
		const data = this.state.userFormData;

		form.validateFields(async (errors, values) => {

			if (errors) return;

			this.setState({ userFormFetching: true });

			let props = [values, form];
			let action;

			if (data) {
				props.unshift(data.id);
				action = 'update';
			} else action = 'create';

			let user = await users[action].apply(null, props);

			if (user) this.setState({
				usersUpdate     : true,
				userFormChanged : false,
				userFormEditing : false,
				userFormData    : user
			});

			this.setState({ userFormFetching: false });

		});

	}

	async userFormDelete() {

		this.setState({ userFormFetching: true });

		if (await users.delete(this.state.userFormData.id)) this.setState({
			usersUpdate  : true,
			userFormData : { ...this.state.userFormData, deleted: true }
		});

		this.setState({ userFormFetching: false });

	}

	async userFormRestore() {

		this.setState({ userFormFetching: true });

		if (await users.restore(this.state.userFormData.id)) this.setState({
			usersUpdate  : true,
			userFormData : { ...this.state.userFormData, deleted: false }
		});

		this.setState({ userFormFetching: false });

	}

	render() {

		pageTitle('Пользователи');

		const { data, total } = users;

		return <div id="users" className="view">
			<PageHeader title="Пользователи" />
			<Drawer
				className="user-form-drawer"
				title={this.state.userFormData
					? this.state.userFormData.lastName + ' ' + this.state.userFormData.firstName
					: 'Новый пользователь'}
				closable={!this.state.userFormFetching}
				placement="right"
				onClose={::this.userFormHide}
				visible={this.state.userFormVisible}
				width={512}
			>
				<UserForm
					wrappedComponentRef={(form) => this.userForm = form}
					roles={roles.data}
					// state
					data={this.state.userFormData}
					fetching={this.state.userFormFetching}
					changed={this.state.userFormChanged}
					changedPwd={this.state.userFormChangedPwd}
					editing={this.state.userFormEditing}
					// action
					toggle={::this.userFormToggle}
					submit={::this.userFormSubmit}
					change={::this.userFormChange}
					changePwd={::this.userFormChangePwd}
					cancel={::this.userFormHide}
					delete={::this.userFormDelete}
					restore={::this.userFormRestore}
				/>
			</Drawer>
			<div className="ant-table-toolbar">
				<FilterForm
					wrappedComponentRef={(form) => this.filterForm = form}
					submit={::this.filter}
					roles={roles.data}
					userCreate={::this.userFormShow}
				/>
			</div>
			<Table
				columns={[
					{ title: 'Логин', dataIndex: 'login' },
					{ title: 'Имя', dataIndex: 'firstName' },
					{ title: 'Фамилия', dataIndex: 'lastName' },
					{ title: 'Роль', dataIndex: 'role.title' },
					{ title: 'Дата создания', dataIndex: 'createdAt' },
					{ title: 'Дата последнего обновления', dataIndex: 'updatedAt' }
				]}
				rowClassName={(row) => row.deleted ? 'deleted' : null}
				dataSource={data}
				loading={this.state.fetching}
				pagination={{ current: this.state.page, total, onChange: ::this.setPage }}
				onRow={(record) => ({
					onClick: () => this.setState({
						userFormVisible: true,
						userFormData: record 
					})
				})}
			/>
		</div>;

	}

}

export default Users;