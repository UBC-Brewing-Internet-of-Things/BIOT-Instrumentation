#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"
#include "esp_log.h"
#include "driver/uart.h"
#include "string.h"
#include "driver/gpio.h"

static const int RX_BUF_SIZE = 1024;

#define TXD_PIN (GPIO_NUM_17)
#define RXD_PIN (GPIO_NUM_16)

#define UART UART_NUM_2

int sendData(const char* logName, const char* data)
{
    const int len = 2;
    const int txBytes = uart_write_bytes(UART, data, len);
    ESP_LOGI(logName, "Wrote %d bytes", txBytes);
    return txBytes;
}

int readData(const char* logName, char* data)
{
	const int rxBytes = uart_read_bytes(UART, (uint8_t*)data, 40, 500 / portTICK_RATE_MS);
	ESP_LOGI(logName, "Read %d bytes", rxBytes);
	return rxBytes;
}


static void tx_task(void *arg)
{
    static const char *TX_TASK_TAG = "TX_TASK";
    esp_log_level_set(TX_TASK_TAG, ESP_LOG_INFO);
    while (1) {
        sendData(TX_TASK_TAG, "R\r");
        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
}


// static void rx_task(void *arg)
// {
//     static const char *RX_TASK_TAG = "RX_TASK";
//     esp_log_level_set(RX_TASK_TAG, ESP_LOG_INFO);
//     uint8_t* data = (uint8_t*) malloc(RX_BUF_SIZE+1);
//     while (1) {
//        const
//         if (rxBytes > 0) {
//             data[rxBytes] = 0;
//             ESP_LOGI(RX_TASK_TAG, "Read %d bytes: '%s'", rxBytes, data);
//           //  ESP_LOG_BUFFER_HEXDUMP(RX_TASK_TAG, data, rxBytes, ESP_LOG_INFO);
//         }
//     }
//     free(data);
// }


void app_main() {
	ESP_LOGI("main", "Hello world!");
	uart_config_t uart_config = {
		.baud_rate = 9600,
		.data_bits = UART_DATA_8_BITS,
		.parity = UART_PARITY_DISABLE,
		.stop_bits = UART_STOP_BITS_1,
		.flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
		.rx_flow_ctrl_thresh = UART_SCLK_APB,
	};

	// Configure UART parameters with error checking
	ESP_ERROR_CHECK(uart_driver_install(UART, RX_BUF_SIZE * 2, 0, 0, NULL, 0));
	ESP_ERROR_CHECK(uart_param_config(UART, &uart_config));
	ESP_ERROR_CHECK(uart_set_pin(UART, TXD_PIN, RXD_PIN, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE));
	sendData("main", "C,0 \r");
	// xTaskCreate(rx_task, "uart_rx_task", 1024*2, NULL, configMAX_PRIORITIES, NULL);
    // xTaskCreate(tx_task, "uart_tx_task", 1024*2, NULL, configMAX_PRIORITIES-1, NULL);	
	while (1) {
		char data[40];
		sendData("main", "R\r");
		readData("main", data);
		ESP_LOGI("main", "Read %d bytes: '%s'", strlen(data), data);
		vTaskDelay(1000 / portTICK_PERIOD_MS);
	}

	

}