import React, { useContext , useEffect , useCallback} from 'react';
import { SocketContext } from '../socket-context';
import { MessageParser, registerCallback } from '../MessageParser.js';

// ---------- CHAT COMPONENT ----------
// This is a simple chat component to demonstrate the use of the socket context.
// When the component is mounted, it subscribes to the 'broadcast-chat' event. This will listen for messages sent from the server.
// When the form is submitted, it emits a 'chat-message' event with the message. This will send the message to the server. The server will broadcast the message to all clients.
// When the component is unmounted, it unsubscribes from the 'broadcast-chat' event.

function Chat(){
	// get the socket from the context
	const socket = useContext(SocketContext);

	// callback for message received
	// useCallback is used to avoid re-rendering the component when the callback is called.
	const handleMessageReceived = useCallback((message) => {
		document.getElementById('messages').innerHTML += `<li>${message.message}</li>`;
	}, []);
	
	// handle register here... move to separate component later w/ dashboard
	function handleRegister(message_json) {
		console.log(message_json);
		console.log("registering...");
		if (message_json.event === "register") {
			// this.device_id = message.id;
			const response = JSON.stringify({
				event : "register_web_client",
				id: message_json.id,
				name: "example client", // accounts??
				type: "Web Client" 
			})
			socket.send(response);
		}
	}


	// useEffect is used to subscribe to the message received event once the component is mounted.
	useEffect(() => {
		// once component is mounted, listen for messages
		registerCallback('register', handleRegister);
		registerCallback('broadcast_chat', handleMessageReceived);
		socket.addEventListener('message', MessageParser);
		// register the callback for the 'broadcast_chat' event
		

		return () => {
			// when component is unmounted, stop listening for messages
			socket.removeEventListener('message', handleMessageReceived);
		}

	}, [socket, handleMessageReceived]);

	// handle the message submission event
	function handleSubmit(event){
		event.preventDefault();
		const message = event.target.message.value;
		const message_json = JSON.stringify({
			event: 'chat_message',
			message: message
		});
		socket.send(message_json); // send the message to the server
	}


	return (
		<div className="chat">
			<ul id="messages"></ul>
			<form className="chat-form" onSubmit={handleSubmit}>
				<input type="text" id="message" />
				<button type="submit">Send</button>
			</form>
		</div>
	);

}


export default Chat;
