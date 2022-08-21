#include "DataDevice.hpp"


// Constants
char * url = "localhost";
int port = 8080;
char * endpoint = "chat";



void app_main() {

	// Init Data Device
	DataDevice * dataDevice = new DataDevice(url, endpoint, port);

	while (1) {
		dataDevice->readAndSendData();
		vTaskDelay(1000 / portTICK_PERIOD_MS);
	}

}