
// esp32 websocket wrapper than encapsulates the websocket connection and provides a simple interface to send and receive messages
// using the ESP espressif esp32 websocket

#include "esp_socket.hpp";

void esp_WebSocket::WebSocket(char * url, char * endpoint) {
	ws_config = {
		.uri = "ws://" + url + "/" + endpoint,
	};
	esp_WebSocket::WebSocket_init();
};

void esp_WebSocket::WebSocket(char * url, char * endpoint, int port) {
	ws_config = {
		.uri = "ws://" + url + "/" + endpoint,
		.port = port,
	};
	esp_WebSocket::WebSocket_init();
};

void esp_WebSocket::WebSocket_init() {
	ws_handle = esp_websocket_client_init(&ws_config);
	if (handle == NULL) {
		Serial.println("Failed to initialize websocket client");
		return;
	};
	Serial.println("Websocket client initialized");
	while (esp_websocket_client_is_connected(handle) == 0) {
	    esp_websocket_client_start(handle);
		delay(100);
	};
	Serial.println("Websocket connected");
}

// Simple send method that sends a message to the websocket server
int esp_WebSocket::WebSocket_send(char * message) {
	if (ws_handle == NULL || esp_websocket_client_is_connected(ws_handle) == 0) {
		Serial.println("Websocket not connected");
		return -1;
	};
	int len = strlen(message);
	int timeout = 0;
	esp_websocket_client_send(ws_handle, (uint8_t *)message, len, timeout);
	return 0;
}

void esp_WebSocket::Register_callback(void (*callback)(void * event_arg, esp_event_base_t event_base, int32_t event_id, void *event_data)) {
	if (ws_handle == NULL || esp_websocket_client_is_connected(ws_handle) == 0) {
		Serial.println("Websocket not connected");
		return;
	};
	
	esp_websocket_register_events(ws_handle, WEBSOCKET_EVENT_DATA, callback, NULL);
}

void esp_WebSocket::Websocket_Stop() {
	if (ws_handle == NULL || esp_websocket_client_is_connected(ws_handle) == 0) {
		Serial.println("Websocket not connected");
		return;
	};
	esp_websocket_client_stop(ws_handle);
}




 




