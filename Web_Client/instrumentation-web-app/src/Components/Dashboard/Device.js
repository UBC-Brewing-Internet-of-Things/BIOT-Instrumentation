import React from "react";
import DataWidget from "../DataWidget.js";

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
	
	return (
		<div className="device" style={style_object.device}>
			<div className="device_details" style ={style_object.device_details}>
				<p className="data_title" style={style_object.data_title}>{name}</p>
				<p className="data_id" style={style_object.data_id}>id:{id}</p>
			</div>
			{ data ? 
				<div className="device_data" style={style_object.device_data}>
					<DataWidget name="pH" value={data.pH} units="" id={id} />
			  		<DataWidget name="temperature" value={data.temperature} units="°C" id={id} />
					<DataWidget name="dissolved_o2" value={data.dissolved_o2} units="ppm" id={id} />
				</div>
				:
				<div className="device_data" style={style_object.device_data}>
					<p className="data_title" style={style_object.data_title}>No data</p>
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
		padding: "10px"
	}, 
	device_details: {
		width: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		textAlign: "left"
	},
	data_title: {
		fontSize: "20px",
		fontWeight: "bold",
		margin: "10px",
		fontFamily: "Roboto Black"
	},
	data_id: {
		fontSize: "10px",
		fontWeight: "light",
		fontFamily: "Roboto Thin"
	},
	device_data: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		allignItems: "center"
	}
}
