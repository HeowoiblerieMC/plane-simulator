import * as THREE from "three";

const MINUTES_PER_DAY = 24 * 60;

const TIME_PRESETS = {
    MORNING: 7 * 60,
    DAY: 12 * 60,
    NIGHT: 20 * 60
};

const SKY_KEYFRAMES = [
    {
        minute: 0,
        sky: 0x071426,
        fog: 0x0a1729,
        hemisphereSky: 0x122b4a,
        hemisphereGround: 0x101419,
        sun: 0x263853,
        sunIntensity: 0,
        hemisphereIntensity: 0.28
    },
    {
        minute: 5 * 60,
        sky: 0x162d4f,
        fog: 0x1c3048,
        hemisphereSky: 0x315673,
        hemisphereGround: 0x25231f,
        sun: 0xff9d66,
        sunIntensity: 0.32,
        hemisphereIntensity: 0.62
    },
    {
        minute: 7 * 60,
        sky: 0x79acd4,
        fog: 0x87aeca,
        hemisphereSky: 0xbadff2,
        hemisphereGround: 0x57634b,
        sun: 0xffd39b,
        sunIntensity: 1.35,
        hemisphereIntensity: 1.25
    },
    {
        minute: 12 * 60,
        sky: 0x87b9e8,
        fog: 0x87b9e8,
        hemisphereSky: 0xd9efff,
        hemisphereGround: 0x4d613f,
        sun: 0xffffff,
        sunIntensity: 2.4,
        hemisphereIntensity: 2
    },
    {
        minute: 17 * 60,
        sky: 0x77a7d2,
        fog: 0x819eb7,
        hemisphereSky: 0xbcd7ea,
        hemisphereGround: 0x5a5747,
        sun: 0xffd0a2,
        sunIntensity: 1.55,
        hemisphereIntensity: 1.45
    },
    {
        minute: 19 * 60,
        sky: 0x654f75,
        fog: 0x685d70,
        hemisphereSky: 0x887aa0,
        hemisphereGround: 0x38323a,
        sun: 0xff7548,
        sunIntensity: 0.7,
        hemisphereIntensity: 0.8
    },
    {
        minute: 20 * 60,
        sky: 0x172b48,
        fog: 0x1e3047,
        hemisphereSky: 0x314c69,
        hemisphereGround: 0x171b21,
        sun: 0x7688a4,
        sunIntensity: 0.1,
        hemisphereIntensity: 0.45
    },
    {
        minute: 24 * 60,
        sky: 0x071426,
        fog: 0x0a1729,
        hemisphereSky: 0x122b4a,
        hemisphereGround: 0x101419,
        sun: 0x263853,
        sunIntensity: 0,
        hemisphereIntensity: 0.28
    }
];

function normalizeMinute(minute) {
    return THREE.MathUtils.euclideanModulo(
        minute,
        MINUTES_PER_DAY
    );
}

function colorFromHex(hex) {
    return new THREE.Color(hex);
}

function findKeyframePair(minute) {
    const normalizedMinute =
        normalizeMinute(minute);

    for (
        let index = 0;
        index < SKY_KEYFRAMES.length - 1;
        index += 1
    ) {
        const current =
            SKY_KEYFRAMES[index];

        const next =
            SKY_KEYFRAMES[index + 1];

        if (
            normalizedMinute >= current.minute &&
            normalizedMinute <= next.minute
        ) {
            const range =
                next.minute -
                current.minute;

            const progress =
                range > 0
                    ? (
                        normalizedMinute -
                        current.minute
                    ) / range
                    : 0;

            return {
                current,
                next,
                progress:
                    THREE.MathUtils.smoothstep(
                        progress,
                        0,
                        1
                    )
            };
        }
    }

    return {
        current:
            SKY_KEYFRAMES[
                SKY_KEYFRAMES.length - 2
            ],
        next:
            SKY_KEYFRAMES[
                SKY_KEYFRAMES.length - 1
            ],
        progress: 1
    };
}

export class TimeOfDaySystem {
    constructor({
        scene,
        sunlight = null,
        hemisphereLight = null,
        city = null,
        airport = null,
        startPreset = "DAY",
        startHour = null,
        timeScale = 10
    }) {
        this.scene = scene;
        this.sunlight = sunlight;
        this.hemisphereLight =
            hemisphereLight;

        this.city = city;
        this.airport = airport;

        this.timeScale =
            Math.max(
                0,
                timeScale
            );

        this.currentMinute =
            Number.isFinite(startHour)
                ? normalizeMinute(
                    startHour * 60
                )
                : (
                    TIME_PRESETS[
                        startPreset
                    ] ??
                    TIME_PRESETS.DAY
                );

        this.dayCount = 0;

        this.skyColor =
            new THREE.Color();

        this.fogColor =
            new THREE.Color();

        this.sunColor =
            new THREE.Color();

        this.hemisphereSkyColor =
            new THREE.Color();

        this.hemisphereGroundColor =
            new THREE.Color();

        this.lastPeriod = null;
        this.lastNotificationMinute =
            null;

        this.onPeriodChanged = null;
        this.onSunsetApproaching =
            null;
        this.onSunriseApproaching =
            null;

        this.applyEnvironment();
    }

    setCallbacks({
        onPeriodChanged = null,
        onSunsetApproaching = null,
        onSunriseApproaching = null
    } = {}) {
        this.onPeriodChanged =
            onPeriodChanged;

        this.onSunsetApproaching =
            onSunsetApproaching;

        this.onSunriseApproaching =
            onSunriseApproaching;
    }

    setTimeScale(timeScale) {
        this.timeScale =
            Math.max(
                0,
                timeScale
            );
    }

    setTime(hour, minute = 0) {
        this.currentMinute =
            normalizeMinute(
                hour * 60 +
                minute
            );

        this.applyEnvironment();
    }

    update(deltaTime) {
        const previousMinute =
            this.currentMinute;

        this.currentMinute =
            normalizeMinute(
                this.currentMinute +
                deltaTime *
                this.timeScale /
                60
            );

        if (
            this.currentMinute <
            previousMinute
        ) {
            this.dayCount += 1;
        }

        this.applyEnvironment();
        this.updateNotifications();
    }

    applyEnvironment() {
        const {
            current,
            next,
            progress
        } = findKeyframePair(
            this.currentMinute
        );

        this.skyColor.lerpColors(
            colorFromHex(current.sky),
            colorFromHex(next.sky),
            progress
        );

        this.fogColor.lerpColors(
            colorFromHex(current.fog),
            colorFromHex(next.fog),
            progress
        );

        this.sunColor.lerpColors(
            colorFromHex(current.sun),
            colorFromHex(next.sun),
            progress
        );

        this.hemisphereSkyColor.lerpColors(
            colorFromHex(
                current.hemisphereSky
            ),
            colorFromHex(
                next.hemisphereSky
            ),
            progress
        );

        this.hemisphereGroundColor.lerpColors(
            colorFromHex(
                current.hemisphereGround
            ),
            colorFromHex(
                next.hemisphereGround
            ),
            progress
        );

        this.scene.background =
            this.skyColor;

        if (this.scene.fog) {
            this.scene.fog.color.copy(
                this.fogColor
            );
        }

        const sunIntensity =
            THREE.MathUtils.lerp(
                current.sunIntensity,
                next.sunIntensity,
                progress
            );

        const hemisphereIntensity =
            THREE.MathUtils.lerp(
                current.hemisphereIntensity,
                next.hemisphereIntensity,
                progress
            );

        this.updateSunPosition();

        if (this.sunlight) {
            this.sunlight.color.copy(
                this.sunColor
            );

            this.sunlight.intensity =
                sunIntensity;
        }

        if (this.hemisphereLight) {
            this.hemisphereLight.color.copy(
                this.hemisphereSkyColor
            );

            this.hemisphereLight.groundColor.copy(
                this.hemisphereGroundColor
            );

            this.hemisphereLight.intensity =
                hemisphereIntensity;
        }

        const nightFactor =
            this.getNightFactor();

        this.updateNightMaterials(
            this.city,
            nightFactor
        );

        this.updateNightMaterials(
            this.airport,
            nightFactor
        );

        const period =
            this.getPeriod();

        if (
            period !==
            this.lastPeriod
        ) {
            this.lastPeriod =
                period;

            this.onPeriodChanged?.({
                period,
                hour:
                    this.getHour(),
                minute:
                    this.getMinute()
            });
        }
    }

    updateSunPosition() {
        if (!this.sunlight) {
            return;
        }

        const dayProgress =
            this.currentMinute /
            MINUTES_PER_DAY;

        const angle =
            dayProgress *
            Math.PI *
            2 -
            Math.PI / 2;

        const horizontalRadius =
            1500;

        const sunHeight =
            Math.sin(angle) *
            1350;

        this.sunlight.position.set(
            Math.cos(angle) *
                horizontalRadius,
            sunHeight,
            Math.sin(angle) *
                horizontalRadius *
                0.45
        );
    }

    updateNightMaterials(
        root,
        nightFactor
    ) {
        if (!root) {
            return;
        }

        root.traverse(
            (object) => {
                const materials = [];

                if (
                    object.material
                ) {
                    if (
                        Array.isArray(
                            object.material
                        )
                    ) {
                        materials.push(
                            ...object.material
                        );
                    } else {
                        materials.push(
                            object.material
                        );
                    }
                }

                if (
                    object.userData
                        ?.nightMaterial
                ) {
                    materials.push(
                        object.userData
                            .nightMaterial
                    );
                }

                if (
                    Array.isArray(
                        object.userData
                            ?.nightMaterials
                    )
                ) {
                    materials.push(
                        ...object.userData
                            .nightMaterials
                    );
                }

                for (
                    const material of
                    materials
                ) {
                    if (
                        material &&
                        "emissiveIntensity" in
                            material
                    ) {
                        const baseIntensity =
                            material.userData
                                .baseEmissiveIntensity ??
                            material
                                .emissiveIntensity;

                        material.userData
                            .baseEmissiveIntensity =
                            baseIntensity;

                        material.emissiveIntensity =
                            THREE.MathUtils.lerp(
                                baseIntensity *
                                    0.25,
                                Math.max(
                                    baseIntensity,
                                    1.4
                                ),
                                nightFactor
                            );
                    }
                }
            }
        );
    }

    updateNotifications() {
        const hour =
            this.getHour();

        const minute =
            this.getMinute();

        const totalMinute =
            hour * 60 +
            minute;

        if (
            totalMinute ===
                18 * 60 + 40 &&
            this.lastNotificationMinute !==
                totalMinute
        ) {
            this.lastNotificationMinute =
                totalMinute;

            this.onSunsetApproaching?.({
                hour,
                minute
            });
        }

        if (
            totalMinute ===
                5 * 60 + 30 &&
            this.lastNotificationMinute !==
                totalMinute
        ) {
            this.lastNotificationMinute =
                totalMinute;

            this.onSunriseApproaching?.({
                hour,
                minute
            });
        }
    }

    getNightFactor() {
        const minute =
            this.currentMinute;

        if (
            minute >= 20 * 60 ||
            minute <= 5 * 60
        ) {
            return 1;
        }

        if (
            minute >= 18 * 60 &&
            minute < 20 * 60
        ) {
            return (
                minute -
                18 * 60
            ) / 120;
        }

        if (
            minute > 5 * 60 &&
            minute < 7 * 60
        ) {
            return (
                7 * 60 -
                minute
            ) / 120;
        }

        return 0;
    }

    getPeriod() {
        const minute =
            this.currentMinute;

        if (
            minute >= 5 * 60 &&
            minute < 8 * 60
        ) {
            return "MORNING";
        }

        if (
            minute >= 8 * 60 &&
            minute < 17 * 60
        ) {
            return "DAY";
        }

        if (
            minute >= 17 * 60 &&
            minute < 20 * 60
        ) {
            return "EVENING";
        }

        return "NIGHT";
    }

    getHour() {
        return Math.floor(
            this.currentMinute / 60
        );
    }

    getMinute() {
        return Math.floor(
            this.currentMinute % 60
        );
    }

    getFormattedTime() {
        const hour =
            String(
                this.getHour()
            ).padStart(
                2,
                "0"
            );

        const minute =
            String(
                this.getMinute()
            ).padStart(
                2,
                "0"
            );

        return `${hour}:${minute}`;
    }

    getState() {
        return {
            currentMinute:
                this.currentMinute,
            dayCount:
                this.dayCount,
            period:
                this.getPeriod(),
            formattedTime:
                this.getFormattedTime(),
            nightFactor:
                this.getNightFactor(),
            timeScale:
                this.timeScale
        };
    }
}

export {
    TIME_PRESETS
};
