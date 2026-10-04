import * as THREE from "three";

const RUNWAY_LENGTH = 3500;
const RUNWAY_WIDTH = 60;
const RUNWAY_HEIGHT = 0.16;

const SHOULDER_WIDTH = 7;
const SHOULDER_HEIGHT = 0.12;
const SHOULDER_TOP_Y = 0.14;

function createRunwayMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x292d31,
        roughness: 0.96,
        metalness: 0,
        depthTest: true,
        depthWrite: true
    });
}

function createShoulderMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x555b61,
        roughness: 1,
        metalness: 0,
        depthTest: true,
        depthWrite: true
    });
}

function createShoulder(
    name,
    xPosition,
    geometry,
    material
) {
    const shoulder = new THREE.Mesh(
        geometry,
        material
    );

    shoulder.name = name;

    shoulder.position.set(
        xPosition,
        SHOULDER_TOP_Y -
            SHOULDER_HEIGHT / 2,
        0
    );

    shoulder.rotation.set(
        0,
        0,
        0
    );

    shoulder.scale.set(
        1,
        1,
        1
    );

    shoulder.castShadow = false;
    shoulder.receiveShadow = false;

    return shoulder;
}

export function createRunways() {
    const runwayGroup =
        new THREE.Group();

    runwayGroup.name = "JFKRunways";

    runwayGroup.position.set(
        0,
        0,
        0
    );

    runwayGroup.rotation.set(
        0,
        0,
        0
    );

    runwayGroup.scale.set(
        1,
        1,
        1
    );

    const runwayGeometry =
        new THREE.BoxGeometry(
            RUNWAY_WIDTH,
            RUNWAY_HEIGHT,
            RUNWAY_LENGTH
        );

    const runway = new THREE.Mesh(
        runwayGeometry,
        createRunwayMaterial()
    );

    runway.name = "PrimaryRunway";

    runway.position.set(
        0,
        RUNWAY_HEIGHT / 2,
        0
    );

    runway.rotation.set(
        0,
        0,
        0
    );

    runway.scale.set(
        1,
        1,
        1
    );

    runway.castShadow = false;
    runway.receiveShadow = false;

    runwayGroup.add(runway);

    const shoulderGeometry =
        new THREE.BoxGeometry(
            SHOULDER_WIDTH,
            SHOULDER_HEIGHT,
            RUNWAY_LENGTH
        );

    const shoulderMaterial =
        createShoulderMaterial();

    const shoulderOffset =
        RUNWAY_WIDTH / 2 +
        SHOULDER_WIDTH / 2 +
        0.05;

    const leftShoulder =
        createShoulder(
            "LeftRunwayShoulder",
            -shoulderOffset,
            shoulderGeometry,
            shoulderMaterial
        );

    const rightShoulder =
        createShoulder(
            "RightRunwayShoulder",
            shoulderOffset,
            shoulderGeometry,
            shoulderMaterial
        );

    runwayGroup.add(
        leftShoulder,
        rightShoulder
    );

    runwayGroup.userData = {
        length: RUNWAY_LENGTH,
        width: RUNWAY_WIDTH,
        height: RUNWAY_HEIGHT,
        shoulderWidth: SHOULDER_WIDTH,
        shoulderHeight: SHOULDER_HEIGHT,
        forwardDirection:
            new THREE.Vector3(
                0,
                0,
                -1
            )
    };

    return runwayGroup;
}

export function getPrimaryRunwayDimensions() {
    return {
        length: RUNWAY_LENGTH,
        width: RUNWAY_WIDTH,
        height: RUNWAY_HEIGHT
    };
}
