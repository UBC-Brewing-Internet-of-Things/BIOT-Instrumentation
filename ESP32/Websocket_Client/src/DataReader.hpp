// Data Reader class
// Responsible for synchronously reading data from an array of sensors over I2C at a fixed polling rat

// Using the esp-idf I2C library
#include <driver/i2c.h>
#include "EzoSensor.hpp"

// I2C Pins on the ESP32 are PIO 22 (SCL) and GPIO 21 (SDA)
#define I2C_SCL 22
#define I2C_SDA 21
#define FREQ 100000
#define PORT I2C_NUM_0

class esp_DataReader {
	public:
	esp_DataReader();
	~esp_DataReader();
	void readData(char ** response_buf);

	private:
	int numSensors;
	EzoSensor ** sensors;
	EzoSensor * ph;
	EzoSensor * temp;
	EzoSensor * O2;
	void prepareWSJSON(unsigned char * data, char ** response_buf, char * device_id);

};



