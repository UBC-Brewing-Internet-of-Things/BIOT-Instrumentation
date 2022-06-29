// ---------- IMPORTS ----------
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

#include <WebSocketsClient_Generic.h>
#include <SocketIOClient_Generic.h>

#include <credentials.h> // provides ssid and pass for WiFi (in gitignore file)

// --------- GLOBALS ----------
WiFiMulti wifiMulti;
SocketIOclient io;

String server_ip = "http://localhost:3000";
int server_port = 3000;



// Helper function to setup and connect to WiFi
void setupWiFi() {
  // add list of WiFi networks to try
  wifiMulti.addAP(ssid, pass); // ssid, password from credentials.h

  // connect to WiFi
  Serial.println("Connecting to WiFi..");
  while (wifiMulti.run() != WL_CONNECTED) { // wifiMulti.run() returns 3 (WL_CONNECTED) when connected 
	delay(100); // if not connected, wait 100ms and try again
	Serial.print(".");
  }
  Serial.println("");

  // print connection details
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
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