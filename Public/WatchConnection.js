//@input Component.Text debugText;

var subscribedOnMessageReceivedEvents = [];

var watchOutput = require('./watch_output_pb');
var common = require('./common_pb');

global.subscribeOnMessageReceive = function(func){
    subscribedOnMessageReceivedEvents.push(func);
}


global.LOG = function(msg){
    script.debugText.text = msg;
    //Studio.log("BLE: " + msg);
}

if (!global.deviceInfoSystem.isSpectacles()) {
    script.debugText.text = "BLE Not Supported\non this device.";
    return
}

INTERACTION_SERVICE_UUID = "008e74d0-7bb3-4ac5-8baf-e5e372cced76";
GESTURE_UUID = "008e74d1-7bb3-4ac5-8baf-e5e372cced76";

SENSOR_SERVICE_UUID = "4b574af0-72d7-45d2-a1bb-23cd0ec20c57";
GYRO_CHAR_UUID = "4b574af1-72d7-45d2-a1bb-23cd0ec20c57";
GRAV_CHAR_UUID = "4b574af3-72d7-45d2-a1bb-23cd0ec20c57";

PROTOBUF_OUTPUT_UUID = "f9d60371-5325-4c64-b874-a68c7c555bad";


//filter which device we want to connect to by its service UUID
var scanPredicate = function(device, rssi, scan_record) {

    var foundDevice = scan_record.getServiceUuids().indexOf(INTERACTION_SERVICE_UUID) >= 0;
    if (foundDevice)
    global.LOG("found: " + scan_record.getServiceUuids() + " : " + device.name());

    if (!foundDevice)
        return false;
    
    var manufacturerDatas = scan_record.getManufacturerAdvData();
    var data = manufacturerDatas[manufacturerDatas.length - 1];
    var kek = bin2str(data.advData());
    global.LOG("found: " + scan_record.getServiceUuids() + " : " + kek + " : " + foundDevice);
    return foundDevice;
}

// Called on device disconnect
var disconnectedCallback = function(device) {
    global.LOG(device.name() + " disconnected");
    startScan();
}

startScan();
global.LOG("here we go");

var transform = script.getSceneObject().getTransform();
var material = script.getSceneObject().getComponent("Component.RenderMeshVisual").getMaterial(0);

var m = 2;

var grav = new vec3(10, 0, 0);
var gyro = new vec3(0, 0, 0);

var heading = new vec3(0, 0, 1);
var phi = 0;

var down = new vec3(1, 0, 0);


function updateOnSensors() {

    var gravLength = grav.length;
    gyro.x = 0
    var rotation = gyro.dot(grav) / gravLength;
    phi += rotation * 0.01;
    var sin = -down.dot(grav) / gravLength;
    var cos = Math.sqrt(1 - cos*cos);

    var theta = Math.asin(sin);
    
    if (Math.abs(theta) > Math.PI / 180 * 60)
        phi *= 0.99

    var dir = new vec3(cos * Math.cos(phi), sin, cos * Math.sin(phi));
    //global.LOG(" " + grav + "\n" + gyro + "\n" + phi * 180 / Math.PI + "\n" + theta * 180 / Math.PI) + "\n" + dir;

    transform.setLocalRotation(quat.fromEulerAngles(theta, phi, 0));
}

function startScan(){
    // Configure global BLE scan timeout (optional)
    //global.lensApi.bluetoothLensApi.setBleScanTimeoutSeconds(30);
    // scan for devices
    global.lensApi.bluetoothLensApi.findDeviceWithFilter(scanPredicate, function(device) {
        global.LOG("attempting connection: " + device.name());
        device.disableBonding();
        var top = device.connect(function(client) {
            global.LOG("connected");
            client.setMtu(512);
            material.mainPass.baseColor = new vec4(1,0,0,1);
            // Register for changes to the RX characteristic

            //client.startNotify(GYRO_CHAR_UUID, function(data) {
            //    var stuff = bytesToFloatArray(data);
            //    gyro = new vec3(stuff[0], stuff[1], stuff[2]);
            //    updateOnSensors();
            //});

            //client.startNotify(GRAV_CHAR_UUID, function(data) {
            //    var stuff = bytesToFloatArray(data);
            //    grav = new vec3(stuff[0], stuff[1], stuff[2]);
            //});

            client.startNotify(PROTOBUF_OUTPUT_UUID, function(data) {
                var kek = watchOutput.Update.deserializeBinary(data);

                var frames = kek.getSensorframesList();
                var frame = frames[0];

                var pGyro = frame.getGyro();
                var pGrav = frame.getGrav();

                grav = new vec3(pGrav.getX(), pGrav.getY(), pGrav.getZ());
                gyro = new vec3(pGyro.getX(), pGyro.getY(), pGyro.getZ());
                updateOnSensors();
                var gestures = kek.getGesturesList();
                //global.LOG(":" + gestures[0]);

                if (((gestures)[0]) == common.GestureType.PINCH_TAP) {
                    transform.setLocalScale((new vec3(m, m, m)).mult(transform.getLocalScale()));
                    m = 1/m;
                }
            })

            client.startNotify(GESTURE_UUID, function(data) {
            });
            
        }, disconnectedCallback)
        .catch(function(err) {
            global.LOG("connection error: " + err)
        });
        global.LOG("connect returned " + top);
    })
    .catch(function(err) {
        global.LOG("scan error: " + err);
        startScan();
    })
}

function FireOnMessageReceived(msg){
    for(var i = 0; i < subscribedOnMessageReceivedEvents.length; i++){
        subscribedOnMessageReceivedEvents[i](msg);
    }
}

function bin2str(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(array[i]);
  }
  return result
}

function bytesToFloatArray(bytes) {
    var result = [];
    for (var i = 0; i < bytes.length; i += 4) {
        var hehe = bytes.slice(i, i+4);
        hehe.reverse();
        result.push(bytesToFloat(hehe));
    }
    return result;
}
function bytesToFloat(byteArray) {
  var value = 0;
  for (var i = 0; i < 4; i++) {
    value += byteArray[i] * Math.pow(256, i);
  }
  
  var sign = (value & 0x80000000) ? -1 : 1;
  var exponent = ((value >> 23) & 0xFF) - 127;
  var mantissa = 1 + ((value & 0x7FFFFF) / 0x7FFFFF);
  
  return sign * mantissa * Math.pow(2, exponent);
}