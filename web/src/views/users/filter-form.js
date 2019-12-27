import React, { Component } from 'react';
import { Tooltip, Form, Icon, Button } from 'antd';
import { Input, Select, Checkbox } from './../../components/reant';

import session from './../../stores/session';

class FilterForm extends Component {

	submit(e) { e.preventDefault(); }

	render() {

		let roles = [{ id: -1, title: 'Все' }].concat(this.props.roles);

		return <Form onSubmit={::this.submit} layout="inline">
			{session.role.id == 1 && <Form.Item>
				<Tooltip title="ctrl + c">
					<Button type="primary" onClick={this.props.userCreate}>
						<Icon type="plus" />
						Добавить
					</Button>
				</Tooltip>
			</Form.Item>}
			<Form.Item>
				<Input
					form={this.props.form}
					prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
					placeholder="Поиск"
					name="search"
					onPressEnter={this.props.submit}
				/>
			</Form.Item>
			<Form.Item label="Показать">
				<Select
					form={this.props.form}
					name="show"
					onChange={this.props.submit}
					dropdownMatchSelectWidth={false}
					vkey="id"
					value={1}
					options={[
						{ id: 1, label: 'Актуальных пользователей' },
						{ id: 2, label: 'Удаленых пользователей' },
						{ id: 3, label: 'Всех пользователей' }
					]}
				/>
			</Form.Item>
			<Form.Item label="Роли">
				<Select
					form={this.props.form}
					name="role"
					onChange={this.props.submit}
					dropdownMatchSelectWidth={false}
					value={-1}
					lkey="title"
					options={roles}
				/>
			</Form.Item>
		</Form>;

	}

}

export default Form.create({ name: 'FilterForm' })(FilterForm);