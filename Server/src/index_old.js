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
	// check if we've got an unfinished recording active for this device
	var recording_device = device_manager.findRecordingDevice(data.name);
	if (recording_device !== undefined) {
		// we've got an unfinished recording, so we need to start it again on this device
		recording_device.startRecording();
	}
}

function register_web_client(data) {
	// register the device with the device manager
	console.log("registering web client with id: " + data.id);
	device_manager.addWebClientDevice(data.id, data.name, data.type, this);
	// send the client a list of data devices
	// var message_to_send = {
	// 	event: "data_device_list",
	// 	devices: device_manager.getDataDevices()
	// };
	// message_to_send = JSON.stringify(message_to_send);
	// this.send(message_to_send);
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

	// we set an interval for every 2s, and if the client hasn't registered, we send it the register message again
	// if the client has registered, we clear the interval
	var register_interval = setInterval(function() {
		if (device_manager.findClientById(device_id) === undefined) {
			socket.send(JSON.stringify({
				event: "register",
				id: device_id
			}));
		} else {
			clearInterval(register_interval);
		}
	}, 2000);


	console.log("new connection id " + device_id);
	
	socket.isAlive = true;


	socket.on("message", message => { 
		// convert the message from a buffer of bytes to a string
		var message_string = "";	
		try {
			message_string = message.toString(); // not sure if toString can throw an error
		} catch (e) {
			console.log("error converting message to string " + e);
			return;
		}
	
		// check for heartbeat (if they ping, they're still alive)
		if (message_string === "heartbeat_client") {
			console.log("heartbeat received");
			socket.isAlive = true;
			return;
		}
		
		var json_message = {};
		try {
			json_message = JSON.parse(message_string);
			console.log(json_message);
		} catch (e) {
			console.log("error parsing json: " + e);
			return;
		}
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
	// if the id isn't registered, then we can't do anything with the message
	if (device_manager.isRegistered(message.id) === false) {
		console.log("device id " + message.id + " is not registered");
		return;
	}

	if (message.event === "data_update") {
		// update the device data
		const data = message.data;
		device_manager.dispatchUpdate(message.id, data);
	}
	
	if (message.event === 'get_data_devices') {
		const data_devices = device_manager.getDataDevices();
		var message_to_send = {
			event: "data_device_list",
			data_devices: data_devices
		};
		console.log("sending " + message_to_send);
		message_to_send = JSON.stringify(message_to_send);
		const device = device_manager.findClientById(message.id);
		if (device !== undefined) {
			device.socket.send(message_to_send);
			console.log("sent data device list to " + message.id);
		}
	}

	if (message.event == "start_recording") {
		console.log("starting recording for device " + message.id);
		id = message.id;
		device_manager.startRecording(id);
	}

	if (message.event == "stop_recording") {
		console.log("stopping recording for " + message.id);
		id = message.id;
		device_manager.stopRecording(id);
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
const server = app.listen(3001);
// When a client makes a http:// upgrade request to the express server,
//  we use the ws_server object to handle the upgrade to the ws:// 
server.on('upgrade', (request, socket_obj, head) => {
	ws_server.handleUpgrade(request, socket_obj, head, socket => {
		ws_server.emit('connection', socket, request);
	});
});

// when visiting the root of the server, display a list of the devices
// mostly just a good way to test if the server is up and running
app.get('/', function (req, res) {
	res.send(device_manager.getDeviceList());
});

// ping function to see if clients are still connected
function ping() {
	ws_server.clients.forEach(function each(ws) {
		if (ws.isAlive === false) {
			device = device_manager.findClientBySocket(ws);
			if (device !== undefined) {
				console.log("removing device: " + device.id);
				device_manager.removeDeviceBySocket(ws);
					// broadcast to web clients that the device has disconnected
					const disconnected_client = {
						event: "device_disconnected",
						id: device.id
					};
					broadcastToWebClients(JSON.stringify(disconnected_client));
			}
			ws.terminate();
		}
		// every 30s we set the isAlive flag to false, and then ping the client
		ws.isAlive = false;
		console.log("pinging client");
		ws.send('heartbeat_server'); // if they're alive, they'll respond with a heartbeat_client message
	});
}

// set up a timer to ping the clients every 30 seconds
const interval = setInterval(ping, 10000);