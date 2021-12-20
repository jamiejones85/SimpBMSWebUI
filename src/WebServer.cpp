#include "WebServer.h"
#include <LittleFS.h>
#include <WiFiClient.h>

void WebServer::setup() {

    LittleFS.begin();

    server.on("/list", HTTP_GET, [this](){ handleFileList(); });
    server.on("/wifi", [this](){ handleWifi(); });
    server.on("/edit", HTTP_POST, [this](){ server.send(200, "text/plain", ""); }, [this](){ handleFileUpload(); });
    server.on("/cmd", HTTP_POST, [this](){ handleCmd(); });

    server.onNotFound([this](){
        if(!handleFileRead(server.uri()))
        server.send(404, "text/plain", "FileNotFound");
    });

    server.begin();
    server.client().setNoDelay(1);
}

void WebServer::loop() {
    server.handleClient();
}

void WebServer::handleCmd(){
    if(server.hasArg("cmd")) {
        String cmd = server.arg("cmd");
        Serial.println(cmd);
    }
    server.send(200, "text/json", "{received: true}");
}

String WebServer::getContentType(String filename){
  if(server.hasArg("download")) return "application/octet-stream";
  else if(filename.endsWith(".htm")) return "text/html";
  else if(filename.endsWith(".html")) return "text/html";
  else if(filename.endsWith(".css")) return "text/css";
  else if(filename.endsWith(".js")) return "application/javascript";
  else if(filename.endsWith(".png")) return "image/png";
  else if(filename.endsWith(".gif")) return "image/gif";
  else if(filename.endsWith(".jpg")) return "image/jpeg";
  else if(filename.endsWith(".ico")) return "image/x-icon";
  else if(filename.endsWith(".xml")) return "text/xml";
  else if(filename.endsWith(".pdf")) return "application/x-pdf";
  else if(filename.endsWith(".zip")) return "application/x-zip";
  else if(filename.endsWith(".gz")) return "application/x-gzip";
  return "text/plain";
}

bool WebServer::handleFileRead(String path){
  //DBG_OUTPUT_PORT.println("handleFileRead: " + path);
  if(path.endsWith("/")) path += "index.html";
  String contentType = getContentType(path);
  String pathWithGz = path + ".gz";
  if(LittleFS.exists(pathWithGz) || LittleFS.exists(path)){
    if(LittleFS.exists(pathWithGz))
      path += ".gz";
    File file = LittleFS.open(path, "r");
    server.sendHeader("Cache-Control", "max-age=2592000");
    size_t sent = server.streamFile(file, contentType);
    file.close();
    return true;
  }
  return false;
}

void WebServer::handleFileUpload(){
    if(server.uri() != "/edit") return;
    
    HTTPUpload& upload = server.upload();
    if(upload.status == UPLOAD_FILE_START){
        String filename = upload.filename;
        if(!filename.startsWith("/")) filename = "/"+filename;
        fsUploadFile = LittleFS.open(filename, "w");
        filename = String();
    } else if(upload.status == UPLOAD_FILE_WRITE){
        if(fsUploadFile)
            fsUploadFile.write(upload.buf, upload.currentSize);
        } else if(upload.status == UPLOAD_FILE_END){
        if(fsUploadFile)
            fsUploadFile.close();
    }
}
void WebServer::handleWifi(){
    bool updated = true;
    if(server.hasArg("apSSID") && server.hasArg("apPW")) 
    {
        WiFi.softAP(server.arg("apSSID").c_str(), server.arg("apPW").c_str());
    }
    else if(server.hasArg("staSSID") && server.hasArg("staPW")) 
    {
        WiFi.mode(WIFI_AP_STA);
        WiFi.begin(server.arg("staSSID").c_str(), server.arg("staPW").c_str());
    }
    else
    {
        File file = LittleFS.open("/wifi.html", "r");
        String html = file.readString();
        file.close();
        html.replace("%staSSID%", WiFi.SSID());
        html.replace("%apSSID%", WiFi.softAPSSID());
        html.replace("%staIP%", WiFi.localIP().toString());
        server.send(200, "text/html", html);
        updated = false;
    }

    if (updated)
    {
        File file = LittleFS.open("/wifi-updated.html", "r");
        server.streamFile(file, getContentType("wifi-updated.html"));
        file.close();    
    } 
}
void WebServer::handleFileList() {

    String path = "/";
    if(server.hasArg("dir")) {
        path = server.arg("dir");
    }
  
    Dir dir = LittleFS.openDir(path);
    path = String();

    String output = "[";
    while(dir.next()){
        File entry = dir.openFile("r");
        if (output != "[") output += ',';
        bool isDir = false;
        output += "{\"type\":\"";
        output += (isDir)?"dir":"file";
        output += "\",\"name\":\"";
        output += String(entry.name()).substring(1);
        output += "\"}";
        entry.close();
    }
    
    output += "]";

    server.send(200, "text/json", output);
}