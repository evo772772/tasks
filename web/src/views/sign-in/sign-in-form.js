import React, { Component } from 'react';
import { Form, Icon, Input, Button } from './../../components/reant';

class SignInForm extends Component {

	render() {

		const { getFieldDecorator } = this.props.form;

		return <Form onSubmit={this.props.submit}>
			<Form.Item>
				<Input
					form={this.props.form}
					prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
					placeholder="Логин"
					name="login"
					rules={{ required: true }}
				/>
			</Form.Item>
			<Form.Item>
				<Input
					form={this.props.form}
					prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
					placeholder="Пароль"
					type="password"
					name="password"
					rules={{ required: true }}
				/>
			</Form.Item>
			<Form.Item>
				<Button type="primary" htmlType="submit">
					Войти
				</Button>
			</Form.Item>
		</Form>

	}

}

export default Form.create({ name: 'SignInForm' })(SignInForm);