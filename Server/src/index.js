
// IMPORTs
const ws = require('ws');
const express = require('express');
const app = express();
const {v4: uuidv4} = require("uuid");
const DeviceManager = require("./DeviceManager.js");
const fs = require('fs');


// WEBSOCKET SERVER
// This is the websocket server that handles all the websocket connections
// The server is handled by express and the ws package
// Our api is event based, and can be extended to serve a variety of device types
// Currently implemented is a data device type, which is a device that reads data from sensors and sends them to the server through a websocket connection


// ------------------ Event handling ------------------
// We register events before starting the server up
// Here we implement our custom API for handling events
// A device has a class of functionality. For each functionality, we register a handler function
const event_handlers = {
	// Data Device Events
	data_update: {},

	// Web client events
	get_data_devices: {},
	start_recording: {},
	stop_recording: {},
};

function registerCallback(event, callback) {
	event_handlers[event] = callback;
}

function registerCallbacks() {
	registerCallback("data_update", data_update);
	registerCallback("get_data_devices", get_data_devices);
	registerCallback("start_recording", start_recording);
	registerCallback("stop_recording", stop_recording);
	registerCallback("delete_recordings", delete_recordings);
}

function messageDispatcher(message) {
	// if the device is not registered, we ignore the message
	if (device_manager.findClientById(message.id) === undefined) {
		console.log("device not registered");
		return;
	}

	// get the function associated with the message type
	const message_function = event_handlers[message.event];
	// call the function
	if (message_function !== undefined) {
		message_function(message);
	} else {
		console.log("no function associated with message type: " + message.event);
	}
}

registerCallbacks();


// ------------------ SERVER SETUP ------------------
// see https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const ws_server = new ws.Server({ noServer: true });

const server = app.listen(3001);

// When a client makes a http:// upgrade request to the express server,
//  we use the ws_server object to handle the upgrade to the ws:// 
server.on('upgrade', (request, socket_obj, head) => {
	ws_server.handleUpgrade(request, socket_obj, head, socket => {
		ws_server.emit('connection', socket, request);
	});
});

// testing purposes...
app.get('/', function (req, res) {
	console.log("sending device list");
	res.send(device_manager.getDeviceList());
});

// 
app.get('/downloadRecording', function (req, res) {
	console.log("sending requested recording");


	const deviceName = req.query.name;
	const deviceId = req.query.id;
	console.log(deviceId);
	console.log(req.query);

	// Check to make sure the device is registered
	const device = device_manager.findClientById(deviceId);
	if (device === undefined) {
			console.log("device not registered");
			res.end();
			return;
	}

	if (device.name !== deviceName) {
			console.log("device name does not match registered id");
			res.end();
			return;
	}

	// Check to make sure the device has a file with recordings
	// file is at the root, with the name of the device . csv
	const filename = device.name + ".csv"; // use the stored name, not the name from the request
	if (!fs.existsSync(filename)) {
			console.log("file does not exist");
			res.end();
			return;
	}

	res.download(filename);
	return;
})

// ------------------ Websocket Message Handling ------------------
ws_server.on("connection", socket => {

	// Every device connected to the server gets a UUID
	// The UUID is used server-side to identify the device
	// The server will only process messages from devices that have registered, so that we can keep track of updates
	device_id = uuidv4();
	
	// Sometimes the register message is missed so:
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

	// When the server receives a message from a device, we parse it and handle it
	socket.on("message", message => {
		// check for null message
		if (!message) {
			console.log("null message received");
			return;
		}
		
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

		// If the message is not a heartbeat, we parse it as JSON
		// messages that fail to deserialize are ignored
		var json_message = {};
		try {
			json_message = JSON.parse(message_string);
			console.log(json_message);
		} catch (e) {
			console.log("error parsing json: " + e);
			return;
		}

		if (!json_message) {
			console.log("null json message received");
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
		console.log("connection closed");
		//handleDisconnect(socket);
	});

});


function handleDisconnect(ws) {
	device = device_manager.findClientBySocket(ws);
	if (device !== undefined) {
		console.log("removing device here: " + device.id);
		device_manager.removeClient(device);
			// broadcast to web clients that the device has disconnected
			const disconnected_client = {
				event: "device_disconnected",
				id: device.id
			};
			device_manager.broadcastToWebClients(JSON.stringify(disconnected_client));
	}
	return ws.terminate();
}

// ------------------ Event Callbacks ------------------
// TODO: move these to device class or separate file?

function data_update(message) {
	device_manager.dispatchUpdate(message.id, message.data);
}

function get_data_devices(message) {
	const devices = device_manager.getDataDevices();
	var message_to_send = {
		event: "data_device_list",
		devices: devices
	};

	console.log("sending " + message_to_send);
	
	message_to_send = JSON.stringify(message_to_send);
	const device = device_manager.findClientById(message.id);

	if (device !== undefined) {
		device.socket.send(message_to_send);
		console.log("sent data device list to " + message.id);
	}
}

function start_recording(message) {
	console.log("starting recording for device " + message.id);
	device_manager.startRecording(message.id);
}

function stop_recording(message) {
	console.log("stopping recording for device " + message.id);
	device_manager.stopRecording(message.id);
}

function delete_recordings(message) {
	console.log("deleting recording for device " + message.id);
	device_manager.deleteRecording(message.id);
}


// ------------------ DEVICE MANAGEMENT ------------------
// Here we implement the device manager
// The device manager keeps track of all the devices connected to the server
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


// ping function to see if clients are still connected
function ping() {
	ws_server.clients.forEach(function each(ws) {
		if (ws.isAlive === false) {
			handleDisconnect(ws);
		}
		// every 30s we set the isAlive flag to false, and then ping the client
		ws.isAlive = false;
		console.log("pinging client");
		ws.send('heartbeat_server'); // if they're alive, they'll respond with a heartbeat_client message
	});
}

// set up a timer to ping the clients every 30 seconds
const interval = setInterval(ping, 10000);