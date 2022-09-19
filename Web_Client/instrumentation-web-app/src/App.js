import React from "react";
import Chat from "./Components/Chat.js";
import Dashboard from "./Components/Dashboard/Dashboard.js";
import Test from "./Test.js"
import { SocketContext } from "./socket-context.js";

// App is the entry point to the application. This functional class will handle the logic of
// what content to serve the user upon visiting the page.
function App() {

	var socket = React.useContext(SocketContext);

    return ( 
		<div classname="main-container">
			<SocketContext.Provider value={socket}>
				<Dashboard />
			</SocketContext.Provider>
		</div>
    )
}

export default App;