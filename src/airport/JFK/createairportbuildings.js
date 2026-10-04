import * as THREE from "three";
import { RUNWAY_LENGTH, RUNWAY_WIDTH, RUNWAY_TOP_Y } from "./createrunways.js";

function material(color, roughness = 0.8, metalness = 0.05) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addBox(group, name, size, position, color) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(...size),
        material(color)
    );
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    group.add(mesh);
    return mesh;
}

function addLight(group, x, y, z, color, radius = 0.1) {
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 10, 8),
        new THREE.MeshBasicMaterial({ color })
    );
    mesh.position.set(x, y, z);
    mesh.renderOrder = 20;
    group.add(mesh);
}

function createLights() {
    const group = new THREE.Group();
    group.name = "AirportLights";

    const halfLength = RUNWAY_LENGTH / 2;
    const edgeX = RUNWAY_WIDTH / 2 + 0.9;

    for (let z = -halfLength + 25; z <= halfLength - 25; z += 50) {
        addLight(group, -edgeX, 0.3, z, 0xffffff, 0.12);
        addLight(group, edgeX, 0.3, z, 0xffffff, 0.12);
    }

    for (let z = -halfLength + 100; z <= halfLength - 100; z += 30) {
        addLight(group, 0, 0.29, z, 0xffffff, 0.075);
    }

    for (let x = -27; x <= 27; x += 3) {
        addLight(group, x, 0.31, halfLength - 2, 0x3cff62, 0.11);
        addLight(group, x, 0.31, -halfLength + 2, 0xff3030, 0.11);
    }

    for (const direction of [-1, 1]) {
        const runwayEnd = direction * halfLength;
        for (let distance = 30; distance <= 600; distance += 30) {
            const z = runwayEnd + direction * distance;
            addLight(group, 0, 0.3, z, 0xffffff, 0.09);

            if (distance % 150 === 0) {
                for (let x = -12; x <= 12; x += 3) {
                    addLight(group, x, 0.3, z, 0xffffff, 0.075);
                }
            }
        }
    }

    for (const z of [1450, -1450]) {
        const direction = Math.sign(z);
        for (let index = 0; index < 4; index += 1) {
            addLight(
                group,
                -42 + index * 2.2,
                0.35,
                z - direction * 25,
                index < 2 ? 0xffffff : 0xff2828,
                0.16
            );
        }
    }

    return group;
}

function createTerminalComplex() {
    const group = new THREE.Group();
    group.name = "TerminalComplex";

    addBox(group, "Terminal", [100, 15, 40], [155, 7.5, 620], 0x9aa4ad);
    addBox(group, "TerminalRoof", [104, 1, 44], [155, 15.5, 620], 0x414a52);
    addBox(group, "Concourse", [40, 9, 120], [120, 4.5, 540], 0x808b94);

    for (const z of [500, 530, 560, 590]) {
        addBox(group, "JetBridge", [28, 2.5, 4], [99, 4.5, z], 0xc4c9ce);
    }

    addBox(group, "Hangar", [60, 16, 44], [-150, 8, 200], 0x8a949d);
    addBox(group, "HangarDoor", [42, 11, 0.5], [-150, 6, 177.8], 0x38434d);
    addBox(group, "FireStation", [34, 10, 28], [-145, 5, -100], 0x9faaa9);

    return group;
}

function createControlTower() {
    const group = new THREE.Group();
    group.name = "ControlTower";

    const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(4.2, 6.5, 34, 16),
        material(0x848f98)
    );
    shaft.position.set(175, 17, 430);
    group.add(shaft);

    const cab = new THREE.Mesh(
        new THREE.CylinderGeometry(8, 7, 5, 12),
        new THREE.MeshStandardMaterial({
            color: 0x23435b,
            roughness: 0.25,
            transparent: true,
            opacity: 0.9
        })
    );
    cab.position.set(175, 36.5, 430);
    group.add(cab);

    const roof = new THREE.Mesh(
        new THREE.CylinderGeometry(9, 8, 1.2, 12),
        material(0x343b42)
    );
    roof.position.set(175, 39.6, 430);
    group.add(roof);

    return group;
}

function createWindsock() {
    const group = new THREE.Group();
    group.name = "Windsock";

    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 5, 10),
        material(0xcbd0d4)
    );
    pole.position.set(-72, 2.5, 350);
    group.add(pole);

    const sock = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 3.5, 16, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0xff6c2a,
            side: THREE.DoubleSide
        })
    );
    sock.rotation.z = -Math.PI / 2;
    sock.position.set(-70.2, 4.8, 350);
    group.add(sock);

    return group;
}

function createHelipad() {
    const group = new THREE.Group();
    group.name = "Helipad";

    const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(13, 13, 0.12, 48),
        material(0x454b50)
    );
    pad.position.set(-105, RUNWAY_TOP_Y, 600);
    group.add(pad);

    const ring = new THREE.Mesh(
        new THREE.RingGeometry(8, 9, 48),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            depthWrite: false
        })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(-105, RUNWAY_TOP_Y + 0.08, 600);
    group.add(ring);

    return group;
}

export function createAirportBuildings() {
    const group = new THREE.Group();
    group.name = "JFKAirportBuildings";
    group.add(
        createLights(),
        createTerminalComplex(),
        createControlTower(),
        createWindsock(),
        createHelipad()
    );
    return group;
}
