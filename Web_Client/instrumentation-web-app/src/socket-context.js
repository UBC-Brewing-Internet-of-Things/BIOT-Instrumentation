import React from "react";

// exports for socket context in other files (global state)
export const socket = new WebSocket("ws://brown-colts-matter-206-87-100-35.loca.lt/");
export const SocketContext = React.createContext(socket); // react use context hook allows us to access the socket from other components
