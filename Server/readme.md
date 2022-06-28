# Instrumentation Server
This will be a simple backend written with Express JS and Socket.io. It will facilitate communication between microcontollers, web clients, and a database. To do so, the server will receive information aggregated by the ESP 32 through one end of a bidirectional websocket. It will relay this information to any web clients through another websocket, as well as logging it for storage in the database. Clients may examine the device state and request changes, such as turning a pump on/off. These changes will be relayed back through the websockets to signal the ESP 32 to update the state accordingly. 

![Server Diagram](server-diagram.png "Server Diagram")

In the future, the backend's implementation may grow to support more powerful features, especially regarding data analysis.

## API Endpoints:
