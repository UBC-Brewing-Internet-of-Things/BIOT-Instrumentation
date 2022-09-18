const DeviceManager = require("./DeviceManager.js");
const {v4: uuidv4} = require("uuid");
const ws = require('ws');
// include the express library
var express = require('express');
const { json } = require("express/lib/response.js");
// create an instance of express
var app = express();
// init a ws_server object to handle the websocket, but we're going to use express to handle actual connections
// see https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
// for another example 

var device_manager = new DeviceManager();


function register_data_evice(data) {
	// register the device with the device manager
	console.log("registering data device with id: " + data.id);
	device_manager.addDataDevice(data.id, data.name, data.type, this);
}

function register_web_client(data) {
	// register the device with the device manager
	console.log("registering web client with id: " + data.id);
	device_manager.addWebClientDevice(data.id, data.name, data.type, this);
}

const ws_server = new ws.Server({ noServer: true });
ws_server.on("connection", socket => {

	// generate a uuid and send it to the client. This will be used to identify the client
	// the client will then respond with the uuid and the device name to complete the registration process
	device_id = uuidv4();
	socket.send(JSON.stringify({
		event: "register",
		id: device_id
	}));

	console.log("new connection id " + device_id);
	
	socket.isAlive = true;
	socket.on('pong', heartbeat);

	socket.on("message", message => { 
		console.log(message);
		// convert the message from a buffer of bytes to a string
		const message_string = message.toString();
		console.log(message_string);
		const json_message = JSON.parse(message_string);
		console.log(json_message);

		// check if the message is a registration message
		// we'll handle this here so we can associate the device with the socket
		if (json_message.event === "register_data_device") {
			register_data_device.call(socket, json_message); // the call function allows us to set the context of the function call to the socket
		} else if (json_message.event === 'register_web_client') {
			register_web_client.call(socket, json_message);
		} else {
			messageDispatcher(json_message);
		}
	});

	socket.on("close", () => {
		console.log("client disconnected");	
		device_manager.removeDeviceBySocket(socket);
	});
});

function messageDispatcher(message) {
	if (message.event === "chat_message") {
		// broadcast the message to all clients
		const message_received = JSON.stringify({
			event: "broadcast_chat",
			message: message.message
		});
		console.log(message_received);
		broadcastMessage(message_received);
	}

	if (message.event === "data_update") {
		// update the device data
		device_manager.dispatchUpdate(message.id, message.data);
	}

}

function broadcastMessage(message) {
	clients = ws_server.clients;
	if (clients !== undefined) {
		clients.forEach(client => {
			client.send(message);
		});
	}
}


// create an express server object
const server = app.listen(process.env.port || 3001);
// When a client makes a http:// upgrade request to the express server,
//  we use the ws_server object to handle the upgrade to the ws:// 
server.on('upgrade', (request, socket_obj, head) => {
	ws_server.handleUpgrade(request, socket_obj, head, socket => {
		ws_server.emit('connection', socket, request);
	});
});

// when visiting the root of the server, display a list of the devices
app.get('/', function (req, res) {
	res.send(device_manager.getDeviceList());
});


// a heartbeat function to keep the connection alive
// this function and the ping function are based on examples from the ws library docs
function heartbeat() {
	this.isAlive = true;
}

// ping function to see if clients are still connected
function ping() {
	ws_server.clients.forEach(function each(ws) {
		if (ws.isAlive === false) {

			return ws.terminate();
		}
		ws.isAlive = false;
		ws.ping();
	});
}

// set up a timer to ping the clients every 30 seconds
const interval = setInterval(ping, 30000);