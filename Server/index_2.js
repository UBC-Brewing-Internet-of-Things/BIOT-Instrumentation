
const ws = require('ws');
// include the express library
var express = require('express');
// create an instance of express
var app = express();
// init a ws_server object to handle the websocket, but we're going to use express to handle actual connections
// see https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
// for another example 
const ws_server = new ws.Server({ noServer: true });
ws_server.on("connection", socket => {
	console.log("client connected");
	
	socket.isAlive = true;
	socket.on('pong', heartbeat);

	socket.on("message", message => { 
		console.log(message);
	});
	socket.on("close", () => {
		console.log("client disconnected");
	});

	socket.on('chat-message', message => {
		console.log(message);
		this.clients.forEach(client => {
			if (client.readyState === ws.OPEN) {
				client.send(message);
			}
		});
	});
});

// create an express server object
const server = app.listen(process.env.port || 3001);
// When a client makes a http:// upgrade request to the express server,
//  we use the ws_server object to handle the upgrade to the ws:// 
server.on('upgrade', (request, socket, head) => {
	ws_server.handleUpgrade(request, socket, head, socket => {
		ws_server.emit('connection', socket, request);
	});
});

// a heartbeat function to keep the connection alive
// this function and the ping function are based on examples from the ws library docs
function heartbeat() {
	this.isAlive = true;
}

// ping function to see if clients are still connected
function ping() {
	ws_server.clients.forEach(function each(ws) {
		if (ws.isAlive === false) return ws.terminate();
		ws.isAlive = false;
		ws.ping();
	});
}

// set up a timer to ping the clients every 30 seconds
const interval = setInterval(ping, 30000);