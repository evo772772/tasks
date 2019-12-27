import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import Message from './message';
import pageTitle from './../../libs/page-title';
import { PageHeader, Spin, Row, Col, Button, Dropdown, Tooltip } from './../../components/reant';

import session from './../../stores/session';
import task from './../../stores/task';

import './style.less';

@observer
class Task extends Component {

	messagesBox  = React.createRef();
	inputWrapper = React.createRef();
	input = React.createRef();

	timeout;

	state = {
		fetching : false,
		sending  : false,
		track    : true,
		rows     : 1,
		height   : document.documentElement.clientHeight - 64
	}

	async componentDidMount() {

		this.setState({ fetching: true });
		await task.all(this.props.match.params.uuid);
		this.setState({ fetching: false });

		::this.resize();
		window.addEventListener('resize', ::this.resize, false);

		this.messagesBox.current.addEventListener('scroll', ::this.scroll, false);

		::this.update();

	}

	componentWillUnmount() {

		task.unmount();

		window.removeEventListener('resize', this.resize);
		this.messagesBox.current.removeEventListener('scroll', this.scroll);
		if (this.timeout) clearTimeout(this.timeout);

	}

	async update() {

		await task.update();
		this.timeout = setTimeout(::this.update, 1000);

		if (this.state.track) {
			const el = this.messagesBox.current;
			el.scrollTo(0, el.scrollHeight);
		}

	}

	scroll() {

		const el    = this.messagesBox.current;
		const track = el.scrollHeight === (el.scrollTop + el.offsetHeight);

		this.setState({ track });

	}

	change() {

		let rows = this.input.current.value.split(/\r*\n/).length;
		if (rows < 5) this.setState({ rows }, ::this.resize);

	}

	resize() {
		this.setState({ height: document.documentElement.clientHeight - 64 - (this.inputWrapper ? this.inputWrapper.current.offsetHeight : 0) });
	}

	async send() {

		let message = this.input.current.value.trim();

		if (message.length === 0) return;

		this.setState({ sending: true });
		if (await task.sendMessage(message)) this.input.current.value = '';
		this.setState({ sending: false });

	}

	complete() {

		task.complete();
		::this.resize();

	}

	restore() {

		task.restore();
		::this.resize();

	}

	keypress(e) {
		if (e.nativeEvent.code === 'Enter' && e.ctrlKey) ::this.send();
	}

	render() {

		pageTitle('Задача' + (task.theme ? (': ' + task.theme) : ''));

		const canRestore  = task.id ? (task.status.id === 30 && task.manager.id === session.id) : false;
		const canComplete = task.id ? (task.status.id === 20 && task.manager.id === session.id) : false;
		const canAnswer   = task.id
			? task.status.id !== 30
				? [task.manager.id, task.executor.id].includes(session.id)
				: false
			: false;

		return <div id="task" className="view">
			<PageHeader
				title="Задача"
				subTitle={task.theme}
				onBack={() => this.props.history.push('/tasks')}
				extra={<Dropdown overlayStyle={{ minWidth: 400 }} overlay={<React.Fragment>
					{task.id && <div id="task-info">
						<Row>
							<Col span={8}>Исполнитель</Col>
							<Col span={16}>{task.executor.firstName + ' ' + task.executor.lastName}</Col>
						</Row>
						<Row>
							<Col span={8}>Постановщик</Col>
							<Col span={16}>{task.manager.firstName + ' ' + task.manager.lastName}</Col>
						</Row>
						<Row>
							<Col span={8}>Дата создания</Col>
							<Col span={16}>{task.createdAt}</Col>
						</Row>
						<Row>
							<Col span={8}>Статус</Col>
							<Col span={16}>{task.status.title}</Col>
						</Row>
						{canRestore && <Button type="primary" onClick={::this.restore}>Возобновить работу над задачей</Button>}
						{canComplete && <Button type="primary" onClick={::this.complete}>Завершить задачу</Button>}
					</div>}
				</React.Fragment>}>
					<Button icon="more" />
				</Dropdown>}
			/>
			<Spin spinning={this.state.fetching}>
				<div className="messages" ref={this.messagesBox} style={{ height: this.state.height }}>
					{task.messages.map((item) => <Message
						key={item.id}
						right={[task.manager.id, task.executor.id].includes(session.id)
							? item.idUser === session.id
							: item.idUser === task.executor.id}
						user={[task.manager, task.executor].find((i) => i.id === item.idUser)}
						amParticipant={[task.manager.id, task.executor.id].includes(session.id)}
						{...item}
					/>)}
				</div>
			</Spin>
			{canAnswer && <div ref={this.inputWrapper} className="input-wrapper">
				<Spin spinning={this.state.sending}>
					<textarea
						ref={this.input}
						onChange={::this.change}
						rows={this.state.rows}
						onKeyPress={::this.keypress}
						placeholder="Введите текст..."
					/>
					<Tooltip title="Отпраить (Ctrl+Enter)">
						<Button type="ghost" className="send" icon="form" onClick={::this.send} />
					</Tooltip>
				</Spin>
			</div>}
		</div>;

	}

}

export default Task;