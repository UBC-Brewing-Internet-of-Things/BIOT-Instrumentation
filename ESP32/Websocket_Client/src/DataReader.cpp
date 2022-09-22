#include "DataReader.hpp"
#include "ArduinoJson.h"

esp_DataReader::esp_DataReader() {
	// Initialize the I2C bus
	i2c_config_t conf;
	conf.mode = I2C_MODE_MASTER;
	conf.sda_io_num = I2C_SDA;
	conf.sda_pullup_en = GPIO_PULLUP_ENABLE;
	conf.scl_io_num = I2C_SCL;
	conf.scl_pullup_en = GPIO_PULLUP_ENABLE;
	i2c_param_config(PORT, &conf);

	// Install the I2C driver ()
	i2c_driver_install(I2C_NUM_0, conf.mode, 0, 0, 0);

	// Initialize the sensor array
	this->ph = new EzoSensor(0x63, "ph"); // 0x63 is the default address for the pH sensor
	this->sensors[0] = this->ph;
	this->temp = new EzoSensor(0x66, "temp"); // 0x66 is the default address for the temperature sensor
	this->sensors[1] = this->temp;
	this->O2 = new EzoSensor(0x61, "O2"); // 0x61 is the default address for the O2 sensor
	this->sensors[2] = this->O2;
	this->numSensors = 3;
}

// TODO: Add destructor

// TODO: perform reads in parallel?
// TODO: refactor to use a single read function
// TODO: add error handling
void esp_DataReader::readData(StaticJsonDocument<200> & doc, char * id) {
	// array of bytes to hold the sensor data
	int * data = new int[sizeof(int) * this->numSensors*2];
	for (int i = 0; i < this->numSensors; i++) {
		create a cmd link to the I2C bus
		i2c_cmd_handle_t cmd = i2c_cmd_link_create();
		i2c_master_start(cmd);

		// write to the I2C bus at the desired sensor's address
		// address is left shifted by 1 to account for the read bit
		i2c_master_write_byte(cmd, this->sensors[i]->address << 1 | I2C_MASTER_WRITE, true);
		
		// read the response code from the device
		i2c_master_read(cmd, data + i * 2, 1, I2C_MASTER_ACK);
		// TODO: check response code for error (see atlas scientific library)
		// read the data from the device
		i2c_master_read(cmd, data + i * 2 + 1, 1, I2C_MASTER_NACK);
		
		// write the stop bit
		i2c_master_stop(cmd);
		// trigger command execution
		i2c_master_cmd_begin(PORT, cmd, 1000 / portTICK_RATE_MS);
		// delete the cmd link
		i2c_cmd_link_delete(cmd);
		
	}

	data[0] = rand() % 14;
	data[1] = rand() % 100;
	data[2] = rand() % 100;

	// convert the data to JSON and store as a string in buffer
	// TODO: device id...
	prepareWSJSON(data, doc, id);

}

// convert data to JSON and store as a string in buffer
void esp_DataReader::prepareWSJSON(int * data, StaticJsonDocument<200> & doc, char * id) {
	// add the sensor data
	char ph[5];
	char temperature[10];
	char dissolved_o2[10];
	sprintf(ph, "%d", data[0]);
	sprintf(temperature, "%d", data[1]);
	sprintf(dissolved_o2, "%d", data[2]);
	doc["event"] = "data_update";
	doc["id"] = id;
	doc["data"]["pH"] = ph;
	doc["data"]["temperature"] = temperature;
	doc["data"]["dissolved_o2"] = dissolved_o2;
}


