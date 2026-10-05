import * as THREE from "three";

import {
    FireEffect
} from "./fireeffects.js";

import {
    SmokeEffect
} from "./smokeeffect.js";

function createLampMesh(
    color,
    radius
) {
    return new THREE.Mesh(
        new THREE.SphereGeometry(
            radius,
            12,
            8
        ),
        new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 1,
            depthWrite: false
        })
    );
}

function createPointLight(
    color,
    intensity,
    distance
) {
    return new THREE.PointLight(
        color,
        intensity,
        distance,
        2
    );
}

export class AircraftVisualSystem {
    constructor({
        aircraft,
        aircraftDefinition
    }) {
        this.aircraft =
            aircraft;

        this.aircraftDefinition =
            aircraftDefinition;

        this.elapsedTime = 0;

        this.boundingBox =
            new THREE.Box3()
                .setFromObject(
                    this.aircraft
                );

        this.size =
            new THREE.Vector3();

        this.center =
            new THREE.Vector3();

        this.boundingBox.getSize(
            this.size
        );

        this.boundingBox.getCenter(
            this.center
        );

        this.width =
            Math.max(
                this.size.x,
                4
            );

        this.height =
            Math.max(
                this.size.y,
                2
            );

        this.length =
            Math.max(
                this.size.z,
                5
            );

        this.scaleReference =
            Math.max(
                this.width / 11,
                this.length / 9,
                0.75
            );

        this.root =
            new THREE.Group();

        this.root.name =
            "AircraftVisualEffects";

        this.aircraft.add(
            this.root
        );

        this.navigationLights = {};
        this.strobeLights = {};
        this.beaconLights = {};
        this.interiorLights = [];
        this.interiorMaterials = [];
        this.landingLights = [];
        this.fillLights = [];

        this.fireEffect = null;
        this.smokeEffect = null;

        this.createNavigationLights();
        this.createStrobes();
        this.createBeacons();
        this.createLandingLights();
        this.createInteriorLights();
        this.createFillLights();
        this.createEmergencyEffects();
    }

    createNavigationLights() {
        const lampRadius =
            0.1 *
            this.scaleReference;

        const wingY =
            this.center.y +
            this.height *
                0.05;

        const wingZ =
            this.center.z;

        const leftLamp =
            createLampMesh(
                0xff2020,
                lampRadius
            );

        leftLamp.position.set(
            this.center.x -
                this.width *
                    0.51,
            wingY,
            wingZ
        );

        const rightLamp =
            createLampMesh(
                0x20ff55,
                lampRadius
            );

        rightLamp.position.set(
            this.center.x +
                this.width *
                    0.51,
            wingY,
            wingZ
        );

        const tailLamp =
            createLampMesh(
                0xffffff,
                lampRadius *
                    0.86
            );

        tailLamp.position.set(
            this.center.x,
            this.center.y +
                this.height *
                    0.17,
            this.boundingBox.max.z -
                this.length *
                    0.02
        );

        const leftGlow =
            createPointLight(
                0xff2020,
                0,
                7 *
                    this.scaleReference
            );

        leftGlow.position.copy(
            leftLamp.position
        );

        const rightGlow =
            createPointLight(
                0x20ff55,
                0,
                7 *
                    this.scaleReference
            );

        rightGlow.position.copy(
            rightLamp.position
        );

        const tailGlow =
            createPointLight(
                0xffffff,
                0,
                6 *
                    this.scaleReference
            );

        tailGlow.position.copy(
            tailLamp.position
        );

        this.root.add(
            leftLamp,
            rightLamp,
            tailLamp,
            leftGlow,
            rightGlow,
            tailGlow
        );

        this.navigationLights = {
            leftLamp,
            rightLamp,
            tailLamp,
            leftGlow,
            rightGlow,
            tailGlow
        };
    }

    createStrobes() {
        const lampRadius =
            0.13 *
            this.scaleReference;

        const y =
            this.center.y +
            this.height *
                0.08;

        const z =
            this.center.z +
            this.length *
                0.03;

        const leftLamp =
            createLampMesh(
                0xffffff,
                lampRadius
            );

        leftLamp.position.set(
            this.center.x -
                this.width *
                    0.49,
            y,
            z
        );

        const rightLamp =
            createLampMesh(
                0xffffff,
                lampRadius
            );

        rightLamp.position.set(
            this.center.x +
                this.width *
                    0.49,
            y,
            z
        );

        const leftGlow =
            createPointLight(
                0xffffff,
                0,
                18 *
                    this.scaleReference
            );

        leftGlow.position.copy(
            leftLamp.position
        );

        const rightGlow =
            createPointLight(
                0xffffff,
                0,
                18 *
                    this.scaleReference
            );

        rightGlow.position.copy(
            rightLamp.position
        );

        this.root.add(
            leftLamp,
            rightLamp,
            leftGlow,
            rightGlow
        );

        this.strobeLights = {
            leftLamp,
            rightLamp,
            leftGlow,
            rightGlow
        };
    }

    createBeacons() {
        const radius =
            0.11 *
            this.scaleReference;

        const topLamp =
            createLampMesh(
                0xff2525,
                radius
            );

        topLamp.position.set(
            this.center.x,
            this.boundingBox.max.y +
                radius,
            this.center.z
        );

        const bottomLamp =
            createLampMesh(
                0xff2525,
                radius
            );

        bottomLamp.position.set(
            this.center.x,
            this.boundingBox.min.y -
                radius,
            this.center.z
        );

        const topGlow =
            createPointLight(
                0xff2020,
                0,
                11 *
                    this.scaleReference
            );

        topGlow.position.copy(
            topLamp.position
        );

        const bottomGlow =
            createPointLight(
                0xff2020,
                0,
                9 *
                    this.scaleReference
            );

        bottomGlow.position.copy(
            bottomLamp.position
        );

        this.root.add(
            topLamp,
            bottomLamp,
            topGlow,
            bottomGlow
        );

        this.beaconLights = {
            topLamp,
            bottomLamp,
            topGlow,
            bottomGlow
        };
    }

    createLandingLights() {
        const leftLight =
            new THREE.SpotLight(
                0xfff4cf,
                0,
                160 *
                    this.scaleReference,
                THREE.MathUtils.degToRad(
                    24
                ),
                0.48,
                1.4
            );

        leftLight.position.set(
            this.center.x -
                this.width *
                    0.12,
            this.center.y,
            this.boundingBox.min.z +
                this.length *
                    0.1
        );

        const leftTarget =
            new THREE.Object3D();

        leftTarget.position.set(
            this.center.x -
                this.width *
                    0.12,
            this.boundingBox.min.y -
                2 *
                    this.scaleReference,
            this.boundingBox.min.z -
                135 *
                    this.scaleReference
        );

        leftLight.target =
            leftTarget;

        const rightLight =
            new THREE.SpotLight(
                0xfff4cf,
                0,
                160 *
                    this.scaleReference,
                THREE.MathUtils.degToRad(
                    24
                ),
                0.48,
                1.4
            );

        rightLight.position.set(
            this.center.x +
                this.width *
                    0.12,
            this.center.y,
            this.boundingBox.min.z +
                this.length *
                    0.1
        );

        const rightTarget =
            new THREE.Object3D();

        rightTarget.position.set(
            this.center.x +
                this.width *
                    0.12,
            this.boundingBox.min.y -
                2 *
                    this.scaleReference,
            this.boundingBox.min.z -
                135 *
                    this.scaleReference
        );

        rightLight.target =
            rightTarget;

        this.root.add(
            leftLight,
            leftTarget,
            rightLight,
            rightTarget
        );

        this.landingLights = [
            leftLight,
            rightLight
        ];
    }

    createInteriorLights() {
        const cockpitLight =
            createPointLight(
                0xaadfff,
                0,
                7 *
                    this.scaleReference
            );

        cockpitLight.position.set(
            this.center.x,
            this.center.y +
                this.height *
                    0.15,
            this.boundingBox.min.z +
                this.length *
                    0.14
        );

        this.root.add(
            cockpitLight
        );

        this.interiorLights.push(
            cockpitLight
        );

        const isAirliner =
            this.aircraftDefinition
                ?.category
                ?.includes(
                    "AIRLINER"
                );

        if (isAirliner) {
            const cabinPositions = [
                -0.22,
                0,
                0.22
            ];

            for (
                const ratio of
                cabinPositions
            ) {
                const cabinLight =
                    createPointLight(
                        0xffd6a3,
                        0,
                        8 *
                            this.scaleReference
                    );

                cabinLight.position.set(
                    this.center.x,
                    this.center.y +
                        this.height *
                            0.08,
                    this.center.z +
                        this.length *
                            ratio
                );

                this.root.add(
                    cabinLight
                );

                this.interiorLights.push(
                    cabinLight
                );
            }
        }

        this.aircraft.traverse(
            (object) => {
                if (
                    !object.material
                ) {
                    return;
                }

                const materials =
                    Array.isArray(
                        object.material
                    )
                        ? object.material
                        : [
                            object.material
                        ];

                for (
                    const material of
                    materials
                ) {
                    const name =
                        object.name
                            .toLowerCase();

                    if (
                        name.includes(
                            "window"
                        ) ||
                        name.includes(
                            "cockpit"
                        )
                    ) {
                        if (
                            "emissive" in
                            material
                        ) {
                            material.userData
                                .originalEmissive =
                                material.emissive
                                    .clone();

                            material.userData
                                .originalEmissiveIntensity =
                                material.emissiveIntensity;

                            this.interiorMaterials.push(
                                material
                            );
                        }
                    }
                }
            }
        );
    }

    createFillLights() {
        const fillLight =
            new THREE.PointLight(
                0x94bfff,
                0,
                22 *
                    this.scaleReference,
                2
            );

        fillLight.position.set(
            this.center.x,
            this.boundingBox.max.y +
                this.height *
                    0.42,
            this.center.z +
                this.length *
                    0.05
        );

        this.root.add(
            fillLight
        );

        this.fillLights.push(
            fillLight
        );
    }

    createEmergencyEffects() {
        const firePosition =
            this.aircraft.userData
                ?.firePoints
                ?.leftEngine
                ?.clone?.() ??
            new THREE.Vector3(
                this.center.x -
                    this.width *
                        0.18,
                this.center.y,
                this.center.z
            );

        this.fireEffect =
            new FireEffect({
                parent:
                    this.aircraft,
                localPosition:
                    firePosition,
                scale:
                    this.scaleReference
            });

        this.smokeEffect =
            new SmokeEffect({
                parent:
                    this.aircraft,
                localPosition:
                    firePosition,
                scale:
                    this.scaleReference,
                particleCount:
                    85
            });
    }

    setEmergencyPosition(
        affectedEngine
    ) {
        const firePoints =
            this.aircraft.userData
                ?.firePoints;

        let position = null;

        if (
            affectedEngine ===
                "LEFT"
        ) {
            position =
                firePoints
                    ?.leftEngine;
        }

        if (
            affectedEngine ===
                "RIGHT"
        ) {
            position =
                firePoints
                    ?.rightEngine;
        }

        if (
            affectedEngine ===
                "MAIN"
        ) {
            position =
                firePoints
                    ?.mainEngine;
        }

        if (!position) {
            if (
                affectedEngine ===
                "RIGHT"
            ) {
                position =
                    new THREE.Vector3(
                        this.center.x +
                            this.width *
                                0.18,
                        this.center.y,
                        this.center.z
                    );
            } else {
                position =
                    new THREE.Vector3(
                        this.center.x -
                            this.width *
                                0.18,
                        this.center.y,
                        this.center.z
                    );
            }
        }

        this.fireEffect.setPosition(
            position
        );

        this.smokeEffect.setPosition(
            position
        );
    }

    update(
        deltaTime,
        {
            nightFactor = 0,
            throttle = 0,
            airborne = false,
            aircraftSpeed = 0,
            rainIntensity = 0,
            engineFireActive = false,
            smokeActive = false,
            smokeType = "BLACK",
            affectedEngine = null
        } = {}
    ) {
        this.elapsedTime +=
            deltaTime;

        const darkness =
            THREE.MathUtils.smoothstep(
                nightFactor,
                0.05,
                1
            );

        this.updateNavigationLights(
            darkness
        );

        this.updateStrobes(
            darkness
        );

        this.updateBeacons(
            darkness
        );

        this.updateLandingLights(
            darkness,
            throttle,
            airborne
        );

        this.updateInteriorLights(
            darkness
        );

        this.updateFillLights(
            darkness
        );

        if (affectedEngine) {
            this.setEmergencyPosition(
                affectedEngine
            );
        }

        this.fireEffect.setActive(
            engineFireActive,
            engineFireActive
                ? 1
                : 0
        );

        this.smokeEffect.setActive(
            smokeActive ||
                engineFireActive,
            engineFireActive
                ? 1
                : 0.7
        );

        this.fireEffect.update(
            deltaTime,
            {
                aircraftSpeed,
                rainIntensity,
                nightFactor:
                    darkness
            }
        );

        this.smokeEffect.update(
            deltaTime,
            {
                aircraftSpeed,
                rainIntensity,
                smokeType:
                    smokeType ||
                    "BLACK"
            }
        );
    }

    updateNavigationLights(
        darkness
    ) {
        const lampOpacity =
            THREE.MathUtils.lerp(
                0.42,
                1,
                darkness
            );

        const glowIntensity =
            THREE.MathUtils.lerp(
                0.15,
                2.4,
                darkness
            );

        this.navigationLights
            .leftLamp
            .material
            .opacity =
            lampOpacity;

        this.navigationLights
            .rightLamp
            .material
            .opacity =
            lampOpacity;

        this.navigationLights
            .tailLamp
            .material
            .opacity =
            lampOpacity;

        this.navigationLights
            .leftGlow
            .intensity =
            glowIntensity;

        this.navigationLights
            .rightGlow
            .intensity =
            glowIntensity;

        this.navigationLights
            .tailGlow
            .intensity =
            glowIntensity *
            0.75;
    }

    updateStrobes(
        darkness
    ) {
        const cycle =
            this.elapsedTime %
            1.4;

        const firstFlash =
            cycle <
            0.07;

        const secondFlash =
            cycle >
                0.17 &&
            cycle <
                0.24;

        const active =
            firstFlash ||
            secondFlash;

        const intensity =
            active
                ? THREE.MathUtils.lerp(
                    2,
                    9,
                    darkness
                )
                : 0;

        const opacity =
            active
                ? 1
                : 0.08;

        this.strobeLights
            .leftLamp
            .material
            .opacity =
            opacity;

        this.strobeLights
            .rightLamp
            .material
            .opacity =
            opacity;

        this.strobeLights
            .leftGlow
            .intensity =
            intensity;

        this.strobeLights
            .rightGlow
            .intensity =
            intensity;
    }

    updateBeacons(
        darkness
    ) {
        const cycle =
            this.elapsedTime %
            0.9;

        const active =
            cycle <
            0.12;

        const intensity =
            active
                ? THREE.MathUtils.lerp(
                    1.2,
                    5.5,
                    darkness
                )
                : 0;

        const opacity =
            active
                ? 1
                : 0.08;

        this.beaconLights
            .topLamp
            .material
            .opacity =
            opacity;

        this.beaconLights
            .bottomLamp
            .material
            .opacity =
            opacity;

        this.beaconLights
            .topGlow
            .intensity =
            intensity;

        this.beaconLights
            .bottomGlow
            .intensity =
            intensity *
            0.8;
    }

    updateLandingLights(
        darkness,
        throttle,
        airborne
    ) {
        const activeFactor =
            THREE.MathUtils.clamp(
                darkness *
                    (
                        0.55 +
                        throttle *
                            0.45
                    ),
                0,
                1
            );

        const intensity =
            THREE.MathUtils.lerp(
                0,
                airborne
                    ? 7
                    : 5,
                activeFactor
            );

        for (
            const light of
            this.landingLights
        ) {
            light.intensity =
                intensity;
        }
    }

    updateInteriorLights(
        darkness
    ) {
        const cockpitIntensity =
            THREE.MathUtils.lerp(
                0,
                1.25,
                darkness
            );

        for (
            const light of
            this.interiorLights
        ) {
            light.intensity =
                cockpitIntensity;
        }

        for (
            const material of
            this.interiorMaterials
        ) {
            if (
                !material.emissive
            ) {
                continue;
            }

            material.emissive.set(
                0xffd6a3
            );

            material.emissiveIntensity =
                THREE.MathUtils.lerp(
                    0,
                    1.35,
                    darkness
                );
        }
    }

    updateFillLights(
        darkness
    ) {
        for (
            const light of
            this.fillLights
        ) {
            light.intensity =
                THREE.MathUtils.lerp(
                    0,
                    1.35,
                    darkness
                );
        }
    }

    dispose() {
        this.fireEffect?.dispose();
        this.smokeEffect?.dispose();

        this.aircraft.remove(
            this.root
        );

        this.root.traverse(
            (object) => {
                object.geometry?.dispose?.();

                if (
                    Array.isArray(
                        object.material
                    )
                ) {
                    for (
                        const material of
                        object.material
                    ) {
                        material.dispose?.();
                    }
                } else {
                    object.material
                        ?.dispose?.();
                }
            }
        );
    }
}
