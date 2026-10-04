import * as THREE from "three";

export class ChaseCamera {
    constructor(camera) {
        this.camera = camera;
        this.position = new THREE.Vector3();
        this.target = new THREE.Vector3();
        this.forward = new THREE.Vector3();
    }

    update(aircraft, flightState) {
        if (!aircraft || !this.camera) {
            return;
        }

        if (!flightState.airborne) {
            this.position.set(
                0,
                aircraft.position.y + 14,
                aircraft.position.z + 16
            );

            this.target.set(
                0,
                aircraft.position.y + 1.8,
                aircraft.position.z - 4
            );
        } else {
            this.forward.set(
                -Math.sin(flightState.heading),
                0,
                -Math.cos(flightState.heading)
            );

            this.position
                .copy(aircraft.position)
                .addScaledVector(this.forward, -16);

            this.position.y += 14;

            this.target
                .copy(aircraft.position)
                .addScaledVector(this.forward, 4);

            this.target.y += 1.8;
        }

        this.camera.position.copy(this.position);
        this.camera.up.set(0, 1, 0);
        this.camera.lookAt(this.target);
    }
}
