import * as THREE from "three";

export class ChaseCamera {
    constructor(camera) {
        this.camera = camera;

        this.cameraPosition =
            new THREE.Vector3();

        this.cameraTarget =
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
        this.cameraPosition.set(
            0,
            aircraft.position.y + 16,
            aircraft.position.z + 14
        );

        this.cameraTarget.set(
            0,
            aircraft.position.y + 1.5,
            aircraft.position.z - 5
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

        this.cameraPosition
            .copy(aircraft.position)
            .addScaledVector(
                this.forward,
                -14
            );

        this.cameraPosition.y += 16;

        this.cameraTarget
            .copy(aircraft.position)
            .addScaledVector(
                this.forward,
                5
            );

        this.cameraTarget.y += 1.5;

        this.applyCamera();
    }

    applyCamera() {
        this.camera.position.copy(
            this.cameraPosition
        );

        this.camera.up.set(
            0,
            1,
            0
        );

        this.camera.lookAt(
            this.cameraTarget
        );

        this.camera.updateMatrixWorld(
            true
        );
    }
}
