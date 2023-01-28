// #include <stdio.h>
// #include "driver/i2c.h"
// #include "esp_log.h"

// #define I2C_SLAVE_ADDR 0x61 // PH chip address, as per datasheet
// #define TIMEOUT 1000 / portTICK_RATE_MS

// static const char *TAG = "I2C Calibration";


// void i2c_master_init() {
// 	int i2c_master_port = I2C_NUM_0;
	
// 	// Configure the I2C bus
// 	// This is the default configuration
// 	i2c_config_t conf;
// 	conf.mode = I2C_MODE_MASTER;
// 	conf.sda_io_num = 21; // SDA pin is GPIO 21
// 	conf.sda_pullup_en = GPIO_PULLUP_ENABLE;
// 	conf.scl_io_num = 22; // SCL pin is GPIO 22
// 	conf.scl_pullup_en = GPIO_PULLUP_ENABLE;
// 	conf.master.clk_speed = 400000; // 400kHz (EZO boards go 100-400kHz)

// 	// Set config and install the driver
// 	ESP_ERROR_CHECK(i2c_param_config(i2c_master_port, &conf));
// 	ESP_ERROR_CHECK(i2c_driver_install(i2c_master_port, conf.mode, 0, 0, 0));
// }


// void app_main() {
// 	i2c_master_init();


// 	// For now, we just want to loop and take a reading every second
// 	// Create a buffer of 40 chars to hold the response from the EZO board, initialize to all 0s


// 	while (1) {
// 		// Send "R\r" to the EZO board to take a reading
// 		char cmd[2]= "R\r";
// 		ESP_LOGI(TAG, "Sending command: %s", cmd);
// 		// Send the command to the EZO board
// 		ESP_ERROR_CHECK(i2c_master_write_to_device(I2C_NUM_0, I2C_SLAVE_ADDR, cmd, strlen(cmd), TIMEOUT));
		
		
// 		// Read the response from the EZO board
// 		char response[40] = {0};
// 		ESP_ERROR_CHECK(i2c_master_read_from_device(I2C_NUM_0, I2C_SLAVE_ADDR, response, 40, TIMEOUT));
// 		ESP_LOGI(TAG, "Response: %s", response);

// 		// Wait 1 second
// 		vTaskDelay(1000 / portTICK_RATE_MS);
// 	}


	

// }

