// interface for WebSocket class in esp_socket.cpp
#include "esp_websocket_client.h"

// class definitions
class esp_WebSocket {

	public:
		esp_WebSocket(char * url, char * endpoint, void * parentDevice);
		esp_WebSocket(char * url, char * endpoint, int port, void * parentDevice);
		int WebSocket_send(char * message);
		void Message_Received(char * message);
		//void Websocket_Event_Handler(void * handler_args, esp_event_base_t base, int32_t event_id, void * event_data);
		void Register_callback(void (*callback)(void * event_arg, esp_event_base_t event_base, int32_t event_id, void *event_data));
		void Websocket_Stop();

	private:
		void WebSocket_init();
		esp_websocket_client_config_t ws_config;
		esp_websocket_client_handle_t ws_handle;
		void * parentDevice; // can we reference DataDevice class here? creates an infinite loop...

};

void Websocket_Event_Handler(void * handler_args, esp_event_base_t base, int32_t event_id, void * event_data);
