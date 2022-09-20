
// esp32 websocket wrapper than encapsulates the websocket connection and provides a simple interface to send and receive messages
// using the ESP espressif esp32 websocket

#include "DataDevice.hpp"
#include "esp_log.h"
#include <string>


#define TIMEOUT 10000

esp_WebSocket * ws_callback_reference;

static const char* TAG = "WebSocket";

// Simple send method that sends a message to the websocket server
int esp_WebSocket::WebSocket_send_with_id(StaticJsonDocument<200> buff) {
	if (ws_handle == NULL || esp_websocket_client_is_connected(ws_handle) == 0) {
		ESP_LOGI(TAG,"Websocket not connected");
		return -1;
	};
	
	// add the device id to the message
	char * device_id = this->getID();
	ESP_LOGI(TAG, "Adding device id to message: %s", device_id);
	buff["id"] = device_id;

	// convert the message to a string
	char message[200];
	serializeJson(buff, message);

	// send the message
	ESP_LOGI(TAG, "Sending message: %s", message);
	int ret = esp_websocket_client_send(ws_handle, message, strlen(message), TIMEOUT);
	if (ret < 0) {
		ESP_LOGE(TAG, "Error sending message");
		return -1;
	}
	
	return 0;
}

int esp_WebSocket::WebSocket_send(char * message) {
	if (ws_handle == NULL || esp_websocket_client_is_connected(ws_handle) == 0) {
		ESP_LOGI(TAG,"Websocket not connected");
		return -1;
	};

	int len = strlen(message);
	ESP_LOGI(TAG, "Sending message: %s", message);
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

void esp_WebSocket::setID(const char * id) {
	strncpy(this->id, id, 37);
	ESP_LOGI(TAG, "Set device id to: %s", this->id);
}

char * esp_WebSocket::getID() {
	return this->id;
}

 
void esp_WebSocket::Message_Received(char * message, int length) {
	if (message == NULL || length == 0) {
		ESP_LOGI(TAG, "Message is null");
		return;
	}
	ESP_LOGI(TAG, "Message received: %s length %d", message, length);


	// check for heartbeat
	char * ret = strstr(message, "heartbeat_server");
	if (ret) {
		ESP_LOGI(TAG, "Heartbeat received");
		WebSocket_send("heartbeat_client");
		return;
	}

	char message_chr = message[0];
	ESP_LOGI(TAG, "Message received: %c", message_chr);

	DynamicJsonDocument doc(1024);
	DeserializationError error = deserializeJson(doc, (const char *) message);

	if (error) {
		ESP_LOGI(TAG, "Deserialization failed");
		ESP_LOGE(TAG, "deserializeJson() failed with code %s", error.c_str());
		return;
	}
	// Handler for custom event tag 
	if (doc.containsKey("event")) {
		const char * event = doc["event"];
		ESP_LOGI(TAG, "Event received: %s", event);
		if (strcmp(event, "register") == 0) { // strcmp is weird like that...
			ESP_LOGI(TAG, "Register event triggered");
			// get the id from the message and set it in the device
			const char * id_const = doc["id"];
			ESP_LOGI(TAG, "ID received: %s", id_const);

			DataDevice * dd = (DataDevice *) parentDevice;
			char * id = (char *)id_const;

			ESP_LOGI(TAG, "ID received (translated): %s", id);
			this->setID(id_const);
			dd->setId(id_const);

			StaticJsonDocument<200> response;
			response["event"] = "register_data_device";
			response["id"] = id;
			response["name"] = dd->getName();
			response["type"] = "esp32";
			
			char buffer[200];
			serializeJson(response, buffer);
			ESP_LOGI(TAG, "Sending response: %s", buffer);
			WebSocket_send(buffer);
			ESP_LOGI(TAG, "Register response sent %s", buffer);
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
		{
			ESP_LOGI(TAG, "Websocket data received with length %d", data->data_len);
			if (data->op_code == 0x08 && data->data_len == 2) {
            	ESP_LOGI(TAG, "Received closed message with code=%d", 256*data->data_ptr[0] + data->data_ptr[1]);
			} else {			
				int length = (int) data->data_len;
				char * message = new char[length];
				strncpy(message, (char *) data->data_ptr, data->data_len);
				ws_callback_reference->Message_Received(message, length);
				delete message;
				break;
			}
		}
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
	strncpy(this->id, "000000000000000000000000000000000000", 37);
	// initalize the ws_config
	esp_websocket_client_config_t config = {};
	config.uri = uri_str.c_str();
	ws_config = config;
	ws_callback_reference = this;
	this->parentDevice = parentDevice;

	ESP_LOGI(TAG, "attempting to init websocket");
	while (WebSocket_init() != 0) {
		ESP_LOGI(TAG, "Attempting websocket init again");
		vTaskDelay(1000 / portTICK_PERIOD_MS);
	}
};

esp_WebSocket::esp_WebSocket(char * url, char * endpoint, int port, void * parentDevice) {
	std::string uri_str = "ws://" + std::string(url) + "/" + std::string(endpoint);
	strncpy(this->id, "000000000000000000000000000000000000", 37);
	// initalize the ws_config
	esp_websocket_client_config_t config = {};
	config.uri = uri_str.c_str();
	ws_config = config;
	ws_config.port = port;
	this->parentDevice = parentDevice;

	while (WebSocket_init() != 0) {
		ESP_LOGI(TAG, "Attempting websocket init again");
		vTaskDelay(1000 / portTICK_PERIOD_MS);
	}
};


// Initialize the websocket connection
// returns 1 if there was an error, 0 if there was no error
int esp_WebSocket::WebSocket_init() {
	ESP_LOGI(TAG, "Websocket init starting");

	// initialize the websocket the conig
    esp_websocket_client_config_t config = {}; 
	ws_handle = esp_websocket_client_init(&ws_config);
	if (ws_handle == NULL) {
		ESP_LOGI(TAG, "Websocket init failed");
		return 1;
	};

	// error checking prob not needed 
	esp_err_t error = esp_websocket_register_events(ws_handle, WEBSOCKET_EVENT_ANY, (esp_event_handler_t) Websocket_Event_Handler, (void*)ws_handle);
	if (error != ESP_OK) {
		ESP_LOGI(TAG, "Error registering events");
	}


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

	// if (esp_websocket_client_is_connected(ws_handle) == 0) {
	// 	ESP_LOGI(TAG, "The Websocket Client failed to connect");
	// 	return 1;
	// }

	ESP_LOGI(TAG,"Websocket connected");
	return 0;
}



 




