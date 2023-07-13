// -----JS CODE-----

var sceneObject = script.getSceneObject();

function disable() {
    sceneObject.enabled = false;
}

function enable() {
    sceneObject.enabled = true;
}

script.api.enable = enable;
script.api.disable = disable;