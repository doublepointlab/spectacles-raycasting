// -----JS CODE-----

var sceneObject = script.getSceneObject();
sceneObject.enabled = false;

function disable() {
    global.LOG("disabling?");
    if (!sceneObject.enabled)
        return;

    global.LOG("disabling");

    global.tweenManager.startTween(sceneObject, "hide", function(){
        sceneObject.enabled = false;
    }, function(){}, function(){
        sceneObject.enabled = false;
    });
}

function enable() {
    global.LOG("enabling?");
    if (sceneObject.enabled)
        return;

    global.LOG("enabling");

    sceneObject.enabled = true;
    global.tweenManager.startTween(sceneObject, "unhide");
}

script.api.enable = enable;
script.api.disable = disable;