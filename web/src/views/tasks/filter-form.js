import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Tooltip, Form, Icon, Spin, Button, Input, Select } from './../../components/reant';

import session from './../../stores/session';
import tasks from './../../stores/tasks';
import statuses from './../../stores/task-statuses';

@observer
class FilterForm extends Component {

	render() {

		return <Form layout="inline">
			<Form.Item>
				<Tooltip title="ctrl + c">
					<Button type="primary" onClick={this.props.showCreationForm}>
						<Icon type="plus" />
						Создать
					</Button>
				</Tooltip>
			</Form.Item>
			<Form.Item>
				<Input
					form={this.props.form}
					prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
					placeholder="Поиск"
					name="search"
					onPressEnter={this.props.change}
				/>
			</Form.Item>
			<Form.Item label="Показать">
				<Select
					form={this.props.form}
					name="readStatus"
					dropdownMatchSelectWidth={false}
					value={1}
					options={[
						{ id: 1, label: 'C непрочитаными сообщениями' },
						{ id: 2, label: 'Все' }
					]}
				/>
			</Form.Item>
			<Form.Item label="Статус">
				<Select
					form={this.props.form}
					name="status"
					dropdownMatchSelectWidth={false}
					lkey="title"
					value={20}
					options={statuses.data.filter((i) => i.id !== 10)}
				/>
			</Form.Item>
			<Form.Item label="Исполнитель">
				<Select
					form={this.props.form}
					name="executor"
					style={{ minWidth: 160 }}
					allowClear={true}
					dropdownMatchSelectWidth={false}
					filterOption={false}
					showSearch={true}
					onSearch={tasks.selectUsers}
					notFoundContent={tasks.usersFetching ? <Spin size="small" /> : null}
					value={session.id}
					options={
						[{ id: session.id, label: session.firstName + ' ' + session.lastName }].concat( tasks.users.map((i) => ({ id: i.id, label: i.firstName + ' ' + i.lastName })) )
					}
				/>
			</Form.Item>
			<Form.Item label="Постановщик">
				<Select
					form={this.props.form}
					name="manager"
					style={{ minWidth: 160 }}
					allowClear={true}
					dropdownMatchSelectWidth={false}
					filterOption={false}
					showSearch={true}
					onSearch={tasks.selectUsers}
					notFoundContent={tasks.usersFetching ? <Spin size="small" /> : null}
					options={
						[{ id: session.id, label: session.firstName + ' ' + session.lastName }].concat( tasks.users.map((i) => ({ id: i.id, label: i.firstName + ' ' + i.lastName })) )
					}
				/>
			</Form.Item>
		</Form>;

	}

}

export default Form.create({ name: 'FilterForm', onFieldsChange: (props) => props.change.call(null, 1) })(FilterForm);