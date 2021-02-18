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

/** @brief excutes when page finished loading. Creates tables and chart */
var output, websocket, clearBarTimeout
function onLoad() {
	output = document.getElementById("output");
	chargerWebSocket("ws://"+ location.host +":81");

}

function onOpen(evt) {
	console.log("Socket Connected");
}
   
function onMessage(evt) {
	const json = JSON.parse(evt.data);

	if (json.message && json.type != 'config') {
		writeToScreen('<span style = "color: blue;">' +
		json.message+'</span>');
	} 

	if (json.type == 'config') {
		loadConfig(json.message)
	}

 }

 function onError(evt) {
	console.log("Socket Error")
 }
   
 function doSend(message) {
	websocket.send(message);
 }
   
 function writeToScreen(message) {
	var pre = document.createElement("p"); 
	pre.style.wordWrap = "break-word"; 
	pre.innerHTML = message; output.appendChild(pre);
 }

function chargerWebSocket(wsUri) {
	websocket = new WebSocket(wsUri);
	   
	websocket.onopen = function(evt) {
	   onOpen(evt)
	};

	websocket.onclose = function(evt) {
		console.log(evt)
	};
   
	websocket.onmessage = function(evt) {
	   onMessage(evt)
	};
   
	websocket.onerror = function(evt) {
	   onError(evt)
	};
 }


 function fileSelected()
{
}

/** @brief uploads file to web server, if bin-file uploaded, starts a firmware upgrade */
function uploadFile() 
{
	var xmlhttp = new XMLHttpRequest();
	var form = document.getElementById('uploadform');
	
	if (form.getFormData)
		var fd = form.getFormData();
	else
		var fd = new FormData(form);
	var file = document.getElementById('updatefile').files[0].name;

	xmlhttp.onload = function() 
	{
		document.getElementById("bar").innerHTML = "<p>Upload complete</p>";
		if (file.endsWith(".hex"))
		{
			runUpdate(-1, "/" + file);
		} else {
			setTimeout(function() { document.getElementById("bar").innerHTML = "" }, 5000);
		}
	}

	xmlhttp.open("POST", "/edit");
	xmlhttp.send(fd);
}

/** @brief Runs a step of a firmware upgrade
 * Step -1 is resetting controller
 * Steps i=0..n send page i
 * @param step step to execute
 * @param file file path of upgrade image on server */
function runUpdate(step,file)
{	
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.onload = function() 
	{
		if (xmlhttp.status != 200) {
			document.getElementById("bar").innerHTML = "<p>Update Error!</p>";
		} else {
			document.getElementById("bar").innerHTML = "<p>Update Done!</p>";
		}
		setTimeout(function() { document.getElementById("bar").innerHTML = "" }, 5000);

	}
	xmlhttp.onerror = function() {
		document.getElementById("bar").innerHTML = "<p>Update Error!</p>";
		setTimeout(function() { document.getElementById("bar").innerHTML = "" }, 5000);

	}

	xmlhttp.open("GET", "/fwupdate?step=" + step + "&file=" + file);
	xmlhttp.send();
	document.getElementById("bar").innerHTML = "<p>Updating</p>";
}

function sendCmd(cmd) {
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.open("POST", "/cmd?cmd=" + cmd);
	xmlhttp.send();
}