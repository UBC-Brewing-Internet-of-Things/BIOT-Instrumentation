import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import { SocketContext } from "../../socket-context";
import { MessageParser, registerCallback } from '../../MessageParser.js';
import Device from './Device.js';
import { Title } from "@mui/icons-material";


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

	// useState to store the list of devices, state is managed by the useEffect hook
	const [devices, setDevices] = useState([
		{
			id: "1",
			name: "device1",
			type: "type1",
			data: {
				"temperature": 0,
				"pH": 0,
			},
			recording: false
		},
			
	]);


	// ------------- Callbacks -------------
	// These are passed as a closure to the MessageParser
	// Then, when a message with the corresponding event occurs, the callback is called
	// Everytime the devices array is updated, the callback is re-registered with the MessageParser
	// This updates the closure to use the updated device array


	// function to handle register message
	// Makes a request for the list of data_devices after registering
	function handleRegister(message_json) {
		console.log("Handling register message");
		if (message_json.event === "register") {
			client_id.current = message_json.client_id;
			const response = JSON.stringify({
				event : "register_web_client",
				id: message_json.id,
				name: "example client", // accounts??
				type: "Web Client" 
			})
			socket.send(response);
			
			// We request the list of devices
			const request = JSON.stringify({
				event: "get_data_devices",
				id: message_json.id
			});
			socket.send(request);
			
		}
	}

	// function to handle device_list message
	function handleDeviceList(message_json) {
		console.log("device list received");
			// loop through message_json.devices
			// for each device, create a new Device component
			// add the component to the device_list

			// first we check if the device_list from the server is empty
			// if it is, we don't need to do anything


			if (!message_json.devices) {
				console.log("No devices connected to server");
				return;
			}


		const temp_devices = [...devices];
		// if the device_list is empty then
		for (var device_json of message_json.devices) {
			const id = device_json.id;
			console.log(device_json);
			// check if the device is already in devices
			var device = devices.find((device) => device.id === id);
			if (device !== undefined) {
			console.log("device already exists");
				// if the device is already in devices, we update the device to match the new id
				return;
			}
			const name = device_json.name;
			// check if device name is already in devices 
			setDevices(devices.filter((device) => device.name !== name));


			const device_proto = {
				id: device_json.id,
				name: device_json.name,
				type: device_json.type,
				data: device_json.data,
				recording: device_json.recording
			}
			temp_devices.push(device_proto);
			console.log("added device: " + device_proto);
		}
		setDevices(temp_devices);
	}

	// function to handle data_update message
	function handleDataUpdate (message_json) {
		console.log("data update recevied");
		if (message_json.event === "device_update") {
			const id = message_json.id;
			console.log("id: " + id);
			// check if the device is already in devices
			var device;
			for (var device_l of devices) {
				if (device_l.id === id) {
					device = device_l;
					break;
				}
			}
			if (device === undefined) {
				console.log("device not found");
				const json = {"event":"get_data_devices"};
				socket.send(json.toString());
				return;
			}
			const temp_devices = [...devices];
			const device_index = temp_devices.findIndex((device) => device.id === id);
			temp_devices[device_index].data = message_json.data;
			temp_devices[device_index].recording = message_json.recording;
			setDevices(temp_devices);
		}
	};

	// function to handle new_device message
	function handleNewDevice(message_json) {
		console.log("new device received");
		if (message_json.event === "new_device") {
			// create a new Device component
			// add the component to the device_list

			// check if the device is already in devices
			const name = message_json.name;
			const temp_devices2 = [...devices];
			const device_index = temp_devices2.findIndex((device) => device.name === name);
			if (device_index !== -1) {
				console.log("device already exists");
				temp_devices2[device_index].id = message_json.id; // we just update the existing device with the new id
				setDevices(temp_devices2);
				return;
			}

			const temp_devices = [...devices];	

			var device_proto = {
				id: message_json.id,
				name: message_json.name,
				type: message_json.type,
				data: message_json.data,
				recording: message_json.recording
			}
			temp_devices.push(device_proto);
			setDevices(temp_devices);
			console.log("added device: " + device_proto);
		}
	}

	function handleDeviceDisconnected(message_json) {
		console.log("device disconnected with id: " + message_json.id);
		if (message_json.event === "device_disconnected") {
			// remove the device with the matching id from the device list
			const temp_devices = [...devices];
			const device_index = temp_devices.findIndex((device) => device.id === message_json.id);
			temp_devices.splice(device_index, 1);
			setDevices(temp_devices);
		}

	}

	function handleHeartbeat(message_json) {
		// console.log(message_json);
		// console.log("heartbeat received");
		socket.send("heartbeat_client");
		console.log("heartbeat sent");
	}



	// useEffect hook to manage the list of devices
	var devices_rendered = [];
	var client_id = useRef("");
    // useEffect runs on first render (or change in dependency)):
    useEffect(() => {
		// once component is mounted, register callbacks and request device list
		registerCallback('data_device_list', handleDeviceList);
		registerCallback('device_update', handleDataUpdate);
		registerCallback('new_device', handleNewDevice);
		registerCallback('register', handleRegister);
		registerCallback('device_disconnected', handleDeviceDisconnected);
		registerCallback('heartbeat_server', handleHeartbeat);
    }, [devices]);

	useEffect(() => {
		socket.addEventListener('message', MessageParser);
	}, [socket]);


	devices.map(device => {devices_rendered.push(<Device key={device.id} id={device.id} name={device.name} type={device.type} data={device.data} recording={device.recording}/>)});

	// We'll ask for a new list of devices every minute
	// This is to ensure that the list is up to date in case a device is added or removed
	// setInterval(() => {
	// 	socket.send(JSON.stringify({event: "get_data_devices", id: client_id.current}));
	// }, 60000);
	

    return (
        <div classname="main-container">
            <h1 style={style_object.title} >Connected Data Sources:</h1>
			<div classname="device-list" style={style_object.device_list}>
				{
					devices_rendered.length > 0 ? devices_rendered : <p>No devices connected</p>
				}
			</div>
        </div>
    )
}

export default Dashboard;

// styles
var style_object = {
	device_list: {
		width: "100%",
		height: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
	},
	title: {
		fontSize: "2em",
		fontWeight: "bold",
		fontFamily: "Roboto"
	}
}
