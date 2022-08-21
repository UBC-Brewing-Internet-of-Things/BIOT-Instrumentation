import React, { useContext, useEffect, useState, useCallback } from "react";
import { SocketContext } from "../../socket-context";
import DashView from "./DashView.js";

// Dashboard container
// -- Render title: Web-Brew
// -- List of Devices: 
//       - Request list of connected devices from server
//       - for each device, render a device-dashboard componenet
//          
function Dashboard() {
 
    // get the socket from the context
    const socket = useContext(SocketContext);

	// useState to store the list of devices, state is managed by the useEffect hook
	// initial value is an empty array
	const [devices, setDevices] = useState([]);

	// callback for device list received
	// useCallback is used to create a memoized version of the callback function -- only changes when the dependencies change
	const deviceListCallback = useCallback((device_in) => {
		setDevices(device_in);
	}, [devices]);

    // useEffect runs on first render:
	//  - request device list from server and subscribe for updates
	//  - render a dash-view component for each device
	//  - render a message if no devices are connected
    useEffect(() => {
		socket.emit("request-device-list");
		socket.on("device-list", deviceListCallback);
    });

    
    return (
        <div classname="main-container">
            <h1>Web-Brew</h1>
			<div classname="device-list">
				{devices.map((device) => {
					return <DashView device={device} />
				})}
			</div>
        </div>
    )
}

export default Dashboard;