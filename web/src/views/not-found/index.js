import React, { Component } from 'react';
import pageTitle from './../../libs/page-title';

class NotFound extends Component {

	render() {

		pageTitle('Страница не найдена');

		return <div id="not-found" className="view service">
			<div>
				<h1>404</h1>
				<p>Страница не найдена</p>
			</div>
		</div>;

	}

}

export default NotFound;