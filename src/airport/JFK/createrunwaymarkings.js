import * as THREE from "three";

import {
    getPrimaryRunwayDimensions
} from "./createrunways.js";

const MARKING_CLEARANCE = 0.008;

function createWhiteMaterial() {
    return new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: false,
        transparent: false
    });
}

function createFlatMarking(
    name,
    width,
    length,
    x,
    z,
    material
) {
    const geometry =
        new THREE.PlaneGeometry(
            width,
            length
        );

    const marking = new THREE.Mesh(
        geometry,
        material
    );

    marking.name = name;

    marking.rotation.set(
        -Math.PI / 2,
        0,
        0
    );

    marking.position.set(
        x,
        MARKING_CLEARANCE,
        z
    );

    marking.scale.set(
        1,
        1,
        1
    );

    marking.renderOrder = 10;

    return marking;
}

function createCenterlineMarkings(
    group,
    runwayLength,
    material
) {
    const segmentWidth = 0.9;
    const segmentLength = 30;
    const segmentGap = 20;

    const startZ =
        runwayLength / 2 - 210;

    const endZ =
        -runwayLength / 2 + 210;

    for (
        let z = startZ;
        z >= endZ;
        z -= segmentLength + segmentGap
    ) {
        group.add(
            createFlatMarking(
                "RunwayCenterline",
                segmentWidth,
                segmentLength,
                0,
                z,
                material
            )
        );
    }
}

function createEdgeLines(
    group,
    runwayLength,
    runwayWidth,
    material
) {
    const edgeLineWidth = 0.9;

    const edgeOffset =
        runwayWidth / 2 -
        edgeLineWidth / 2 -
        0.6;

    group.add(
        createFlatMarking(
            "LeftRunwayEdgeLine",
            edgeLineWidth,
            runwayLength - 20,
            -edgeOffset,
            0,
            material
        )
    );

    group.add(
        createFlatMarking(
            "RightRunwayEdgeLine",
            edgeLineWidth,
            runwayLength - 20,
            edgeOffset,
            0,
            material
        )
    );
}

function createThresholdStripes(
    group,
    runwayLength,
    material
) {
    const stripeWidth = 2.25;
    const stripeLength = 42;
    const stripeGap = 1.3;
    const stripeCountPerSide = 7;

    const thresholdOffset = 72;

    const nearThresholdZ =
        runwayLength / 2 -
        thresholdOffset;

    const farThresholdZ =
        -runwayLength / 2 +
        thresholdOffset;

    for (
        let index = 0;
        index < stripeCountPerSide;
        index += 1
    ) {
        const xOffset =
            3.3 +
            index *
                (
                    stripeWidth +
                    stripeGap
                );

        const positions = [
            [
                -xOffset,
                nearThresholdZ
            ],
            [
                xOffset,
                nearThresholdZ
            ],
            [
                -xOffset,
                farThresholdZ
            ],
            [
                xOffset,
                farThresholdZ
            ]
        ];

        for (const [x, z] of positions) {
            group.add(
                createFlatMarking(
                    "ThresholdStripe",
                    stripeWidth,
                    stripeLength,
                    x,
                    z,
                    material
                )
            );
        }
    }
}

function createAimingPoints(
    group,
    runwayLength,
    material
) {
    const distanceFromEnd = 430;
    const lateralOffset = 11.5;
    const width = 7.5;
    const length = 52;

    const nearZ =
        runwayLength / 2 -
        distanceFromEnd;

    const farZ =
        -runwayLength / 2 +
        distanceFromEnd;

    const positions = [
        [-lateralOffset, nearZ],
        [lateralOffset, nearZ],
        [-lateralOffset, farZ],
        [lateralOffset, farZ]
    ];

    for (const [x, z] of positions) {
        group.add(
            createFlatMarking(
                "AimingPoint",
                width,
                length,
                x,
                z,
                material
            )
        );
    }
}

function createTouchdownZoneMarkings(
    group,
    runwayLength,
    material
) {
    const distances = [
        300,
        600,
        750
    ];

    const lateralOffsets = [
        8,
        14
    ];

    for (const distance of distances) {
        const nearZ =
            runwayLength / 2 -
            distance;

        const farZ =
            -runwayLength / 2 +
            distance;

        for (
            const lateralOffset
            of lateralOffsets
        ) {
            const positions = [
                [
                    -lateralOffset,
                    nearZ
                ],
                [
                    lateralOffset,
                    nearZ
                ],
                [
                    -lateralOffset,
                    farZ
                ],
                [
                    lateralOffset,
                    farZ
                ]
            ];

            for (const [x, z] of positions) {
                group.add(
                    createFlatMarking(
                        "TouchdownZoneMarking",
                        2.2,
                        22,
                        x,
                        z,
                        material
                    )
                );
            }
        }
    }
}

function createRunwayNumberTexture(
    text,
    rotation
) {
    const canvas =
        document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 512;

    const context =
        canvas.getContext("2d");

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    context.save();

    context.translate(
        canvas.width / 2,
        canvas.height / 2
    );

    context.rotate(rotation);

    context.fillStyle = "#ffffff";

    context.textAlign = "center";

    context.textBaseline = "middle";

    context.font =
        "bold 250px Arial, sans-serif";

    context.fillText(
        text,
        0,
        20
    );

    context.restore();

    const texture =
        new THREE.CanvasTexture(canvas);

    texture.colorSpace =
        THREE.SRGBColorSpace;

    texture.minFilter =
        THREE.LinearFilter;

    texture.magFilter =
        THREE.LinearFilter;

    texture.needsUpdate = true;

    return texture;
}

function createRunwayNumbers(
    group,
    runwayLength
) {
    const numberDistance = 150;

    const nearTexture =
        createRunwayNumberTexture(
            "04",
            0
        );

    const farTexture =
        createRunwayNumberTexture(
            "22",
            Math.PI
        );

    const nearMaterial =
        new THREE.MeshBasicMaterial({
            map: nearTexture,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            side: THREE.DoubleSide
        });

    const farMaterial =
        new THREE.MeshBasicMaterial({
            map: farTexture,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            side: THREE.DoubleSide
        });

    group.add(
        createFlatMarking(
            "RunwayNumber04",
            21,
            40,
            0,
            runwayLength / 2 -
                numberDistance,
            nearMaterial
        )
    );

    group.add(
        createFlatMarking(
            "RunwayNumber22",
            21,
            40,
            0,
            -runwayLength / 2 +
                numberDistance,
            farMaterial
        )
    );
}

export function createRunwayMarkings() {
    const markingGroup =
        new THREE.Group();

    markingGroup.name =
        "JFKRunwayMarkings";

    markingGroup.position.set(
        0,
        0,
        0
    );

    markingGroup.rotation.set(
        0,
        0,
        0
    );

    markingGroup.scale.set(
        1,
        1,
        1
    );

    const {
        length,
        width,
        height
    } = getPrimaryRunwayDimensions();

    markingGroup.position.y =
        height;

    const whiteMaterial =
        createWhiteMaterial();

    createCenterlineMarkings(
        markingGroup,
        length,
        whiteMaterial
    );

    createEdgeLines(
        markingGroup,
        length,
        width,
        whiteMaterial
    );

    createThresholdStripes(
        markingGroup,
        length,
        whiteMaterial
    );

    createAimingPoints(
        markingGroup,
        length,
        whiteMaterial
    );

    createTouchdownZoneMarkings(
        markingGroup,
        length,
        whiteMaterial
    );

    createRunwayNumbers(
        markingGroup,
        length
    );

    return markingGroup;
}
