#include "DataDevice.hpp"

// Data Device class constructors
DataDevice::DataDevice(char * url, char * endpoint) {
	ws = new esp_WebSocket(url, endpoint);
	// dr = new esp_DataReader();
}

DataDevice::DataDevice(char * url, char * endpoint, int port) {
	ws = new esp_WebSocket(url, endpoint, port);
	//dr = new esp_DataReader();
}

DataDevice::~DataDevice() {
	delete ws;
	// delete dr;
}

void DataDevice::readAndSendData() {
	char * data_buf = new char[100]; // TODO: make this dynamic
	//dr->readData(data_buf);
	data_buf = "Hello World";
	ws->WebSocket_send(data_buf);
	delete data_buf;
}

