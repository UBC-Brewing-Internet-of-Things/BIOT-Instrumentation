// Abstract class for client
class Client {
	constructor(id, name, type, socket, device_manager) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.socket = socket;
		this.device_manager = device_manager;
	}
}
module.exports = Client;