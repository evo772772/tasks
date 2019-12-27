import React, { Component } from 'react';
import {
	Button as AButton,
	Popconfirm
} from 'antd';

class Button extends Component {

	render() {

		let { confirm, onClick, ...props } = this.props;

		if (!confirm) props.onClick = onClick;

		return confirm
			? <Popconfirm title={confirm} onConfirm={onClick}>
				<AButton {...props}>{props.children}</AButton>
			</Popconfirm>
			: <AButton {...props}>{props.children}</AButton>;

	}

}

export default Button;