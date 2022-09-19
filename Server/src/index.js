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


function register_data_device(data) {
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


	socket.on("message", message => { 
		console.log(message);
		
		// convert the message from a buffer of bytes to a string
		const message_string = message.toString();
		console.log(message_string);

		// check for heartbeat (if they ping, they're still alive)
		if (message_string === "heartbeat_client") {
			console.log("heartbeat received");
			socket.isAlive = true;
			return;
		}

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
		const message_to_send = JSON.stringify({
			event: "broadcast_chat",
			message: message.message
		});
		console.log(message_to_send);
		broadcastMessage(message_to_send);
	}

	if (message.event === "data_update") {
		// update the device data
		device_manager.dispatchUpdate(message.id, message.data);
	}
	
	if (message.event === 'get_data_devices') {
		const data_devices = device_manager.getDataDevices();
		const message_to_send = JSON.stringify({
			event: "data_devices",
			data_devices: data_devices
		});
		console.log(message_to_send);
		device_manager.findClientById(message.id).socket.send(message_to_send);
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

// ping function to see if clients are still connected
function ping() {
	ws_server.clients.forEach(function each(ws) {
		if (ws.isAlive === false) {
			device = device_manager.findClientBySocket(ws);
			console.log("dead client " + device.id + " disconnected");
			if (device !== undefined) {
				console.log("removing device: " + device.name);
				device_manager.removeDeviceBySocket(ws);
			}
			return ws.terminate();
		}
		// every 30s we set the isAlive flag to false, and then ping the client
		ws.isAlive = false;
		console.log("pinging client");
		ws.send('heartbeat_server'); // if they're alive, they'll respond with a heartbeat_client message
	});
}

// set up a timer to ping the clients every 30 seconds
const interval = setInterval(ping, 10000);