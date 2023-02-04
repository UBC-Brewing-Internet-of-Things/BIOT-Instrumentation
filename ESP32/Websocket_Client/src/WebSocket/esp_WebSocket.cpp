// esp32 websocket wrapper than encapsulates the websocket connection and provides a simple interface to send and receive messages
// using the ESP espressif esp32 websocket

#include "../DataReader/DataDevice.hpp"
//#include "esp_WebSocket.hpp"
#include "esp_log.h"
#include <string>


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
    ESP_LOGI(TAG, "Sending message: %s", message);
    esp_websocket_client_send(ws_handle, message, len, portMAX_DELAY);
    return 0;
}

/// Register a callback function to be called when a message is received from the websocket server
// This is mostly just a wrapper for the library's register callback function
void esp_WebSocket::Register_callback(void (*callback)(void * event_arg, esp_event_base_t event_base, int32_t event_id, void *event_data)) {
    if (ws_handle == NULL || esp_websocket_client_is_connected(ws_handle) == 0) {
        ESP_LOGI(TAG,"Websocket not connected");
        return;
    };
    esp_websocket_register_events(ws_handle, WEBSOCKET_EVENT_DATA, callback, NULL);
}

void esp_WebSocket::setID(const char * id) {
    strncpy(this->id, id, 37); // uuid-4 is 36 characters long + 1 for null terminator
    ESP_LOGI(TAG, "Set device id to: %s", this->id);
}

char * esp_WebSocket::getID() {
    return this->id;
}

// Message_Received is called when a message is received from the websocket server
// The message is one of:
// 		- Heartbeat (server) 
//      - A JSON message with an event. The possible events are:
//          - "register" - the server is requesting the device to register itself and gives it an id. we confirm by sending the id back to the server
//
void esp_WebSocket::Message_Received(char * message, int length) {
    if (message == NULL || length == 0) {
        ESP_LOGI(TAG, "Message is null");
        return;
    }
    ESP_LOGI(TAG, "Message received: %s length %d", message, length);

    // ------------------ check for heartbeat ------------------
    // This is used by the server to check if the device is still connected
    // If we receive a heartbeat_server, we send a heartbeat_client back
    // TODO: device should check for heartbeat_server, and then revert to attempting to reconnect if it doesn't receive one
    char * ret = strstr(message, "heartbeat_server");
    if (ret) {
        ESP_LOGI(TAG, "Heartbeat received");
        WebSocket_send("heartbeat_client");
        return;
    }


    // ------------------ JSON Events ------------------
    // Otherwise, we assume the message is a JSON message with an event
    // NOTE: messages that FAIL to deserialize are ignored. This is to prevent the device from crashing if the server sends a message that is not JSON. 
    // 		 so, if you add an event and it's not working, check that the message is deserializing correctly

    char message_chr = message[0];
    ESP_LOGI(TAG, "Message received: %c", message_chr);

    // Allocate a buffer for the JSON message
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, (const char *) message); // library deserializes the message into the buffer

    if (error) {
        ESP_LOGI(TAG, "Deserialization failed");
        ESP_LOGE(TAG, "deserializeJson() failed with code %s", error.c_str());
        return;
    }

    // ----------- JSON Event Handler -----------
    // TODO: refactor this into a separate function
    if (doc.containsKey("event")) {
        const char * event = doc["event"];
        ESP_LOGI(TAG, "Event received: %s", event);

        // ----------- register event -----------
        if (strcmp(event, "register") == 0) { // strcmp is weird like that...
            ESP_LOGI(TAG, "Register event triggered");

            // get the id from the message and set it in the device
            // TODO: why all this nasty setting the id in two places... (here and in the device)
            const char * id_const = doc["id"];
            ESP_LOGI(TAG, "ID received: %s", id_const);
            DataDevice * dd = (DataDevice *) parentDevice;
            char * id = (char *)id_const;
            ESP_LOGI(TAG, "ID received (translated): %s", id);
            this->setID(id_const);
            dd->setId(id_const);

            // The server also expects our responses to be in JSON. It will ignore any responses that are not JSON
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


// This is the websocket event handler, it is called when the websocket receives a message
// It is registered in the esp_WebSocket::Register_callback method
// The esp32 websocket library calls this method when a message is received
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
                break;
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

// This is the constructor for the esp_WebSocket class
// It calls websocket_init() to start the websocket, and keeps trying until we get a connection
esp_WebSocket::esp_WebSocket(char * url, char * endpoint, void * parentDevice) {
    std::string uri_str = "ws://" + std::string(url) + "/" + std::string(endpoint);
    memset(this->id, 0, 37);
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
// copy constructor w/ that includes the port number, in case you need to specify a port
esp_WebSocket::esp_WebSocket(char * url, char * endpoint, int port, void * parentDevice) {
    std::string uri_str = "ws://" + std::string(url) + "/" + std::string(endpoint);
    memset(this->id, 0, 37);
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
    // Here we register the event handler for the websocket
    esp_err_t error = esp_websocket_register_events(ws_handle, WEBSOCKET_EVENT_ANY, (esp_event_handler_t) Websocket_Event_Handler, (void*)ws_handle);
    if (error != ESP_OK) {
        ESP_LOGI(TAG, "Error registering events");
    }


    ESP_LOGI(TAG,"Websocket client initialized");
    int timeout = 0; 
    while (esp_websocket_client_is_connected(ws_handle) == 0 && timeout < TIMEOUT) {
        esp_err_t err = esp_websocket_client_start(ws_handle); // start the websocket client
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








