
// esp32 websocket wrapper than encapsulates the websocket connection and provides a simple interface to send and receive messages
// using the ESP espressif esp32 websocket

#include "esp_WebSocket.hpp"
#include "esp_log.h"
#include <string>

static const char* TAG = "WebSocket";

esp_WebSocket::esp_WebSocket(char * url, char * endpoint) {
	std::string uri_str = "ws://" + std::string(url) + "/" + std::string(endpoint);
	ws_config = {
		.uri = uri_str.c_str(),
	};
	esp_WebSocket::WebSocket_init();
};

esp_WebSocket::esp_WebSocket(char * url, char * endpoint, int port) {
	std::string uri_str = "ws://" + std::string(url) + "/" + std::string(endpoint);
	ws_config.uri = uri_str.c_str();
	ws_config.port = port;
	esp_WebSocket::WebSocket_init();
};

void esp_WebSocket::WebSocket_init() {
	ws_handle = esp_websocket_client_init(&ws_config);
	if (ws_handle == NULL) {
		ESP_LOGI(TAG, "Websocket init failed");
		return;
	};
	ESP_LOGI(TAG,"Websocket client initialized");
	int timeout = 0; 
	while (esp_websocket_client_is_connected(ws_handle) == 0 && timeout < 1000) {
	    esp_err_t err = esp_websocket_client_start(ws_handle);
	    if (err == ESP_OK) {
	        ESP_LOGI(TAG, "Websocket client started");
	        break;
	    }
		timeout++;
	};
	if (esp_websocket_client_is_connected(ws_handle) == 0) {
		ESP_LOGI(TAG, "Websocket connection failed");
		return;
	}
	ESP_LOGI(TAG,"Websocket connected");
}

// Simple send method that sends a message to the websocket server
int esp_WebSocket::WebSocket_send(char * message) {
	if (ws_handle == NULL || esp_websocket_client_is_connected(ws_handle) == 0) {
		ESP_LOGI(TAG,"Websocket not connected");
		return -1;
	};
	int len = strlen(message);
	int timeout = 0;
	esp_websocket_client_send(ws_handle, message, len, timeout);
	return 0;
}

void esp_WebSocket::Register_callback(void (*callback)(void * event_arg, esp_event_base_t event_base, int32_t event_id, void *event_data)) {
	if (ws_handle == NULL || esp_websocket_client_is_connected(ws_handle) == 0) {
		ESP_LOGI(TAG,"Websocket not connected");
		return;
	};
	
	esp_websocket_register_events(ws_handle, WEBSOCKET_EVENT_DATA, callback, NULL);
}

void esp_WebSocket::Websocket_Stop() {
	if (ws_handle == NULL || esp_websocket_client_is_connected(ws_handle) == 0) {
		ESP_LOGI(TAG,"Websocket not connected");
		return;
	};
	esp_websocket_client_stop(ws_handle);
}




 




