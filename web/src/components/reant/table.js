import React, { Component } from 'react';
import { Link } from 'react-router';
import { Table as ATable } from 'antd';

class Table extends Component {

	state = { x: '100%', y: '100%' }

	el = React.createRef();

	static defaultProps = {
		size       : 'small',
		rowKey     : 'id',
		autoHeight : true
	}

	componentDidMount() {
		window.addEventListener('resize', ::this.resize);
		::this.resize();
	}

	componentWillUnmount() {
		window.removeEventListener('resize', ::this.resize);
	}

	resize() {

		const el = this.el.current;

		const thead = el.querySelector('.ant-table-header');
		const pagination = el.querySelector('.ant-pagination');

		let width = el.offsetWidth;
		let x = this.props.columns.reduce((x, c) => {

			if (/\%$/.test(c.width)) x += width / 100 * +(c.width.replace(/\%$/, ''));
			else width += +c.width;

			return x;

		}, 0);

		let y = el.offsetTop + 40;
		y += pagination ? pagination.offsetHeight : 0;
		y += thead ? thead.offsetHeight : 0;

		y = `calc(100vh - ${y}px)`;

		this.setState({ x, y });

	}

	render() {

		let props = { ...this.props };

		if (!props.scroll && this.props.autoHeight) {

			delete props.autoHeight;
			props.scroll = this.state

		}

		if (props.pagination && !props.pagination.defaultPageSize) props.pagination.defaultPageSize = 50;

		return <div ref={this.el} className="reant-table">
			<ATable {...props} />
		</div>;

	}

}

export default Table;