/* 
  FSWebServer - Example WebServer with SPIFFS backend for esp8266
  Copyright (c) 2015 Hristo Gochkov. All rights reserved.
  This file is part of the ESP8266WebServer library for Arduino environment.
 
  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.
  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.
  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
  
  upload the contents of the data folder with MkSPIFFS Tool ("ESP8266 Sketch Data Upload" in Tools menu in Arduino IDE)
  or you can upload the contents of a folder if you CD in that folder and run the following command:
  for file in `ls -A1`; do curl -F "file=@$PWD/$file" esp8266fs.local/edit; done
  
  access the sample web page at http://esp8266fs.local
  edit the page by going to http://esp8266fs.local/edit
*/
/*
 * This file is part of the esp8266 web interface
 *
 * Copyright (C) 2018 Johannes Huebner <dev@johanneshuebner.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266mDNS.h>
#include <WebSocketsServer.h>
#include <ArduinoOTA.h>
#include <ArduinoJson.h>
#include <Ticker.h>
#include "WebServer.h"

#define DBG_OUTPUT_PORT Serial


char endMarker = 0xff;
const char* host = "bms.local";
StaticJsonDocument<600> root;
String capturing = "";
char captureBuffer[1024];
uint16_t capPos = 0;
char serialBuffer[500];
uint8_t bufPos = 0;

WebSocketsServer webSocket = WebSocketsServer(81);
WebServer webServer;

void staCheck();
void broadcastMessage(String message);
Ticker sta_tick(staCheck, 1000, 0, MICROS);
int8_t connectionNumber = 0;

void staCheck(){
  sta_tick.stop();

  if(!(uint32_t)WiFi.localIP()){
    WiFi.mode(WIFI_AP); //disable station mode
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t lenght) {
    switch(type) {
        case WStype_ERROR:      
        case WStype_DISCONNECTED:      
            connectionNumber = webSocket.connectedClients();
            break;
        case WStype_CONNECTED: 
            connectionNumber = webSocket.connectedClients();
            break;
        
        case WStype_TEXT: 
            break;  
        case WStype_BIN:
            break;
  
    }
}

void setup(void){
  Serial.begin(115200);
  Serial.setTimeout(100);

  //WIFI INIT
  WiFi.mode(WIFI_AP_STA);
  WiFi.hostname(host);
  WiFi.begin();
  sta_tick.start();
  
  MDNS.begin(host);
  
  //SERVER INIT
  ArduinoOTA.setHostname(host);
  ArduinoOTA.begin();

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  webServer.setup();

}

void broadcastMessage(String message, String type) {
  String response;
  message.trim();
  root.clear();
  root["message"] = message;
  root["type"] = type;
  serializeJson(root, response);
  webSocket.broadcastTXT(response);
}

void addToCaptureBuffer(String message) {
    int length = message.length();
    for(int i = 0; i < length; i++) {
      captureBuffer[capPos] = message[i];
      capPos++;
    }
}

void processMessage(String message) {

    broadcastMessage(message, "command");

}
 
void loop(void){
  ArduinoOTA.handle();
  webSocket.loop();
  webServer.loop();
  sta_tick.update();
  if(connectionNumber > 0 && Serial.available()) {
      char receivedChar = Serial.read();

      if (receivedChar != endMarker) {
        serialBuffer[bufPos] = receivedChar;
        bufPos++;

      } else {

        if (bufPos > 0) {
          serialBuffer[bufPos] = '\0';
          bufPos = 0;
          broadcastMessage(serialBuffer, "receivedChar");

          //processMessage(String(serialBuffer));
        }
      }
  }

}
