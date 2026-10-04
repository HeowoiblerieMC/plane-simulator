import * as THREE from "three";

const RUNWAY_LENGTH = 3500;
const RUNWAY_WIDTH = 60;
const RUNWAY_HEIGHT = 0.12;

export function createRunways() {
    const runwayGroup = new THREE.Group();

    runwayGroup.name = "JFKRunways";

    const runwayGeometry = new THREE.BoxGeometry(
        RUNWAY_WIDTH,
        RUNWAY_HEIGHT,
        RUNWAY_LENGTH
    );

    const runwayMaterial = new THREE.MeshStandardMaterial({
        color: 0x25282b,
        roughness: 0.96,
        metalness: 0
    });

    const runway = new THREE.Mesh(
        runwayGeometry,
        runwayMaterial
    );

    runway.name = "PrimaryRunway";
    runway.position.set(
        0,
        RUNWAY_HEIGHT / 2,
        0
    );

    runway.receiveShadow = true;
    runway.castShadow = false;

    runwayGroup.add(runway);

    const shoulderMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x404448,
            roughness: 1,
            metalness: 0
        });

    const shoulderWidth = 7;

    const leftShoulder = new THREE.Mesh(
        new THREE.BoxGeometry(
            shoulderWidth,
            RUNWAY_HEIGHT * 0.75,
            RUNWAY_LENGTH
        ),
        shoulderMaterial
    );

    leftShoulder.name = "LeftRunwayShoulder";
    leftShoulder.position.set(
        -(RUNWAY_WIDTH / 2 + shoulderWidth / 2),
        RUNWAY_HEIGHT * 0.375,
        0
    );

    leftShoulder.receiveShadow = true;

    runwayGroup.add(leftShoulder);

    const rightShoulder = leftShoulder.clone();

    rightShoulder.name = "RightRunwayShoulder";
    rightShoulder.position.x =
        RUNWAY_WIDTH / 2 + shoulderWidth / 2;

    runwayGroup.add(rightShoulder);

    runwayGroup.userData = {
        length: RUNWAY_LENGTH,
        width: RUNWAY_WIDTH,
        height: RUNWAY_HEIGHT,
        forwardDirection: new THREE.Vector3(
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
