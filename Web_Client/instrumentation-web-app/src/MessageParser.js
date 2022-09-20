// This is a component to parse messages from the server. It is used to differentiate between different types of messages sent by clients.
// This structure stores the assocated functions for the message parser.
// Individual components can assign their own function to handle the messages contents.

const MessageFunctions = {
	broadcast_chat: {},
	register: {},
	device_update: {},
	data_device_list: {},
	new_device: {},
	device_disconnected: {},
	heartbeat_server: {},
}

function registerCallback(type, callback) {
	MessageFunctions[type] = callback;
}

function MessageParser(message) {
	console.log("message received: " + message.data);
	if (message.data === "heartbeat_server") {
		MessageFunctions.heartbeat_server();
	} else {
		// parse the message into a json object
		const message_json = JSON.parse(message.data);
		// get the function associated with the message type
		const message_function = MessageFunctions[message_json.event];
		// call the function
		if (message_function !== undefined) {
			message_function(message_json);
		} else {
			console.log("no function associated with message type: " + message_json.event);
		}
	}	
}


module.exports = {
	MessageParser: MessageParser,
	registerCallback: registerCallback,
}

