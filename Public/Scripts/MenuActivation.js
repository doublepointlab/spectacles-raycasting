// -----JS CODE-----
// @input SceneObject menu
// @input SceneObject ray
// @input SceneObject camera
// @input SceneObject activationObject

global.subscribeOnProtoSensorframe(onProtoSensorframe);
global.subscribeOnGesture(onGesture);

var grav = new vec3(10, 0, 0);
var gyro = new vec3(0, 0, 0);

var active = false;

var verticalOffsetThreshold = 0.7;
var baseThreshold = 0.7;

function onProtoSensorframe(frame) {
    var pGyro = frame.getGyro();
    var pGrav = frame.getGrav();

    grav = new vec3(pGrav.getX(), pGrav.getY(), pGrav.getZ());
    gyro = new vec3(pGyro.getX(), pGyro.getY(), pGyro.getZ());
    updateOnSensors();

}

function onGesture(gesture) {
    if (gesture != 1)
        return;

    if (active && script.menu) {

        global.tweenManager.startTween(script.activationObject, "hide");

        global.LOG("MENU ACTIVATED");

        if (script.menu) {
            var scripts = script.menu.getComponents("ScriptComponent");
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].api && scripts[i].api.enable) {
                    scripts[i].api.enable();
                }
            }
        }

        if (script.ray) {
            script.ray.enabled = true;
        }
    }
}

function updateOnSensors() {
    var g = grav.length;
    var triggerValue = -grav.z / g;
    var verticalOffset = Math.abs(grav.x / g);
    var verticalCondition = verticalOffset < verticalOffsetThreshold;
    var palmUpCondition = triggerValue > baseThreshold * Math.sqrt(1 - verticalOffset * verticalOffset);

    if (verticalCondition && palmUpCondition) {
        if (!active)
            activate();
    } else {
        if (active)
            deactivate();
    }

    if (script.camera && script.activationObject) {
        var cameraTransform = script.camera.getTransform().getWorldTransform(); 
        var heading = cameraTransform.multiplyDirection(vec3.back());
        heading.y = 0;
        var horizontalHeading = heading.normalize();
        var activationPosition = horizontalHeading.uniformScale(100);
        activationPosition.y = -20;
        var rotation = quat.rotationFromTo(vec3.back(), horizontalHeading);
        script.activationObject.getTransform().setWorldPosition(activationPosition);
        script.activationObject.getTransform().setWorldRotation(rotation);
    }
}

function activate() {
    active = true;
    global.LOG("activated");
    if (script.activationObject) {
        global.tweenManager.startTween(script.activationObject, "unhide");
    }

}

function deactivate() {
    active = false;
    global.LOG("deactivated");

    if (script.activationObject) {
        global.tweenManager.startTween(script.activationObject, "hide");
    }

}