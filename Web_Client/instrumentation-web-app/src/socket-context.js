import React from "react";

// exports for socket context in other files (global state)
export const socket = new WebSocket("ws://sour-sheep-remain-142-179-65-220.loca.lt");
export const SocketContext = React.createContext(socket); // react use context hook allows us to access the socket from other components
