import * as THREE from "three";

const RUNWAY_LENGTH = 3500;
const RUNWAY_WIDTH = 60;
const RUNWAY_HEIGHT = 0.12;

const SHOULDER_WIDTH = 7;
const SHOULDER_HEIGHT = 0.08;
const SHOULDER_TOP = 0.1;

function createRunwayMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x25282b,
        roughness: 0.96,
        metalness: 0,
        depthWrite: true,
        depthTest: true
    });
}

function createShoulderMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x45494d,
        roughness: 1,
        metalness: 0,
        depthWrite: true,
        depthTest: true
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
        SHOULDER_TOP -
            SHOULDER_HEIGHT / 2,
        0
    );

    shoulder.castShadow = false;
    shoulder.receiveShadow = false;

    return shoulder;
}

export function createRunways() {
    const runwayGroup =
        new THREE.Group();

    runwayGroup.name = "JFKRunways";

    const runway = new THREE.Mesh(
        new THREE.BoxGeometry(
            RUNWAY_WIDTH,
            RUNWAY_HEIGHT,
            RUNWAY_LENGTH
        ),
        createRunwayMaterial()
    );

    runway.name = "PrimaryRunway";

    runway.position.set(
        0,
        RUNWAY_HEIGHT / 2,
        0
    );

    runway.castShadow = false;
    runway.receiveShadow = true;

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
        0.02;

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
