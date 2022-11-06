
const express = require('express');
const ws = require("ws");

const app = express();
const port = 3001;


// create a new websocket server
const ws_server = new ws.Server({ noServer: true });

// handle websocket connections
ws_server.on("connection", (socket) => {
	console.log("New client connected");
	socket.on("message", (message) => {
		console.log("Received message from client: ", message);
		// send the message back to the client
		socket.send(message);
	});
	socket.on("close", () => {
		console.log("Client disconnected");
	});
});

// handle http request

const server = app.listen(3002);

server.on('upgrade', (request, socket_obj, head) => {
	ws_server.handleUpgrade(request, socket_obj, head, socket => {
		ws_server.emit('connection', socket, request);
	});
});

function send_fake_data() {
	const pH = Math.random() % 14;
	const temperature = Math.random() % 100;
	const dissolved_o2 = Math.random() % 100;


	const packet = {
		id: "123",
		data: {
			pH: pH,
			temperature: temperature,
			dissolved_o2: dissolved_o2,
		}
	}

	console.log("Sending fake data: ", packet);

	if (ws_server.clients.size > 0) {
		// send the packet to the client
		ws_server.clients.forEach((client) => {
			client.send(JSON.stringify(packet));
		});
	}
}

// send fake data every 5 seconds
setInterval(send_fake_data, 5000);