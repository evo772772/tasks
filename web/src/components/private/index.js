import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import Waiting from './../waiting/index';

import session from './../../stores/session';

@observer
class Private extends Component {

	render() {

		if ( session.fetching) return <Waiting/>;
		if (!session.id)       return <Redirect to={{ pathname: '/sign-in', state: { from: this.props.location.pathname } }} />;

		let { view: View, ...props } = this.props;

		return <View {...props} />;

	}

}

export default Private;