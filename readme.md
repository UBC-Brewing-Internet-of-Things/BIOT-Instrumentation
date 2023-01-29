<!-- Intro -->

<!-- Links/Socials -->

<div id="badges" align="center">
<a href="https://www.ubcenvision.com/beer/">
    <img src="https://img.shields.io/badge/BIoT Homepage-24242c?logo=undertale&logoColor=white&style=for-the-badge" alt="Email Badge">
  </a>
  <a href="https://www.instagram.com/ubcbiot/">
    <img src="https://img.shields.io/badge/Instagram-24242c?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram Badge">
  </a>
  <a href="mailto:brewing@ubcenvision.com">
    <img src="https://img.shields.io/badge/Email-24242c?logo=gmail&logoColor=white&style=for-the-badge" alt="Email Badge">
  </a>
</div>

# General Information
![Web Client UI](SCR-20221119-wxl.png "UI image")

### This is the source repository for the development of BIOT's instrumentation System
At a high level, this is the design of our system.
![BIOT Instrumentation Diagram](diagram2.png "Diagram")
Sensor and pump data from the brew are aggregated by an ESP32 Microcontroller. This controller opens a websocket connection with our server. Through said connection, live data is streamed regarding the "state" of the brew. Currently, we monitor Ph, temperature and dissolved oxygen. The backend is able to relay this data to a browser client through another websocket. It also stores the data to a local buffer, and stores it in a database for later reference.

### Guidelines
This page only exists to provide an overview of the project and contain information regarding the system as a whole. For more specific details and implementations, please visit the respective directories above. 

When contributing, please make sure to document all of your work thoroughly.