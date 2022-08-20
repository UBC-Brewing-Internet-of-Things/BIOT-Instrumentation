#include <EzoSensor.h>

EzoSensor::EzoSensor(uint8_t address, char * name) {
	this->address = address;
	this->name = name;
}