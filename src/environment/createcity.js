import * as THREE from "three";

const CITY_GROUND_TOP_Y = -0.02;
const VERTICAL_ROAD_TOP_Y = 0.06;
const HORIZONTAL_ROAD_TOP_Y = 0.072;
const ACCESS_ROAD_TOP_Y = 0.084;
const ROAD_MARKING_Y = 0.098;
const WATER_TOP_Y = -0.03;

const RUNWAY_CLEARANCE_X = 230;
const RUNWAY_CLEARANCE_Z = 1950;

function createSeededRandom(seed = 605) {
    let state = seed >>> 0;

    return function random() {
        state += 0x6d2b79f5;
        let value = state;

        value = Math.imul(
            value ^ (value >>> 15),
            value | 1
        );

        value ^=
            value +
            Math.imul(
                value ^ (value >>> 7),
                value | 61
            );

        return (
            ((value ^ (value >>> 14)) >>> 0) /
            4294967296
        );
    };
}

function createStandardMaterial(
    color,
    roughness = 0.85,
    metalness = 0.03
) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
        depthTest: true,
        depthWrite: true
    });
}

function createEmissiveMaterial(
    color,
    emissive,
    emissiveIntensity
) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.72,
        metalness: 0.04,
        emissive,
        emissiveIntensity,
        depthTest: true,
        depthWrite: true
    });
}

function createBox(
    name,
    width,
    height,
    depth,
    x,
    topY,
    z,
    material
) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
    );

    mesh.name = name;
    mesh.position.set(x, topY - height / 2, z);
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    return mesh;
}

function createInstancedObjects({
    name,
    count,
    geometry,
    material,
    createTransform
}) {
    const mesh = new THREE.InstancedMesh(
        geometry,
        material,
        count
    );

    mesh.name = name;
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const euler = new THREE.Euler();

    for (let index = 0; index < count; index += 1) {
        const transform = createTransform(index);

        position.set(
            transform.x,
            transform.y,
            transform.z
        );

        euler.set(
            0,
            transform.rotationY || 0,
            0
        );

        quaternion.setFromEuler(euler);

        scale.set(
            transform.scaleX,
            transform.scaleY,
            transform.scaleZ
        );

        matrix.compose(position, quaternion, scale);
        mesh.setMatrixAt(index, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    return mesh;
}

function isInsideRunwayClearance(x, z) {
    return (
        Math.abs(x) < RUNWAY_CLEARANCE_X &&
        Math.abs(z) < RUNWAY_CLEARANCE_Z
    );
}

function createCityGround() {
    const group = new THREE.Group();
    group.name = "CityGroundAreas";

    const material = createStandardMaterial(
        0x4c5358,
        1,
        0
    );

    group.add(
        createBox(
            "WestUrbanGround",
            2950,
            0.08,
            6200,
            -1725,
            CITY_GROUND_TOP_Y,
            100,
            material
        ),
        createBox(
            "EastUrbanGround",
            2950,
            0.08,
            6200,
            1725,
            CITY_GROUND_TOP_Y,
            100,
            material
        )
    );

    return group;
}

function createRoadNetwork() {
    const group = new THREE.Group();
    group.name = "CityRoadNetwork";

    const roadMaterial = createStandardMaterial(
        0x252a2e,
        0.97,
        0
    );

    const yellowMaterial = new THREE.MeshBasicMaterial({
        color: 0xe5b93c,
        depthTest: true,
        depthWrite: true
    });

    const whiteMaterial = new THREE.MeshBasicMaterial({
        color: 0xe9edf0,
        depthTest: true,
        depthWrite: true
    });

    const verticalRoadXPositions = [
        -2800,
        -2350,
        -1900,
        -1450,
        -1000,
        -550,
        550,
        1000,
        1450,
        1900,
        2350,
        2800
    ];

    const horizontalRoadZPositions = [
        -2600,
        -2200,
        -1750,
        -1300,
        -850,
        -400,
        50,
        500,
        950,
        1400,
        1850,
        2300,
        2750
    ];

    for (const x of verticalRoadXPositions) {
        group.add(
            createBox(
                "NorthSouthRoad",
                24,
                0.1,
                5600,
                x,
                VERTICAL_ROAD_TOP_Y,
                100,
                roadMaterial
            ),
            createBox(
                "NorthSouthCenterline",
                0.32,
                0.012,
                5550,
                x,
                ROAD_MARKING_Y,
                100,
                yellowMaterial
            )
        );
    }

    for (const z of horizontalRoadZPositions) {
        group.add(
            createBox(
                "EastWestRoad",
                5900,
                0.1,
                24,
                0,
                HORIZONTAL_ROAD_TOP_Y,
                z,
                roadMaterial
            ),
            createBox(
                "EastWestCenterline",
                5850,
                0.012,
                0.32,
                0,
                ROAD_MARKING_Y + 0.004,
                z,
                whiteMaterial
            )
        );
    }

    for (const x of verticalRoadXPositions) {
        for (const z of horizontalRoadZPositions) {
            group.add(
                createBox(
                    "RoadIntersection",
                    26,
                    0.108,
                    26,
                    x,
                    HORIZONTAL_ROAD_TOP_Y + 0.006,
                    z,
                    roadMaterial
                )
            );
        }
    }

    const accessRoad = createBox(
        "AirportAccessRoad",
        34,
        0.11,
        1600,
        310,
        ACCESS_ROAD_TOP_Y,
        950,
        roadMaterial
    );

    accessRoad.rotation.y = THREE.MathUtils.degToRad(-16);
    group.add(accessRoad);

    return group;
}

function createResidentialDistrict(random) {
    const count = 180;
    const geometry = new THREE.BoxGeometry(18, 8, 22);
    const material = createStandardMaterial(
        0xc0b6a5,
        0.9,
        0
    );

    return createInstancedObjects({
        name: "ResidentialHouses",
        count,
        geometry,
        material,
        createTransform: () => {
            let x;
            let z;

            do {
                const side = random() < 0.5 ? -1 : 1;
                x = side * (450 + random() * 2350);
                z = -1200 + random() * 3850;
            } while (isInsideRunwayClearance(x, z));

            const heightScale = 0.72 + random() * 0.8;

            return {
                x,
                y: 4 * heightScale,
                z,
                scaleX: 0.68 + random() * 1.25,
                scaleY: heightScale,
                scaleZ: 0.7 + random() * 1.2,
                rotationY: random() < 0.5 ? 0 : Math.PI / 2
            };
        }
    });
}

function createApartmentDistrict(random) {
    const count = 72;
    const geometry = new THREE.BoxGeometry(32, 28, 38);
    const material = createEmissiveMaterial(
        0x8d969c,
        0x253344,
        0.08
    );

    const mesh = createInstancedObjects({
        name: "ApartmentBuildings",
        count,
        geometry,
        material,
        createTransform: () => {
            const side = random() < 0.5 ? -1 : 1;
            const x = side * (900 + random() * 1800);
            const z = -1800 + random() * 4200;
            const heightScale = 0.7 + random() * 1.9;

            return {
                x,
                y: 14 * heightScale,
                z,
                scaleX: 0.7 + random() * 1.2,
                scaleY: heightScale,
                scaleZ: 0.7 + random() * 1.25,
                rotationY: random() * Math.PI
            };
        }
    });

    mesh.userData.nightMaterial = material;

    return mesh;
}

function createWarehouseDistrict(random) {
    const count = 44;
    const geometry = new THREE.BoxGeometry(60, 13, 44);
    const material = createStandardMaterial(
        0x788188,
        0.94,
        0.01
    );

    return createInstancedObjects({
        name: "IndustrialWarehouses",
        count,
        geometry,
        material,
        createTransform: () => {
            const side = random() < 0.5 ? -1 : 1;

            return {
                x: side * (350 + random() * 1150),
                y: 6.5,
                z: -2100 - random() * 900,
                scaleX: 0.8 + random() * 1.8,
                scaleY: 0.75 + random() * 0.8,
                scaleZ: 0.8 + random() * 1.6,
                rotationY: random() < 0.5 ? 0 : Math.PI / 2
            };
        }
    });
}

function createDowntown(random) {
    const group = new THREE.Group();
    group.name = "DowntownDistrict";

    const material = createEmissiveMaterial(
        0x52616b,
        0x172638,
        0.12
    );

    const towers = createInstancedObjects({
        name: "DowntownTowers",
        count: 34,
        geometry: new THREE.BoxGeometry(44, 90, 44),
        material,
        createTransform: (index) => {
            const row = Math.floor(index / 6);
            const column = index % 6;
            const heightScale = 0.55 + random() * 2.4;

            return {
                x: 1850 + column * 105 + (random() - 0.5) * 25,
                y: 45 * heightScale,
                z: -1100 + row * 145 + (random() - 0.5) * 30,
                scaleX: 0.65 + random() * 0.9,
                scaleY: heightScale,
                scaleZ: 0.65 + random() * 0.9,
                rotationY: random() * Math.PI
            };
        }
    });

    towers.userData.nightMaterial = material;
    group.add(towers);

    const landmarkMaterial = createEmissiveMaterial(
        0x384b59,
        0x1e4265,
        0.18
    );

    group.add(
        createBox(
            "CityLandmarkTower",
            58,
            310,
            58,
            2180,
            310,
            -760,
            landmarkMaterial
        )
    );

    group.userData.nightMaterials = [
        material,
        landmarkMaterial
    ];

    return group;
}

function createTrees(random) {
    const group = new THREE.Group();
    group.name = "CityTrees";

    const count = 260;
    const trunkGeometry = new THREE.CylinderGeometry(0.6, 0.85, 5, 7);
    const crownGeometry = new THREE.ConeGeometry(3.7, 8, 8);
    const trunkMaterial = createStandardMaterial(0x5d422b, 1, 0);
    const crownMaterial = createStandardMaterial(0x2f6f38, 1, 0);

    const trunks = new THREE.InstancedMesh(
        trunkGeometry,
        trunkMaterial,
        count
    );

    const crowns = new THREE.InstancedMesh(
        crownGeometry,
        crownMaterial,
        count
    );

    const trunkMatrix = new THREE.Matrix4();
    const crownMatrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    for (let index = 0; index < count; index += 1) {
        let x;
        let z;

        do {
            const side = random() < 0.5 ? -1 : 1;
            x = side * (350 + random() * 2600);
            z = -1500 + random() * 4100;
        } while (isInsideRunwayClearance(x, z));

        const treeScale = 0.65 + random() * 1.2;
        scale.set(treeScale, treeScale, treeScale);

        position.set(x, 2.5 * treeScale, z);
        trunkMatrix.compose(position, quaternion, scale);
        trunks.setMatrixAt(index, trunkMatrix);

        position.set(x, 7.5 * treeScale, z);
        crownMatrix.compose(position, quaternion, scale);
        crowns.setMatrixAt(index, crownMatrix);
    }

    trunks.instanceMatrix.needsUpdate = true;
    crowns.instanceMatrix.needsUpdate = true;

    group.add(trunks, crowns);

    return group;
}

function createStreetlights() {
    const group = new THREE.Group();
    group.name = "CityStreetlights";

    const positions = [];

    for (let x = -2800; x <= 2800; x += 180) {
        if (Math.abs(x) > RUNWAY_CLEARANCE_X) {
            positions.push([x, 500]);
            positions.push([x, -850]);
            positions.push([x, 1850]);
        }
    }

    const poleMaterial = createStandardMaterial(
        0x4d555d,
        0.72,
        0.28
    );

    const lampMaterial = createEmissiveMaterial(
        0xffe3a0,
        0xffb73d,
        0.15
    );

    const poles = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(0.12, 0.16, 6, 8),
        poleMaterial,
        positions.length
    );

    const lamps = new THREE.InstancedMesh(
        new THREE.SphereGeometry(0.3, 8, 6),
        lampMaterial,
        positions.length
    );

    const matrix = new THREE.Matrix4();

    for (let index = 0; index < positions.length; index += 1) {
        const [x, z] = positions[index];

        matrix.makeTranslation(x, 3, z);
        poles.setMatrixAt(index, matrix);

        matrix.makeTranslation(x, 6.15, z);
        lamps.setMatrixAt(index, matrix);
    }

    poles.instanceMatrix.needsUpdate = true;
    lamps.instanceMatrix.needsUpdate = true;
    lamps.userData.nightMaterial = lampMaterial;

    group.add(poles, lamps);
    group.userData.lampMaterial = lampMaterial;

    return group;
}

function createCoastline() {
    const group = new THREE.Group();
    group.name = "CoastalArea";

    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x1b5f7a,
        roughness: 0.28,
        metalness: 0.04,
        transparent: true,
        opacity: 0.88,
        depthTest: true,
        depthWrite: true
    });

    const water = new THREE.Mesh(
        new THREE.PlaneGeometry(7200, 2600),
        waterMaterial
    );

    water.name = "CityWater";
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, WATER_TOP_Y, 4100);
    group.add(water);

    group.add(
        createBox(
            "CoastalShore",
            7200,
            0.06,
            280,
            0,
            CITY_GROUND_TOP_Y + 0.015,
            2800,
            createStandardMaterial(0x756f5c, 1, 0)
        )
    );

    group.userData.waterMaterial = waterMaterial;

    return group;
}

function createBridge() {
    const group = new THREE.Group();
    group.name = "CityBridge";

    const deck = createBox(
        "BridgeDeck",
        34,
        2.4,
        920,
        -1450,
        21.2,
        3300,
        createStandardMaterial(0x343a40, 0.88, 0.08)
    );

    deck.rotation.y = THREE.MathUtils.degToRad(-18);
    group.add(deck);

    const supportMaterial = createStandardMaterial(
        0x858d94,
        0.72,
        0.18
    );

    for (let index = -4; index <= 4; index += 1) {
        const support = new THREE.Mesh(
            new THREE.BoxGeometry(5, 40, 5),
            supportMaterial
        );

        support.position.set(
            -1450 + index * 32,
            0,
            3300 + index * 95
        );

        group.add(support);
    }

    return group;
}

function createPortFacilities() {
    const group = new THREE.Group();
    group.name = "PortFacilities";

    const dockMaterial = createStandardMaterial(
        0x474d52,
        0.9,
        0.04
    );

    const containerColors = [
        0xc74a3a,
        0x2876a7,
        0xd29b32,
        0x3c8b5e,
        0x8d4fa0
    ];

    for (let dockIndex = 0; dockIndex < 4; dockIndex += 1) {
        const dockX = 900 + dockIndex * 240;

        group.add(
            createBox(
                "PortDock",
                150,
                2,
                620,
                dockX,
                2,
                3250,
                dockMaterial
            )
        );

        for (let containerIndex = 0; containerIndex < 18; containerIndex += 1) {
            const row = Math.floor(containerIndex / 6);
            const column = containerIndex % 6;
            const color = containerColors[
                (containerIndex + dockIndex) % containerColors.length
            ];

            group.add(
                createBox(
                    "ShippingContainer",
                    26,
                    9,
                    10,
                    dockX - 58 + column * 23,
                    10,
                    3060 + row * 14,
                    createStandardMaterial(color, 0.86, 0.05)
                )
            );
        }
    }

    return group;
}

export function createCity() {
    const random = createSeededRandom(605);
    const city = new THREE.Group();

    city.name = "NovaCity";

    city.add(
        createCityGround(),
        createRoadNetwork(),
        createResidentialDistrict(random),
        createApartmentDistrict(random),
        createWarehouseDistrict(random),
        createDowntown(random),
        createTrees(random),
        createStreetlights(),
        createCoastline(),
        createBridge(),
        createPortFacilities()
    );

    city.userData = {
        runwayClearanceX: RUNWAY_CLEARANCE_X,
        runwayClearanceZ: RUNWAY_CLEARANCE_Z,
        surfaceLevels: {
            cityGround: CITY_GROUND_TOP_Y,
            verticalRoad: VERTICAL_ROAD_TOP_Y,
            horizontalRoad: HORIZONTAL_ROAD_TOP_Y,
            accessRoad: ACCESS_ROAD_TOP_Y,
            roadMarking: ROAD_MARKING_Y,
            water: WATER_TOP_Y
        }
    };

    return city;
}
