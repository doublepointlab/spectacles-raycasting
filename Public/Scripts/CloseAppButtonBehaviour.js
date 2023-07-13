// -----JS CODE-----
// @input SceneObject apps
// @input SceneObject menu

var transform = script.getSceneObject().getTransform();

function onHit() {
    transform.setLocalScale(new vec3(1.2, 1.2, 1.2));
}

function onMiss() {
    transform.setLocalScale(new vec3(1.0, 1.0, 1.0));
}

function onTap() {
    global.LOG("close button");

    // deactivate apps
    if (script.apps) {
        for (var i = 0; i < script.apps.getChildrenCount(); i++) {
            var child = script.apps.getChild(i);
            var scripts = child.getComponents("ScriptComponent");
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].api && scripts[i].api.deactivate) {
                    scripts[i].api.deactivate();
                }
            }
        }
    }

    // enable menu
    if (script.menu) {
        global.LOG("enable menu");
        var scripts = script.menu.getComponents("ScriptComponent");
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].api && scripts[i].api.enable) {
                scripts[i].api.enable();
            }
        }
    }

    // deactivate self
    //global.tweenManager.startTween(script.getSceneObject(), "hide");

}

function activate() {
    //global.tweenManager.startTween(script.getSceneObject(), "unhide");
}

script.api.onHit = onHit;
script.api.onMiss = onMiss;
script.api.onTap = onTap;
script.api.activate = activate;
