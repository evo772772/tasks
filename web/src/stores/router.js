import { browserHistory } from 'react-router';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';

const routing = new RouterStore();
const history = syncHistoryWithStore(browserHistory, routing);

export { history };
export default routing;
