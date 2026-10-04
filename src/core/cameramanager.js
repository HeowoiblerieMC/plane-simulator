import { ChaseCamera } from "../cameras/chasecamera.js";
import { CockpitCamera } from "../cameras/cockpitcamera.js";

export class CameraManager {
    constructor(camera) {
        this.camera = camera;
        this.mode = "CHASE";
        this.chaseCamera = new ChaseCamera(camera);
        this.cockpitCamera = new CockpitCamera(camera);
    }

    toggle() {
        this.mode =
            this.mode === "CHASE"
                ? "COCKPIT"
                : "CHASE";

        return this.mode;
    }

    update(aircraft, flightState) {
        if (!aircraft) {
            return;
        }

        const cockpit = aircraft.userData.cockpit;

        if (cockpit) {
            cockpit.visible = this.mode === "COCKPIT";
        }

        if (this.mode === "COCKPIT") {
            this.cockpitCamera.update(aircraft);
            return;
        }

        this.chaseCamera.update(aircraft, flightState);
    }
}
