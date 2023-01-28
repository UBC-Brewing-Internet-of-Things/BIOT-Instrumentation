// // This is a program to calibrate the ezo Atlas boards
// // It has two tasks:
// //      - Continuously read the sensor and print the value
// // 		- Take input from the serial and send it to the sensor

// #include <stdio.h>
// #include <stdlib.h>
// #include <string.h>
// #include <nvs_flash.h>
// #include "freertos/FreeRTOS.h"
// #include "freertos/task.h"
// #include "driver/uart.h"
// #include "driver/gpio.h"
// #include "sdkconfig.h"
// #include "esp_log.h"


// #define TXD_PIN (GPIO_NUM_17)
// #define RXD_PIN (GPIO_NUM_16)
// #define UART UART_NUM_2

// #define RX_BUF_SIZE 256



// // Simple method to send data over the UART connection
// int sendData(const char* logName, const char* data, uart_port_t uart_num) {
// 	const int len = strlen(data);
// 	const int txBytes = uart_write_bytes(uart_num, data, len);
// 	ESP_LOGI(logName, "Wrote %d bytes", txBytes);
// 	return txBytes;
// }

// // Simple method to read data from the UART connection
// int readData_h(const char* logName, char* data, uart_port_t uart_num)
// {
// 	// Read data from the UART
// 	ESP_LOGI(logName, "Reading data");
// 	const int rxBytes = uart_read_bytes(uart_num, (uint8_t*) data, RX_BUF_SIZE, 500 / portTICK_RATE_MS);
// 	// Print the data if we read any
// 	if (rxBytes > 0) {
// 		data[rxBytes] = 0;
// 		//ESP_LOGI(logName, "Read %d bytes: '%s'", rxBytes, data);
// 	}
// 	return rxBytes;
// }



// void app_main() {

// 	esp_err_t ret = nvs_flash_init();
//     if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
//       ESP_ERROR_CHECK(nvs_flash_erase());
//       ret = nvs_flash_init();
//     }
//     ESP_ERROR_CHECK(ret);

// 	// uart for the Atlas board
//    uart_config_t uart_config_sensor = {
//         .baud_rate = 9600,
//         .data_bits = UART_DATA_8_BITS,
//         .parity    = UART_PARITY_DISABLE,
//         .stop_bits = UART_STOP_BITS_1,
//         .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
//         .source_clk = UART_SCLK_APB,
//     };
// 	// Configure UART parameters with error checking
// 	ESP_ERROR_CHECK(uart_driver_install(UART, RX_BUF_SIZE * 2, 0, 0, NULL, 0));
// 	ESP_ERROR_CHECK(uart_param_config(UART, &uart_config_sensor));
// 	ESP_ERROR_CHECK(uart_set_pin(UART, TXD_PIN, RXD_PIN, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE));

// 	// uart for the computer
// 	uart_config_t uart_config_computer = {
// 		.baud_rate = 115200,
// 		.data_bits = UART_DATA_8_BITS,
// 		.parity    = UART_PARITY_DISABLE,
// 		.stop_bits = UART_STOP_BITS_1,
// 		.flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
// 		.source_clk = UART_SCLK_APB,
// 	};
// 	// Configure UART parameters with error checking
// 	ESP_ERROR_CHECK(uart_driver_install(UART_NUM_0, RX_BUF_SIZE * 2, 0, 0, NULL, 0));
// 	ESP_ERROR_CHECK(uart_param_config(UART_NUM_0, &uart_config_computer));
// 	ESP_ERROR_CHECK(uart_set_pin(UART_NUM_0, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE));

// 	sendData("main", "C,0\r", UART);	

// 	while (1) {
// 		char data[40];
// 		sendData("main", "R\r", UART);
// 		int rxBytes = readData_h("UART", data, UART);
// 		// data[6] = '\0';
		
// 		if (rxBytes > 0) {
// 			ESP_LOGI("UART", "Read %d bytes: '%s'", rxBytes, data);
// 		}

// 		// if there's a command from the computer, send it to the sensor
// 		char data2[40];
// 		int rxBytes2 = readData_h("Serial", data2, UART_NUM_0);
// 		if (rxBytes2 > 0) {
// 			ESP_LOGI("Serial", "Read %d bytes: '%s'", rxBytes2, data2);
// 			sendData("main", data2, UART);
// 		}

// 		vTaskDelay(1000 / portTICK_PERIOD_MS);
// 	}

// }