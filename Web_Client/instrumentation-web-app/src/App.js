import react from "React";
import Chat from "Chat.js"
import Dashboard from "./Components/Dashboard/Dashboard.js";

// App is the entry point to the application. This functional class will handle the logic of
// what content to serve the user upon visiting the page.
function App() {
     
    
    return (
        
            <div classname="main-container">
                <Dashboard />
            </div>

    )
}

export default App;