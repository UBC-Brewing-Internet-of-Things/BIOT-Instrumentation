#include <stdio.h>
#include "driver/i2c.h"
#include "driver/uart.h"
#include <nvs_flash.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"

#define I2C_SLAVE_ADDR 0x66 // PH chip address, as per datasheet
#define TIMEOUT 1000 / portTICK_RATE_MS
#define RX_BUF_SIZE 256

static const char *TAG = "I2C Calibration";

// Init i2c bus for the EZO board
void i2c_master_init() {
	int i2c_master_port = I2C_NUM_0;
	
	// Configure the I2C bus
	// This is the default configuration
	i2c_config_t conf = {0};
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

// Init uart bus for the computer
// So we can gather commands to send to the EZO board
void uart_init() {

	// Define the UART configuration from DOCS
	uart_config_t uart_config_computer = {
		.baud_rate = 115200,
		.data_bits = UART_DATA_8_BITS,
		.parity    = UART_PARITY_DISABLE,
		.stop_bits = UART_STOP_BITS_1,
		.flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
		.source_clk = UART_SCLK_APB,
	};
	// Configure UART parameters with error checking
	ESP_ERROR_CHECK(uart_driver_install(UART_NUM_0, RX_BUF_SIZE * 2, 0, 0, NULL, 0));
	ESP_ERROR_CHECK(uart_param_config(UART_NUM_0, &uart_config_computer));
	ESP_ERROR_CHECK(uart_set_pin(UART_NUM_0, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE));

}


void app_main() {
	// Init NVS for storing calibration data
	esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
      ESP_ERROR_CHECK(nvs_flash_erase());
      ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

	// Init i2c and uart
	i2c_master_init();
	uart_init();

	while (1) {
		// Send "R\r" to the EZO board to take a reading
		uint8_t cmd[4]= "R";
		uint8_t response[10] = {0};

		// Send the command to the EZO board
		ESP_LOGI(TAG, "Sending command: %s", cmd);
		ESP_ERROR_CHECK(i2c_master_write_to_device(I2C_NUM_0, I2C_SLAVE_ADDR, cmd, 1, TIMEOUT));
		
		// Wait for processing delay
		vTaskDelay(600 / portTICK_RATE_MS);		

		// Read the response from the EZO board
		ESP_ERROR_CHECK(i2c_master_read_from_device(I2C_NUM_0, I2C_SLAVE_ADDR, response, 10, TIMEOUT));

		ESP_LOGI(TAG, "Response: %s, %d", response, response[0]);

		// If there's a command from the computer, send it to the EZO board
		uint8_t user_data[10] = {};
		int len = uart_read_bytes(UART_NUM_0, (uint8_t *)user_data, 10, 500 / portTICK_RATE_MS);
		if (len > 0) {
			ESP_LOGI(TAG, "Sending command: %s", user_data);
			ESP_ERROR_CHECK(i2c_master_write_to_device(I2C_NUM_0, I2C_SLAVE_ADDR, user_data, len, TIMEOUT));
			vTaskDelay(1000 / portTICK_RATE_MS); // max processing delay is 750ms

			// Read the response from the EZO board
			ESP_ERROR_CHECK(i2c_master_read_from_device(I2C_NUM_0, I2C_SLAVE_ADDR, response, 10, TIMEOUT));

			ESP_LOGI(TAG, "Response to user input: %s, %d", response, response[0]);
		}
		
		// Wait 1 second
		vTaskDelay(1000 / portTICK_RATE_MS);
	}

}

