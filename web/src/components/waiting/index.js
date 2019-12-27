import React, { Component } from 'react';
import { Spin } from 'antd';

import './style.less';

class Waiting extends Component {

	render() {

		return <Spin id="waiting-spin" />;

	}

}

export default Waiting;