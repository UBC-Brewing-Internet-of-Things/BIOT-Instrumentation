// import React, { useState, useContext } from "react";
// import { SocketContext } from "../../socket-context.js";

// function DashView(props) {

// 	// get the socket from the context
// 	const socket = useContext(SocketContext);

// 	// useState to store the device, state is managed by the useEffect hook
// 	// initial value is an empty object
// 	const [device, setDevice] = useState({});

// 	// useEffect runs on first render:
// 	//  - request device data from server and subscribe for updates
// 	//  - render a widget component for Temperature, pH, and dissolved oxygen


// 	return (
// 		<div classname="device-dashboard">
// 			<h2>{props.device.name}</h2>
// 			<p>{props.device.description}</p>
// 		</div>
// 	)
// }

// export default DashView;