#include "DataDevice.hpp"
#include "esp_log.h"
#include "esp_wifi.h"
#include "WifiCredentials.h"
#include "nvs_flash.h"
#include "WiFiManager.c"

// Constants
char * url = "websocket-biot.herokuapp.com";
char * endpoint = "chat";


extern "C" {
	void app_main();
}


void app_main() {

	 //Initialize NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
      ESP_ERROR_CHECK(nvs_flash_erase());
      ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

	// From sample code...
	ESP_LOGI(TAG, "ESP_WIFI_MODE_STA");
    wifi_init_sta();

	// Init Data Device
	DataDevice * dataDevice = new DataDevice(url, endpoint);

	while (1) {
		dataDevice->readAndSendData();
		vTaskDelay(1000 / portTICK_PERIOD_MS);
	}

}