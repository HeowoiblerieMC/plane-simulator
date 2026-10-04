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
            aircraft.position.y + 4.5,
            aircraft.position.z + 18
        );

        this.target.set(
            0,
            aircraft.position.y + 1.8,
            aircraft.position.z - 25
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
                -18
            );

        this.position.y += 4.5;

        this.target
            .copy(aircraft.position)
            .addScaledVector(
                this.forward,
                25
            );

        this.target.y += 1.8;

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

        this.camera.updateProjectionMatrix();
        this.camera.updateMatrixWorld(true);
    }
}
