import React , { useState , useEffect, useRef , useContext} from "react";
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
	let data = useRef(props.data);
	let recording = props.recording;
	data.current = props.data;

	const socket = useContext(SocketContext);

	// values for the charts, we call updateCharts every 10 seconds to update the props of the charts
	// the useEffect in each chart will update the chart with the new data
	
	const [expanded, setExpanded] = useState(false);

	// refs to let us update the charts on an interval
	let phref = useRef(0);
	let tempref = useRef(0);
	let o2ref = useRef(0);
	
	let interval_length = 10000; // 10 seconds

	// TODO: only works if reading is not the same as previous...
	//       potential fix --> add a very small DELTA to the reading if it's the same as the previous reading
	useEffect(() => {
		// update the charts every 10 seconds
		const interval = setInterval(() => {
			phref.current = data.current.pH;
			tempref.current = data.current.temperature;
			o2ref.current = data.current.dissolved_o2;
		}, interval_length);

		return () => clearInterval(interval);
	}, [interval_length, data]);

	const [startstop, setStartStop] = useState(false);
	const buttonRef = useRef(null);

	function handleRecordingClick() {
		console.log("Recording button clicked");
		if (!startstop) {
			socket.send(JSON.stringify({
				event: "start_recording",
				id: id,
			}));
			setStartStop(true);
		} else {
			socket.send(JSON.stringify({
				event: "stop_recording",
				id: id,
			}));
			setStartStop(false);
		}
		createTimedPopup("Recording started");
	}

	function handleDeleteClick() {
		if (recording) {
			alert("Cannot delete a recording that is currently being recorded");
			return;
		}
		console.log("Delete button clicked");
		socket.send(JSON.stringify({
			event: "delete_recordings",
			id: id,
		}));
		createTimedPopup("Deleted recording");
	}

	function handleDownloadClick() {
		console.log("Download button clicked");
		window.open("http://192.168.50.107:3001/downloadRecording?id=" + id+"&name="+name);
	};


	function createTimedPopup(message) {
		const popup = document.createElement("div");
		popup.classList.add("popup");
		popup.innerText = message;
		document.body.appendChild(popup);
		setTimeout(() => {
			popup.remove();
		}, 2000);
	}
	

	// When we collapse, we want to store the current state of the charts
	// When we expand, we want to restore the state of the charts
	// TODO
	// function handleExpanded() {

	// 	setExpanded(expanded => !expanded);
	// }


	
	// TODO: (??) Lift the logic for updating the charts to the parent component
	// see below

	return (
		<div className="device" style={style_object.device}>
			{/* Device name + id */}	
			<div className="collapsed-view" style={style_object.collapsed_view} onClick={() => {setExpanded(expanded => !expanded)}}>
				<div className="device_details" style ={style_object.device_details}>
					<div style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
						<p className="data_title" style={style_object.data_title}>{name}</p>
						{ recording &&
							<span class="dot" style={style_object.dot}></span>
						}
					</div>
					<p className="data_id" style={style_object.data_id}>id:{id}</p>
				</div>
				{ !data ?
					/* no data to display */
					<div className="device_data" style={style_object.device_data}>
						<p className="data_title" style={style_object.data_title}>No data</p>
					</div>

					:
					/* display widgets for each data reading (temperature, pH, dissolved_o2) */ 
					<div className="data_widgets" >
						<div className="device_data" style={style_object.device_data}>
							<DataWidget name="pH" value={data.current.pH} units="" id={id} />
							<DataWidget name="temperature" value={data.current.temperature} units="°C" id={id} />
							{ /* DataWidget name="dissolved_o2" value={data.current.dissolved_o2} units="ppm" id={id} /> */}
						</div>
					</div>
				}
			</div>
			{/* Expanded view, displays charts for each data reading */}
			{ expanded && data &&
				<>
				<div className="expanded-view" style={style_object.expanded_view}>
						<DataChart name="pH" value={phref.current} units="" id={id} />
						<DataChart name="temperature" value={tempref.current} units="°C" id={id} />
						{ /* <DataChart name="dissolved_o2" value={o2ref.current} units="ppm" id={id} /> */}
				</div>
				<div style={style_object.recording_section}>

				{recording === true 
					? 
					<>
					<p>Recording...</p> 
					<button ref={buttonRef}className="record_button" style={style_object.record_button} onClick={() => handleRecordingClick()}>Stop Recording</button>
					</>
					
					: 
					<>
					<p>Not Recording</p>
					<button ref={buttonRef}className="record_button" style={style_object.record_button} onClick={() => handleRecordingClick()}>Start Recording</button>
					</>
				}
				<button className="record_button" style={style_object.record_button} onClick={() => handleDeleteClick()}>Delete Data</button>
				<button className="record_button" style={style_object.record_button} onClick={() => handleDownloadClick()}>Download Data</button>	
				</div>	
				</>
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
		//boxShadow: "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset", Cool 3d shadow
		boxShadow: "rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px",
		display: "flex",
		flexDirection: "column",
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
	}, 
	collapsed_view: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%"
	},
	expanded_view: {
		width : "100%",
		height: "100%",
		display: "flex",
		flexDirection: "row",
		//justifyContent: "space-between",
		padding: "2vh",
	},
	record_button: {
		backgroundColor: "rgba(54, 162, 235, 0.5)",
		border: "0",
		borderRadius: ".5rem",
		padding: "0.5vw 1vw",
		margin: "1vw 1vw",
		boxSizing: "border-box",
		fontFamily: "Roboto",
		textAlign: "center",
	},
	recording_section: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		margin: "1vh 0"
	},
	dot : {
		width: "1vw",
		height: "1vw",
		borderRadius: "50%",
		backgroundColor: "red",
	}
	
}