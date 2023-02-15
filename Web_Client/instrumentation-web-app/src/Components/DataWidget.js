import React, { useEffect, useRef } from "react";

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

	var value = props.value;

	// if we can parse to a float, we round to 2 decimal places
	// otherwise, just show the string (might be an error reading)
	if (parseFloat(value)) {
		value = parseFloat(value);
		value = value.toFixed(2);
	}


	const name = props.name;
	const units = props.units;
	//var previous_value = useRef(0);


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
			context.lineCap = 'round';
			var end_angle = calculateEndAngle(props.value, props.name);
			const base_angle = 3/2 * (Math.PI);
			//const start_angle = previous_value.current || base_angle;
			// if (animation_interval) {
			// 	clearInterval(animation_interval);
			// }
			//animateArcToNextPosition(context, start_angle, end_angle, canvas.width/2 - 3, canvas.height/2, canvas.width/2);
			// var current_angle = start_angle;
			// var steps = 1;
			// var step_angle = (end_angle - start_angle) / steps;
			// for (var i = 0; i < steps; i++) {
			// 	context.beginPath();
			// 	context.arc(canvas.width/2, canvas.height/2, canvas.width/2 - 3, base_angle, current_angle);
			// 	context.stroke();
			// 	current_angle += step_angle;
			// 	//console.log("current angle: " + current_angle);
			// }
			// previous_value.current = end_angle;
			context.beginPath();
			context.arc(canvas.width/2, canvas.height/2, canvas.width/2 - 3, base_angle, end_angle);
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
		width: "15vw",
		height: "15vw",
		padding: "2vw",
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
		fontSize: "5vw",
		fontFamily: "Roboto Medium",
		position: "relative",
		top: "10%"
	},
	data_widget_units: {
		fontSize: "1vw",
		fontFamily: "Roboto Light",
		position: "relative"
	},
	data_widget_name: {
		fontSize: "1.5vw",
		fontFamily: "Roboto Light",
		fontWeight: "light",
		position: "relative",
		top: "-5vw"
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