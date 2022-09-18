// Main Class for the ESP32 Devices
// On event from web socket server, call the callback function to update the device state
// On event from data reader, convert the data to JSON and send it to the web socket server
#include "esp_WebSocket.hpp"
#include "DataReader.hpp"

class DataDevice {
	public:
	DataDevice(char * url, char * endpoint, char * name);
	DataDevice(char * url, char * endpoint, int port, char * name);
	~DataDevice();
	void readAndSendData();
	void setId(char * id);
	char * getId();
	void setName(char * name);
	char * getName();
	

	private:
	esp_WebSocket * ws;
	char * id;
	char * name;
	//esp_DataReader * dr;

};
