// -----JS CODE-----

global.subscribeOnProtoSensorframe(onProtoSensorframe);
global.subscribeOnGesture(onGesture);


function onProtoSensorframe(frame) {
    var pGyro = frame.getGyro();
    var pGrav = frame.getGrav();

    grav = new vec3(pGrav.getX(), pGrav.getY(), pGrav.getZ());
    gyro = new vec3(pGyro.getX(), pGyro.getY(), pGyro.getZ());
    updateOnSensors();

}

function onGesture(gesture) {
    // TODO
}

var transform = script.getSceneObject().getTransform();

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
    var cos = Math.sqrt(1 - sin*sin);

    var theta = Math.asin(sin);
    
    if (Math.abs(theta) > Math.PI / 180 * 60)
        phi *= 0.99

    var dir = new vec3(cos * Math.cos(phi), sin, cos * Math.sin(phi));

    transform.setLocalRotation(quat.fromEulerAngles(theta, phi, 0));
}