import * as THREE from "three";
import {
    RUNWAY_LENGTH,
    RUNWAY_WIDTH,
    RUNWAY_TOP_Y,
    TAXIWAY_X
} from "./createrunways.js";

const MARKING_Y = RUNWAY_TOP_Y + 0.015;

function createMaterial(color) {
    return new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: true
    });
}

function addMarking(group, width, length, x, z, color = 0xffffff) {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(width, length),
        createMaterial(color)
    );

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, MARKING_Y, z);
    mesh.renderOrder = 10;
    group.add(mesh);
    return mesh;
}

function createRunwayNumberTexture(text, rotation = 0) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, 512, 512);
    context.translate(256, 256);
    context.rotate(rotation);
    context.fillStyle = "#ffffff";
    context.font = "bold 230px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 0, 18);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function addRunwayNumber(group, text, z, rotation) {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(22, 42),
        new THREE.MeshBasicMaterial({
            map: createRunwayNumberTexture(text, rotation),
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        })
    );

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, MARKING_Y + 0.002, z);
    mesh.renderOrder = 11;
    group.add(mesh);
}

export function createRunwayMarkings() {
    const group = new THREE.Group();
    group.name = "JFKRunwayMarkings";

    for (let z = RUNWAY_LENGTH / 2 - 210; z >= -RUNWAY_LENGTH / 2 + 210; z -= 50) {
        addMarking(group, 0.9, 30, 0, z);
    }

    const edgeX = RUNWAY_WIDTH / 2 - 1;
    addMarking(group, 0.9, RUNWAY_LENGTH - 20, -edgeX, 0);
    addMarking(group, 0.9, RUNWAY_LENGTH - 20, edgeX, 0);

    for (const direction of [-1, 1]) {
        const thresholdZ = direction * (RUNWAY_LENGTH / 2 - 72);

        for (let index = 0; index < 7; index += 1) {
            const x = 3.3 + index * 3.5;
            addMarking(group, 2.2, 42, -x, thresholdZ);
            addMarking(group, 2.2, 42, x, thresholdZ);
        }

        const aimingZ = direction * (RUNWAY_LENGTH / 2 - 430);
        addMarking(group, 7.5, 52, -11.5, aimingZ);
        addMarking(group, 7.5, 52, 11.5, aimingZ);

        for (const distance of [300, 600, 750]) {
            const touchdownZ = direction * (RUNWAY_LENGTH / 2 - distance);
            for (const x of [-14, -8, 8, 14]) {
                addMarking(group, 2.1, 22, x, touchdownZ);
            }
        }
    }

    addRunwayNumber(group, "04", RUNWAY_LENGTH / 2 - 150, 0);
    addRunwayNumber(group, "22", -RUNWAY_LENGTH / 2 + 150, Math.PI);

    addMarking(group, 0.35, 3080, TAXIWAY_X, 0, 0xf5c928);

    for (const z of [1100, 650, 200, -250, -700, -1150]) {
        addMarking(group, 52, 0.32, 48, z, 0xf5c928);
        addMarking(group, 0.45, 16, 61, z + 18, 0xf5c928);
        addMarking(group, 0.45, 16, 64, z + 18, 0xf5c928);
    }

    return group;
}
