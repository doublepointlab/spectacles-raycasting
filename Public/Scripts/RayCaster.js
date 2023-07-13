// -----JS CODE-----
//@input Component.MeshVisual meshVisual

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
    if (hitObject !== null && gesture == 1) {
        var scripts = hitObject.getComponents("ScriptComponent");
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].api && scripts[i].api.onTap) {
                scripts[i].api.onTap();
            }
        }
    }
}

var hitObject = null;
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
    var sin = down.dot(grav) / gravLength;
    var cos = Math.sqrt(1 - sin*sin);

    var theta = Math.asin(sin);
    
    if (Math.abs(theta) > Math.PI / 180 * 60)
        phi *= 0.99

    var dir = new vec3(cos * Math.sin(phi), sin, cos * Math.cos(phi));

    updateRay(dir, new vec3(20, -60, 0));

}

function updateRay(dir, from) {
    var builder = new MeshBuilder([
        {name: "position", components: 3}
    ]);

    builder.topology = MeshTopology.Lines;

    var to = dir.uniformScale(-200).add(from);
    //global.LOG("kek" + dir);

    builder.appendVerticesInterleaved([
        from.x, from.y, from.z,
        to.x, to.y, to.z
    ]);

    builder.appendIndices([0, 1]);

    script.meshVisual.mesh = builder.getMesh();
    builder.updateMesh();

    raycast(to, from);

}

function raycast(to, from) {
    var probe = Physics.createRootProbe();
    probe.rayCast(from, to, onHit);
}


function onHit(hit) {

    if (hit === null) {
 
        global.LOG("no hit");

        if (hitObject !== null) {
            var scripts = hitObject.getComponents("ScriptComponent");
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].api && scripts[i].api.onMiss) {
                    scripts[i].api.onMiss();
                }
            }
        }
        hitObject = null;
        return;
    }

    var newHitObject = hit.collider.getSceneObject();

    if (hitObject !== null && newHitObject !== hitObject) {
        var scripts = hitObject.getComponents("ScriptComponent");
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].api && scripts[i].api.onMiss) {
                scripts[i].api.onMiss();
            }
        }
    }

    if (newHitObject !== hitObject) {
        global.LOG("hit: " + newHitObject);
        var scripts = newHitObject.getComponents("ScriptComponent");
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].api && scripts[i].api.onHit) {
                scripts[i].api.onHit();
            }
        }
    }

    hitObject = newHitObject;

}