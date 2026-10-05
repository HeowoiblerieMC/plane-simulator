export const INCIDENT_TYPES = {
    MEDICAL_EMERGENCY: "MEDICAL_EMERGENCY",
    CABIN_SMOKE: "CABIN_SMOKE",
    SECURITY_INCIDENT: "SECURITY_INCIDENT",
    ENGINE_FAILURE: "ENGINE_FAILURE",
    ENGINE_FIRE: "ENGINE_FIRE",
    HYDRAULIC_FAULT: "HYDRAULIC_FAULT",
    ELECTRICAL_FAULT: "ELECTRICAL_FAULT",
    LANDING_GEAR_FAULT: "LANDING_GEAR_FAULT",
    BIRD_STRIKE: "BIRD_STRIKE"
};

const FIRE_TEST_MODE = true;
const FIRE_TEST_DELAY_SECONDS = 5;
const FIRE_TEST_MINIMUM_ALTITUDE_METERS = 2;
const FIRE_TEST_TRIGGER_CHANCE = 1;

const INCIDENT_DEFINITIONS = {
    MEDICAL_EMERGENCY: {
        type: INCIDENT_TYPES.MEDICAL_EMERGENCY,
        category: "CABIN CREW",
        level: "EMERGENCY",
        title: "Medical emergency",
        message:
            "A passenger requires urgent medical assistance. Request priority landing.",
        major: false,
        passengerRelated: true,
        minimumAltitude: 0,
        duration: 420
    },

    CABIN_SMOKE: {
        type: INCIDENT_TYPES.CABIN_SMOKE,
        category: "CABIN CREW",
        level: "EMERGENCY",
        title: "Smoke detected",
        message:
            "Smoke has been detected in the cabin. Land as soon as practical.",
        major: true,
        passengerRelated: true,
        minimumAltitude: 20,
        duration: 300
    },

    SECURITY_INCIDENT: {
        type: INCIDENT_TYPES.SECURITY_INCIDENT,
        category: "CABIN CREW",
        level: "EMERGENCY",
        title: "Security incident",
        message:
            "A serious security incident has been reported. Request priority landing immediately.",
        major: true,
        passengerRelated: true,
        minimumAltitude: 20,
        duration: 360
    },

    ENGINE_FAILURE: {
        type: INCIDENT_TYPES.ENGINE_FAILURE,
        category: "FLIGHT OPERATIONS",
        level: "EMERGENCY",
        title: "Engine power loss",
        message:
            "Engine power has been lost. Maintain airspeed and prepare to land.",
        major: true,
        passengerRelated: false,
        minimumAltitude: 30,
        duration: 0
    },

    ENGINE_FIRE: {
        type: INCIDENT_TYPES.ENGINE_FIRE,
        category: "FLIGHT OPERATIONS",
        level: "EMERGENCY",
        title: "Engine fire",
        message:
            "Engine fire detected. Reduce power and prepare for an emergency landing.",
        major: true,
        passengerRelated: false,
        minimumAltitude: FIRE_TEST_MINIMUM_ALTITUDE_METERS,
        duration: 0
    },

    HYDRAULIC_FAULT: {
        type: INCIDENT_TYPES.HYDRAULIC_FAULT,
        category: "FLIGHT OPERATIONS",
        level: "WARNING",
        title: "Hydraulic pressure warning",
        message:
            "Hydraulic pressure is decreasing. Control response may become slower.",
        major: false,
        passengerRelated: false,
        minimumAltitude: 15,
        duration: 0
    },

    ELECTRICAL_FAULT: {
        type: INCIDENT_TYPES.ELECTRICAL_FAULT,
        category: "FLIGHT OPERATIONS",
        level: "WARNING",
        title: "Electrical system fault",
        message:
            "An electrical system fault has been detected. Some instruments may be unavailable.",
        major: false,
        passengerRelated: false,
        minimumAltitude: 10,
        duration: 180
    },

    LANDING_GEAR_FAULT: {
        type: INCIDENT_TYPES.LANDING_GEAR_FAULT,
        category: "FLIGHT OPERATIONS",
        level: "WARNING",
        title: "Landing gear fault",
        message:
            "Landing gear indication fault detected. Prepare for a precautionary landing.",
        major: false,
        passengerRelated: false,
        minimumAltitude: 25,
        duration: 0
    },

    BIRD_STRIKE: {
        type: INCIDENT_TYPES.BIRD_STRIKE,
        category: "AIR TRAFFIC CONTROL",
        level: "ADVISORY",
        title: "Possible bird strike",
        message:
            "A possible bird strike has occurred. Monitor engine performance.",
        major: false,
        passengerRelated: false,
        minimumAltitude: 5,
        maximumAltitude: 900,
        duration: 40
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

function chooseRandom(
    values
) {
    if (
        values.length === 0
    ) {
        return null;
    }

    return values[
        Math.floor(
            Math.random() *
                values.length
        )
    ];
}

export class IncidentSystem {
    constructor({
        aircraftDefinition,
        passengers = 0,
        minimumMajorIncidentTime = 90,
        minimumCheckInterval = 45,
        maximumCheckInterval = 85,
        majorIncidentChance = 0.035,
        minorIncidentChance = 0.09
    }) {
        this.aircraftDefinition =
            aircraftDefinition;

        this.passengers =
            Math.max(
                0,
                passengers
            );

        this.minimumMajorIncidentTime =
            minimumMajorIncidentTime;

        this.minimumCheckInterval =
            minimumCheckInterval;

        this.maximumCheckInterval =
            maximumCheckInterval;

        this.majorIncidentChance =
            majorIncidentChance;

        this.minorIncidentChance =
            minorIncidentChance;

        this.elapsedTime = 0;

        this.checkTimer =
            FIRE_TEST_MODE
                ? FIRE_TEST_DELAY_SECONDS
                : randomRange(
                    this.minimumCheckInterval,
                    this.maximumCheckInterval
                );

        this.fireTestTriggered =
            false;

        this.activeIncidents =
            new Map();

        this.incidentHistory = [];

        this.majorIncidentCount = 0;
        this.minorIncidentCount = 0;
        this.passengerIncidentCount = 0;

        this.maximumMajorIncidents = 1;
        this.maximumMinorIncidents = 2;
        this.maximumPassengerIncidents = 1;

        this.effectState =
            this.createDefaultEffectState();

        this.onIncidentStarted =
            null;

        this.onIncidentUpdated =
            null;

        this.onIncidentEnded =
            null;

        this.onFireRequested =
            null;

        this.onSmokeRequested =
            null;

        this.onCameraShakeRequested =
            null;
    }

    createDefaultEffectState() {
        return {
            enginePowerMultiplier: 1,
            asymmetricThrust: 0,
            pitchControlMultiplier: 1,
            rollControlMultiplier: 1,
            steeringMultiplier: 1,
            brakingMultiplier: 1,
            instrumentVisibility: 1,
            landingGearIntegrity: 1,
            engineFireActive: false,
            engineFailureActive: false,
            cabinSmokeActive: false
        };
    }

    setCallbacks({
        onIncidentStarted = null,
        onIncidentUpdated = null,
        onIncidentEnded = null,
        onFireRequested = null,
        onSmokeRequested = null,
        onCameraShakeRequested = null
    } = {}) {
        this.onIncidentStarted =
            onIncidentStarted;

        this.onIncidentUpdated =
            onIncidentUpdated;

        this.onIncidentEnded =
            onIncidentEnded;

        this.onFireRequested =
            onFireRequested;

        this.onSmokeRequested =
            onSmokeRequested;

        this.onCameraShakeRequested =
            onCameraShakeRequested;
    }

    update(
        deltaTime,
        {
            airborne = false,
            altitudeMeters = 0,
            speedMetersPerSecond = 0,
            verticalSpeed = 0,
            approachingRunway = false,
            crashed = false
        } = {}
    ) {
        if (crashed) {
            return;
        }

        this.elapsedTime +=
            deltaTime;

        this.updateActiveIncidents(
            deltaTime
        );

        if (FIRE_TEST_MODE) {
            this.updateFireTest({
                airborne,
                altitudeMeters
            });

            return;
        }

        this.checkTimer -=
            deltaTime;

        if (
            this.checkTimer > 0
        ) {
            return;
        }

        this.checkTimer =
            randomRange(
                this.minimumCheckInterval,
                this.maximumCheckInterval
            );

        this.tryGenerateIncident({
            airborne,
            altitudeMeters,
            speedMetersPerSecond,
            verticalSpeed,
            approachingRunway
        });
    }

    updateFireTest({
        airborne,
        altitudeMeters
    }) {
        if (
            this.fireTestTriggered ||
            this.activeIncidents.size > 0
        ) {
            return;
        }

        if (
            !airborne ||
            altitudeMeters <
                FIRE_TEST_MINIMUM_ALTITUDE_METERS
        ) {
            return;
        }

        this.checkTimer -=
            1 / 60;

        const fireDelayPassed =
            this.elapsedTime >=
            FIRE_TEST_DELAY_SECONDS;

        if (!fireDelayPassed) {
            return;
        }

        if (
            Math.random() <=
            FIRE_TEST_TRIGGER_CHANCE
        ) {
            this.fireTestTriggered =
                true;

            this.startIncident(
                INCIDENT_TYPES.ENGINE_FIRE
            );
        }
    }

    tryGenerateIncident({
        airborne,
        altitudeMeters,
        speedMetersPerSecond,
        approachingRunway
    }) {
        if (
            this.activeIncidents.size >
            0
        ) {
            return;
        }

        const allowMajorIncident =
            this.elapsedTime >=
                this.minimumMajorIncidentTime &&
            this.majorIncidentCount <
                this.maximumMajorIncidents &&
            !approachingRunway;

        const allowMinorIncident =
            this.minorIncidentCount <
            this.maximumMinorIncidents;

        const roll =
            Math.random();

        let requestedSeverity =
            null;

        if (
            allowMajorIncident &&
            roll <
                this.majorIncidentChance
        ) {
            requestedSeverity =
                "MAJOR";
        } else if (
            allowMinorIncident &&
            roll <
                this.majorIncidentChance +
                    this.minorIncidentChance
        ) {
            requestedSeverity =
                "MINOR";
        }

        if (!requestedSeverity) {
            return;
        }

        const candidates =
            Object.values(
                INCIDENT_DEFINITIONS
            ).filter(
                (incident) =>
                    this.isIncidentEligible(
                        incident,
                        {
                            requestedSeverity,
                            airborne,
                            altitudeMeters,
                            speedMetersPerSecond
                        }
                    )
            );

        const selectedIncident =
            chooseRandom(
                candidates
            );

        if (!selectedIncident) {
            return;
        }

        this.startIncident(
            selectedIncident.type
        );
    }

    isIncidentEligible(
        incident,
        {
            requestedSeverity,
            airborne,
            altitudeMeters,
            speedMetersPerSecond
        }
    ) {
        if (
            requestedSeverity ===
                "MAJOR" &&
            !incident.major
        ) {
            return false;
        }

        if (
            requestedSeverity ===
                "MINOR" &&
            incident.major
        ) {
            return false;
        }

        if (
            incident.passengerRelated &&
            (
                this.passengers <= 0 ||
                this.passengerIncidentCount >=
                    this.maximumPassengerIncidents
            )
        ) {
            return false;
        }

        if (
            incident.minimumAltitude !==
                undefined &&
            altitudeMeters <
                incident.minimumAltitude
        ) {
            return false;
        }

        if (
            incident.maximumAltitude !==
                undefined &&
            altitudeMeters >
                incident.maximumAltitude
        ) {
            return false;
        }

        if (
            incident.type ===
                INCIDENT_TYPES.ENGINE_FAILURE ||
            incident.type ===
                INCIDENT_TYPES.ENGINE_FIRE
        ) {
            if (
                !airborne ||
                speedMetersPerSecond <
                    15
            ) {
                return false;
            }
        }

        const flightType =
            this.aircraftDefinition
                ?.flightType ??
            "FIXED_WING";

        if (
            flightType ===
                "FIGHTER" &&
            incident.passengerRelated
        ) {
            return false;
        }

        if (
            flightType ===
                "EXPERIMENTAL" &&
            incident.passengerRelated
        ) {
            return false;
        }

        return true;
    }

    startIncident(
        incidentType
    ) {
        const definition =
            INCIDENT_DEFINITIONS[
                incidentType
            ];

        if (
            !definition ||
            this.activeIncidents.has(
                incidentType
            )
        ) {
            return false;
        }

        const incident = {
            ...definition,

            startedAt:
                this.elapsedTime,

            elapsed: 0,

            remainingTime:
                definition.duration,

            resolved: false,

            affectedEngine:
                this.selectAffectedEngine(
                    incidentType
                )
        };

        this.activeIncidents.set(
            incidentType,
            incident
        );

        this.incidentHistory.push({
            type: incidentType,
            startedAt:
                this.elapsedTime,
            affectedEngine:
                incident.affectedEngine
        });

        if (definition.major) {
            this.majorIncidentCount +=
                1;
        } else {
            this.minorIncidentCount +=
                1;
        }

        if (
            definition.passengerRelated
        ) {
            this.passengerIncidentCount +=
                1;
        }

        this.applyIncidentEffect(
            incident
        );

        this.onIncidentStarted?.({
            ...incident
        });

        return true;
    }

    selectAffectedEngine(
        incidentType
    ) {
        if (
            incidentType !==
                INCIDENT_TYPES.ENGINE_FAILURE &&
            incidentType !==
                INCIDENT_TYPES.ENGINE_FIRE
        ) {
            return null;
        }

        const engineCount =
            this.aircraftDefinition
                ?.engineCount ??
            (
                this.aircraftDefinition
                    ?.id ===
                    "airliner100"
                    ? 2
                    : 1
            );

        if (engineCount <= 1) {
            return "MAIN";
        }

        if (engineCount === 2) {
            return (
                Math.random() < 0.5
                    ? "LEFT"
                    : "RIGHT"
            );
        }

        return `ENGINE_${
            Math.floor(
                Math.random() *
                    engineCount
            ) + 1
        }`;
    }

    applyIncidentEffect(
        incident
    ) {
        switch (
            incident.type
        ) {
            case INCIDENT_TYPES.ENGINE_FAILURE: {
                const engineCount =
                    this.getEngineCount();

                this.effectState
                    .engineFailureActive =
                    true;

                this.effectState
                    .enginePowerMultiplier =
                    engineCount <= 1
                        ? 0
                        : (
                            engineCount -
                            1
                        ) /
                            engineCount;

                this.applyAsymmetricThrust(
                    incident.affectedEngine
                );

                break;
            }

            case INCIDENT_TYPES.ENGINE_FIRE: {
                const engineCount =
                    this.getEngineCount();

                this.effectState
                    .engineFireActive =
                    true;

                this.effectState
                    .enginePowerMultiplier =
                    engineCount <= 1
                        ? 0.25
                        : Math.max(
                            0.45,
                            (
                                engineCount -
                                1
                            ) /
                                engineCount
                        );

                this.applyAsymmetricThrust(
                    incident.affectedEngine
                );

                this.onFireRequested?.({
                    active: true,
                    affectedEngine:
                        incident
                            .affectedEngine
                });

                this.onSmokeRequested?.({
                    active: true,
                    smokeType: "BLACK",
                    affectedEngine:
                        incident
                            .affectedEngine
                });

                this.onCameraShakeRequested?.({
                    duration: 1.5,
                    strength: 0.14
                });

                break;
            }

            case INCIDENT_TYPES.HYDRAULIC_FAULT: {
                this.effectState
                    .pitchControlMultiplier =
                    0.52;

                this.effectState
                    .rollControlMultiplier =
                    0.48;

                this.effectState
                    .steeringMultiplier =
                    0.65;

                break;
            }

            case INCIDENT_TYPES.ELECTRICAL_FAULT: {
                this.effectState
                    .instrumentVisibility =
                    0.38;

                break;
            }

            case INCIDENT_TYPES.LANDING_GEAR_FAULT: {
                this.effectState
                    .landingGearIntegrity =
                    0.42;

                this.effectState
                    .brakingMultiplier =
                    0.62;

                break;
            }

            case INCIDENT_TYPES.CABIN_SMOKE: {
                this.effectState
                    .cabinSmokeActive =
                    true;

                this.onSmokeRequested?.({
                    active: true,
                    smokeType: "GRAY",
                    affectedEngine: null
                });

                break;
            }

            case INCIDENT_TYPES.BIRD_STRIKE: {
                this.effectState
                    .enginePowerMultiplier =
                    Math.min(
                        this.effectState
                            .enginePowerMultiplier,
                        0.82
                    );

                this.onCameraShakeRequested?.({
                    duration: 1.1,
                    strength: 0.18
                });

                break;
            }

            default:
                break;
        }
    }

    getEngineCount() {
        if (
            Number.isFinite(
                this.aircraftDefinition
                    ?.engineCount
            )
        ) {
            return (
                this.aircraftDefinition
                    .engineCount
            );
        }

        if (
            this.aircraftDefinition
                ?.id ===
            "airliner100"
        ) {
            return 2;
        }

        return 1;
    }

    applyAsymmetricThrust(
        affectedEngine
    ) {
        if (
            affectedEngine ===
            "LEFT"
        ) {
            this.effectState
                .asymmetricThrust =
                0.16;
        }

        if (
            affectedEngine ===
            "RIGHT"
        ) {
            this.effectState
                .asymmetricThrust =
                -0.16;
        }
    }

    updateActiveIncidents(
        deltaTime
    ) {
        for (
            const [
                incidentType,
                incident
            ] of
            this.activeIncidents
        ) {
            incident.elapsed +=
                deltaTime;

            if (
                incident.duration >
                0
            ) {
                incident.remainingTime =
                    Math.max(
                        0,
                        incident.duration -
                            incident.elapsed
                    );
            }

            this.onIncidentUpdated?.({
                ...incident
            });

            if (
                incident.duration >
                    0 &&
                incident.remainingTime <=
                    0
            ) {
                this.endIncident(
                    incidentType,
                    "EXPIRED"
                );
            }
        }
    }

    endIncident(
        incidentType,
        reason = "RESOLVED"
    ) {
        const incident =
            this.activeIncidents.get(
                incidentType
            );

        if (!incident) {
            return false;
        }

        this.activeIncidents.delete(
            incidentType
        );

        incident.resolved =
            reason === "RESOLVED";

        this.rebuildEffectState();

        this.onIncidentEnded?.({
            ...incident,
            reason
        });

        return true;
    }

    rebuildEffectState() {
        this.effectState =
            this.createDefaultEffectState();

        this.onFireRequested?.({
            active: false,
            affectedEngine: null
        });

        this.onSmokeRequested?.({
            active: false,
            smokeType: null,
            affectedEngine: null
        });

        for (
            const incident of
            this.activeIncidents.values()
        ) {
            this.applyIncidentEffect(
                incident
            );
        }
    }

    forceIncident(
        incidentType
    ) {
        return this.startIncident(
            incidentType
        );
    }

    resolveAllIncidents() {
        const incidentTypes = [
            ...this.activeIncidents
                .keys()
        ];

        for (
            const incidentType of
            incidentTypes
        ) {
            this.endIncident(
                incidentType,
                "RESOLVED"
            );
        }
    }

    getEffects() {
        return {
            ...this.effectState
        };
    }

    getActiveIncidents() {
        return [
            ...this.activeIncidents
                .values()
        ].map(
            (incident) => ({
                ...incident
            })
        );
    }

    getState() {
        return {
            fireTestMode:
                FIRE_TEST_MODE,

            fireTestTriggered:
                this.fireTestTriggered,

            elapsedTime:
                this.elapsedTime,

            activeIncidents:
                this.getActiveIncidents(),

            majorIncidentCount:
                this.majorIncidentCount,

            minorIncidentCount:
                this.minorIncidentCount,

            passengerIncidentCount:
                this.passengerIncidentCount,

            effects:
                this.getEffects()
        };
    }

    reset({
        aircraftDefinition =
            this.aircraftDefinition,

        passengers =
            this.passengers
    } = {}) {
        this.aircraftDefinition =
            aircraftDefinition;

        this.passengers =
            Math.max(
                0,
                passengers
            );

        this.elapsedTime = 0;

        this.checkTimer =
            FIRE_TEST_MODE
                ? FIRE_TEST_DELAY_SECONDS
                : randomRange(
                    this.minimumCheckInterval,
                    this.maximumCheckInterval
                );

        this.fireTestTriggered =
            false;

        this.activeIncidents.clear();
        this.incidentHistory = [];

        this.majorIncidentCount = 0;
        this.minorIncidentCount = 0;
        this.passengerIncidentCount = 0;

        this.rebuildEffectState();
    }
}

export {
    INCIDENT_DEFINITIONS
};
