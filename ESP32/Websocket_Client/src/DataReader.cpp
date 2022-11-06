#include "DataReader.hpp"
#include "ArduinoJson.h"
#include "esp_log.h"
#define TAG "DataReader"
static const int RX_BUF_SIZE = 1024;

#define TXD_PIN (GPIO_NUM_17)
#define RXD_PIN (GPIO_NUM_16)

#define UART UART_NUM_2


static void tx_task(void *arg)
{
	char* Txdata = (char*) malloc(100);
    // while (1) {
    	sprintf (Txdata, "C,0 \r");
        uart_write_bytes(UART, Txdata, strlen(Txdata));
        vTaskDelay(2000 / portTICK_PERIOD_MS);
    // }
}


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

int sendData(const char* logName, const char* data)
{
    const int len = 2;
    const int txBytes = uart_write_bytes(UART, data, len);
    ESP_LOGI(logName, "Wrote %d bytes", txBytes);
    return txBytes;
}

int readData_h(const char* logName, char* data)
{
	const int rxBytes = uart_read_bytes(UART, (uint8_t*)data, 40, 500 / portTICK_RATE_MS);
	ESP_LOGI(logName, "Read %d bytes", rxBytes);
	return rxBytes;
}

esp_DataReader::esp_DataReader() {
	ESP_LOGI(TAG, "Temp Sensor Created");
	uart_config_t uart_config = {
		9600,
		UART_DATA_8_BITS,
		UART_PARITY_DISABLE,
		UART_STOP_BITS_1,
		UART_HW_FLOWCTRL_DISABLE,
		UART_SCLK_APB,
	};

	// Configure UART parameters with error checking
	ESP_ERROR_CHECK(uart_driver_install(UART, RX_BUF_SIZE * 2, 0, 0, NULL, 0));
	ESP_ERROR_CHECK(uart_param_config(UART, &uart_config));
	ESP_ERROR_CHECK(uart_set_pin(UART, TXD_PIN, RXD_PIN, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE));
	sendData("main", "C,0 \r");
	ESP_LOGI(TAG, "Sensors initialized");
	tx_task(NULL);
}

void esp_DataReader::loop() {
	// xTaskCreate(rx_task, "uart_rx_task", 1024*2, NULL, configMAX_PRIORITIES-1, NULL);
	rx_task(NULL);
    // xTaskCreate(tx_task, "uart_tx_task", 1024*2, NULL, configMAX_PRIORITIES-2, NULL);
}



// TODO: Add destructor

// TODO: perform reads in parallel?
// TODO: refactor to use a single read function
// TODO: add error handling
void esp_DataReader::readData(StaticJsonDocument<200> & doc, char * id) {
	char * data = (char*) malloc(100);
	sendData("main", "R\r");
	const int rxBytes = readData_h(TAG, data);

	// take only the first 6 bytes of data
	data[6] = '\0';
	ESP_LOGI(TAG, "Read %d bytes: '%s'", rxBytes, data);
	prepareWSJSON(data, doc, id);
	free(data);
}

// convert data to JSON and store as a string in buffer
void esp_DataReader::prepareWSJSON(char * data, StaticJsonDocument<200> & doc, char * id) {
	// add the sensor data
	char ph[5];
	char temperature[10];
	char dissolved_o2[10];
	sprintf(ph, "%d", 0);
	sprintf(temperature, "%s", data);
	sprintf(dissolved_o2, "%d", 0); 
	doc["event"] = "data_update";
	doc["id"] = id;
	doc["data"]["pH"] = ph;
	doc["data"]["temperature"] = temperature;
	doc["data"]["dissolved_o2"] = dissolved_o2;
}


