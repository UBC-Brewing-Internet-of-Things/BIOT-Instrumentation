import React from "react";
import io from "socket.io-client";

// exports for socket context in other files (global state)
export const socket = io("http://localhost:3001");
export const SocketContext = React.createContext(socket); // react use context hook allows us to access the socket from other components
