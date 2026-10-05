import * as THREE from "three";

export const WEATHER_TYPES = {
    CLEAR: "CLEAR",
    CLOUDY: "CLOUDY",
    RAIN: "RAIN"
};

const WEATHER_PROFILES = {
    CLEAR: {
        cloudCover: 0.08,
        fogNear: 3000,
        fogFar: 12000,
        lightMultiplier: 1,
        skyDarkening: 0,
        rainIntensity: 0,
        brakingMultiplier: 1,
        dragMultiplier: 1,
        visibility: 1
    },

    CLOUDY: {
        cloudCover: 0.72,
        fogNear: 1600,
        fogFar: 7600,
        lightMultiplier: 0.68,
        skyDarkening: 0.26,
        rainIntensity: 0,
        brakingMultiplier: 0.95,
        dragMultiplier: 1.015,
        visibility: 0.72
    },

    RAIN: {
        cloudCover: 1,
        fogNear: 750,
        fogFar: 4200,
        lightMultiplier: 0.48,
        skyDarkening: 0.48,
        rainIntensity: 1,
        brakingMultiplier: 0.78,
        dragMultiplier: 1.04,
        visibility: 0.45
    }
};

function randomRange(
    minimum,
    maximum
) {
    return (
        minimum +
        Math.random() *
        (
            maximum -
            minimum
        )
    );
}

function selectNextWeather(
    currentWeather
) {
    const random =
        Math.random();

    if (
        currentWeather ===
        WEATHER_TYPES.CLEAR
    ) {
        return (
            random < 0.76
                ? WEATHER_TYPES.CLOUDY
                : WEATHER_TYPES.CLEAR
        );
    }

    if (
        currentWeather ===
        WEATHER_TYPES.CLOUDY
    ) {
        if (random < 0.38) {
            return WEATHER_TYPES.CLEAR;
        }

        if (random < 0.78) {
            return WEATHER_TYPES.RAIN;
        }

        return WEATHER_TYPES.CLOUDY;
    }

    return (
        random < 0.72
            ? WEATHER_TYPES.CLOUDY
            : WEATHER_TYPES.RAIN
    );
}

export class WeatherSystem {
    constructor({
        scene,
        camera,
        renderer,
        sunlight = null,
        hemisphereLight = null,
        initialWeather = "CLEAR",
        minimumWeatherDuration = 150,
        maximumWeatherDuration = 360,
        warningDuration = 25,
        transitionDuration = 35
    }) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.sunlight = sunlight;
        this.hemisphereLight =
            hemisphereLight;

        this.currentWeather =
            WEATHER_PROFILES[
                initialWeather
            ]
                ? initialWeather
                : WEATHER_TYPES.CLEAR;

        this.targetWeather =
            this.currentWeather;

        this.minimumWeatherDuration =
            minimumWeatherDuration;

        this.maximumWeatherDuration =
            maximumWeatherDuration;

        this.warningDuration =
            warningDuration;

        this.transitionDuration =
            transitionDuration;

        this.weatherTimer =
            randomRange(
                this.minimumWeatherDuration,
                this.maximumWeatherDuration
            );

        this.warningTimer = 0;
        this.transitionTimer = 0;

        this.warningActive = false;
        this.transitionActive = false;

        this.currentValues = {
            ...WEATHER_PROFILES[
                this.currentWeather
            ]
        };

        this.transitionStartValues = {
            ...this.currentValues
        };

        this.onWeatherForecast =
            null;

        this.onWeatherChanged =
            null;

        this.onRainStarted =
            null;

        this.onRainStopped =
            null;

        this.rainEffect =
            this.createRainEffect();

        this.cloudLayer =
            this.createCloudLayer();

        this.applyWeatherValues();
    }

    setCallbacks({
        onWeatherForecast = null,
        onWeatherChanged = null,
        onRainStarted = null,
        onRainStopped = null
    } = {}) {
        this.onWeatherForecast =
            onWeatherForecast;

        this.onWeatherChanged =
            onWeatherChanged;

        this.onRainStarted =
            onRainStarted;

        this.onRainStopped =
            onRainStopped;
    }

    createRainEffect() {
        const particleCount =
            1100;

        const positions =
            new Float32Array(
                particleCount * 3
            );

        for (
            let index = 0;
            index < particleCount;
            index += 1
        ) {
            positions[
                index * 3
            ] =
                randomRange(
                    -55,
                    55
                );

            positions[
                index * 3 + 1
            ] =
                randomRange(
                    -8,
                    52
                );

            positions[
                index * 3 + 2
            ] =
                randomRange(
                    -55,
                    55
                );
        }

        const geometry =
            new THREE.BufferGeometry();

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        const material =
            new THREE.PointsMaterial({
                color: 0xa8c8df,
                size: 0.11,
                transparent: true,
                opacity: 0,
                depthWrite: false
            });

        const rain =
            new THREE.Points(
                geometry,
                material
            );

        rain.name =
            "DynamicRain";

        rain.frustumCulled =
            false;

        this.scene.add(
            rain
        );

        return {
            object: rain,
            geometry,
            material,
            particleCount
        };
    }

    createCloudLayer() {
        const group =
            new THREE.Group();

        group.name =
            "DynamicCloudLayer";

        const material =
            new THREE.MeshStandardMaterial({
                color: 0xb8c0c8,
                roughness: 1,
                metalness: 0,
                transparent: true,
                opacity: 0.08,
                depthWrite: false
            });

        for (
            let index = 0;
            index < 34;
            index += 1
        ) {
            const cloud =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        randomRange(
                            70,
                            150
                        ),
                        8,
                        6
                    ),
                    material
                );

            cloud.scale.set(
                randomRange(
                    1.5,
                    3.2
                ),
                randomRange(
                    0.18,
                    0.38
                ),
                randomRange(
                    0.8,
                    2
                )
            );

            cloud.position.set(
                randomRange(
                    -3500,
                    3500
                ),
                randomRange(
                    440,
                    850
                ),
                randomRange(
                    -3500,
                    3500
                )
            );

            group.add(
                cloud
            );
        }

        this.scene.add(
            group
        );

        return {
            object: group,
            material
        };
    }

    update(
        deltaTime,
        {
            aircraftPosition = null,
            aircraftSpeed = 0,
            timeLightMultiplier = 1
        } = {}
    ) {
        this.updateWeatherSelection(
            deltaTime
        );

        this.updateTransition(
            deltaTime
        );

        this.updateRain(
            deltaTime,
            aircraftPosition,
            aircraftSpeed
        );

        this.updateClouds(
            deltaTime,
            aircraftPosition
        );

        this.applyWeatherValues(
            timeLightMultiplier
        );
    }

    updateWeatherSelection(
        deltaTime
    ) {
        if (
            this.transitionActive
        ) {
            return;
        }

        if (
            this.warningActive
        ) {
            this.warningTimer -=
                deltaTime;

            if (
                this.warningTimer <=
                0
            ) {
                this.warningActive =
                    false;

                this.startTransition();
            }

            return;
        }

        this.weatherTimer -=
            deltaTime;

        if (
            this.weatherTimer >
            0
        ) {
            return;
        }

        const nextWeather =
            selectNextWeather(
                this.currentWeather
            );

        if (
            nextWeather ===
            this.currentWeather
        ) {
            this.weatherTimer =
                randomRange(
                    this.minimumWeatherDuration,
                    this.maximumWeatherDuration
                );

            return;
        }

        this.targetWeather =
            nextWeather;

        this.warningActive =
            true;

        this.warningTimer =
            this.warningDuration;

        this.onWeatherForecast?.({
            currentWeather:
                this.currentWeather,
            targetWeather:
                this.targetWeather,
            warningSeconds:
                this.warningDuration
        });
    }

    startTransition() {
        this.transitionActive =
            true;

        this.transitionTimer = 0;

        this.transitionStartValues = {
            ...this.currentValues
        };
    }

    updateTransition(
        deltaTime
    ) {
        if (
            !this.transitionActive
        ) {
            return;
        }

        this.transitionTimer +=
            deltaTime;

        const rawProgress =
            THREE.MathUtils.clamp(
                this.transitionTimer /
                this.transitionDuration,
                0,
                1
            );

        const progress =
            THREE.MathUtils.smoothstep(
                rawProgress,
                0,
                1
            );

        const targetProfile =
            WEATHER_PROFILES[
                this.targetWeather
            ];

        for (
            const key of
            Object.keys(
                this.currentValues
            )
        ) {
            this.currentValues[key] =
                THREE.MathUtils.lerp(
                    this.transitionStartValues[
                        key
                    ],
                    targetProfile[key],
                    progress
                );
        }

        if (
            rawProgress < 1
        ) {
            return;
        }

        const previousWeather =
            this.currentWeather;

        this.currentWeather =
            this.targetWeather;

        this.currentValues = {
            ...targetProfile
        };

        this.transitionActive =
            false;

        this.weatherTimer =
            randomRange(
                this.minimumWeatherDuration,
                this.maximumWeatherDuration
            );

        if (
            previousWeather !==
                WEATHER_TYPES.RAIN &&
            this.currentWeather ===
                WEATHER_TYPES.RAIN
        ) {
            this.onRainStarted?.();
        }

        if (
            previousWeather ===
                WEATHER_TYPES.RAIN &&
            this.currentWeather !==
                WEATHER_TYPES.RAIN
        ) {
            this.onRainStopped?.();
        }

        this.onWeatherChanged?.({
            previousWeather,
            currentWeather:
                this.currentWeather
        });
    }

    updateRain(
        deltaTime,
        aircraftPosition,
        aircraftSpeed
    ) {
        const rain =
            this.rainEffect;

        rain.material.opacity =
            this.currentValues
                .rainIntensity *
            0.72;

        rain.object.visible =
            this.currentValues
                .rainIntensity >
            0.015;

        if (
            aircraftPosition
        ) {
            rain.object.position.copy(
                aircraftPosition
            );
        } else {
            rain.object.position.copy(
                this.camera.position
            );
        }

        const positions =
            rain.geometry.attributes
                .position.array;

        const fallSpeed =
            34 +
            aircraftSpeed *
                0.22;

        const backwardDrift =
            Math.min(
                aircraftSpeed *
                    0.04,
                9
            );

        for (
            let index = 0;
            index <
            rain.particleCount;
            index += 1
        ) {
            positions[
                index * 3 + 1
            ] -=
                fallSpeed *
                deltaTime;

            positions[
                index * 3 + 2
            ] +=
                backwardDrift *
                deltaTime;

            if (
                positions[
                    index * 3 + 1
                ] <
                -8
            ) {
                positions[
                    index * 3 + 1
                ] =
                    randomRange(
                        36,
                        55
                    );

                positions[
                    index * 3
                ] =
                    randomRange(
                        -55,
                        55
                    );

                positions[
                    index * 3 + 2
                ] =
                    randomRange(
                        -55,
                        55
                    );
            }
        }

        rain.geometry.attributes
            .position.needsUpdate =
            true;
    }

    updateClouds(
        deltaTime,
        aircraftPosition
    ) {
        this.cloudLayer.material.opacity =
            THREE.MathUtils.lerp(
                0.04,
                0.72,
                this.currentValues
                    .cloudCover
            );

        this.cloudLayer.object.position.x +=
            deltaTime * 2.2;

        if (
            this.cloudLayer.object
                .position.x >
            900
        ) {
            this.cloudLayer.object
                .position.x =
                -900;
        }

        if (
            aircraftPosition
        ) {
            this.cloudLayer.object
                .position.z =
                aircraftPosition.z *
                0.08;
        }
    }

    applyWeatherValues(
        timeLightMultiplier = 1
    ) {
        if (
            this.scene.fog
        ) {
            this.scene.fog.near =
                this.currentValues
                    .fogNear;

            this.scene.fog.far =
                this.currentValues
                    .fogFar;
        }

        if (
            this.sunlight
        ) {
            const baseIntensity =
                this.sunlight.userData
                    .timeIntensity ??
                this.sunlight.intensity;

            this.sunlight.intensity =
                baseIntensity *
                this.currentValues
                    .lightMultiplier *
                timeLightMultiplier;
        }

        if (
            this.hemisphereLight
        ) {
            const baseIntensity =
                this.hemisphereLight
                    .userData
                    .timeIntensity ??
                this.hemisphereLight
                    .intensity;

            this.hemisphereLight
                .intensity =
                baseIntensity *
                THREE.MathUtils.lerp(
                    1,
                    0.58,
                    this.currentValues
                        .skyDarkening
                );
        }
    }

    forceWeather(
        weatherType,
        immediate = false
    ) {
        if (
            !WEATHER_PROFILES[
                weatherType
            ]
        ) {
            return;
        }

        this.targetWeather =
            weatherType;

        this.warningActive =
            false;

        if (immediate) {
            const previousWeather =
                this.currentWeather;

            this.currentWeather =
                weatherType;

            this.currentValues = {
                ...WEATHER_PROFILES[
                    weatherType
                ]
            };

            this.transitionActive =
                false;

            this.onWeatherChanged?.({
                previousWeather,
                currentWeather:
                    weatherType
            });

            return;
        }

        this.startTransition();
    }

    getBrakingMultiplier() {
        return (
            this.currentValues
                .brakingMultiplier
        );
    }

    getDragMultiplier() {
        return (
            this.currentValues
                .dragMultiplier
        );
    }

    getVisibility() {
        return (
            this.currentValues
                .visibility
        );
    }

    getState() {
        return {
            currentWeather:
                this.currentWeather,
            targetWeather:
                this.targetWeather,
            warningActive:
                this.warningActive,
            transitionActive:
                this.transitionActive,
            transitionProgress:
                this.transitionActive
                    ? THREE.MathUtils.clamp(
                        this.transitionTimer /
                            this.transitionDuration,
                        0,
                        1
                    )
                    : 1,
            rainIntensity:
                this.currentValues
                    .rainIntensity,
            cloudCover:
                this.currentValues
                    .cloudCover,
            visibility:
                this.currentValues
                    .visibility,
            brakingMultiplier:
                this.currentValues
                    .brakingMultiplier,
            dragMultiplier:
                this.currentValues
                    .dragMultiplier
        };
    }

    dispose() {
        this.scene.remove(
            this.rainEffect.object
        );

        this.scene.remove(
            this.cloudLayer.object
        );

        this.rainEffect.geometry.dispose();
        this.rainEffect.material.dispose();

        for (
            const cloud of
            this.cloudLayer.object
                .children
        ) {
            cloud.geometry.dispose();
        }

        this.cloudLayer.material.dispose();
    }
}
