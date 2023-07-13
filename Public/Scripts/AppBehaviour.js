// -----JS CODE-----
// @input SceneObject menu
// @input SceneObject closeButton

var active = false;

function activate() {
    if (active)
        return;

    active = true;

    global.tweenManager.startTween(script.getSceneObject(), "scale_up");
    // TODO:
    // - activate close app button
    if (script.menu) {
        var scripts = script.menu.getComponents("ScriptComponent");
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].api && scripts[i].api.disable) {
                scripts[i].api.disable();
            }
        }
    }

    if (script.closeButton) {
        var scripts = script.closeButton.getComponents("ScriptComponent");
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].api && scripts[i].api.activate) {
                scripts[i].api.activate();
            }
        }
    }

}

function deactivate() {
    if (!active)
        return;

    active = false;

    global.tweenManager.startTween(script.getSceneObject(), "scale_down");
}

script.api.activate = activate;
script.api.deactivate = deactivate;
