import React, { Component } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { Avatar, Tooltip } from './../../components/reant';

import session from './../../stores/session';
import task from './../../stores/task';

@observer
class Message extends Component {

	constructor(props) {

		super(props);

		this.state = {
			isRead: props.idUser === 1
				? true
				: props.isRead
		};

	}

	timeout;

	componentDidMount() {

		if (task.status.id === 30) return;
		if (this.props.idUser === 1) return;

		if (
			!this.state.isRead
			&& this.props.amParticipant
			&& this.props.user.id !== session.id
		) this.timeout = setTimeout(async () => {
			if (await task.readMessage(this.props.id)) this.setState({ isRead: true });
		}, 2000);

	}

	componentWillUnmount() {
		if (this.timeout) clearTimeout(this.timeout);
	}

	render() {

		if (this.props.idUser === 1) return <div className="message system">
			{this.props.message}
		</div>;

		const { amParticipant, user, right, message, createdAt } = this.props;
		const isRead = user.id === session.id
			? true
			: this.state.isRead;

		return <div className={classNames('message', { right, 'is-read': isRead })}>
			<div className="wrapper">
				<Tooltip title={user.firstName + ' ' + user.lastName}>
					<Avatar>{user.firstName[0] + user.lastName[0]}</Avatar>
				</Tooltip>
				<div className="content">
					{this.props.message && <div className="text">{message}</div>}
				</div>
				<div className="date">{createdAt}</div>
			</div>
			<div className="clearfix"/>
		</div>;

	}

}

export default Message;