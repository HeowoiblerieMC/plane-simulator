import * as THREE from "three";
import {
    getPrimaryRunwayDimensions
} from "./createrunways.js";

const MARKING_Y = 0.072;

function createMarkingMaterial() {
    return new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4
    });
}

function createFlatMarking(
    width,
    length,
    x,
    z,
    material
) {
    const geometry = new THREE.PlaneGeometry(
        width,
        length
    );

    const marking = new THREE.Mesh(
        geometry,
        material
    );

    marking.rotation.x = -Math.PI / 2;
    marking.position.set(
        x,
        MARKING_Y,
        z
    );

    marking.renderOrder = 2;

    return marking;
}

function createCenterlineMarkings(
    group,
    runwayLength,
    material
) {
    const segmentLength = 30;
    const segmentGap = 20;
    const segmentWidth = 0.9;
    const usableLength = runwayLength - 280;

    const startZ = usableLength / 2;

    for (
        let z = startZ;
        z >= -startZ;
        z -= segmentLength + segmentGap
    ) {
        const marking = createFlatMarking(
            segmentWidth,
            segmentLength,
            0,
            z,
            material
        );

        marking.name = "RunwayCenterline";

        group.add(marking);
    }
}

function createRunwayEdgeLines(
    group,
    runwayLength,
    runwayWidth,
    material
) {
    const edgeOffset = runwayWidth / 2 - 1.1;
    const edgeLineWidth = 0.9;

    const leftLine = createFlatMarking(
        edgeLineWidth,
        runwayLength - 20,
        -edgeOffset,
        0,
        material
    );

    leftLine.name = "LeftRunwayEdgeLine";

    group.add(leftLine);

    const rightLine = createFlatMarking(
        edgeLineWidth,
        runwayLength - 20,
        edgeOffset,
        0,
        material
    );

    rightLine.name = "RightRunwayEdgeLine";

    group.add(rightLine);
}

function createThresholdMarkings(
    group,
    runwayLength,
    material
) {
    const thresholdDistance = 70;
    const stripeWidth = 2.3;
    const stripeLength = 45;
    const stripeGap = 1.5;
    const stripeCountPerSide = 8;

    const northThresholdZ =
        -runwayLength / 2 + thresholdDistance;

    const southThresholdZ =
        runwayLength / 2 - thresholdDistance;

    for (
        let index = 0;
        index < stripeCountPerSide;
        index += 1
    ) {
        const offset =
            3.5 +
            index * (stripeWidth + stripeGap);

        const northLeftStripe = createFlatMarking(
            stripeWidth,
            stripeLength,
            -offset,
            northThresholdZ,
            material
        );

        northLeftStripe.name =
            "NorthThresholdStripe";

        group.add(northLeftStripe);

        const northRightStripe = createFlatMarking(
            stripeWidth,
            stripeLength,
            offset,
            northThresholdZ,
            material
        );

        northRightStripe.name =
            "NorthThresholdStripe";

        group.add(northRightStripe);

        const southLeftStripe = createFlatMarking(
            stripeWidth,
            stripeLength,
            -offset,
            southThresholdZ,
            material
        );

        southLeftStripe.name =
            "SouthThresholdStripe";

        group.add(southLeftStripe);

        const southRightStripe = createFlatMarking(
            stripeWidth,
            stripeLength,
            offset,
            southThresholdZ,
            material
        );

        southRightStripe.name =
            "SouthThresholdStripe";

        group.add(southRightStripe);
    }
}

function createAimingPointMarkings(
    group,
    runwayLength,
    material
) {
    const aimingPointDistance = 450;
    const markingWidth = 8;
    const markingLength = 55;
    const lateralOffset = 12;

    const northZ =
        -runwayLength / 2 +
        aimingPointDistance;

    const southZ =
        runwayLength / 2 -
        aimingPointDistance;

    const positions = [
        [-lateralOffset, northZ],
        [lateralOffset, northZ],
        [-lateralOffset, southZ],
        [lateralOffset, southZ]
    ];

    for (const [x, z] of positions) {
        const marking = createFlatMarking(
            markingWidth,
            markingLength,
            x,
            z,
            material
        );

        marking.name = "AimingPointMarking";

        group.add(marking);
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
        const northZ =
            -runwayLength / 2 +
            distance;

        const southZ =
            runwayLength / 2 -
            distance;

        for (const lateralOffset of lateralOffsets) {
            const positions = [
                [-lateralOffset, northZ],
                [lateralOffset, northZ],
                [-lateralOffset, southZ],
                [lateralOffset, southZ]
            ];

            for (const [x, z] of positions) {
                const marking = createFlatMarking(
                    2.2,
                    22,
                    x,
                    z,
                    material
                );

                marking.name =
                    "TouchdownZoneMarking";

                group.add(marking);
            }
        }
    }
}

function createRunwayNumberTexture(
    number,
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
        "bold 260px Arial, sans-serif";

    context.fillText(
        number,
        0,
        15
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
    const numberDistance = 155;
    const numberWidth = 22;
    const numberLength = 42;

    const northTexture =
        createRunwayNumberTexture(
            "04",
            0
        );

    const southTexture =
        createRunwayNumberTexture(
            "22",
            Math.PI
        );

    const northMaterial =
        new THREE.MeshBasicMaterial({
            map: northTexture,
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -5,
            polygonOffsetUnits: -5
        });

    const southMaterial =
        new THREE.MeshBasicMaterial({
            map: southTexture,
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -5,
            polygonOffsetUnits: -5
        });

    const northNumber = createFlatMarking(
        numberWidth,
        numberLength,
        0,
        -runwayLength / 2 + numberDistance,
        northMaterial
    );

    northNumber.name = "RunwayNumber04";

    group.add(northNumber);

    const southNumber = createFlatMarking(
        numberWidth,
        numberLength,
        0,
        runwayLength / 2 - numberDistance,
        southMaterial
    );

    southNumber.name = "RunwayNumber22";

    group.add(southNumber);
}

export function createRunwayMarkings() {
    const markingGroup = new THREE.Group();

    markingGroup.name = "JFKRunwayMarkings";

    const {
        length,
        width,
        height
    } = getPrimaryRunwayDimensions();

    const material =
        createMarkingMaterial();

    markingGroup.position.y = height;

    createCenterlineMarkings(
        markingGroup,
        length,
        material
    );

    createRunwayEdgeLines(
        markingGroup,
        length,
        width,
        material
    );

    createThresholdMarkings(
        markingGroup,
        length,
        material
    );

    createAimingPointMarkings(
        markingGroup,
        length,
        material
    );

    createTouchdownZoneMarkings(
        markingGroup,
        length,
        material
    );

    createRunwayNumbers(
        markingGroup,
        length
    );

    return markingGroup;
}
