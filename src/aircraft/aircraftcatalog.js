export const AIRCRAFT_CATALOG = [
    {
        id: "sky172",
        displayName: "NOVA SKY 172",
        category: "LIGHT AIRCRAFT",
        difficulty: "EASY",
        engineType: "SINGLE PISTON PROPELLER",
        maximumSpeed: "220 km/h",
        rotationSpeed: "100 km/h",
        handling: "LIGHT AND FORGIVING",
        description: "A compact training aircraft with gentle controls and predictable ground handling.",
        available: true
    },
    {
        id: "airliner100",
        displayName: "NOVA AIRLINER 100",
        category: "MEDIUM AIRLINER",
        difficulty: "NORMAL",
        engineType: "TWIN TURBOFAN",
        maximumSpeed: "830 km/h",
        rotationSpeed: "230 km/h",
        handling: "BALANCED",
        description: "A responsive medium-range passenger jet designed for stable and comfortable flight.",
        available: false
    },
    {
        id: "airliner200",
        displayName: "NOVA AIRLINER 200",
        category: "MEDIUM AIRLINER",
        difficulty: "NORMAL",
        engineType: "TWIN TURBOFAN",
        maximumSpeed: "850 km/h",
        rotationSpeed: "245 km/h",
        handling: "STABLE AND HEAVY",
        description: "A stretched passenger jet with greater capacity and a slightly slower control response.",
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
        description: "A long-range widebody aircraft with powerful engines and a large swept wing.",
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
        description: "The largest passenger aircraft in the fleet, built for long runways and smooth inputs.",
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
        description: "A lightweight high-performance jet focused on acceleration and rapid maneuvering.",
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
        description: "A larger twin-engine fighter with strong high-speed stability and powerful climb performance.",
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
        description: "A utility helicopter designed for vertical takeoff, hovering, and precise low-speed flight.",
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
        description: "This seems like a bad idea.",
        available: false,
        secret: true
    }
];

export function getAircraftById(aircraftId) {
    return (
        AIRCRAFT_CATALOG.find((aircraft) => aircraft.id === aircraftId) ||
        AIRCRAFT_CATALOG[0]
    );
}
