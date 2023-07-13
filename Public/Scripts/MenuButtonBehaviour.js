// -----JS CODE-----
// @input SceneObject targetSceneObject

var transform = script.getSceneObject().getTransform();

function onHit() {
    transform.setLocalScale(new vec3(1.2, 1.2, 1.2));
}

function onMiss() {
    transform.setLocalScale(new vec3(1.0, 1.0, 1.0));
}

function onTap() {
  
    global.LOG("tap");
    global.tweenManager.startTween(script.getSceneObject(), "rotate_x");

    if (script.targetSceneObject) {
        var scripts = script.targetSceneObject.getComponents("ScriptComponent");
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].api && scripts[i].api.activate) {
                scripts[i].api.activate();
            }
        }
    }
}

script.api.onHit = onHit;
script.api.onMiss = onMiss;
script.api.onTap = onTap;