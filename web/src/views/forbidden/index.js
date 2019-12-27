import React, { Component } from 'react';

class Forbidden extends Component {

	render() {

		document.title = 'Доступ запрещен';

		return <div id="forbidden" className="view service">
			<div>
				<h1>Нет доступа</h1>
			</div>
		</div>;

	}

}

export default Forbidden;