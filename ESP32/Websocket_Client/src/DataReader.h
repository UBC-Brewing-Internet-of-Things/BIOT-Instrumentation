// Data Reader class
// Responsible for synchronously reading data from an array of sensors over I2C at a fixed polling rat

// Using the esp-idf I2C library
#include <driver/i2c.h>
#include "EzoSensor.h"

// I2C Pins on the ESP32 are PIO 22 (SCL) and GPIO 21 (SDA)
#define I2C_SCL 22
#define I2C_SDA 21
#define FREQ 100000
#define PORT I2C_NUM_0

class esp_DataReader {
	public:
	esp_DataReader();
	~esp_DataReader();
	char * readData();

	private:
	int numSensors;
	EzoSensor ** sensors;
	EzoSensor * ph;
	EzoSensor * temp;
	EzoSensor * O2;
	char * convertDataToJSON(std::byte * data, char ** json);

};

