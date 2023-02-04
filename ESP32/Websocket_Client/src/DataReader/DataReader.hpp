// Data Reader class
// Responsible for synchronously reading data from an array of sensors over I2C at a fixed polling rat

// Using the esp-idf I2C library
#include <driver/i2c.h>
#include "EzoSensor.hpp"
#include "ArduinoJson.h"
// #include "I2Cbus/include/I2Cbus.hpp"
#include "driver/uart.h"

// I2C Pins on the ESP32 are PIO 22 (SCL) and GPIO 21 (SDA)
#define I2C_SCL 22
#define I2C_SDA 21
#define FREQ 100000
#define PORT I2C_NUM_0

class esp_DataReader {
	public:
	esp_DataReader();
	~esp_DataReader();
	void loop();
	void readData(StaticJsonDocument<200> & doc, char * id);
	
	uart_config_t uart_config;

	private:
	int numSensors;
	EzoSensor ** sensors;
	EzoSensor * ph;
	EzoSensor * temp;
	EzoSensor * O2;
	void prepareWSJSON(char * data_ph, char * data_temp, char * data_o2, StaticJsonDocument<200> & doc, char * id);
};



