import React, { useContext , useEffect , useCallback} from 'react';
import { SocketContext } from './socket-context';


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
		console.log(message);
		document.getElementById('messages').innerHTML += `<li>${message}</li>`;
	}, []);
	
	// useEffect is used to subscribe to the message received event once the component is mounted.
	useEffect(() => {
		// once component is mounted, listen for messages
		socket.on('broadcast-chat', handleMessageReceived);

		return () => {
			// when component is unmounted, stop listening for messages
			socket.off('broadcast-chat', handleMessageReceived);
		}

	}, []);

	// handle the message submission event
	function handleSubmit(event){
		event.preventDefault();
		const message = event.target.message.value;
		socket.emit('chat-message', message); // send the message to the server
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
