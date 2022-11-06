// A simple system to manage the list of esp devices connected to the websocket
const DataWriter = require('./DataWriter.js');


class DataDevice {
	constructor(id, name, type, socket, parent) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.socket = socket;
		this.data = {
			temperature: 0,
			pH: 0,
			dissolved_o2: 0
		};
		this.recordingInterval = null;
		this.recordingResolution = 30000; // 30 seconds
		this.parent = parent;
	}	

	updateData(temp, pH, dissolved_o2) {
		this.data.temperature = temp || 0;
		this.data.pH = pH || 0;
		this.data.dissolved_o2 = dissolved_o2 || 0;
	}

	startRecording() {
		this.recording = true;
		const filename = this.name + "_" + Date.now() + ".csv";
		var DataWriter_v = new DataWriter(filename);
		console.log("starting recording to " + filename);

		// if this device disconnects, and rejoins with the same name
		// we need to stop the recording for the old device
		// and start recording for the new device
		prev_device = this.parent.findRecordingDevice(this.name);
		if (prev_device !== undefined) {
			prev_device.stopRecording();
		}
		// remove prev device from the list of recording devices
		this.parent.removeRecordingDevice(this.name);
		// add this device to the list of recording devices
		this.parent.addRecordingDevice(this.name, this);

		this.recordingInterval = setInterval(() => {
		    var data_to_write = {
				time: Date.now(),
				temperature: this.data.temperature,
				pH: this.data.pH,
				dissolved_o2: this.data.dissolved_o2
			};

			DataWriter_v.writeData(data_to_write);
		}, this.recordingResolution);
	}

	stopRecording() {
		if (this.recordingInterval !== null) {
			clearInterval(this.recordingInterval);
			this.recordingInterval = null;
			// remove from the list of recording devices
			this.parent.removeRecordingDevice(this.name);
			console.log("stopped recording");
		} else {
			console.log("no recording to stop");
		}
	}

}

class DeviceManager {
	constructor() {
		this.DataDevices = [];
		this.WebClientDevices = [];
		this.recordingDevices = []; // A recording must be explicitly started and stopped
	}

	addDataDevice(id, name, type, socket) {
		const device = new DataDevice(id, name, type, socket, this);
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
		const device = new DataDevice(id, name, type, socket, this);
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

	removeDeviceBySocket(socket) {
		const device = this.findClientBySocket(socket);
		if (device !== undefined) {
			if (device.type === "data_device") {
				this.removeDataDevice(device.id);
			} else if (device.type === "web_client") {
				this.removeWebClientDevice(device.id);
			}
			
		}
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
			console.log("Dispatching update to device: " + id);
			device.updateData(data.temperature, data.pH, data.dissolved_o2);
		}
		this.broadcastToWebClients(JSON.stringify({
			event: "device_update",
			id: id,
			data: data
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
				}
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
				}
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

	

}
module.exports = DeviceManager;
