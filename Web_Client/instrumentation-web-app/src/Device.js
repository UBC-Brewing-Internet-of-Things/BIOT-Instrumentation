import React from "react";


function Device(props) {
	this.id = props.id;
	this.name = props.name;
	this.type = props.type;
	this.data = props.data;

	return (
		<div className="device">
			<h3>{props.name}</h3>
			<p>{props.id}</p>
			<p>{props.type}</p>
			<p>{props.data}</p>
		</div>
	);
}