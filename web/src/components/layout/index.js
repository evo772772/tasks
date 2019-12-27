import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Icon, Avatar, Menu, Dropdown, Tooltip, Drawer } from './../reant';
import UserForm from './../../views/users/user-form';

import session from './../../stores/session';
import users from './../../stores/users';
import roles from './../../stores/roles';

import './style.less';

const menu = [
	{ title: 'Задачи',       icon: 'ordered-list', path: '/tasks' },
	{ title: 'Пользователи', icon: 'team', path: '/users' }
];

@observer
class Layout extends Component {

	state = {

		collapsed : true,
		selected  : [],

		userFormFetching   : false,
		userFormEditing    : false,
		userFormVisible    : false,
		userFormChanged    : false,
		userFormChangedPwd : false

	}

	componentDidMount() { this.select.call(this); }

	toggle() { this.setState({ collapsed: !this.state.collapsed }); }

	select() {

		let selected = [];

		menu.forEach((item, idx) => {

			let re = '^' + item.path
				.replace(/\/$/, '')
				.replace(/\//g, '\\/');

			re += item.exact ? '(\\/)?$' : '(\/.*|$)';

			if (
				new RegExp(re).test(document.location.pathname)
			) selected.push(idx.toString());

		});

		this.setState({ selected });

	}

	userFormShow() {
		this.setState({ userFormVisible: true });
	}

	userFormHide() {

		const hide = () => {

			this.userForm.props.form.resetFields();
			this.setState({
				userFormVisible    : false,
				userFormChanged    : false,
				userFormChangedPwd : false,
				userFormEditing    : false
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

		form.validateFields(async (errors, values) => {

			if (errors) return;

			this.setState({ userFormFetching: true });

			let user = await users.update(session.id, values, form);

			if (user) {

				this.setState({
					usersUpdate     : true,
					userFormChanged : false,
					userFormEditing : false
				});

				session.set(user);

			}

			this.setState({ userFormFetching: false });

		});

	}

	async userFormDelete() {

		this.setState({ userFormFetching: true });

		if (await users.delete(session.id)) session.signOut();

		this.setState({ userFormFetching: false });

	}

	render() {

		if (session.fetching || !session.id) return this.props.children;

		return <React.Fragment>
			<Drawer
				className="user-form-drawer"
				title={session.lastName + ' ' + session.firstName}
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
					data={session}
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
				/>
			</Drawer>
			<div id="main-menu">
				<div id="toggle--main-menu">
					{this.state.collapsed ? <Icon type="menu" onClick={::this.toggle} /> : <Icon type="close" onClick={::this.toggle} />}
				</div>
				<Menu mode="inline" inlineCollapsed={this.state.collapsed} selectedKeys={this.state.selected}>
					{menu.map((item, idx) => <Menu.Item key={idx} onClick={::this.select}>
						<Link to={item.path}>
							<Icon type={item.icon} />
							<span>{item.title}</span>
						</Link>
					</Menu.Item>)}
				</Menu>
				<Dropdown overlay={<Menu>
					<Menu.Item onClick={::this.userFormShow}>Профиль</Menu.Item>
					<Menu.Item onClick={session.signOut}>Выйти</Menu.Item>
				</Menu>}>
					<Avatar>{session.initials}</Avatar>
				</Dropdown>
			</div>
			{this.props.children}
		</React.Fragment>;

	}

}

export default Layout;