import React, { useEffect } from "react";

// a simple data widget that displays the current value of a data device, and the units of the data
// undeneath the data value is the name of the data
// surrounding the data widget is a circle with 10px radius.
// The circle is filled according to the value of the data on it's respective scale

// props:
// - name: the name of the data
// - value: the value of the data
// - units: the units of the data

const min_max = {
	"pH": [0, 14],
	"temperature": [0, 100],
	"dissolved_o2": [0, 100],
}


function DataWidget(props) {

	function calculatePercentage(value, min, max) {
		var percentage = value / (max - min);
		return percentage;
	}
	
	function calculateEndAngle(value, name) {
		const [min, max] = min_max[name];
		const percentage = calculatePercentage(value, min, max);
		var angle = percentage * (360*(Math.PI/180));
		return angle - Math.PI/2 + 0.00001;
	}

	const value = props.value;
	const name = props.name;
	const units = props.units;


	const canvas_id = "circleCanvas" + props.name + props.id;

	useEffect(() => {
		var canvas = document.getElementById(canvas_id);
		var circle = document.getElementsByClassName("data-widget-circle")[0];
		var context;
		if (canvas) {
			canvas.width = circle.offsetWidth;
			canvas.height = circle.offsetHeight;
			context = canvas.getContext('2d');
			context.clearRect(0,0,canvas.width,canvas.height);
			context.strokeStyle = 'black';
			context.lineWidth = 7;
			context.beginPath();
			var end_angle = calculateEndAngle(props.value, props.name);
			context.arc(canvas.width/2, canvas.width/2, canvas.width/2 - 3, 3/2*(Math.PI), end_angle);
			context.stroke();
		}
	});

	return (
		<div className="data-widget" style={style_object.data_widget}>
			<canvas id={canvas_id} style={style_object.circle_canvas}></canvas>
			<div className="data-widget-circle" style={style_object.data_widget_circle}>
					<div className="data-value-div" style={style_object.data_widget_div}>
						<p className="data-widget-value" style={style_object.data_widget_value} key={'1'}>{value}</p>
						<p className="data-widget-units" style={style_object.data_widget_units} key={'2'}>{units}</p>
					</div>
				<p className="data-widget-name" style={style_object.data_widget_name} key={'3'}>{name}</p>
			</div>
		</div>
	)
}

export default DataWidget;

// Styles ---
var style_object = {
	data_widget: {
		width: "15vh",
		height: "15vh",
		padding: "2vh",
		position: "relative"
	},
	data_widget_circle: {
		width: "100%",
		height: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: "50%",
		backgroundColor: "white",
		border: "7px solid #a6a6a6",
	},
	data_widget_value: {
		fontSize: "70px",
		fontFamily: "Roboto Medium",
		position: "relative",
		top: "10%",
		margin: "10%"
	},
	data_widget_units: {
		fontSize: "10px",
		fontFamily: "Roboto Light",
		position: "relative"
	},
	data_widget_name: {
		fontSize: "15px",
		fontFamily: "Roboto Light",
		fontWeight: "light",
		position: "relative",
		top: "-10%"
	},
	data_widget_div: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "baseline"
	},
	circle_canvas: {
		position: "absolute"
	}
}