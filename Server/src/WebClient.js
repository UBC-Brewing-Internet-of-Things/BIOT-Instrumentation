const Client = require('./Client.js');

class WebClient extends Client {
	constructor(id, name, type, socket, device_manager) {
		super(id, name, type, socket, device_manager);
	}
}

module.exports = WebClient;