import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import { Provider } from 'mobx-react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import ruRu from 'antd/lib/locale-provider/ru_RU';

import stores from './stores/index';

import Layout  from './components/layout/index';
import Private from './components/private/index';

import SignIn    from './views/sign-in/index';
import NotFound  from './views/not-found/index';
import Forbidden from './views/forbidden/index';

import Home  from './views/home/index';
import Users from './views/users/index';
import Tasks from './views/tasks/index';
import Task  from './views/task/index';

import './styles/main.less';

import './libs/axios';

import { createBrowserHistory } from 'history';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();
const history = syncHistoryWithStore(browserHistory, routingStore);

class App extends Component {

	componentDidMount() { stores.session.get(); }

	render() {

		return <ConfigProvider locale={ruRu}>
			<Provider {...stores} routing={routingStore}>
				<Router history={history}>
					<Layout>
						<Switch>
							<Route path="/"            render={(props) => <Redirect to="tasks" />} exact />
							<Route path="/users"       render={(props) => <Private view={Users}     {...props} />} exact />
							<Route path="/tasks"       render={(props) => <Private view={Tasks}     {...props} />} exact />
							<Route path="/tasks/:uuid" render={(props) => <Private view={Task}      {...props} />} />
							<Route path="/forbidden"   render={(props) => <Private view={Forbidden} {...props} />} />
							<Route path="/sign-in" component={SignIn} />
							<Route                 component={NotFound} />
						</Switch>
					</Layout>
				</Router>
			</Provider>
		</ConfigProvider>;

	}

}

export default App;
// export default hot(module)(App);