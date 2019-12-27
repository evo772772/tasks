import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
	Spin,
	Form,
	Col,
	Row,
	Button,
	Input,
	Select,
	Checkbox,
} from './../../components/reant';

import session from './../../stores/session';
import roles from './../../stores/roles';

@observer
class UserForm extends Component {

	render() {

		const {
			data, // data
			changed, changedPwd, fetching, editing, // state
			submit, change, changePwd, cancel, toggle, delete: _delete, restore // actions
		} = this.props;

		const isNew   = !data;
		const isAdmin = session.isAdmin;
		const isMe    = data ? data.id === session.id : false;

		const canEdit   = isAdmin || isMe;
		const canDelete = isAdmin;

		return <Spin spinning={fetching}>
			<Form layout="vertical" onSubmit={submit}>
				<Row>
					<Col span={(isAdmin || !editing) ? 12 : 24}>
						<Form.Item label="Логин">
							<Input
								form={this.props.form}
								rules={[{ required: true }]}
								name="login"
								value={isNew ? null : data.login}
								read={!editing}
								onChange={change}
							/>
						</Form.Item>
					</Col>
					{(isAdmin || !editing) && <Col span={12}>
						<Form.Item label="Роль">
							<Select
								form={this.props.form}
								rules={[{ required: true }]}
								name="role"
								options={roles.data}
								lkey="title"
								value={isNew ? null : data.role.id}
								read={!editing}
								onChange={change}
							/>
						</Form.Item>
					</Col>}
				</Row>
				<Row>
					<Col span={12}>
						<Form.Item label="Имя">
							<Input
								form={this.props.form}
								rules={[{ required: true }]}
								name="firstName"
								value={isNew ? null : data.firstName}
								read={!editing}
								onChange={change}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item label="Фамилия">
							<Input
								form={this.props.form}
								rules={[{ required: true }]}
								name="lastName"
								value={isNew ? null : data.lastName}
								read={!editing}
								onChange={change}
							/>
						</Form.Item>
					</Col>
				</Row>
				{isNew && <Row>
					<Col span={12}>
						<Form.Item label={'Пароль'}>
							<Input
								form={this.props.form}
								rules={[{ required: true }]}
								name="password"
								type="password"
								onChange={change}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item label={'Повторите пароль'}>
							<Input
								form={this.props.form}
								rules={[{ required: true }]}
								name="repeatPassword"
								type="password"
								onChange={change}
							/>
						</Form.Item>
					</Col>
				</Row>}
				{!isNew && editing && <Row>
					<Col span={24}>
						<Form.Item>
							<Checkbox form={this.props.form} onChange={changePwd} name="changePassword">Изменить пароль</Checkbox>
						</Form.Item>
					</Col>
				</Row>}
				{(!isNew && editing && changedPwd) && <React.Fragment>
					<Row>
						<Col span={12}>
							<Form.Item label={'Старый пароль'}>
								<Input
									form={this.props.form}
									rules={[{ required: true }]}
									name="oldPassword"
									type="password"
									onChange={change}
								/>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label={'Новый пароль'}>
								<Input
									form={this.props.form}
									rules={[{ required: true }]}
									name="newPassword"
									type="password"
									onChange={change}
								/>
							</Form.Item>
						</Col>
					</Row>
					<Row>
						<Col span={12} offset={12}>
							<Form.Item label={'Повторите новый пароль'}>
								<Input
									form={this.props.form}
									rules={[{ required: true }]}
									name="repeatPassword"
									type="password"
									onChange={change}
								/>
							</Form.Item>
						</Col>
					</Row>
				</React.Fragment>}
				<Row>
					<Col>
						<Form.Item>
							{editing && <React.Fragment>
								<Button type="primary" htmlType="submit" disabled={!changed}>Сохранить</Button>
								<Button
									type="danger"
									confirm={changed ? 'Изменения будут утрачены, продолжить?': null}
									onClick={isNew ? cancel : toggle}
								>
									Отмена
								</Button>
							</React.Fragment>}
							{!editing && ((data && data.deleted)
								? <Button type="primary" onClick={restore}>Востановить</Button>
								: <React.Fragment>
									{canEdit && <Button type="primary" onClick={toggle}>Редактировать</Button>}
									{canDelete && <Button type="danger" onClick={_delete}>Удалить</Button>}
								</React.Fragment>)}
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Spin>;

	}

}

export default Form.create({ name: 'UserForm' })(UserForm);