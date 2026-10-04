import * as THREE from "three";

export class ChaseCamera {
    constructor(camera) {
        this.camera = camera;

        this.position =
            new THREE.Vector3();

        this.target =
            new THREE.Vector3();

        this.forward =
            new THREE.Vector3();
    }

    update(aircraft, flightState) {
        if (!aircraft || !this.camera) {
            return;
        }

        if (flightState.airborne) {
            this.updateAirCamera(
                aircraft,
                flightState
            );

            return;
        }

        this.updateGroundCamera(
            aircraft
        );
    }

    updateGroundCamera(aircraft) {
        this.position.set(
            0,
            aircraft.position.y + 3.8,
            aircraft.position.z + 15
        );

        this.target.set(
            0,
            aircraft.position.y + 1.6,
            aircraft.position.z - 30
        );

        this.applyCamera();
    }

    updateAirCamera(
        aircraft,
        flightState
    ) {
        this.forward.set(
            -Math.sin(
                flightState.heading
            ),
            0,
            -Math.cos(
                flightState.heading
            )
        );

        this.position
            .copy(aircraft.position)
            .addScaledVector(
                this.forward,
                -15
            );

        this.position.y += 3.8;

        this.target
            .copy(aircraft.position)
            .addScaledVector(
                this.forward,
                30
            );

        this.target.y += 1.6;

        this.applyCamera();
    }

    applyCamera() {
        this.camera.position.copy(
            this.position
        );

        this.camera.up.set(
            0,
            1,
            0
        );

        this.camera.lookAt(
            this.target
        );

        this.camera.updateMatrixWorld(
            true
        );
    }
}
