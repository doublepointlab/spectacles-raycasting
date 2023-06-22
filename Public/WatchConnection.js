//@input Component.Text debugText;

var subscribedOnProtoSensorframes = [];
var subscribedOnGestures = [];

var watchOutput = require('./watch_output_pb');
var common = require('./common_pb');

global.subscribeOnProtoSensorframe = function(func){
    subscribedOnProtoSensorframes.push(func);
}

global.subscribeOnGesture = function(func){
    subscribedOnGestures.push(func);
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

            client.startNotify(PROTOBUF_OUTPUT_UUID, function(data) {
                var update = watchOutput.Update.deserializeBinary(data);
                var frames = update.getSensorframesList();
                var frame = frames[0];

                fireOnProtoSensorframe(frame);

            })

            client.startNotify(GESTURE_UUID, function(data) {
                fireOnGesture(data[0]);
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

function fireOnProtoSensorframe(frame) {
    for(var i = 0; i < subscribedOnProtoSensorframes.length; i++){
        subscribedOnProtoSensorframes[i](frame);
    }
}

function fireOnGesture(gesture) {
    for(var i = 0; i < subscribedOnGestures.length; i++){
        subscribedOnGestures[i](gesture);
    }
}

function bin2str(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(array[i]);
  }
  return result
}