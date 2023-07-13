global.subscribeOnMessageReceive(OnMessageReceived);

var transform = script.getSceneObject().getTransform();

function OnMessageReceived(msg) {
    //var orientation = new quat(msg[0], msg[1], msg[2], mnsg[3]);
    global.LOG("hehe");
    //transform.setLocalRotation(orientation);
}