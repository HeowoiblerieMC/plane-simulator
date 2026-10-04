import * as THREE from "three";
import { createRunways } from "../airport/JFK/createrunways.js";
import { createRunwayMarkings } from "../airport/JFK/createrunwaymarkings.js";
import { createSky172 } from "../aircraft/general/createsky172.js";
import { FlightHUD } from "../ui/flighthud.js";

export class Game {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.aircraft = null;
        this.hud = null;
        this.keys = new Set();
        this.cameraMode = "EXTERNAL";
        this.cameraModes = ["EXTERNAL", "COCKPIT"];
        this.cameraModeIndex = 0;

        this.flightState = {
            throttle: 0,
            speedMetersPerSecond: 0,
            verticalSpeed: 0,
            altitudeMeters: 0,
            pitch: 0,
            roll: 0,
            heading: 0,
            brakeActive: false,
            airborne: false
        };

        this.forwardVector = new THREE.Vector3();
        this.cameraPosition = new THREE.Vector3();
        this.cameraTarget = new THREE.Vector3();
        this.animationFrameId = null;
        this.isRunning = false;

        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    start() {
        if (this.isRunning) return;
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createGround();
        this.createAirport();
        this.createAircraft();
        this.createHUD();
        this.bindEvents();
        this.isRunning = true;
        this.clock.start();
        this.animate();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87b9e8);
        this.scene.fog = new THREE.Fog(0x87b9e8, 3500, 15000);
    }

    createCamera() {
        const width = Math.max(this.container.clientWidth, 1);
        const height = Math.max(this.container.clientHeight, 1);
        this.camera = new THREE.PerspectiveCamera(62, width / height, 0.08, 30000);
    }

    createRenderer() {
        document.querySelector("#startup-status")?.remove();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight, false);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }

    createLights() {
        this.scene.add(new THREE.HemisphereLight(0xd9efff, 0x3d5134, 2));
        const sunlight = new THREE.DirectionalLight(0xffffff, 2.4);
        sunlight.position.set(900, 1400, 700);
        sunlight.castShadow = true;
        sunlight.shadow.mapSize.set(2048, 2048);
        this.scene.add(sunlight);
    }

    createGround() {
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(20000, 20000),
            new THREE.MeshStandardMaterial({ color: 0x557744, roughness: 1 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    createAirport() {
        const airport = new THREE.Group();
        airport.name = "JFKAirport";
        airport.add(createRunways(), createRunwayMarkings());
        this.scene.add(airport);
    }

    createAircraft() {
        this.aircraft = createSky172();
        this.aircraft.position.set(0, 0.12, 1250);
        this.aircraft.rotation.order = "YXZ";
        this.scene.add(this.aircraft);
        this.updateAircraftRotation();
        this.updateCamera();
    }

    createHUD() {
        this.hud = new FlightHUD();
        this.updateHUD();
    }

    bindEvents() {
        window.addEventListener("resize", this.handleResize);
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
    }

    handleKeyDown(event) {
        const keys = ["KeyW", "KeyS", "KeyA", "KeyD", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "KeyC"];
        if (keys.includes(event.code)) event.preventDefault();
        if (event.code === "KeyC" && !event.repeat) {
            this.cameraModeIndex = (this.cameraModeIndex + 1) % this.cameraModes.length;
            this.cameraMode = this.cameraModes[this.cameraModeIndex];
            return;
        }
        this.keys.add(event.code);
    }

    handleKeyUp(event) {
        this.keys.delete(event.code);
    }

    action(codes, touchAction) {
        return codes.some((code) => this.keys.has(code)) || Boolean(this.hud?.isControlActive(touchAction));
    }

    updateControls(deltaTime) {
        if (this.action(["KeyW"], "throttleUp")) this.flightState.throttle += 0.35 * deltaTime;
        if (this.action(["KeyS"], "throttleDown")) this.flightState.throttle -= 0.35 * deltaTime;
        this.flightState.throttle = THREE.MathUtils.clamp(this.flightState.throttle, 0, 1);
        this.flightState.brakeActive = this.action(["Space"], "brake");

        const left = this.action(["KeyA", "ArrowLeft"], "turnLeft");
        const right = this.action(["KeyD", "ArrowRight"], "turnRight");
        const pitchUp = this.action(["ArrowDown"], "pitchUp");
        const pitchDown = this.action(["ArrowUp"], "pitchDown");

        if (this.flightState.airborne) {
            this.updateAirControls(deltaTime, left, right, pitchUp, pitchDown);
        } else {
            this.updateGroundControls(deltaTime, left, right, pitchUp, pitchDown);
        }
    }

    updateGroundControls(deltaTime, left, right, pitchUp, pitchDown) {
        const speed = this.flightState.speedMetersPerSecond;
        const steering = THREE.MathUtils.clamp(speed / 4, 0, 1);
        const rate = THREE.MathUtils.degToRad(24);
        if (left) this.flightState.heading += rate * steering * deltaTime;
        if (right) this.flightState.heading -= rate * steering * deltaTime;
        if (pitchUp && speed >= 27) this.flightState.pitch += THREE.MathUtils.degToRad(18) * deltaTime;
        if (pitchDown) this.flightState.pitch -= THREE.MathUtils.degToRad(18) * deltaTime;
        this.flightState.pitch = THREE.MathUtils.clamp(this.flightState.pitch, 0, THREE.MathUtils.degToRad(12));
        if (!pitchUp && !pitchDown) this.flightState.pitch = THREE.MathUtils.damp(this.flightState.pitch, 0, 7, deltaTime);
        this.flightState.roll = THREE.MathUtils.damp(this.flightState.roll, 0, 8, deltaTime);
    }

    updateAirControls(deltaTime, left, right, pitchUp, pitchDown) {
        if (pitchUp) this.flightState.pitch += THREE.MathUtils.degToRad(22) * deltaTime;
        if (pitchDown) this.flightState.pitch -= THREE.MathUtils.degToRad(22) * deltaTime;
        if (left) this.flightState.roll += THREE.MathUtils.degToRad(42) * deltaTime;
        if (right) this.flightState.roll -= THREE.MathUtils.degToRad(42) * deltaTime;
        if (!left && !right) this.flightState.roll = THREE.MathUtils.damp(this.flightState.roll, 0, 2.5, deltaTime);
        this.flightState.pitch = THREE.MathUtils.clamp(this.flightState.pitch, THREE.MathUtils.degToRad(-18), THREE.MathUtils.degToRad(24));
        this.flightState.roll = THREE.MathUtils.clamp(this.flightState.roll, THREE.MathUtils.degToRad(-45), THREE.MathUtils.degToRad(45));
        this.flightState.heading += Math.sin(this.flightState.roll) * THREE.MathUtils.degToRad(18) * deltaTime;
    }

    updatePhysics(deltaTime) {
        const speed = this.flightState.speedMetersPerSecond;
        const acceleration = this.flightState.throttle * (this.flightState.airborne ? 2.6 : 4.8) - 0.7 - 0.002 * speed * speed - (this.flightState.brakeActive ? 12 : 0);
        this.flightState.speedMetersPerSecond = THREE.MathUtils.clamp(speed + acceleration * deltaTime, 0, 75);

        if (!this.flightState.airborne && this.flightState.speedMetersPerSecond >= 27 && this.flightState.pitch >= THREE.MathUtils.degToRad(5)) {
            this.flightState.airborne = true;
            this.flightState.verticalSpeed = 1.5;
        }

        this.forwardVector.set(-Math.sin(this.flightState.heading), 0, -Math.cos(this.flightState.heading));
        this.aircraft.position.addScaledVector(this.forwardVector, this.flightState.speedMetersPerSecond * deltaTime);

        if (this.flightState.airborne) {
            const targetVerticalSpeed = Math.sin(this.flightState.pitch) * this.flightState.speedMetersPerSecond * 0.52 + Math.max(0, this.flightState.speedMetersPerSecond - 23) * 0.08 - 1.2;
            this.flightState.verticalSpeed = THREE.MathUtils.damp(this.flightState.verticalSpeed, targetVerticalSpeed, 2, deltaTime);
            this.aircraft.position.y += this.flightState.verticalSpeed * deltaTime;
            if (this.aircraft.position.y <= 0.12 && this.flightState.verticalSpeed <= 0) {
                this.aircraft.position.y = 0.12;
                this.flightState.airborne = false;
                this.flightState.verticalSpeed = 0;
                this.flightState.roll = 0;
            }
        } else {
            this.aircraft.position.y = 0.12;
        }

        this.flightState.altitudeMeters = Math.max(0, this.aircraft.position.y - 0.12);
    }

    updateAircraftRotation() {
        this.aircraft.rotation.set(this.flightState.pitch, this.flightState.heading, this.flightState.roll, "YXZ");
    }

    updatePropeller(deltaTime) {
        const propeller = this.aircraft?.userData.propeller;
        if (propeller) propeller.rotation.z += (5 + this.flightState.throttle * 70) * deltaTime;
    }

    updateCamera() {
        if (!this.aircraft || !this.camera) return;
        const cockpitMode = this.cameraMode === "COCKPIT";
        const mount = cockpitMode ? this.aircraft.userData.cockpitCameraMount : this.aircraft.userData.chaseCameraMount;
        const target = cockpitMode ? this.aircraft.userData.cockpitLookTarget : this.aircraft.userData.chaseLookTarget;
        if (!mount || !target) return;
        this.aircraft.updateMatrixWorld(true);
        mount.getWorldPosition(this.cameraPosition);
        target.getWorldPosition(this.cameraTarget);
        this.camera.position.copy(this.cameraPosition);
        this.camera.up.set(0, 1, 0).applyQuaternion(cockpitMode ? this.aircraft.quaternion : new THREE.Quaternion());
        this.camera.lookAt(this.cameraTarget);
    }

    updateHUD() {
        this.hud?.update({
            aircraftName: "NOVA SKY 172",
            speedKmh: this.flightState.speedMetersPerSecond * 3.6,
            altitudeMeters: this.flightState.altitudeMeters,
            throttle: this.flightState.throttle,
            pitchDegrees: THREE.MathUtils.radToDeg(this.flightState.pitch),
            brakeActive: this.flightState.brakeActive,
            airborne: this.flightState.airborne,
            cameraMode: this.cameraMode
        });
    }

    update(deltaTime) {
        this.updateControls(deltaTime);
        this.updatePhysics(deltaTime);
        this.updateAircraftRotation();
        this.updatePropeller(deltaTime);
        this.updateCamera();
        this.updateHUD();
    }

    animate() {
        if (!this.isRunning) return;
        this.animationFrameId = window.requestAnimationFrame(this.animate);
        const deltaTime = Math.min(this.clock.getDelta(), 1 / 20);
        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        const width = Math.max(this.container.clientWidth, 1);
        const height = Math.max(this.container.clientHeight, 1);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(width, height, false);
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        window.cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener("resize", this.handleResize);
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);
        this.keys.clear();
        this.clock.stop();
    }
}
