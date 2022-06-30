// ---------- IMPORTS ----------
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <String.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>
#include <WiFiMulti.h>
#include <WebSocketsClient.h> // using v2.3.4 ( ^ versions are not working )
#include <SocketIOclient.h>

#include "credentials.h" // provides ssid and pass for WiFi (in gitignore file)

// --------- GLOBALS ----------
SocketIOclient io;

String server_ip = "http://10.0.0.216:3001";
int server_port = 3000;



// Helper function to setup and connect to WiFi
void setupWiFi() {
  // set the wifi to station mode
  //WiFi.mode(WIFI_STA);
  // begin wifi connection and log in
  WiFi.begin(ssid, pass);
  Serial.printf("Connecting to %s", ssid);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(1000);
  }
  Serial.println("");
  // print out the local ip after connecting
  Serial.print(WiFi.localIP());
}


// callback function for socket event
// this function will handle all incoming socket events.
// The following events are handled:
// 	- log to console
void socketEvent(socketIOmessageType_t type, uint8_t * data, size_t length) {
   switch(type) {
	case sIOtype_CONNECT:
		Serial.println("Connected to server");
		break;
	case sIOtype_DISCONNECT:
		Serial.println("Disconnected from server");
		break;
	case sIOtype_EVENT:
		Serial.print("Event: ");
		Serial.println((char*)data);
		break;
	default:
		Serial.println("Unknown event");
		break;
   }
}



void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);

  // setup WiFi
  setupWiFi();

  // setup SocketIOClient
  io.begin(server_ip, server_port, "/");
  io.onEvent(socketEvent); // register callback function for socket events
}

void loop() {
  io.loop(); // handle socketIO events

  // send "hello" message to server --- testing
  DynamicJsonDocument doc(1024);
  JsonArray array = doc.to<JsonArray>();
  array.add("hello");
  
  String message;
  serializeJson(doc, message);

  io.sendEVENT(message); // send message to server
}