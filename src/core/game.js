import * as THREE from "three";
import { createRunways } from "../airport/JFK/createrunways.js";
import { createRunwayMarkings } from "../airport/JFK/createrunwaymarkings.js";
import { createSky172 } from "../aircraft/general/createsky172.js";
import { FlightHUD } from "../ui/flighthud.js";
import { CameraManager } from "./cameramanager.js";

export class Game {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.cameraManager = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.aircraft = null;
        this.hud = null;
        this.keys = new Set();

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
        this.animationFrameId = null;
        this.isRunning = false;

        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    start() {
        if (this.isRunning) {
            return;
        }

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

        console.log("Nova Flight Simulator started successfully.");
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87b9e8);
        this.scene.fog = new THREE.Fog(0x87b9e8, 3500, 15000);
    }

    createCamera() {
        const width = Math.max(this.container.clientWidth, 1);
        const height = Math.max(this.container.clientHeight, 1);

        this.camera = new THREE.PerspectiveCamera(
            55,
            width / height,
            0.25,
            20000
        );

        this.cameraManager = new CameraManager(this.camera);
    }

    createRenderer() {
        document.querySelector("#startup-status")?.remove();

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight,
            false
        );

        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = false;
        this.container.appendChild(this.renderer.domElement);
    }

    createLights() {
        const hemisphereLight = new THREE.HemisphereLight(
            0xd9efff,
            0x3d5134,
            2
        );

        this.scene.add(hemisphereLight);

        const sunlight = new THREE.DirectionalLight(
            0xffffff,
            2.4
        );

        sunlight.position.set(900, 1400, 700);
        sunlight.castShadow = false;
        this.scene.add(sunlight);
    }

    createGround() {
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(20000, 20000),
            new THREE.MeshStandardMaterial({
                color: 0x557744,
                roughness: 1,
                metalness: 0
            })
        );

        ground.name = "AirportGround";
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.08;
        ground.receiveShadow = false;
        this.scene.add(ground);
    }

    createAirport() {
        const airport = new THREE.Group();
        airport.name = "JFKAirport";
        airport.add(
            createRunways(),
            createRunwayMarkings()
        );
        this.scene.add(airport);
    }

    createAircraft() {
        this.aircraft = createSky172();
        this.aircraft.position.set(0, 0.12, 1250);
        this.aircraft.rotation.order = "YXZ";
        this.scene.add(this.aircraft);
        this.updateAircraftRotation();
        this.cameraManager.update(
            this.aircraft,
            this.flightState
        );
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
        const controlledKeys = [
            "KeyW",
            "KeyS",
            "KeyA",
            "KeyD",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Space",
            "KeyC"
        ];

        if (controlledKeys.includes(event.code)) {
            event.preventDefault();
        }

        if (event.code === "KeyC" && !event.repeat) {
            this.cameraManager?.toggle();
            return;
        }

        this.keys.add(event.code);
    }

    handleKeyUp(event) {
        this.keys.delete(event.code);
    }

    isActionActive(keyboardCodes, touchAction) {
        const keyboardActive = keyboardCodes.some(
            (code) => this.keys.has(code)
        );

        const touchActive = this.hud?.isControlActive(
            touchAction
        );

        return Boolean(keyboardActive || touchActive);
    }

    updateControls(deltaTime) {
        const throttleRate = 0.35;

        if (this.isActionActive(["KeyW"], "throttleUp")) {
            this.flightState.throttle += throttleRate * deltaTime;
        }

        if (this.isActionActive(["KeyS"], "throttleDown")) {
            this.flightState.throttle -= throttleRate * deltaTime;
        }

        this.flightState.throttle = THREE.MathUtils.clamp(
            this.flightState.throttle,
            0,
            1
        );

        this.flightState.brakeActive = this.isActionActive(
            ["Space"],
            "brake"
        );

        const turnLeft = this.isActionActive(
            ["KeyA", "ArrowLeft"],
            "turnLeft"
        );

        const turnRight = this.isActionActive(
            ["KeyD", "ArrowRight"],
            "turnRight"
        );

        const pitchUp = this.isActionActive(
            ["ArrowDown"],
            "pitchUp"
        );

        const pitchDown = this.isActionActive(
            ["ArrowUp"],
            "pitchDown"
        );

        if (this.flightState.airborne) {
            this.updateAirControls(
                deltaTime,
                turnLeft,
                turnRight,
                pitchUp,
                pitchDown
            );
        } else {
            this.updateGroundControls(
                deltaTime,
                turnLeft,
                turnRight,
                pitchUp,
                pitchDown
            );
        }
    }

    updateGroundControls(
        deltaTime,
        turnLeft,
        turnRight,
        pitchUp,
        pitchDown
    ) {
        const speed = this.flightState.speedMetersPerSecond;
        const steeringEffect = THREE.MathUtils.clamp(
            speed / 4,
            0,
            1
        );
        const steeringRate = THREE.MathUtils.degToRad(24);

        if (turnLeft) {
            this.flightState.heading +=
                steeringRate * steeringEffect * deltaTime;
        }

        if (turnRight) {
            this.flightState.heading -=
                steeringRate * steeringEffect * deltaTime;
        }

        if (pitchUp && speed >= 27) {
            this.flightState.pitch +=
                THREE.MathUtils.degToRad(18) * deltaTime;
        }

        if (pitchDown) {
            this.flightState.pitch -=
                THREE.MathUtils.degToRad(18) * deltaTime;
        }

        this.flightState.pitch = THREE.MathUtils.clamp(
            this.flightState.pitch,
            0,
            THREE.MathUtils.degToRad(12)
        );

        if (!pitchUp && !pitchDown) {
            this.flightState.pitch = THREE.MathUtils.damp(
                this.flightState.pitch,
                0,
                7,
                deltaTime
            );
        }

        this.flightState.roll = THREE.MathUtils.damp(
            this.flightState.roll,
            0,
            8,
            deltaTime
        );
    }

    updateAirControls(
        deltaTime,
        turnLeft,
        turnRight,
        pitchUp,
        pitchDown
    ) {
        if (pitchUp) {
            this.flightState.pitch +=
                THREE.MathUtils.degToRad(22) * deltaTime;
        }

        if (pitchDown) {
            this.flightState.pitch -=
                THREE.MathUtils.degToRad(22) * deltaTime;
        }

        if (turnLeft) {
            this.flightState.roll +=
                THREE.MathUtils.degToRad(42) * deltaTime;
        }

        if (turnRight) {
            this.flightState.roll -=
                THREE.MathUtils.degToRad(42) * deltaTime;
        }

        if (!turnLeft && !turnRight) {
            this.flightState.roll = THREE.MathUtils.damp(
                this.flightState.roll,
                0,
                2.5,
                deltaTime
            );
        }

        this.flightState.pitch = THREE.MathUtils.clamp(
            this.flightState.pitch,
            THREE.MathUtils.degToRad(-18),
            THREE.MathUtils.degToRad(24)
        );

        this.flightState.roll = THREE.MathUtils.clamp(
            this.flightState.roll,
            THREE.MathUtils.degToRad(-45),
            THREE.MathUtils.degToRad(45)
        );

        this.flightState.heading +=
            Math.sin(this.flightState.roll) *
            THREE.MathUtils.degToRad(18) *
            deltaTime;
    }

    updatePhysics(deltaTime) {
        const speed = this.flightState.speedMetersPerSecond;
        const engineAcceleration =
            this.flightState.throttle *
            (this.flightState.airborne ? 2.6 : 4.8);
        const rollingResistance = this.flightState.airborne ? 0 : 0.7;
        const aerodynamicDrag = 0.002 * speed * speed;
        const brakeDeceleration =
            this.flightState.brakeActive &&
            !this.flightState.airborne
                ? 12
                : 0;

        const acceleration =
            engineAcceleration -
            rollingResistance -
            aerodynamicDrag -
            brakeDeceleration;

        this.flightState.speedMetersPerSecond =
            THREE.MathUtils.clamp(
                speed + acceleration * deltaTime,
                0,
                75
            );

        if (
            !this.flightState.airborne &&
            this.flightState.speedMetersPerSecond >= 27 &&
            this.flightState.pitch >= THREE.MathUtils.degToRad(5)
        ) {
            this.flightState.airborne = true;
            this.flightState.verticalSpeed = 1.5;
        }

        this.forwardVector.set(
            -Math.sin(this.flightState.heading),
            0,
            -Math.cos(this.flightState.heading)
        );

        this.aircraft.position.addScaledVector(
            this.forwardVector,
            this.flightState.speedMetersPerSecond * deltaTime
        );

        if (this.flightState.airborne) {
            const targetVerticalSpeed =
                Math.sin(this.flightState.pitch) *
                this.flightState.speedMetersPerSecond *
                0.52 +
                Math.max(
                    0,
                    this.flightState.speedMetersPerSecond - 23
                ) *
                0.08 -
                1.2;

            this.flightState.verticalSpeed = THREE.MathUtils.damp(
                this.flightState.verticalSpeed,
                targetVerticalSpeed,
                2,
                deltaTime
            );

            this.aircraft.position.y +=
                this.flightState.verticalSpeed * deltaTime;

            if (
                this.aircraft.position.y <= 0.12 &&
                this.flightState.verticalSpeed <= 0
            ) {
                this.aircraft.position.y = 0.12;
                this.flightState.airborne = false;
                this.flightState.verticalSpeed = 0;
                this.flightState.roll = 0;
            }
        } else {
            this.aircraft.position.y = 0.12;
        }

        this.flightState.altitudeMeters = Math.max(
            0,
            this.aircraft.position.y - 0.12
        );
    }

    updateAircraftRotation() {
        this.aircraft.rotation.set(
            this.flightState.pitch,
            this.flightState.heading,
            this.flightState.roll,
            "YXZ"
        );
    }

    updatePropeller(deltaTime) {
        const propeller = this.aircraft?.userData.propeller;

        if (!propeller) {
            return;
        }

        propeller.rotation.z +=
            (5 + this.flightState.throttle * 70) * deltaTime;
    }

    updateHUD() {
        this.hud?.update({
            aircraftName: "NOVA SKY 172",
            speedKmh:
                this.flightState.speedMetersPerSecond * 3.6,
            altitudeMeters:
                this.flightState.altitudeMeters,
            throttle:
                this.flightState.throttle,
            pitchDegrees:
                THREE.MathUtils.radToDeg(
                    this.flightState.pitch
                ),
            brakeActive:
                this.flightState.brakeActive,
            airborne:
                this.flightState.airborne,
            cameraMode:
                this.cameraManager?.mode || "CHASE"
        });
    }

    update(deltaTime) {
        if (!this.aircraft) {
            return;
        }

        this.updateControls(deltaTime);
        this.updatePhysics(deltaTime);
        this.updateAircraftRotation();
        this.updatePropeller(deltaTime);

        this.cameraManager?.update(
            this.aircraft,
            this.flightState
        );

        this.updateHUD();
    }

    animate() {
        if (!this.isRunning) {
            return;
        }

        this.animationFrameId =
            window.requestAnimationFrame(this.animate);

        const deltaTime = Math.min(
            this.clock.getDelta(),
            1 / 20
        );

        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        if (!this.camera || !this.renderer) {
            return;
        }

        const width = Math.max(this.container.clientWidth, 1);
        const height = Math.max(this.container.clientHeight, 1);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        this.renderer.setSize(width, height, false);
    }

    stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;

        if (this.animationFrameId !== null) {
            window.cancelAnimationFrame(this.animationFrameId);
        }

        window.removeEventListener("resize", this.handleResize);
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);

        this.keys.clear();
        this.clock.stop();
    }

    dispose() {
        this.stop();
        this.hud?.dispose();

        this.scene?.traverse((object) => {
            object.geometry?.dispose();

            if (Array.isArray(object.material)) {
                object.material.forEach((material) => {
                    material.dispose();
                });
            } else {
                object.material?.dispose();
            }
        });

        this.renderer?.dispose();
        this.renderer?.domElement.remove();

        this.aircraft = null;
        this.hud = null;
        this.cameraManager = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }
}
