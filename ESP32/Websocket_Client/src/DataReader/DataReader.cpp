#include "DataReader.hpp"
#include "ArduinoJson.h"
#include "driver/i2c.h"
#include "esp_log.h"
#define TAG "DataReader"
static const int RX_BUF_SIZE = 1024;

// PH
#define TXD_PIN (GPIO_NUM_17)
#define RXD_PIN (GPIO_NUM_16)
#define UART UART_NUM_2

// Temperature
#define TXD_PIN_TEMP (GPIO_NUM_1)
#define RXD_PIN_TEMP (GPIO_NUM_3)
#define UART_TEMP UART_NUM_1


// i2c config params
#define I2C_MASTER_SCL_IO           CONFIG_I2C_MASTER_SCL      /*!< GPIO number used for I2C master clock */
#define I2C_MASTER_SDA_IO           CONFIG_I2C_MASTER_SDA      /*!< GPIO number used for I2C master data  */
#define I2C_MASTER_NUM              0                          /*!< I2C master i2c port number, the number of i2c peripheral interfaces available will depend on the chip */
#define I2C_MASTER_FREQ_HZ          400000                     /*!< I2C master clock frequency */
#define I2C_MASTER_TX_BUF_DISABLE   0                          /*!< I2C master doesn't need buffer */
#define I2C_MASTER_RX_BUF_DISABLE   0                          /*!< I2C master doesn't need buffer */
#define I2C_MASTER_TIMEOUT_MS       1000



// TODO: use the esp event loop to handle the data reader events
// TX task will transmit data from the device to the connection on the TX pin
static void tx_task(void *arg)
{
	char* Txdata = (char*) malloc(100);
    // while (1) {
    	sprintf (Txdata, "C,0 \r");
        uart_write_bytes(UART, Txdata, strlen(Txdata));
        vTaskDelay(2000 / portTICK_PERIOD_MS);
    // }
}


// TODO: use the esp event loop to handle the data reader events
// The RX task will read data from the connection on the RX pin and send it to the device
static void rx_task(void *arg)
{
    static const char *RX_TASK_TAG = "RX_TASK";
    esp_log_level_set(RX_TASK_TAG, ESP_LOG_INFO);
    uint8_t* data = (uint8_t*) malloc(RX_BUF_SIZE+1);
    // while (1) {
        const int rxBytes = uart_read_bytes(UART, data, RX_BUF_SIZE, 500 / portTICK_RATE_MS);
        if (rxBytes > 0) {
            data[rxBytes] = 0;
            ESP_LOGI(RX_TASK_TAG, "Read %d bytes: '%s'", rxBytes, data);
        } else {
			ESP_LOGI(RX_TASK_TAG, "No data");
		}
    // }
    free(data);
}

// Simple method to send data over the UART connection
int sendData(const char* logName, const char* data, int UART_use)
{
    const int len = 2;
    const int txBytes = uart_write_bytes(UART_use, data, len);
    ESP_LOGI(logName, "Wrote %d bytes", txBytes);
    return txBytes;
}

// Simple method to read data from the UART connection
int readData_h(const char* logName, char* data, int UART_use)
{
	const int rxBytes = uart_read_bytes(UART_use, (uint8_t*)data, 40, 500 / portTICK_RATE_MS);
	ESP_LOGI(logName, "Read %d bytes", rxBytes);
	return rxBytes;
}


// Class Constructor
// Initializes the UART connection -> Currently only PH
// TODO: add other sensors
esp_DataReader::esp_DataReader() {
	ESP_LOGI(TAG, "pH Sensor Created");


	int i2c_master_port = I2C_MASTER_NUM;
	i2c_config_t conf = {
		I2C_MODE_MASTER,
		I2C_MASTER_SDA_IO,
		GPIO_PULLUP_ENABLE,
		GPIO_PULLUP_ENABLE,
		I2C_MASTER_FREQ_HZ,
	};

	// Configure UART parameters with error checking
	ESP_ERROR_CHECK(i2c_param_config(i2c_master_port, &conf);
	ESP_ERROR_CHECK(i2c_driver_install(i2c_master_port, conf.mode, I2C_MASTER_RX_BUF_DISABLE, I2C_MASTER_TX_BUF_DISABLE, 0);

	ESP_LOGI(TAG, "Sensors initialized");
}

// TODO: Add destructor
// TODO: perform reads in parallel? use esp event loop/queue?
// TODO: refactor to use a single read function
// TODO: add error handling
void esp_DataReader::readData(StaticJsonDocument<200> & doc, char * id) {
	char data_ph[10]; // we dont need this much memory, I think max is ~40 chars...
	// "R" is the command to take a reading
	sendData("main", "R\r", UART);
	// Listen on the rx pin for a response
	const int rxBytes = readData_h(TAG, data_ph, UART);

	// take only the first 6 bytes of data (just in case there is some garbage at the end or in the buffer...)
	data_ph[5] = '\0';
	//int data_int = atoi(data); // we convert the data to an int to get rid of unwanted chars
	ESP_LOGI(TAG, "Read %d bytes: '%s'", rxBytes, data_ph);
	//sprintf(data, "%d", data_int); // we convert the data back to a string
	// We need to prep the data for the server in a properly formatted JSON object

	char data_temp[10] = "0.00"; // we dont need this much memory, I think max is ~40 chars...
	// sendData("main", "R\r", UART_TEMP);
	// const int rxBytes_temp = readData_h(TAG, data_temp, UART_TEMP);
	// data_temp[6] = '\0';
	// ESP_LOGI(TAG, "Read %d bytes: '%s'", rxBytes_temp, data_temp);

	prepareWSJSON(data_temp, data_ph, doc, id);

	// Now that the data is in the JSON document, we can free the buffer
}

// convert data to JSON and store as a string in buffer
void esp_DataReader::prepareWSJSON(char * data_ph, char * data_temp, StaticJsonDocument<200> & doc, char * id) {
	// add the sensor data
	char ph[10];
	char temperature[10];
	char dissolved_o2[10];
	sprintf(ph, "%s", data_ph); // 0 is a placeholder for now
	sprintf(temperature, "%s", data_temp);
	sprintf(dissolved_o2, "%d", 0);  // 0 is a placeholder for now

	// We want to send a "data_update" event to the server with our id, to let it know we have new data :D
	doc["event"] = "data_update";
	doc["id"] = id;
	doc["data"]["pH"] = ph;
	doc["data"]["temperature"] = temperature;
	doc["data"]["dissolved_o2"] = dissolved_o2;
}


