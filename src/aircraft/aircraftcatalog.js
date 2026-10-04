import { createSky172 } from "./general/createsky172.js";
import { createAirliner100 } from "./general/createairliner100.js";

const BASE_AIRCRAFT = [
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
        description: "A compact training aircraft with gentle controls and predictable handling.",
        available: true,
        createModel: createSky172,
        spawn: { x: 0, y: 0.12, z: 1250 },
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
            gravityEffect: 1.2
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
        description: "A responsive medium-range passenger jet designed for stable and comfortable flight.",
        available: true,
        createModel: createAirliner100,
        spawn: { x: 0, y: 0.2, z: 1250 },
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
            gravityEffect: 1.4
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

const PLACEHOLDER_AIRCRAFT = [
    ["airliner200", "NOVA AIRLINER 200", "MEDIUM AIRLINER", "NORMAL", "TWIN TURBOFAN", "850 km/h", "245 km/h"],
    ["widebody300", "NOVA WIDEBODY 300", "LARGE AIRLINER", "HARD", "TWIN HIGH-BYPASS TURBOFAN", "900 km/h", "270 km/h"],
    ["jumbo400", "NOVA JUMBO 400", "LARGE AIRLINER", "HARD", "FOUR TURBOFANS", "920 km/h", "285 km/h"],
    ["falconf1", "NOVA FALCON F1", "FIGHTER AIRCRAFT", "EXPERT", "SINGLE AFTERBURNING TURBOFAN", "Mach 2.0", "190 km/h"],
    ["phantomf2", "NOVA PHANTOM F2", "FIGHTER AIRCRAFT", "EXPERT", "TWIN AFTERBURNING TURBOFANS", "Mach 2.3", "210 km/h"],
    ["rotorh1", "NOVA ROTOR H1", "ROTORCRAFT", "HARD", "TURBOSHAFT", "260 km/h", "VERTICAL TAKEOFF"],
    ["hyperx", "NOVA HYPER X", "EXPERIMENTAL", "WHY", "PROBABLY ENGINES", "MACH YES", "GOOD LUCK"]
].map(([id, displayName, category, difficulty, engineType, maximumSpeed, rotationSpeed]) => ({
    id,
    displayName,
    category,
    difficulty,
    engineType,
    maximumSpeed,
    rotationSpeed,
    handling: "IN DEVELOPMENT",
    description: "Aircraft model and flight data are in development.",
    available: false
}));

export const AIRCRAFT_CATALOG = [
    ...BASE_AIRCRAFT,
    ...PLACEHOLDER_AIRCRAFT
];

export function getAircraftById(aircraftId) {
    return AIRCRAFT_CATALOG.find((aircraft) => aircraft.id === aircraftId) || AIRCRAFT_CATALOG[0];
}
