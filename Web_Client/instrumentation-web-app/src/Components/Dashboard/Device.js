import React from "react";
import { SocketContext } from "../../socket-context.js";


// Data Device component
// - Renders a device
//     - Device gets from props:
//         - Name
//         - Id
//         - current_data_reading (json object)
function Device(props) {
	// usestate to store the device, state is managed by the useEffect hook
	// initial value is an empty object
	this.name = props.device.name;
	this.id = props.device.id;
	this.current_data_reading = props.device.current_data_reading;
	
	function updateDevice(data) {
		// update the device
		this.current_data_reading = data;
	}

	return (
		<div className="device">
			<h2>{this.name}</h2>
			<p>{this.id}</p>
			<p> data = {this.current_data_reading}</p>
		</div>
	)

}

export default Device;