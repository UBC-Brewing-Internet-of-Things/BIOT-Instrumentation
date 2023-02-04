// A simple system to manage the list of esp devices connected to the websocket
const DataDevice = require('./DataDevice.js');
const WebClient = require('./WebClient.js');

class DeviceManager {
	constructor() {
		this.DataDevices = [];
		this.WebClientDevices = [];
		this.recordingDevices = []; // A recording must be explicitly started and stopped
	}

	addDataDevice(id, name, type, socket) {
		const device = new DataDevice(id, name, type, socket, this);
		
		// Check if device with the same name is registered
		// If so, remove it and add the new device
		var prev_device = this.DataDevices.find(device => device.name === name);
		if (prev_device !== undefined) {
			this.removeDataDevice(prev_device.id);
		}

		this.DataDevices.push(device);
		const new_client = {
			event: "new_device",
			id: id,
			name: name,
			type: type,
			data:
			{
				temperature: 0,
				pH: 0,
				dissolved_o2: 0
			}
		};
		console.log("New device added: " + JSON.stringify(new_client));
		this.broadcastToWebClients(JSON.stringify(new_client));
	}

	addWebClientDevice(id, name, type, socket) {
		const device = new WebClient(id, name, type, socket, this);
		this.WebClientDevices.push(device);
	}

	removeDataDevice(id) {
		this.DataDevices = this.DataDevices.filter(device => device.id !== id);
	}

	removeWebClientDevice(id) {
		this.WebClientDevices = this.WebClientDevices.filter(device => device.id !== id);
	}

	removeRecordingDevice(name) {
		this.recordingDevices = this.recordingDevices.filter(device => device.name !== name);
	}

	findRecordingDevice(name) {
		return this.recordingDevices.find(device => device.name === name);
	}

	addRecordingDevice(name, device) {
		this.recordingDevices.push(device);
	}

	removeClient(device) {
		console.log(device);
		if (device !== undefined) {
			this.removeDataDevice(device.id);
			this.removeWebClientDevice(device.id);
		}
		console.log(this.getDeviceList());
	}

	// is device registered?
	isRegistered(id) {
		return this.DataDevices.find(device => device.id === id) !== undefined || this.WebClientDevices.find(device => device.id === id) !== undefined;
	}

	getDataDevice(id) {
		return this.DataDevices.find(device => device.id === id);
	}

	getWebClientDevice(id) {
		return this.WebClientDevices.find(device => device.id === id);
	}
	
	findClientById(id) {
		return this.DataDevices.find(device => device.id === id) || this.WebClientDevices.find(device => device.id === id);
	}

	findClientBySocket(socket) {
		return this.DataDevices.find(device => device.socket === socket) || this.WebClientDevices.find(device => device.socket === socket);
	}

	broadcastToWebClients(message) {
		this.WebClientDevices.forEach(device => {
			device.socket.send(message);
		});
	}

	dispatchUpdate(id, data) {
		const device = this.getDataDevice(id); 
		if (device !== undefined) {
			console.log("Dispatching update to local device state: " + id);
			device.updateData(data.temperature, data.pH, data.dissolved_o2);
		}
		this.broadcastToWebClients(JSON.stringify({
			event: "device_update",
			id: id,
			data: data,
			recording: device.recording
		}));
	}

	getDeviceList() {
		const devices = [];
		this.DataDevices.forEach(device => {
			devices.push({
				id: device.id,
				name: device.name,
				type: device.type,
				data: {
					temperature: device.data.temperature,
					pH: device.data.pH,
					dissolved_o2: device.data.dissolved_o2
				},
				recording: device.recording
			});
		});
		this.WebClientDevices.forEach(device => {
			devices.push({
				id: device.id,
				name: device.name,
				type: device.type
			});
		});

		return devices;
	}	

	getDataDevices() {
		const devices = [];
		this.DataDevices.forEach(device => {
			var device_info = {
				id: device.id,
				name: device.name,
				type: device.type,
				data: {
					temperature: device.data.temperature,
					pH: device.data.pH,
					dissolved_o2: device.data.dissolved_o2
				},
				recording: device.recording
			}
			devices.push(device_info);
		});
		return devices;
	}

	startRecording(id) {
		var device = this.getDataDevice(id);
		if (device !== undefined) {
			device.startRecording();
		} else {
			console.log("Device not found, cannot start recording");
		}
	}

	stopRecording(id) {
		var device = this.getDataDevice(id);
		if (device !== undefined) {
			device.stopRecording();
		} else {
			console.log("Device not found, cannot stop recording");
		}
	}

	deleteRecording(id) {
		var device = this.getDataDevice(id);
		if (device !== undefined) {
			device.deleteRecording();
		} else {
			console.log("Device not found, cannot clear recording");
		}
	}

}
module.exports = DeviceManager;
