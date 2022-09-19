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
	const name = props.name;
	const id = props.id;
	var data = props.data;
	console.log(data);
	
	return (
		<div className="device">
			<h2>{name}</h2>
			<p>{id}</p>

			<p>ph = {data.pH ? data.pH.value : ""}</p>
			<p>temp = {data.temp ? data.temperature.value : ""}</p>	
			<p>disolved o2 = {data.dissolved_o2 ? data.dissolved_o2.value : ""}</p>
		</div>
	)

}

export default Device;