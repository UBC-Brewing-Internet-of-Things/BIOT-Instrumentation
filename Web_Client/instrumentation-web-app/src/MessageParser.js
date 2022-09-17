// This is a component to parse messages from the server. It is used to differentiate between different types of messages sent by clients.
// This structure stores the assocated functions for the message parser.
// Individual components can assign their own function to handle the messages contents.

const MessageFunctions = {
	broadcast_chat: {},
	register: {}
}

function registerCallback(type, callback) {
	MessageFunctions[type] = callback;
}

function MessageParser(message) {
	// parse the message into a json object
	const message_json = JSON.parse(message.data);
	// get the function associated with the message type
	console.log(MessageFunctions[message_json.event]);
	console.log(message_json.event);

	const message_function = MessageFunctions[message_json.event];
	// call the function
	message_function(message_json);
}


module.exports = {
	MessageParser: MessageParser,
	registerCallback: registerCallback,
}

