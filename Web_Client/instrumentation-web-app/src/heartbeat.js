import { useContext } from 'react';
import { SocketContext } from './socket-context';
import WebSocket from 'ws';

// get the socket from the react context
const socket = useContext(SocketContext);

// heartbeat function from ws-api docs
function heartbeat() {
	clearTimeout(this.pingTimeout);
	var ws = new WebSocket()

	this.pingTimeout = setTimeout(() => {
		this.terminate();
		//reconnect();
		
	}, 30000 + 1000);
}

socket.addEventListener('open', heartbeat);
socket.addEventListener('ping', heartbeat);
socket.addEventListener('close', function clear() {
	clearTimeout(this.pingTimeout);
});
