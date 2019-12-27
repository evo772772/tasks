const koaRouter = require('koa-router');
const auth      = require('./middlewares/auth');
const sessions  = require('./routes/sessions');
const roles     = require('./routes/user-roles');
const users     = require('./routes/users');
const tasks     = require('./routes/tasks');

const _public  = new koaRouter();
const _private = new koaRouter();

_public
	// sessions
	.post('/sessions/create', sessions.create);

_private
	.use(auth)
	// sessions
	.post('/sessions/get',    sessions.get)
	.post('/sessions/delete', sessions.delete)
	// roles
	.post('/roles/all', roles.all)
	// users
	.post('/users/select',  users.select)
	.post('/users/create',  users.create)
	.post('/users/update',  users.update)
	.post('/users/delete',  users.delete)
	.post('/users/restore', users.restore)
	.post('/users/:uuid',   users.get)
	// tasks
	.post('/tasks/select',          tasks.select)
	.post('/tasks/create',          tasks.create)
	.post('/tasks/statuses/all',    tasks.allStatuses)
	.post('/tasks/users/select',    tasks.selectUsers)
	.post('/tasks/messages/all',    tasks.allMessages)
	.post('/tasks/messages/new',    tasks.updateMessages)
	.post('/tasks/messages/create', tasks.createMessage)
	.post('/tasks/messages/read',   tasks.readMessage)
	.post('/tasks/complete',        tasks.complete)
	.post('/tasks/restore',         tasks.restore);

module.exports = { public: _public, private: _private };