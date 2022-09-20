#include "DataDevice.hpp"
#include "esp_log.h"
#include "ArduinoJson.h"

#define TAG "DataDevice"

// Data Device class constructors
DataDevice::DataDevice(char * url, char * endpoint, char * name) {
	ws = new esp_WebSocket(url, endpoint, (void *) this);
	this->name = name;
	strncpy(this->id, "00000000-0000-0000-0000-000000000000", 37);
	dr = new esp_DataReader();
}

DataDevice::DataDevice(char * url, char * endpoint, int port, char * name) {
	ws = new esp_WebSocket(url, endpoint, port, (void *) this);
	this->name = name;
	strncpy(this->id, "00000000-0000-0000-0000-000000000000", 37);
	dr = new esp_DataReader();
}

DataDevice::~DataDevice() {
	delete ws;
	delete dr;
}

void DataDevice::readAndSendData() {
	char * device_id = this->getId();
	ESP_LOGI(TAG, "Reading data from device with id: %s", device_id);
	StaticJsonDocument <200> doc;
	dr->readData(doc, device_id);

	char buffer[200];
	serializeJson(doc, buffer);

	// data_buf = "Hello World";
	ws->WebSocket_send(buffer);
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

