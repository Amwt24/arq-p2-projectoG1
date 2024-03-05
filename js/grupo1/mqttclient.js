/*################################################################################################*/
/*####################################### CLIENTE MQTT ###########################################*/
/*################################################################################################*/

//var wsbroker = "192.168.0.3";  //mqtt websocket enabled broker
var wsbroker = "broker.hivemq.com";
//var wsbroker = "localhost";
//var wsbroker = "0.tcp.sa.ngrok.io";

var wsport = 1883; // port for above
//var wsport = 8083 // port for above
//var wsport = 14792; // port for above
var client = new Paho.MQTT.Client(
    wsbroker,
    //Number(wsport)
    Number(8000),
    "myclientid_" + parseInt(Math.random() * 100, 10)
);

client.onConnectionLost = function (responseObject) {
    console.log("connection lost: " + responseObject.errorMessage);
};

/*################################################################################################*/
/*####################################### LLEGA EL MENSAJE########################################*/
/*################################################################################################*/

/*let primero = 1;*/
function addData(data) {
    // Aquí agregas la lógica para procesar los datos recibidos
    console.log("Datos recibidos:", data);
}

client.onMessageArrived = function (message) {
    let destination = message.destinationName;
    if (destination === "amawta0") {
        let response = JSON.parse(message.payloadString);
        dataFormat = response;
        let dataCPU = dataFormat.CPU;
        console.log(dataFormat);
        let dataMemory = dataFormat.Memory;
        let dataDisco = dataFormat.Disco;
		let dataProcesos = dataFormat.Aplicaciones;

        console.log(dataFormat);
        console.log(parseFloat(dataFormat.value));

            document.getElementById("dataCPUElement").textContent = "Valor de CPU: " + dataCPU.toFixed(2) + "%";
            document.getElementById("dataMemoryElement").textContent = "Valor de uso de Memoria: " + dataMemory.toFixed(2) + "%";
            document.getElementById("dataDiscoElement").textContent = "Valor Usado de Disco: " + dataDisco.toFixed(2) + " GB";
            document.getElementById("dataProcesos").textContent = "Procesos en ejecución: " + dataProcesos;
        //Cargar datos CPU , Memoria y Almacenamiento
        addData(
            chart_bars,
            parseFloat(dataCPU),
            
        );

        addData(
            chart_line,
            parseFloat(dataMemory),
            
        );
        
        addData(
            chart_line_tasks,
            parseFloat(dataDisco),
            
        );
		
        addData(message.payloadString);
    } 
	if (destination === "shiri0") {
//para otra Pc
 
		let response = JSON.parse(message.payloadString);
		dataFormat = response;
		let dataCPU1 = dataFormat.CPU1;
		console.log(dataFormat);
		let dataMemory1 = dataFormat.Memory1;
		let dataDisco1 = dataFormat.Disco1;
		let dataProcesos1 = dataFormat.Aplicaciones1;

		console.log(dataFormat);
		console.log(parseFloat(dataFormat.value));

			document.getElementById("dataCPUElement1").textContent = "Valor de CPU: " + dataCPU1.toFixed(2) + "%";
			document.getElementById("dataMemoryElement1").textContent = "Valor de uso de Memoria: " + dataMemory1.toFixed(2) + "%";
			document.getElementById("dataDiscoElement1").textContent = "Valor Usado de Disco: " + dataDisco1.toFixed(2) + " GB";
			document.getElementById("dataProcesos1").textContent = "Procesos en ejecución: " + dataProcesos1;
	//Cargar datos CPU , Memoria y Almacenamiento
		addData(
			chart_bars,
			parseFloat(dataCPU1),
		
		);

		addData(
			chart_line,
			parseFloat(dataMemory1),
		
		);
	
		addData(
			chart_line_tasks,
			parseFloat(dataDisco1),
		
		);
	
		addData(message.payloadString);
	}

};

function enviarMensajeMQTT(mensajeJSON) {
    let messageObj = new Paho.MQTT.Message(mensajeJSON);
    messageObj.destinationName = "amawta3"; // Cambia al topic correcto
	/*messageObj.destinationName = "shiri3";*/
    client.send(messageObj);
}



var options = {
    timeout: 1,
    onSuccess: function () {
        console.log("mqtt connected");
        // Connection succeeded; subscribe to our topic, you can add multile lines of these
        client.subscribe("amawta0", { qos: 1 });
        client.subscribe("shiri0", { qos: 1 });
    },
    onFailure: function (message) {
        console.log("Connection failed: " + message.errorMessage);
    },
};

function testMqtt(){
    console.log("hi");
}
var chart_bars;
var chart_line;
var chart_line_tasks;
var chart_line_tasks1;
function initMqtt() {
    client.connect(options);
}


