import * as THREE from "three";

const RUNWAY_LENGTH = 3500;
const RUNWAY_WIDTH = 60;
const RUNWAY_HEIGHT = 0.16;

export function createRunways() {
    const group = new THREE.Group();
    group.name = "JFKRunways";

    const runway = new THREE.Mesh(
        new THREE.BoxGeometry(RUNWAY_WIDTH, RUNWAY_HEIGHT, RUNWAY_LENGTH),
        new THREE.MeshStandardMaterial({
            color: 0x292d31,
            roughness: 0.96,
            metalness: 0
        })
    );
    runway.position.set(0, RUNWAY_HEIGHT / 2, 0);
    group.add(runway);

    const shoulderGeometry = new THREE.BoxGeometry(7, 0.12, RUNWAY_LENGTH);
    const shoulderMaterial = new THREE.MeshStandardMaterial({
        color: 0x555b61,
        roughness: 1,
        metalness: 0
    });

    for (const x of [-33.55, 33.55]) {
        const shoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        shoulder.position.set(x, 0.08, 0);
        group.add(shoulder);
    }

    return group;
}

export function getPrimaryRunwayDimensions() {
    return {
        length: RUNWAY_LENGTH,
        width: RUNWAY_WIDTH,
        height: RUNWAY_HEIGHT
    };
}
