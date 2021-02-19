/** @brief excutes when page finished loading. Creates tables and chart */
var output, websocket,chartSpeed

function toggleHidden(id) {
	const element = document.getElementById(id);
	if (element.classList.contains('hidden')) {
		element.classList.remove('hidden');

	} else {
		element.classList.add('hidden');

	}

	return false
}
function setValue(id, value) {
	const element = document.getElementById(id);
	element.innerHTML = value
}
function updateText(data) {
	const parts = data.split("=");
	if (parts[0] == 'firm.val') {
		setValue('version', parts[1]);
	} else if (parts[0] == 'stat.txt') {
		setValue('mode', parts[1]);
	} else if (parts[0] == 'lowcell.val') {
		setValue('celllow', parts[1]);
	} else if (parts[0] == 'highcell.val') {
		setValue('cellhigh', parts[1]);
	} else if (parts[0] == 'celldelta.val') {
		setValue('celldelta', parts[1]);
	} 
}

function onLoad() {
	output = document.getElementById("output");
	initGauges();
	chargerWebSocket("ws://"+ location.host +":81");
}

function onOpen(evt) {
	console.log("Socket Connected");
}
   
function onMessage(evt) {
	const json = JSON.parse(evt.data);
	updateGauge(json.message);
	updateText(json.message);
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