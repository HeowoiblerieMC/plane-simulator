import * as THREE from "three";
import { createRunways } from "./createrunways.js";
import { createRunwayMarkings } from "./createrunwaymarkings.js";
import { createAirportBuildings } from "./createairportbuildings.js";

export function createJFK() {
    const airport = new THREE.Group();
    airport.name = "JFKAirport";
    airport.position.set(0, 0, 0);
    airport.rotation.set(0, 0, 0);
    airport.scale.set(1, 1, 1);

    airport.add(
        createRunways(),
        createRunwayMarkings(),
        createAirportBuildings()
    );

    return airport;
}
