import React , { useState , useEffect }from "react";
import { SocketContext } from "../../socket-context.js";
import DataWidget from "../DataWidget.js";
import DataChart from "./DataChart.js";

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
	
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="device" style={style_object.device} onClick={() => setExpanded(expanded => !expanded)}>
			{/* Device name + id */}	
			<div className="device_details" style ={style_object.device_details}>
				<p className="data_title" style={style_object.data_title}>{name}</p>
				<p className="data_id" style={style_object.data_id}>id:{id}</p>
			</div>
			{ !data ?
				/* no data to display */
				<div className="device_data" style={style_object.device_data}>
					<p className="data_title" style={style_object.data_title}>No data</p>
				</div>

				:
				/* display widgets for each data reading (temperature, pH, dissolved_o2) */ 
				<div className="device_data" style={style_object.device_data}>
					<DataWidget name="pH" value={data.pH} units="" id={id} />
			  		<DataWidget name="temperature" value={data.temperature} units="°C" id={id} />
					<DataWidget name="dissolved_o2" value={data.dissolved_o2} units="ppm" id={id} />
		

					<div className="expanded_data" >
						{/* Here we want to render*/}
						<DataChart name="pH" value={data.pH} />
					</div>
				</div>
		}
		</div>
	)
}

export default Device;



// Styles ---
var style_object = {
	device: {
		width: "95%",
		height: "100%",
		backgroundColor: "white",
		borderRadius: "10px",
		boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: "2vh",
		margin: "2vh 0"
	}, 
	device_details: {
		width: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "flex-start",
		textAlign: "left",
		margin: "0 0"
	},
	data_title: {
		fontSize: "7vw",
		fontWeight: "bold",
		margin: "10px 0",
		fontFamily: "Roboto Black"
	},
	data_id: {
		fontSize: "2vw",
		fontWeight: "light",
		fontFamily: "Roboto Thin",
		margin: "0"
	},
	device_data: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		allignItems: "center"
	}
}

/*
TODOS:
	- Expanded View
		- Click on device to expand
		- Contains a graph of the data over the past hour (user can select time range)
		- Contains a 'record' button
			- When clicked, the device will make a call to the server to start recording data
				- The button will turn red and "RECORDING" text will appear to indicate that the device is recording
			- When clicked again, the device will make a call to the server to stop recording data
				- The button will turn grey and "RECORD" text will appear to indicate that the device is no longer recording

*/

