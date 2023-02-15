#include "DataReader/DataDevice.hpp"
#include "esp_log.h"
#include "esp_wifi.h"
#include "WebSocket/WifiCredentials.h"
#include "nvs_flash.h"
#include "WebSocket/WiFiManager.c"

// Constants
char * url = "192.168.50.67:3001";
// char * url = "192.168.1.139:3001";
char * endpoint = "";


extern "C" {
    void app_main();
}


void app_main() {

    //	ESP_LOGI("main", "Starting up");

    // Initialize NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    // // From sample code...
    wifi_init_sta();

    // // Init Data Device
    DataDevice * dataDevice = new DataDevice(url, endpoint, "Bob");
    ESP_LOGI(TAG, "DataDevice created with url: %s, endpoint: %s, deviceName: %s", url, endpoint, "test device");

    // wait for everything to connect
    vTaskDelay(10000 / portTICK_PERIOD_MS);

    // wait for the id to be set
    while (strcmp(dataDevice->getId(), "") == 0) {
        ESP_LOGI(TAG, "Waiting for id to be set");
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }

    ESP_LOGI(TAG, "Id set to: %s", dataDevice->getId());


    // Main Loop
    while (1) {
        dataDevice->readAndSendData();
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }

}
