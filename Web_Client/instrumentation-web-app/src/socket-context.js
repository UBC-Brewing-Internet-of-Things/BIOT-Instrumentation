import React from "react";

// exports for socket context in other files (global state)
// export const socket = new WebSocket("ws://192.168.50.67:3001");
export const socket = new WebSocket("ws://192.168.50.107:3001");
export const SocketContext = React.createContext(socket); // react use context hook allows us to access the socket from other components
