# Important Note
*This repository is now archived. Each folder (Server, Web_Client, ESP32) has been separated into their respective repositories, which can be found under the organization's repository list.*

---

# General Information
![Web Client UI](UpdatedScreenshot.png "UI image")

### This is the source repository for the development of BIOT's instrumentation System
At a high level, this is the design of our system.
![BIOT Instrumentation Diagram](diagram2.png "Diagram")
Sensor and pump data from the brew are aggregated by an ESP32 Microcontroller. This controller opens a websocket connection with our server. Through said connection, live data is streamed regarding the "state" of the brew. Currently, we monitor Ph, temperature and dissolved oxygen. The backend is able to relay this data to a browser client through another websocket. It also stores the data to a local buffer, and stores it in a database for later reference.

### [Changelog](/changelog.md)
Here is the changelog.

### Guidelines
This page only exists to provide an overview of the project and contain information regarding the system as a whole. For more specific details and implementations, please visit the respective directories above. 

When contributing, please make sure to document all of your work thoroughly.
