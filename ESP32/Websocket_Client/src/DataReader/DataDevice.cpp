#include "DataDevice.hpp"
#include "esp_log.h"
#include "ArduinoJson.h"

#define TAG "DataDevice"

// Data Device class constructors
DataDevice::DataDevice(char * url, char * endpoint, char * name) {
	memset(this->id, 0, 37);
	ws = new esp_WebSocket(url, endpoint, (void *) this);
	this->name = name;
	dr = new esp_DataReader();
}

DataDevice::DataDevice(char * url, char * endpoint, int port, char * name) {
	// initialize id to all 0's (36 characters + 1 for null terminator)
	memset(this->id, 0, 37);
	ws = new esp_WebSocket(url, endpoint, port, (void *) this);
	this->name = name;
	dr = new esp_DataReader();
}

DataDevice::~DataDevice() {
	delete ws;
	delete dr;
}

// Data Device class methods


// read data from the data reader and send it to the web socket server
// this function expects to be called in the main loop
void DataDevice::readAndSendData() {
	StaticJsonDocument<200> doc;
	dr->readData(doc, this->id);

	// small vtask delay to prevent the watchdog timer from triggering
	vTaskDelay(10 / portTICK_PERIOD_MS);

	// send the data to the websocket server
	char message[200];
	serializeJson(doc, message);
	ws->WebSocket_send(message);
}

void DataDevice::setId(const char * id) {
	strncpy(this->id, id, 36);
}

char * DataDevice::getId() {
	return this->id;
}

void DataDevice::setName(char * name) {
	this->name = name;
}

char * DataDevice::getName() {
	return this->name;
}

