// -----JS CODE-----
//@input Component.MeshVisual meshVisual

var builder = new MeshBuilder([
    {name: "position", components: 3}
]);

builder.topology = MeshTopology.Lines;

builder.appendVerticesInterleaved([
    20,-60,0,
    20,-60,-200
]);

builder.appendIndices([0, 1]);

script.meshVisual.mesh = builder.getMesh();
builder.updateMesh();