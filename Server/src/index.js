// ---------- INDEX ----------
// The index file for the server. Using express for the backend, axios for the http requests,
// and socket.io to facilitate the web sockets. 


// ---------- IMPORT + INIT -----------
const port = 3000;

// Importing modules
const express = require("express");
const { Server } = require("socket.io");

// Creating the express instance and initalizing the server. passing the instance of the server to socket.io
const app = express();
const server = app.listen(port);
const io = new Server(server); // Creating the socket.io instance

// ---------- EXPRESS ROUTES ----------
// Routes for the express server.
// Upon loading, the server will load the index.html file. Inside the index.html file, 
// the io() function is called on the client side to create a socket.io instance. the io() method exposes an io global object that, by default, connects to the host serving the page
app.get("/", (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

// ---------- SOCKET.IO ROUTES ----------
io.on("connection", (socket) => {
	console.log("A user has connected");

	socket.on("disconnect", () => {
		console.log("A user has disconnected");
	});

	// The server is listening for a "brew-update" event from the ESP-32 client.
	// The server receives a data object with the following properties:
	//  - pH: (float) the current pH value
	//  - temp: (float) the current temperature value
	//  - o2: (float) the current dissolved oxygen level
	//  - pump: (boolean) whether the pump is on or off
	//
	socket.on("brew-update", (data) => {
		console.log(data.pH, data.temp, data.o2, data.pump);

		// The server then sends a "client-update" event to the client.
		// The client receives a data object with the same properties.
		socket.emit("client-update", data);
	});

});


