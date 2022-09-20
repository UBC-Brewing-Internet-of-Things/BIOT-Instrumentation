// A simple system to manage the list of esp devices connected to the websocket

class DataDevice {
	constructor(id, name, type, socket) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.socket = socket;
		this.data = {
			temperature: 0,
			pH: 0,
			dissolved_o2: 0
		};
	}	

	updateData(temp, pH, dissolved_o2) {
		this.data.temperature = temp || 0;
		this.data.pH = pH || 0;
		this.data.dissolved_o2 = dissolved_o2 || 0;
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

	

}
module.exports = DeviceManager;
