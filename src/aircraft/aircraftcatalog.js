import {
    createSky172
} from "./general/createsky172.js";

import {
    createAirliner100
} from "./general/createairliner100.js";

const AVAILABLE_AIRCRAFT = [
    {
        id: "sky172",
        displayName: "NOVA SKY 172",
        category: "LIGHT AIRCRAFT",
        flightType: "FIXED_WING",
        difficulty: "EASY",
        engineType: "SINGLE PISTON PROPELLER",
        maximumSpeed: "220 km/h",
        rotationSpeed: "100 km/h",
        handling: "LIGHT AND FORGIVING",
        description:
            "A compact training aircraft with gentle controls and predictable handling.",
        available: true,
        createModel: createSky172,

        spawn: {
            x: 0,
            y: 0.12,
            z: 1250
        },

        performance: {
            maximumSpeedMetersPerSecond: 61.1,
            rotationSpeedMetersPerSecond: 27.8,
            stallSpeedMetersPerSecond: 22,
            groundEngineAcceleration: 4.5,
            airEngineAcceleration: 2.8,
            rollingResistance: 0.55,
            aerodynamicDrag: 0.0022,
            liftStrength: 0.52,
            baseLiftStrength: 0.08,
            gravityEffect: 1.2,
            brakeDeceleration: 10
        },

        handlingConfig: {
            groundSteeringRateDegrees: 28,
            pitchRateDegrees: 22,
            rollRateDegrees: 42,
            turnRateDegrees: 18,
            maximumGroundPitchDegrees: 12,
            maximumPitchUpDegrees: 24,
            maximumPitchDownDegrees: -18,
            maximumRollDegrees: 45
        },

        camera: {
            externalDistance: 38,
            externalHeight: 4.8,
            externalTargetDistance: 2,
            externalTargetHeight: 3.2,
            cockpitForward: 1.15,
            cockpitHeight: 2.35,
            cockpitLookDistance: 60,
            cockpitTargetHeight: 2.25
        }
    },
    {
        id: "airliner100",
        displayName: "NOVA AIRLINER 100",
        category: "MEDIUM AIRLINER",
        flightType: "FIXED_WING",
        difficulty: "NORMAL",
        engineType: "TWIN TURBOFAN",
        maximumSpeed: "830 km/h",
        rotationSpeed: "230 km/h",
        handling: "BALANCED",
        description:
            "A responsive medium-range passenger jet designed for stable and comfortable flight.",
        available: true,
        createModel: createAirliner100,

        spawn: {
            x: 0,
            y: 0.2,
            z: 1250
        },

        performance: {
            maximumSpeedMetersPerSecond: 230.6,
            rotationSpeedMetersPerSecond: 63.9,
            stallSpeedMetersPerSecond: 51,
            groundEngineAcceleration: 7.4,
            airEngineAcceleration: 4.2,
            rollingResistance: 0.72,
            aerodynamicDrag: 0.00072,
            liftStrength: 0.19,
            baseLiftStrength: 0.055,
            gravityEffect: 1.4,
            brakeDeceleration: 12
        },

        handlingConfig: {
            groundSteeringRateDegrees: 15,
            pitchRateDegrees: 12,
            rollRateDegrees: 20,
            turnRateDegrees: 8,
            maximumGroundPitchDegrees: 10,
            maximumPitchUpDegrees: 18,
            maximumPitchDownDegrees: -12,
            maximumRollDegrees: 32
        },

        camera: {
            externalDistance: 78,
            externalHeight: 13,
            externalTargetDistance: 8,
            externalTargetHeight: 6,
            cockpitForward: 8.3,
            cockpitHeight: 3.8,
            cockpitLookDistance: 140,
            cockpitTargetHeight: 3.5
        }
    }
];

const DEVELOPMENT_AIRCRAFT = [
    {
        id: "airliner200",
        displayName: "NOVA AIRLINER 200",
        category: "MEDIUM AIRLINER",
        difficulty: "NORMAL",
        engineType: "TWIN TURBOFAN",
        maximumSpeed: "850 km/h",
        rotationSpeed: "245 km/h",
        handling: "STABLE AND HEAVY",
        description:
            "A stretched medium passenger jet currently in development.",
        available: false
    },
    {
        id: "widebody300",
        displayName: "NOVA WIDEBODY 300",
        category: "LARGE AIRLINER",
        difficulty: "HARD",
        engineType: "TWIN HIGH-BYPASS TURBOFAN",
        maximumSpeed: "900 km/h",
        rotationSpeed: "270 km/h",
        handling: "HEAVY AND STABLE",
        description:
            "A long-range widebody passenger aircraft currently in development.",
        available: false
    },
    {
        id: "jumbo400",
        displayName: "NOVA JUMBO 400",
        category: "LARGE AIRLINER",
        difficulty: "HARD",
        engineType: "FOUR TURBOFANS",
        maximumSpeed: "920 km/h",
        rotationSpeed: "285 km/h",
        handling: "VERY HEAVY",
        description:
            "The largest passenger aircraft in the fleet, currently in development.",
        available: false
    },
    {
        id: "falconf1",
        displayName: "NOVA FALCON F1",
        category: "FIGHTER AIRCRAFT",
        difficulty: "EXPERT",
        engineType: "SINGLE AFTERBURNING TURBOFAN",
        maximumSpeed: "Mach 2.0",
        rotationSpeed: "190 km/h",
        handling: "HIGHLY RESPONSIVE",
        description:
            "A lightweight high-performance jet currently in development.",
        available: false
    },
    {
        id: "phantomf2",
        displayName: "NOVA PHANTOM F2",
        category: "FIGHTER AIRCRAFT",
        difficulty: "EXPERT",
        engineType: "TWIN AFTERBURNING TURBOFANS",
        maximumSpeed: "Mach 2.3",
        rotationSpeed: "210 km/h",
        handling: "FAST AND STABLE",
        description:
            "A powerful twin-engine high-speed jet currently in development.",
        available: false
    },
    {
        id: "rotorh1",
        displayName: "NOVA ROTOR H1",
        category: "ROTORCRAFT",
        difficulty: "HARD",
        engineType: "TURBOSHAFT",
        maximumSpeed: "260 km/h",
        rotationSpeed: "VERTICAL TAKEOFF",
        handling: "HOVER CAPABLE",
        description:
            "A utility helicopter currently in development.",
        available: false
    },
    {
        id: "hyperx",
        displayName: "NOVA HYPER X",
        category: "EXPERIMENTAL",
        difficulty: "WHY",
        engineType: "PROBABLY ENGINES",
        maximumSpeed: "MACH YES",
        rotationSpeed: "GOOD LUCK",
        handling: "TECHNICALLY CONTROLLABLE",
        description:
            "This seems like a bad idea.",
        available: false,
        secret: true
    }
];

export const AIRCRAFT_CATALOG = [
    ...AVAILABLE_AIRCRAFT,
    ...DEVELOPMENT_AIRCRAFT
];

export function getAircraftById(
    aircraftId
) {
    return (
        AIRCRAFT_CATALOG.find(
            (aircraft) =>
                aircraft.id === aircraftId
        ) ||
        AIRCRAFT_CATALOG[0]
    );
}

export function getAvailableAircraft() {
    return AIRCRAFT_CATALOG.filter(
        (aircraft) =>
            aircraft.available &&
            typeof aircraft.createModel ===
                "function"
    );
}
