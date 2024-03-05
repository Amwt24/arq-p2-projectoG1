/*################################################################################################*/
/*####################################### DATA TABLE Y FIREBASE ##################################*/
/*################################################################################################*/
// // Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-analytics.js";
// // TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


$(document).ready(function () {
    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
        const firebaseConfig = {
            apiKey: "AIzaSyALwNktx1cXYPq7loSrSiu15cJ4CgX4oSI",
            authDomain: "arquitectura-grupo-10.firebaseapp.com",
            databaseURL: "https://arquitectura-grupo-10-default-rtdb.firebaseio.com",
            projectId: "arquitectura-grupo-10",
            storageBucket: "arquitectura-grupo-10.appspot.com",
            messagingSenderId: "873488218159",
            appId: "1:873488218159:web:20739bffd65e804d36aeda",
            measurementId: "G-S9Q73ST6QJ"
        };
       // const firebaseConfig = {
           // apiKey: "AIzaSyDvrO4hcjbWWSIJyne45ezAaPMHEG-54b4",
           // authDomain: "datospc-57b1b.firebaseapp.com",
           // projectId: "datospc-57b1b",
           // storageBucket: "datospc-57b1b.appspot.com",
           // messagingSenderId: "634296976157",
          //  appId: "1:634296976157:web:67646111942d647294d7f4",
           // measurementId: "G-SBPS8V5DCH"
          //};
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
    
        var db = firebase.database();
        var coleccionProductos = db.ref().child("presiones");
        var dataSet = []; //array para guardar los valores de los campos inputs del form
        var table = $("#tablaProductos").DataTable({
            pageLength: 10,
            lengthMenu: [
                [5, 10, 20, -1],
                [5, 10, 20, "Todos"],
            ],
            data: dataSet,
            columnDefs: [
                {
                    targets: [0],
                    visible: false, //ocultamos la columna de ID que es la [0]
                },
            ],
        });
    
        coleccionProductos.on("child_added", (datos) => {
            $("#tablaProductos").delay("slow").fadeIn();
            dataSet = [
                datos.key,
                datos.child("fecha").val(),
                datos.child("hora").val(),
                datos.child("CPU").val(),
                datos.child("Memory").val(),
                datos.child("Disco").val(),
                datos.child("Procesos").val(),
                
            ];
            table.rows.add([dataSet]).draw();
        });
    
        coleccionProductos.orderByChild("fecha").limitToFirst(2).once("value", (snapshot) => {
            snapshot.forEach((datos) => {
              const primeraFecha = datos.child("fecha").val();
              const fechaInput = document.getElementById("fechaInput");
              if (primeraFecha !== null) {
                fechaInput.min = primeraFecha;
                console.log(fechaInput);
              }
            //   fechaInput.min = '2023-08-27';
              console.log(primeraFecha);
              console.log(fechaInput);
            });
          });
          
        
          coleccionProductos.orderByChild("fecha").limitToLast(1).once("value", (snapshot) => {
            snapshot.forEach((datos) => {
              const ultimaFecha = datos.child("fecha").val();
              const fechaInput = document.getElementById("fechaInput");
              fechaInput.max = ultimaFecha;
              console.log(ultimaFecha)
              console.log(fechaInput)
            });
          });
        
          $("#generateReportButton").on("click", function () {
            const selectedDate = document.getElementById("fechaInput").value;
            const fechaInput = new Date(selectedDate); // Convertir a objeto de fecha
            const today = new Date(); // Obtener la fecha actual
            console.log(selectedDate)
            console.log(fechaInput)
            console.log(today)
    
            if (!selectedDate) {
                alert("Selecciona una fecha antes de generar el informe.");
                return;
              }
          
            obtenerTodasLasFechas(selectedDate, function (fechas) {
                generateMultiplePDFs(fechas);
            });
          });
          
          
          function obtenerTodasLasFechas(selectedDate, callback) {
            const coleccionProductos = db.ref().child("presiones");
            coleccionProductos.once("value", (snapshot) => {
              const fechas = new Set();
              snapshot.forEach((datos) => {
                const fecha = datos.child("fecha").val();
                if (fecha >= selectedDate) {
                  fechas.add(fecha);
                }
              });
              callback(Array.from(fechas));
            });
          }
          
          function generateMultiplePDFs(fechas) {
            const zip = new JSZip();
            const promises = [];
          
            fechas.forEach((fecha, index) => {
              promises.push(generatePDFReport(fecha, index + 1, zip));
            });
          
            Promise.all(promises).then(() => {
              zip.generateAsync({ type: "blob" }).then(function (content) {
                const reader = new FileReader();
                reader.onload = function () {
                  const zipBase64 = reader.result.split(",")[1];
                    var emailInput = document.getElementById("emailInput");
                    var emailValue = emailInput.value.trim();
                    if (emailValue.length > 0) {
                        mqtt(zipBase64);
                    }
                  saveAs(content, "Informes.zip");
                };
                reader.readAsDataURL(content);
              });
            });
          }
          
          
          function generatePDFReport(fecha, pageIndex, zip) {
            return new Promise((resolve) => {
              const doc = new jsPDF();
              let yPos = 20;
              const pageWidth = doc.internal.pageSize.width;
              const pageHeight = doc.internal.pageSize.height;
              const columnWidth = pageWidth / 2;
          
              obtenerDatosPorFecha(fecha, function (data) {
                doc.setFontSize(16);
                doc.text(`Informe de Datos - Fecha ${fecha}`, 10, yPos);
                yPos += 20;
          
                const promedios = calcularPromedios(data);
          
                doc.setFontSize(12);
                Object.keys(promedios).forEach((key, index) => {
                  doc.text(`${key} Promedio: ${promedios[key].toFixed(2)}`, 10, yPos + index * 10);
                });
          
                yPos += Object.keys(promedios).length * 10 + 10;
          
                data.forEach((rowData, rowIndex) => {
                  if (yPos + 20 > pageHeight) {
                    doc.addPage();
                    yPos = 20;
                  }
          
                  doc.setFontSize(12);
                  Object.keys(rowData).forEach((key, colIndex) => {
                    const columnIndex = colIndex % 2;
                    const textX = columnIndex === 0 ? 10 : columnWidth + 10;
                    const text = `${key}: ${rowData[key]}`;
                    doc.text(textX, yPos, text);
                    if (columnIndex === 1) {
                      yPos += 10;
                    }
                  });
          
                  yPos += 10;
                });
          
                const pdfBlob = doc.output("blob");
                zip.file(`Informe_${fecha}.pdf`, pdfBlob);
    
                // const pdfBytes = doc.output('datauristring');
                // mqtt(pdfBytes);
    
                resolve();
              });
            });
          }
          
          function obtenerDatosPorFecha(selectedDate, callback) {
            const coleccionProductos = db.ref().child("presiones");
            coleccionProductos.once("value", (snapshot) => {
              const data = [];
              snapshot.forEach((datos) => {
                const fecha = datos.child("fecha").val();
                if (fecha === selectedDate) {
                  const rowData = {
                    hora: datos.child("hora").val(),
                    CPU: datos.child("CPU").val(),
                    Memory: datos.child("Memory").val(),
                    Disco: datos.child("Disco").val(),
                    Descarga: datos.child("Procesos").val(),//cambiar por Aplicaciones probar
                   
                  };
                  data.push(rowData);
                }
              });
              callback(data);
            });
          }
          
          function calcularPromedios(data) {
            const totalRows = data.length;
            const promedios = {
              CPU: 0,
              Memory: 0,
              Disco: 0,
              Descarga: 0,
              Subida: 0,
            };
          
            data.forEach((rowData) => {
              Object.keys(promedios).forEach((key) => {
                promedios[key] += parseFloat(rowData[key]);
              });
            });
          
            Object.keys(promedios).forEach((key) => {
              promedios[key] /= totalRows;
            });
          
            return promedios;
          }
    });
    
    function mqtt(pdf){
        var wsbroker = "broker.hivemq.com";
        var client2 = new Paho.MQTT.Client(
            wsbroker,
            Number(8000),
            "myclientid_" + parseInt(Math.random() * 100, 10)
        );
    
        client2.onConnectionLost = function (responseObject) {
            console.log("connection lost: " + responseObject.errorMessage);
        };
        
        function enviarMensajeMQTT(mensajeJSON) {
            let messageObj = new Paho.MQTT.Message(mensajeJSON);
            messageObj.destinationName = "amawta4"; // Cambia al topic correcto
            client2.send(messageObj);
            client2.disconnect();
        }
    
        var options = {
            timeout: 3,
            onSuccess: function () {
                console.log("mqtt connected");
                enviarMensajeMQTT(pdf)
            },
            onFailure: function (message) {
                console.log("Connection failed: " + message.errorMessage);
            },
        };
    
        function testMqtt(){
            console.log("hi");
        }
        client2.connect(options);
    
    }