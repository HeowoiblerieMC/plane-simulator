import * as THREE from "three";

const CITY_GROUND_Y = -0.02;
const ROAD_TOP_Y = 0.02;
const BUILDING_BASE_Y = 0;
const WATER_TOP_Y = -0.01;

const RUNWAY_CLEARANCE_X = 230;
const RUNWAY_CLEARANCE_Z = 1950;

const CITY_LIMIT_X = 3200;
const CITY_LIMIT_Z = 3400;

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
            (
                value ^
                (value >>> 14)
            ) >>>
            0
        ) / 4294967296;
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
        metalness
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
        emissiveIntensity
    });
}

function createBox(
    name,
    width,
    height,
    depth,
    x,
    y,
    z,
    material
) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
            width,
            height,
            depth
        ),
        material
    );

    mesh.name = name;

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = false;
    mesh.receiveShadow = false;

    return mesh;
}

function createInstancedBuildings({
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
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const euler = new THREE.Euler();

    for (
        let index = 0;
        index < count;
        index += 1
    ) {
        const transform =
            createTransform(index);

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

        rotation.setFromEuler(euler);

        scale.set(
            transform.scaleX,
            transform.scaleY,
            transform.scaleZ
        );

        matrix.compose(
            position,
            rotation,
            scale
        );

        mesh.setMatrixAt(
            index,
            matrix
        );
    }

    mesh.instanceMatrix.needsUpdate =
        true;

    return mesh;
}

function isInsideRunwayClearance(
    x,
    z
) {
    return (
        Math.abs(x) <
            RUNWAY_CLEARANCE_X &&
        Math.abs(z) <
            RUNWAY_CLEARANCE_Z
    );
}

function createCityGround() {
    const group =
        new THREE.Group();

    group.name =
        "CityGroundAreas";

    const urbanMaterial =
        createStandardMaterial(
            0x4c5358,
            1,
            0
        );

    const industrialMaterial =
        createStandardMaterial(
            0x55595b,
            1,
            0
        );

    group.add(
        createBox(
            "WestUrbanGround",
            2100,
            0.08,
            5000,
            -1400,
            CITY_GROUND_Y,
            150,
            urbanMaterial
        )
    );

    group.add(
        createBox(
            "EastUrbanGround",
            2100,
            0.08,
            5000,
            1400,
            CITY_GROUND_Y,
            100,
            urbanMaterial
        )
    );

    group.add(
        createBox(
            "NorthIndustrialGround",
            2500,
            0.08,
            900,
            0,
            CITY_GROUND_Y,
            -2450,
            industrialMaterial
        )
    );

    return group;
}

function createRoadNetwork() {
    const group =
        new THREE.Group();

    group.name =
        "CityRoadNetwork";

    const roadMaterial =
        createStandardMaterial(
            0x252a2e,
            0.97,
            0
        );

    const lineMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xe5b93c,
            depthWrite: false
        });

    const whiteLineMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xe9edf0,
            depthWrite: false
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

    for (
        const x of
        verticalRoadXPositions
    ) {
        group.add(
            createBox(
                "NorthSouthRoad",
                24,
                0.08,
                5600,
                x,
                ROAD_TOP_Y,
                100,
                roadMaterial
            )
        );

        group.add(
            createBox(
                "NorthSouthCenterline",
                0.32,
                0.015,
                5550,
                x,
                ROAD_TOP_Y + 0.05,
                100,
                lineMaterial
            )
        );
    }

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

    for (
        const z of
        horizontalRoadZPositions
    ) {
        group.add(
            createBox(
                "EastWestRoad",
                5900,
                0.08,
                24,
                0,
                ROAD_TOP_Y,
                z,
                roadMaterial
            )
        );

        group.add(
            createBox(
                "EastWestCenterline",
                5850,
                0.015,
                0.32,
                0,
                ROAD_TOP_Y + 0.05,
                z,
                whiteLineMaterial
            )
        );
    }

    const airportAccessRoad =
        createBox(
            "AirportAccessRoad",
            34,
            0.1,
            1600,
            310,
            ROAD_TOP_Y + 0.01,
            950,
            roadMaterial
        );

    airportAccessRoad.rotation.y =
        THREE.MathUtils.degToRad(
            -16
        );

    group.add(
        airportAccessRoad
    );

    return group;
}

function createResidentialDistrict(
    random
) {
    const houseCount = 180;

    const material =
        createStandardMaterial(
            0xc0b6a5,
            0.9,
            0
        );

    const geometry =
        new THREE.BoxGeometry(
            18,
            8,
            22
        );

    return createInstancedBuildings({
        name: "ResidentialHouses",
        count: houseCount,
        geometry,
        material,

        createTransform: () => {
            let x = 0;
            let z = 0;

            do {
                const districtSide =
                    random() < 0.5
                        ? -1
                        : 1;

                x =
                    districtSide *
                    (
                        450 +
                        random() * 2350
                    );

                z =
                    -1200 +
                    random() * 3850;
            } while (
                isInsideRunwayClearance(
                    x,
                    z
                )
            );

            const heightScale =
                0.72 +
                random() * 0.8;

            return {
                x,
                y:
                    BUILDING_BASE_Y +
                    4 * heightScale,
                z,
                scaleX:
                    0.68 +
                    random() * 1.25,
                scaleY:
                    heightScale,
                scaleZ:
                    0.7 +
                    random() * 1.2,
                rotationY:
                    random() <
                    0.5
                        ? 0
                        : Math.PI / 2
            };
        }
    });
}

function createApartmentDistrict(
    random
) {
    const apartmentCount = 72;

    const material =
        createEmissiveMaterial(
            0x8d969c,
            0x253344,
            0.08
        );

    const geometry =
        new THREE.BoxGeometry(
            32,
            28,
            38
        );

    const mesh =
        createInstancedBuildings({
            name:
                "ApartmentBuildings",
            count:
                apartmentCount,
            geometry,
            material,

            createTransform: () => {
                const side =
                    random() < 0.5
                        ? -1
                        : 1;

                const x =
                    side *
                    (
                        900 +
                        random() * 1800
                    );

                const z =
                    -1800 +
                    random() * 4200;

                const heightScale =
                    0.7 +
                    random() * 1.9;

                return {
                    x,
                    y:
                        BUILDING_BASE_Y +
                        14 *
                            heightScale,
                    z,
                    scaleX:
                        0.7 +
                        random() * 1.2,
                    scaleY:
                        heightScale,
                    scaleZ:
                        0.7 +
                        random() * 1.25,
                    rotationY:
                        random() *
                        Math.PI
                };
            }
        });

    mesh.userData.nightMaterial =
        material;

    return mesh;
}

function createWarehouseDistrict(
    random
) {
    const warehouseCount = 44;

    const material =
        createStandardMaterial(
            0x788188,
            0.94,
            0.01
        );

    const geometry =
        new THREE.BoxGeometry(
            60,
            13,
            44
        );

    return createInstancedBuildings({
        name: "IndustrialWarehouses",
        count: warehouseCount,
        geometry,
        material,

        createTransform: () => {
            const side =
                random() < 0.5
                    ? -1
                    : 1;

            const x =
                side *
                (
                    350 +
                    random() * 1150
                );

            const z =
                -2100 -
                random() * 900;

            return {
                x,
                y:
                    BUILDING_BASE_Y +
                    6.5,
                z,
                scaleX:
                    0.8 +
                    random() * 1.8,
                scaleY:
                    0.75 +
                    random() * 0.8,
                scaleZ:
                    0.8 +
                    random() * 1.6,
                rotationY:
                    random() <
                    0.5
                        ? 0
                        : Math.PI / 2
            };
        }
    });
}

function createDowntown(
    random
) {
    const group =
        new THREE.Group();

    group.name =
        "DowntownDistrict";

    const towerCount = 34;

    const towerMaterial =
        createEmissiveMaterial(
            0x52616b,
            0x172638,
            0.12
        );

    const towerGeometry =
        new THREE.BoxGeometry(
            44,
            90,
            44
        );

    const towers =
        createInstancedBuildings({
            name:
                "DowntownTowers",
            count:
                towerCount,
            geometry:
                towerGeometry,
            material:
                towerMaterial,

            createTransform: (
                index
            ) => {
                const row =
                    Math.floor(
                        index / 6
                    );

                const column =
                    index % 6;

                const x =
                    1850 +
                    column * 105 +
                    (
                        random() -
                        0.5
                    ) *
                        25;

                const z =
                    -1100 +
                    row * 145 +
                    (
                        random() -
                        0.5
                    ) *
                        30;

                const heightScale =
                    0.55 +
                    random() * 2.4;

                return {
                    x,
                    y:
                        BUILDING_BASE_Y +
                        45 *
                            heightScale,
                    z,
                    scaleX:
                        0.65 +
                        random() * 0.9,
                    scaleY:
                        heightScale,
                    scaleZ:
                        0.65 +
                        random() * 0.9,
                    rotationY:
                        random() *
                        Math.PI
                };
            }
        });

    towers.userData.nightMaterial =
        towerMaterial;

    group.add(
        towers
    );

    const landmarkMaterial =
        createEmissiveMaterial(
            0x384b59,
            0x1e4265,
            0.18
        );

    const landmark =
        createBox(
            "CityLandmarkTower",
            58,
            310,
            58,
            2180,
            155,
            -760,
            landmarkMaterial
        );

    group.add(
        landmark
    );

    group.userData.nightMaterials = [
        towerMaterial,
        landmarkMaterial
    ];

    return group;
}

function createTrees(
    random
) {
    const group =
        new THREE.Group();

    group.name =
        "CityTrees";

    const treeCount = 260;

    const trunkMaterial =
        createStandardMaterial(
            0x5d422b,
            1,
            0
        );

    const leafMaterial =
        createStandardMaterial(
            0x2f6f38,
            1,
            0
        );

    const trunkGeometry =
        new THREE.CylinderGeometry(
            0.6,
            0.85,
            5,
            7
        );

    const crownGeometry =
        new THREE.ConeGeometry(
            3.7,
            8,
            8
        );

    const trunks =
        new THREE.InstancedMesh(
            trunkGeometry,
            trunkMaterial,
            treeCount
        );

    const crowns =
        new THREE.InstancedMesh(
            crownGeometry,
            leafMaterial,
            treeCount
        );

    trunks.name =
        "TreeTrunks";

    crowns.name =
        "TreeCrowns";

    const trunkMatrix =
        new THREE.Matrix4();

    const crownMatrix =
        new THREE.Matrix4();

    const position =
        new THREE.Vector3();

    const quaternion =
        new THREE.Quaternion();

    const scale =
        new THREE.Vector3();

    for (
        let index = 0;
        index < treeCount;
        index += 1
    ) {
        let x = 0;
        let z = 0;

        do {
            const side =
                random() < 0.5
                    ? -1
                    : 1;

            x =
                side *
                (
                    350 +
                    random() * 2600
                );

            z =
                -1500 +
                random() * 4100;
        } while (
            isInsideRunwayClearance(
                x,
                z
            )
        );

        const treeScale =
            0.65 +
            random() * 1.2;

        position.set(
            x,
            2.5 * treeScale,
            z
        );

        scale.set(
            treeScale,
            treeScale,
            treeScale
        );

        trunkMatrix.compose(
            position,
            quaternion,
            scale
        );

        trunks.setMatrixAt(
            index,
            trunkMatrix
        );

        position.set(
            x,
            7.5 * treeScale,
            z
        );

        crownMatrix.compose(
            position,
            quaternion,
            scale
        );

        crowns.setMatrixAt(
            index,
            crownMatrix
        );
    }

    trunks.instanceMatrix.needsUpdate =
        true;

    crowns.instanceMatrix.needsUpdate =
        true;

    group.add(
        trunks,
        crowns
    );

    return group;
}

function createStreetlights() {
    const group =
        new THREE.Group();

    group.name =
        "CityStreetlights";

    const poleMaterial =
        createStandardMaterial(
            0x4d555d,
            0.72,
            0.28
        );

    const lampMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xffe3a0,
            roughness: 0.4,
            emissive: 0xffb73d,
            emissiveIntensity: 0.15
        });

    const poleGeometry =
        new THREE.CylinderGeometry(
            0.12,
            0.16,
            6,
            8
        );

    const lampGeometry =
        new THREE.SphereGeometry(
            0.3,
            8,
            6
        );

    const positions = [];

    for (
        let x = -2800;
        x <= 2800;
        x += 180
    ) {
        if (
            Math.abs(x) >
            RUNWAY_CLEARANCE_X
        ) {
            positions.push([
                x,
                500
            ]);

            positions.push([
                x,
                -850
            ]);

            positions.push([
                x,
                1850
            ]);
        }
    }

    const poles =
        new THREE.InstancedMesh(
            poleGeometry,
            poleMaterial,
            positions.length
        );

    const lamps =
        new THREE.InstancedMesh(
            lampGeometry,
            lampMaterial,
            positions.length
        );

    const matrix =
        new THREE.Matrix4();

    const lampMatrix =
        new THREE.Matrix4();

    for (
        let index = 0;
        index < positions.length;
        index += 1
    ) {
        const [
            x,
            z
        ] = positions[index];

        matrix.makeTranslation(
            x,
            3,
            z
        );

        poles.setMatrixAt(
            index,
            matrix
        );

        lampMatrix.makeTranslation(
            x,
            6.15,
            z
        );

        lamps.setMatrixAt(
            index,
            lampMatrix
        );
    }

    poles.instanceMatrix.needsUpdate =
        true;

    lamps.instanceMatrix.needsUpdate =
        true;

    lamps.userData.nightMaterial =
        lampMaterial;

    group.add(
        poles,
        lamps
    );

    group.userData.lampMaterial =
        lampMaterial;

    return group;
}

function createCoastline() {
    const group =
        new THREE.Group();

    group.name =
        "CoastalArea";

    const waterMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x1b5f7a,
            roughness: 0.28,
            metalness: 0.04,
            transparent: true,
            opacity: 0.88
        });

    const water =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                7200,
                2600
            ),
            waterMaterial
        );

    water.name =
        "CityWater";

    water.rotation.x =
        -Math.PI / 2;

    water.position.set(
        0,
        WATER_TOP_Y,
        4100
    );

    group.add(
        water
    );

    const shoreMaterial =
        createStandardMaterial(
            0x756f5c,
            1,
            0
        );

    group.add(
        createBox(
            "CoastalShore",
            7200,
            0.06,
            280,
            0,
            CITY_GROUND_Y,
            2800,
            shoreMaterial
        )
    );

    group.userData.waterMaterial =
        waterMaterial;

    return group;
}

function createBridge() {
    const group =
        new THREE.Group();

    group.name =
        "CityBridge";

    const deckMaterial =
        createStandardMaterial(
            0x343a40,
            0.88,
            0.08
        );

    const supportMaterial =
        createStandardMaterial(
            0x858d94,
            0.72,
            0.18
        );

    const deck =
        createBox(
            "BridgeDeck",
            34,
            2.4,
            920,
            -1450,
            20,
            3300,
            deckMaterial
        );

    deck.rotation.y =
        THREE.MathUtils.degToRad(
            -18
        );

    group.add(
        deck
    );

    for (
        let index = -4;
        index <= 4;
        index += 1
    ) {
        const support =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    5,
                    40,
                    5
                ),
                supportMaterial
            );

        support.position.set(
            -1450 +
                index * 32,
            0,
            3300 +
                index * 95
        );

        group.add(
            support
        );
    }

    return group;
}

function createPortFacilities() {
    const group =
        new THREE.Group();

    group.name =
        "PortFacilities";

    const dockMaterial =
        createStandardMaterial(
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

    for (
        let dockIndex = 0;
        dockIndex < 4;
        dockIndex += 1
    ) {
        const dockX =
            900 +
            dockIndex * 240;

        group.add(
            createBox(
                "PortDock",
                150,
                2,
                620,
                dockX,
                1,
                3250,
                dockMaterial
            )
        );

        for (
            let containerIndex = 0;
            containerIndex < 18;
            containerIndex += 1
        ) {
            const row =
                Math.floor(
                    containerIndex / 6
                );

            const column =
                containerIndex % 6;

            const color =
                containerColors[
                    (
                        containerIndex +
                        dockIndex
                    ) %
                        containerColors.length
                ];

            group.add(
                createBox(
                    "ShippingContainer",
                    26,
                    9,
                    10,
                    dockX -
                        58 +
                        column * 23,
                    5.5,
                    3060 +
                        row * 14,
                    createStandardMaterial(
                        color,
                        0.86,
                        0.05
                    )
                )
            );
        }
    }

    return group;
}

export function createCity() {
    const random =
        createSeededRandom(
            605
        );

    const city =
        new THREE.Group();

    city.name =
        "NovaCity";

    city.add(
        createCityGround(),
        createRoadNetwork(),
        createResidentialDistrict(
            random
        ),
        createApartmentDistrict(
            random
        ),
        createWarehouseDistrict(
            random
        ),
        createDowntown(
            random
        ),
        createTrees(
            random
        ),
        createStreetlights(),
        createCoastline(),
        createBridge(),
        createPortFacilities()
    );

    city.userData = {
        cityLimitX:
            CITY_LIMIT_X,
        cityLimitZ:
            CITY_LIMIT_Z,
        runwayClearanceX:
            RUNWAY_CLEARANCE_X,
        runwayClearanceZ:
            RUNWAY_CLEARANCE_Z
    };

    return city;
}
