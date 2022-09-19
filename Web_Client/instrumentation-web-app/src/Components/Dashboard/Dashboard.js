import React, { useContext, useEffect, useState, useCallback } from "react";
import { SocketContext } from "../../socket-context";
import { MessageParser, registerCallback } from '../MessageParser.js';
import Device from './Device.js';


// Dashboard container
/*
	DASHBOARD:
	- On component mount
		- Call /getDataDevices
		- Populate response into an array of devices
	- UseEffect (dependency tracking)
		- Manage list of devices
	- Callbacks:
		- “Message”
			- “Register”
				- Respond w/ “register_web_device”
			- “Data_update”
				- Forward to device w/ matching uuid
			- “New_device”
				- Add device to array
			- “Device_disconnected”
				- Remove device from array
	- For each DataDevice
		- Render component

*/
function Dashboard() {
 
    // get the socket from the context
    const socket = useContext(SocketContext);

	// function to handle register message
	function handleRegister(message_json) {
		console.log(message_json);
		console.log("registering...");
		if (message_json.event === "register") {
			setClientId(message_json.id);
			const response = JSON.stringify({
				event : "register_web_client",
				id: message_json.id,
				name: "example client", // accounts??
				type: "Web Client" 
			})
			socket.send(response);
		}
	}

	// function to handle device_list message
	function handleDeviceList(message_json) {
		console.log(message_json);
		console.log("device list received");
		if (message_json.event === "device_list") {
			// loop through message_json.devices
			// for each device, create a new Device component
			// add the component to the device_list
		    for (device of message_json.devices) {
				console.log(device);

				// check that the device id is not already in the list of device ids
				if(!device_ids.includes(device.id)) {
					console.log("device id already in list");
					return;
				}
				var device = {
					id: device.id,
					name: device.name,
					type: device.type,
					data: device.data
				}
				this.setDeviceList({devices: this.state.devices.push(device)});
				this.setDeviceIds({device_ids: this.state.device_ids.push(device.id)});
			}
		}
	}

	// function to handle data_update message
	function handleDataUpdate(message_json) {
		console.log(message_json);
		console.log("data update received");
		if (message_json.event === "data_update") {
			const id = message_json.id;
			var device = this.state.devices.find(device => device.id === id);
			device.data = message_json.data;
		}
	}

	// function to handle new_device message
	function handleNewDevice(message_json) {
		console.log(message_json);
		console.log("new device received");
		if (message_json.event === "new_device") {
			// create a new Device component
			// add the component to the device_list
			var device = {
				id: message_json.id,
				name: message_json.name,
				type: message_json.type,
				data: message_json.data
			}
			setDevices({devices: this.state.devices.push(device)});
			setDeviceIds({device_ids: this.state.device_ids.push(device.id)});
		}
	}

	function handleDeviceDisconnected(message_json) {
		console.log(message_json);
		console.log("device disconnected with id: " + message_json.id);
		if (message_json.event === "device_disconnected") {
			// remove the device with the matching id from the device list
			var device = this.state.devices.find(device => device.id === message_json.id);
			var index = this.state.devices.indexOf(device);
			if (index > -1) {
				this.state.devices.splice(index, 1);
			}

			// remove the device id from the device id list
			var index = this.state.device_ids.indexOf(message_json.id);
			if (index > -1) {
				this.state.device_ids.splice(index, 1);
			}
		}

	}


	// useState to store the list of devices, state is managed by the useEffect hook
	// initial value is an empty array
	const [devices, setDevices] = useState([]);
	const [device_ids, setDeviceIds] = useState([]);
	const [client_id, setClientId] = useState("");


    // useEffect runs on first render (empty dependency array):
	//  - request device list from server and subscribe for updates
	//  - render a dash-view component for each device
	//  - render a message if no devices are connected
    useEffect(() => {
		// once component is mounted, register callbacks and request device list
		registerCallback('data_device_list', handleDeviceList);
		registerCallback('data_update', handleDataUpdate);
		registerCallback('new_device', handleNewDevice);
		registerCallback('register', handleRegister);
		registerCallback('device_disconnected', handleDeviceDisconnected);
		socket.addEventListener('message', MessageParser);
		// send a message to the server to request the device list
		socket.send(JSON.stringify({event: "get_data_devices", id: client_id}));
    }, []);

    
    return (
        <div classname="main-container">
            <h1>Web-Brew</h1>
			<div classname="device-list">
				{devices.map((device) => {
					return <Device key={device.id} props={device} />
				})}
			</div>
        </div>
    )
}

export default Dashboard;