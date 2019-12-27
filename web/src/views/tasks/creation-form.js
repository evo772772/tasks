import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Spin, Form, Input, Select, Checkbox } from './../../components/reant';
import tasks from './../../stores/tasks';

@observer
class CreationForm extends Component {

	render() {

		const formItemLayout = {
			labelCol: { span: 8 },
			wrapperCol: { span: 16 } 
		}

		return <Form {...formItemLayout}>
			<Form.Item label="Тема">
				<Input
					form={this.props.form}
					name="theme"
					rules={{ required: true }}
				/>
			</Form.Item>
			<Form.Item label="Исполнитель">
				<Select
					form={this.props.form}
					name="executor"
					rules={{ required: true }}
					filterOption={false}
					dropdownMatchSelectWidth={false}
					showSearch={true}
					onSearch={tasks.selectUsers}
					notFoundContent={tasks.usersFetching ? <Spin size="small" /> : null}
					options={tasks.users.map((i) => ({ id: i.id, label: i.firstName + ' ' + i.lastName }))}
				/>
			</Form.Item>
		</Form>;

	}

}

export default Form.create({ name: 'CreationForm' })(CreationForm);