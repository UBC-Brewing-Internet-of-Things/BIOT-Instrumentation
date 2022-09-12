import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SocketContext, socket } from './socket-context';
import WebSocket from 'ws';
import Chat from './Components/Chat';

// we provide a reconnect function to the child components, this is so the heartbeat can reconnect if it stops hearing pings from the server
function reconnect() {
	while (socket.readyState === WebSocket.CLOSED) {
		socket = new WebSocket("ws://localhost:3001");
		setTimeout(1000); // wait a bit before we check again...
	}
	if (socket.readyState !== WebSocket.OPEN) {
		setTimeout(reconnect, 1000);
	}
}



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	// The Socket context allows all children of this provider to access the socket without using props
	<SocketContext.Provider value={( socket )}>
    	<App />
	</SocketContext.Provider>
);
