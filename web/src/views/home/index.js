import React, { Component } from 'react';

class Home extends Component {

	render() {

		document.title = 'Главная';

		return <div id="home" className="view">
			Home
		</div>;

	}

}

export default Home;