import react, { useContext, useEffect, useState } from "React";
import SocketContext from "../../SocketContext.js";
import Socket from "../../Socket.js"

// Dashboard container
// -- Render title: Web-Brew
// -- List of Devices: 
//       - Request list of connected devices from server
//       - for each device, render a device-dashboard componenet
//          
function Dashboard() {
 
    // get the socket from the context
    const socket = useContext(SocketContext);

    // useEffect 
    useEffect(() => {

    })

    
    return (
        <div classname="main-container">
            
        </div>
    )
}

export default Dashboard;