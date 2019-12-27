import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import { Spin, Typography } from 'antd';
import SignInFormForm from './sign-in-form';

import session from './../../stores/session';

import './style.less';

@observer
class SignIn extends Component {

	state = { fetching: false }

	submitsignInForm(e) {

		e.preventDefault();

		let form = this.signInForm.props.form;

		form.validateFields(async (errors, values) => {

			if (errors) return;

			this.setState({ fetching: true });
			await session.singIn(form, values)
			this.setState({ fetching: false });

		});

	}

	submitrestorePwdForm() { e.preventDefault(); }

	render() {

		if (session.id) return <Redirect to={this.props.location.state ? this.props.location.state.from : '/'} />

		document.title = 'Вход';

		return <Spin id="sign-in" spinning={this.state.fetching}>
			<Typography.Title level={3}>Вход</Typography.Title>
			<SignInFormForm wrappedComponentRef={form => this.signInForm = form} submit={::this.submitsignInForm} />
		</Spin>;

	}

}

export default SignIn;