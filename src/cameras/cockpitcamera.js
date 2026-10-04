import * as THREE from "three";

export class CockpitCamera {
    constructor(camera) {
        this.camera = camera;
        this.localPosition = new THREE.Vector3(0, 2.62, -0.55);
        this.localTarget = new THREE.Vector3(0, 2.48, -50);
        this.worldPosition = new THREE.Vector3();
        this.worldTarget = new THREE.Vector3();
        this.worldUp = new THREE.Vector3();
    }

    update(aircraft) {
        if (!aircraft || !this.camera) {
            return;
        }

        this.worldPosition
            .copy(this.localPosition)
            .applyQuaternion(aircraft.quaternion)
            .add(aircraft.position);

        this.worldTarget
            .copy(this.localTarget)
            .applyQuaternion(aircraft.quaternion)
            .add(aircraft.position);

        this.worldUp
            .set(0, 1, 0)
            .applyQuaternion(aircraft.quaternion);

        this.camera.position.copy(this.worldPosition);
        this.camera.up.copy(this.worldUp);
        this.camera.lookAt(this.worldTarget);
    }
}
