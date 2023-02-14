#include "DataReader.hpp"
#include "ArduinoJson.h"
#include "driver/i2c.h"
#include "esp_log.h"
#define TAG "DataReader"

static const int RX_BUF_SIZE = 256;

#define TIMEOUT 1000 / portTICK_RATE_MS
#define DO_PROCESSING_DELAY 600 / portTICK_RATE_MS
#define PH_PROCESSING_DELAY 900 / portTICK_RATE_MS
#define DO2_ADDR 0x61
#define PH_ADDR_TEMP 0x63
#define RTD_ADDR 0x66


// // i2c config params
// #define I2C_MASTER_SCL_IO           21      /*!< GPIO number used for I2C master clock */
// #define I2C_MASTER_SDA_IO           22      /*!< GPIO number used for I2C master data  */
// #define I2C_MASTER_NUM              0                          /*!< I2C master i2c port number, the number of i2c peripheral interfaces available will depend on the chip */
// #define I2C_MASTER_FREQ_HZ          100000                     /*!< I2C master clock frequency */
// #define I2C_MASTER_TX_BUF_DISABLE   0                          /*!< I2C master doesn't need buffer */
// #define I2C_MASTER_RX_BUF_DISABLE   0                          /*!< I2C master doesn't need buffer */
// #define I2C_MASTER_TIMEOUT_MS       1000


// Init i2c bus for the EZO board
void i2c_master_init() {
	int i2c_master_port = I2C_NUM_0;
	
	// Configure the I2C bus
	// This is the default configuration
	i2c_config_t conf = {};
	conf.mode = I2C_MODE_MASTER;
	conf.sda_io_num = 21; // SDA pin is GPIO 21
	conf.sda_pullup_en = GPIO_PULLUP_ENABLE;
	conf.scl_io_num = 22; // SCL pin is GPIO 22
	conf.scl_pullup_en = GPIO_PULLUP_ENABLE;
	conf.master.clk_speed = 100000; // 400kHz (EZO boards go 100-400kHz)

	// Set config and install the driver
	ESP_ERROR_CHECK(i2c_param_config(i2c_master_port, &conf));
	ESP_ERROR_CHECK(i2c_driver_install(i2c_master_port, conf.mode, 0, 0, 0));
}


// Class Constructor
// Initialize the i2c bus
// TODO: add other sensors
esp_DataReader::esp_DataReader() {
	// Init i2c 
	i2c_master_init();
}

// TODO: Add destructor
// TODO: perform reads in parallel? use esp event loop/queue?
// TODO: refactor to use a single read function
// TODO: add error handling
void esp_DataReader::readData(StaticJsonDocument<200> & doc, char * id) {
	uint8_t data[2] = "R";
	uint8_t data_temp[10] = {0};
	uint8_t data_ph[10] = {0};
	uint8_t data_dissolved_o2[10] = {0};

	// Read temperature
	ESP_LOGI(TAG, "Reading temp");
	ESP_ERROR_CHECK_WITHOUT_ABORT(i2c_master_write_to_device(I2C_NUM_0, RTD_ADDR, data, 1, TIMEOUT));
	vTaskDelay(DO_PROCESSING_DELAY);
	ESP_ERROR_CHECK_WITHOUT_ABORT(i2c_master_read_from_device(I2C_NUM_0, RTD_ADDR, data_temp, 10, TIMEOUT));
	ESP_LOGI(TAG, "temp: %s", data_temp);
	

	// Read pH
	ESP_LOGI(TAG, "Reading pH");
	ESP_ERROR_CHECK_WITHOUT_ABORT(i2c_master_write_to_device(I2C_NUM_0, PH_ADDR_TEMP, data, 1, TIMEOUT));
	vTaskDelay(PH_PROCESSING_DELAY);
	ESP_ERROR_CHECK_WITHOUT_ABORT(i2c_master_read_from_device(I2C_NUM_0, PH_ADDR_TEMP, data_ph, 10, TIMEOUT));
	ESP_LOGI(TAG, "pH: %s", data_ph);

	// // Read dissolved_o2
	// ESP_LOGI(TAG, "Reading dissolved_o2");
	// ESP_ERROR_CHECK_WITHOUT_ABORT(i2c_master_write_to_device(I2C_NUM_0, DO2_ADDR, data, 1, TIMEOUT));
	// vTaskDelay(DO_PROCESSING_DELAY);
	// ESP_ERROR_CHECK_WITHOUT_ABORT(i2c_master_read_from_device(I2C_NUM_0, DO2_ADDR, data_dissolved_o2, 10, TIMEOUT));
	// ESP_LOGI(TAG, "dissolved_o2: %s", data_dissolved_o2);

	prepareWSJSON((char *) data_ph, (char *) data_temp, (char *) data_dissolved_o2, doc, id);
}

// convert data to JSON and store as a string in buffer
void esp_DataReader::prepareWSJSON(char * data_ph, char * data_temp, char * data_o2, StaticJsonDocument<200> & doc, char * id) {
	// add the sensor data
	char ph[10]={0};
	char temperature[10]={0};
	char dissolved_o2[10]={0};
	sprintf(ph, "%s", data_ph); // 0 is a placeholder for now
	sprintf(temperature, "%s", data_temp);
	sprintf(dissolved_o2, "%s", data_o2);  // 0 is a placeholder for now

	// Remove all non-numeric characters except for the decimal point
	for (int i = 0; i < strlen(ph); i++) {
		if (!isdigit(ph[i]) && ph[i] != '.') {
			ph[i] = ' ';
		}
	}

	for (int i = 0; i < strlen(temperature); i++) {
		if (!isdigit(temperature[i]) && temperature[i] != '.') {
			temperature[i] = ' ';
		}
	}

	for (int i = 0; i < strlen(dissolved_o2); i++) {
		if (!isdigit(dissolved_o2[i]) && dissolved_o2[i] != '.') {
			dissolved_o2[i] = ' ';
		}
	}


	// We want to send a "data_update" event to the server with our id, to let it know we have new data :D
	doc["event"] = "data_update";
	doc["id"] = id;
	doc["data"]["pH"] = ph;
	doc["data"]["temperature"] = temperature;
	doc["data"]["dissolved_o2"] = dissolved_o2;
}


