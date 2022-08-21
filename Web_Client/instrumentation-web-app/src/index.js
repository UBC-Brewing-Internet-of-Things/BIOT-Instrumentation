import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SocketContext , socket } from './socket-context';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	// The Socket context allows all children of this provider to access the socket without using props
	<SocketContext.Provider value={socket}>
    	<App />
	</SocketContext.Provider>
);
