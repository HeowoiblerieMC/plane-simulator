import * as THREE from "three";

export const RUNWAY_LENGTH = 3500;
export const RUNWAY_WIDTH = 60;
export const RUNWAY_TOP_Y = 0.18;
export const TAXIWAY_X = 82;

function createSurface(color, width, height, length, x, topY, name) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, length),
        new THREE.MeshStandardMaterial({
            color,
            roughness: 0.94,
            metalness: 0
        })
    );

    mesh.name = name;
    mesh.position.set(x, topY - height / 2, 0);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    return mesh;
}

export function createRunways() {
    const group = new THREE.Group();
    group.name = "JFKRunwaySurfaces";

    group.add(
        createSurface(
            0x282c30,
            RUNWAY_WIDTH,
            0.16,
            RUNWAY_LENGTH,
            0,
            RUNWAY_TOP_Y,
            "PrimaryRunway"
        )
    );

    group.add(
        createSurface(
            0x555b60,
            8,
            0.12,
            RUNWAY_LENGTH,
            -34,
            RUNWAY_TOP_Y - 0.02,
            "LeftRunwayShoulder"
        ),
        createSurface(
            0x555b60,
            8,
            0.12,
            RUNWAY_LENGTH,
            34,
            RUNWAY_TOP_Y - 0.02,
            "RightRunwayShoulder"
        )
    );

    group.add(
        createSurface(
            0x3a4045,
            24,
            0.12,
            3100,
            TAXIWAY_X,
            RUNWAY_TOP_Y - 0.03,
            "ParallelTaxiway"
        )
    );

    for (const z of [1100, 650, 200, -250, -700, -1150]) {
        const exit = createSurface(
            0x3a4045,
            52,
            0.12,
            15,
            48,
            RUNWAY_TOP_Y - 0.03,
            "RunwayExit"
        );
        exit.position.z = z;
        group.add(exit);
    }

    group.userData = {
        runwayLength: RUNWAY_LENGTH,
        runwayWidth: RUNWAY_WIDTH,
        runwayTopY: RUNWAY_TOP_Y,
        taxiwayX: TAXIWAY_X
    };

    return group;
}
