
// esp32 websocket wrapper than encapsulates the websocket connection and provides a simple interface to send and receive messages
// using the ESP espressif esp32 websocket

#include "DataDevice.hpp"
#include "esp_log.h"
#include <string>
#include <ArduinoJson.h>

#define TIMEOUT 10000

esp_WebSocket * ws_callback_reference;

static const char* TAG = "WebSocket";

// Simple send method that sends a message to the websocket server
int esp_WebSocket::WebSocket_send(char * message) {
	if (ws_handle == NULL || esp_websocket_client_is_connected(ws_handle) == 0) {
		ESP_LOGI(TAG,"Websocket not connected");
		return -1;
	};
	int len = strlen(message);
	esp_websocket_client_send(ws_handle, message, len, portMAX_DELAY);
	return 0;
}

void esp_WebSocket::Register_callback(void (*callback)(void * event_arg, esp_event_base_t event_base, int32_t event_id, void *event_data)) {
	if (ws_handle == NULL || esp_websocket_client_is_connected(ws_handle) == 0) {
		ESP_LOGI(TAG,"Websocket not connected");
		return;
	};
	esp_websocket_register_events(ws_handle, WEBSOCKET_EVENT_DATA, callback, NULL);
}


 
void esp_WebSocket::Message_Received(char * message) {
	if (message == NULL || strlen(message) == 0) {
		ESP_LOGI(TAG, "Message is null");
		return;
	}

	StaticJsonDocument<200> doc;
	DeserializationError error = deserializeJson(doc, message);
	if (error) {
		ESP_LOGI(TAG, "Deserialization failed");
		ESP_LOGE(TAG, "deserializeJson() failed: %s", error.c_str());
		return;
	}

	// Handler for custom event tag 
	if (doc.containsKey("event")) {
		const char * event = doc["event"];
		if (strcmp(event, "register") == 1) {
			// get the id from the message and set it in the device
			const char * id_const = doc["id"];
			char * id = (char *)id_const;
			((DataDevice *)parentDevice)->setId(id);
			DataDevice * device = (DataDevice *) parentDevice;
			device->setId(id);
			StaticJsonDocument<200> response;
			response["event"] = "register_data_device";
			response["id"] = id;
			response["name"] = device->getName();
			response["type"] = "esp32";

			char buffer[200];
			serializeJson(response, buffer);
			WebSocket_send(buffer);
		}	
	}
}

void Websocket_Event_Handler(void * event_arg, esp_event_base_t event_base, int32_t event_id, void *event_data) {
	esp_websocket_event_data_t *data = (esp_websocket_event_data_t *)event_data;
	switch (event_id) {
		case WEBSOCKET_EVENT_CONNECTED:
			ESP_LOGI(TAG, "Websocket connected");
			break;
		case WEBSOCKET_EVENT_DISCONNECTED:
			ESP_LOGI(TAG, "Websocket disconnected");
			break;
		case WEBSOCKET_EVENT_DATA:
			ESP_LOGI(TAG, "Websocket data received");
			ESP_LOGI(TAG, "Received=%.*s", data->data_len, (char *)data->data_ptr);
			ws_callback_reference->Message_Received((char *)data->data_ptr);
			break;
		case WEBSOCKET_EVENT_ERROR:
			ESP_LOGI(TAG, "Websocket error");
			break;
	}
}



void esp_WebSocket::Websocket_Stop() {
	if (ws_handle == NULL || esp_websocket_client_is_connected(ws_handle) == 0) {
		ESP_LOGI(TAG,"Websocket not connected");
		return;
	};
	esp_websocket_client_stop(ws_handle);
}


esp_WebSocket::esp_WebSocket(char * url, char * endpoint, void * parentDevice) {
	std::string uri_str = "ws://" + std::string(url) + "/" + std::string(endpoint);
	ws_config.uri = uri_str.c_str();
	ws_callback_reference = this;
	this->parentDevice = parentDevice;
	while (WebSocket_init() != 0) {
		ESP_LOGI(TAG, "Attempting websocket init again");
		vTaskDelay(1000 / portTICK_PERIOD_MS);
	}

	// Register the websocket event handler
	// error checking prob not needed
	esp_err_t error = esp_websocket_register_events(ws_handle, WEBSOCKET_EVENT_ANY, (esp_event_handler_t) Websocket_Event_Handler, (void*)ws_handle);
	if (error != ESP_OK) {
		ESP_LOGI(TAG, "Error registering websocket events");
	}
};

esp_WebSocket::esp_WebSocket(char * url, char * endpoint, int port, void * parentDevice) {
	std::string uri_str = "ws://" + std::string(url) + "/" + std::string(endpoint);
	ws_config.uri = uri_str.c_str();
	ws_config.port = port;
	this->parentDevice = parentDevice;
	while (WebSocket_init() != 0) {
		ESP_LOGI(TAG, "Attempting websocket init again");
		vTaskDelay(1000 / portTICK_PERIOD_MS);
	}

	// error checking prob not needed
	esp_err_t error = esp_websocket_register_events(ws_handle, WEBSOCKET_EVENT_ANY, (esp_event_handler_t) Websocket_Event_Handler, (void*)ws_handle);
	if (error != ESP_OK) {
		ESP_LOGI(TAG, "Error registering events");
	}
};


// Initialize the websocket connection
// returns 1 if there was an error, 0 if there was no error
int esp_WebSocket::WebSocket_init() {
	ws_handle = esp_websocket_client_init(&ws_config);
	if (ws_handle == NULL) {
		ESP_LOGI(TAG, "Websocket init failed");
		return 1;
	};
	ESP_LOGI(TAG,"Websocket client initialized");
	int timeout = 0; 
	while (esp_websocket_client_is_connected(ws_handle) == 0 && timeout < TIMEOUT) {
	    esp_err_t err = esp_websocket_client_start(ws_handle);
	    if (err == ESP_OK) {
	        ESP_LOGI(TAG, "Websocket client started");
	        break;
	    }
		timeout++;
	};
	if (esp_websocket_client_is_connected(ws_handle) == 0) {
		ESP_LOGI(TAG, "Websocket connection failed");
		return 1;
	}
	ESP_LOGI(TAG,"Websocket connected");
	return 0;
}



 




