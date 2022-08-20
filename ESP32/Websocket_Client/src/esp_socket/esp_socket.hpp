// interface for WebSocket class in esp_socket.cpp
#include "esp_websocket_client.h"

// class definitions
class esp_WebSocket {

public:
  void WebSocket(char * url, char * endpoint);
  void WebSocket(char * url, char * endpoint, int port);
  int WebSocket_send(char * message);
  void Register_callback(void (*callback)(void * event_arg, esp_event_base_t event_base, int32_t event_id, void *event_data));
  void Websocket_Stop();

private:
  void WebSocket_init();
  esp_websocket_client_config_t ws_config;
  esp_websocket_client_handle_t ws_handle;

};
