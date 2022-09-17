#include "DataDevice.hpp"

// Data Device class constructors
DataDevice::DataDevice(char * url, char * endpoint, char * name) {
	ws = new esp_WebSocket(url, endpoint, this);
	this->name = name;
	// dr = new esp_DataReader();
}

DataDevice::DataDevice(char * url, char * endpoint, int port, char * name) {
	ws = new esp_WebSocket(url, endpoint, port, this);
	this->name = name;
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

void DataDevice::setId(char * id) {
	this->id = id;
}

void DataDevice::getId() {
	return this->id;
}

void DataDevice::setName(char * name) {
	this->name = name;
}

void DataDevice::getName() {
	return this->name;
}

