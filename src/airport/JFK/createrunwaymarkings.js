import * as THREE from "three";
import { getPrimaryRunwayDimensions } from "./createrunways.js";

function createMarking(width, length, x, z, material) {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(width, length),
        material
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.006, z);
    mesh.renderOrder = 10;
    return mesh;
}

export function createRunwayMarkings() {
    const group = new THREE.Group();
    group.name = "JFKRunwayMarkings";

    const { length, width, height } = getPrimaryRunwayDimensions();
    group.position.set(0, height, 0);

    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    for (let z = length / 2 - 200; z >= -length / 2 + 200; z -= 50) {
        group.add(createMarking(0.9, 30, 0, z, material));
    }

    const edgeOffset = width / 2 - 1;
    group.add(createMarking(0.9, length - 20, -edgeOffset, 0, material));
    group.add(createMarking(0.9, length - 20, edgeOffset, 0, material));

    return group;
}
