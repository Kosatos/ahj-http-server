const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('koa-cors');
const { v4: uuid } = require('uuid');
const app = new Koa();

const appData = {
	tickets: [
		{
			id: 1,
			name: 'Ticket 1',
			status: false,
			created: new Date('2012-10-3').getTime(),
			description: '',
		},

		{
			id: 2,
			name: 'Ticket 2',
			status: false,
			created: new Date('2012-10-3').getTime(),
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		},
	],
};

app.use(cors());

app.use(
	koaBody({
		urlencoded: true,
		multipart: true,
	})
);

function getFullTicket(id) {
	const ticket = appData.tickets.find((tckt) => tckt.id == id);
	return ticket;
}

function createTicket(requestBody) {
	try {
		const { name, description, status } = requestBody;
		const id = uuid();
		const created = new Date().getTime();
		const ticket = { id, name, status, created, description };
		appData.tickets.push(ticket);

		return ticket;
	} catch (err) {
		return err.message;
	}
}

function deleteTicket(id) {
	try {
		appData.tickets = appData.tickets.filter((ticket) => ticket.id !== id);
		return { status: true, id: id };
	} catch (err) {
		return err.message;
	}
}

function editTicket(requestBody) {
	try {
		const { id, name, description, status } = requestBody;
		const changedTicked = appData.tickets.find((ticket) => ticket.id === id);

		if (status !== undefined) changedTicked.status = status;
		if (name !== undefined) changedTicked.name = name;
		if (description !== undefined) changedTicked.description = description;

		return changedTicked;
	} catch (err) {
		return err.message;
	}
}

app.use(async (ctx) => {
	if (ctx.method === 'GET') {
		const { method, id } = ctx.request.query;
		switch (method) {
			case 'allTickets':
				ctx.response.body = appData.tickets;
				return;
			case 'ticketById':
				ctx.response.body = getFullTicket(id);
				return;
			default:
				ctx.response.status = 404;
				return;
		}
	} else if (ctx.method === 'POST') {
		const { id, method } = ctx.request.body;

		switch (method) {
			case 'createTicket':
				ctx.response.body = createTicket(ctx.request.body);
				return;
			case 'editTicket':
				ctx.response.body = editTicket(ctx.request.body);
				return;
			case 'deleteTicket':
				ctx.response.body = deleteTicket(id);
				return;
			default:
				ctx.response.status = 404;
				return;
		}
	}
});

const server = http.createServer(app.callback()).listen(8080);
