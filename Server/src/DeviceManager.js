// A simple system to manage the list of esp devices connected to the websocket

class DataDevice {
	constructor(id, name, type, socket) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.socket = socket;
		this.sensors = {
			temperature: {
				value: null,
				unit: "C"
			},
			pH: {
				value: null,
				
			},
			disolved_o2: {
				value: null,
				unit: "mg/L"
			}
		};
	}

	updateData(temp, pH, disolved_o2) {
		this.sensors.temperature.value = temp || null;
		this.sensors.pH.value = pH || null;
		this.sensors.disolved_o2.value = disolved_o2 || null;
	}

}

class DeviceManager {
	constructor() {
		this.DataDevices = [];
		this.WebClientDevices = [];
	}

	addDataDevice(id, name, type, socket) {
		const device = new DataDevice(id, name, type, socket);
		this.DataDevices.push(device);
	}

	addWebClientDevice(id, name, type, socket) {
		const device = new DataDevice(id, name, type, socket);
		this.WebClientDevices.push(device);
	}

	removeDataDevice(id) {
		this.DataDevices = this.DataDevices.filter(device => device.id !== id);
	}

	removeWebClientDevice(id) {
		this.WebClientDevices = this.WebClientDevices.filter(device => device.id !== id);
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
			device.updateData(data);
		}
		this.broadcastToWebClients(JSON.stringify({
			event: "update",
			data: {
				id: id,
				data: data
			}
		}));
	}

	

}
module.exports = DeviceManager;
