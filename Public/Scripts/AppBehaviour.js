// -----JS CODE-----

function activate() {
    global.LOG("activate");
    global.tweenManager.startTween(script.getSceneObject(), "scale_up");
}

function deactivate() {
    global.tweenManager.startTween(script.getSceneObject(), "scale_down");
}

script.api.activate = activate;
script.api.deactivate = deactivate;
