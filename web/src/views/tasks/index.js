import React, { Component } from 'react';
import { observer } from 'mobx-react';
import keydown from 'react-keydown';
import { PageHeader, Modal, Table } from './../../components/reant';
import pageTitle from './../../libs/page-title';
import FilterForm from './filter-form';
import CreationForm from './creation-form';

import tasks from './../../stores/tasks';
import statuses from './../../stores/task-statuses';

import './style.less';

@observer
class Tasks extends Component {

	state = {
		page: 1,
		fetching: false,
		creationFormVisible: false
	}

	async componentDidMount() {

		this.setState({ fetching: true });

		await Promise.all([
			statuses.all(),
			::this.select()
		]);

		this.setState({ fetching: false });

	}

	async select(page) {

		let filter = this.filterForm.props.form.getFieldsValue();

		if (page) this.setState({ page });

		this.setState({ fetching: true });
		await tasks.select({ page: page || this.state.page, ...filter });
		this.setState({ fetching: false });

	}

	setPage(page) { this.setState({ page }, this.select); }

	creationFormSubmit() {

		const form = this.creationForm.props.form;

		form.validateFields(async (errors, values) => {

			if (errors) return;

			let uuid = await tasks.create(values, form);
			if (uuid) this.props.history.push(`/tasks/${uuid}`);

		});

	}

	@keydown('ctrl+c')
	creationFormShow() {
		this.setState({ creationFormVisible: true });
	}

	creationFormToggle() {

		if (this.creationForm) this.creationForm.props.form.resetFields();
		this.setState({ creationFormVisible: !this.state.creationFormVisible });

	}

	render() {

		pageTitle('Задачи');

		return <div id="tasks" className="view">
			<PageHeader title="Задачи" />
			<Modal
				title="Новая задача"
				visible={this.state.creationFormVisible}
				onOk={::this.creationFormSubmit}
				onCancel={::this.creationFormToggle}
			>
				<CreationForm wrappedComponentRef={(form) => this.creationForm = form} />
			</Modal>
			<div className="ant-table-toolbar">
				<FilterForm
					wrappedComponentRef={(form) => this.filterForm = form}
					showCreationForm={::this.creationFormToggle}
					change={this.select.bind(this, 1)}
				/>
			</div>
			<Table
				columns={[
					{ title: 'Тема', dataIndex: 'theme' },
					{ title: 'Контролер', dataIndex: 'manager.firstName' },
					{ title: 'Исполнитель', dataIndex: 'executor.lastName' },
					{ title: 'Статус', dataIndex: 'status.title' },
					{ title: 'Дата создания', dataIndex: 'createdAt' }
				]}
				dataSource={tasks.data}
				loading={this.state.fetching}
				pagination={{ current: this.state.page, total: tasks.total, onChange: ::this.setPage }}
				onRow={(record) => ({ onClick: () => this.props.history.push(`/tasks/${record.uuid}`) })}
			/>
		</div>;

	}

}

export default Tasks;