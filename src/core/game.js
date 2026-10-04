import * as THREE from "three";

import {
    createRunways
} from "../airport/JFK/createrunways.js";

import {
    createRunwayMarkings
} from "../airport/JFK/createrunwaymarkings.js";

import {
    createSky172
} from "../aircraft/general/createsky172.js";

import {
    FlightHUD
} from "../ui/flighthud.js";

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

        this.cameraModes = [
            "CHASE",
            "COCKPIT"
        ];

        this.cameraModeIndex = 0;
        this.cameraMode = this.cameraModes[0];

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

        this.cameraOffset = new THREE.Vector3(
            0,
            5.5,
            18
        );

        this.cameraTargetOffset = new THREE.Vector3(
            0,
            2.0,
            -10
        );

        this.cockpitOffset = new THREE.Vector3(
            0,
            2.18,
            -1.35
        );

        this.cockpitTargetOffset = new THREE.Vector3(
            0,
            2.1,
            -50
        );

        this.desiredCameraPosition = new THREE.Vector3();
        this.desiredCameraTarget = new THREE.Vector3();
        this.smoothedCameraTarget = new THREE.Vector3();
        this.cameraHeadingQuaternion = new THREE.Quaternion();
        this.worldUpAxis = new THREE.Vector3(0, 1, 0);
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
        this.scene.fog = new THREE.Fog(
            0x87b9e8,
            3500,
            15000
        );
    }

    createCamera() {
        const width = Math.max(
            this.container.clientWidth,
            1
        );

        const height = Math.max(
            this.container.clientHeight,
            1
        );

        this.camera = new THREE.PerspectiveCamera(
            58,
            width / height,
            0.1,
            30000
        );

        this.camera.position.set(
            0,
            5.62,
            1268
        );

        this.camera.lookAt(
            0,
            1.92,
            1228
        );
    }

    createRenderer() {
        const startupStatus = document.querySelector(
            "#startup-status"
        );

        if (startupStatus) {
            startupStatus.remove();
        }

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
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(
            this.renderer.domElement
        );
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

        sunlight.position.set(
            900,
            1400,
            700
        );

        sunlight.castShadow = true;
        sunlight.shadow.mapSize.set(2048, 2048);
        sunlight.shadow.camera.left = -2200;
        sunlight.shadow.camera.right = 2200;
        sunlight.shadow.camera.top = 2200;
        sunlight.shadow.camera.bottom = -2200;
        sunlight.shadow.camera.near = 1;
        sunlight.shadow.camera.far = 5000;

        this.scene.add(sunlight);
    }

    createGround() {
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(
                20000,
                20000
            ),
            new THREE.MeshStandardMaterial({
                color: 0x557744,
                roughness: 1,
                metalness: 0
            })
        );

        ground.name = "AirportGround";
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        ground.receiveShadow = true;

        this.scene.add(ground);

        const grid = new THREE.GridHelper(
            5000,
            100,
            0x73896c,
            0x5f7659
        );

        grid.name = "DevelopmentGrid";
        grid.position.y = 0.005;
        grid.material.transparent = true;
        grid.material.opacity = 0.14;
        grid.material.depthWrite = false;

        this.scene.add(grid);
    }

    createAirport() {
        const airportGroup = new THREE.Group();
        airportGroup.name = "JFKAirport";

        airportGroup.add(
            createRunways(),
            createRunwayMarkings()
        );

        this.scene.add(airportGroup);
    }

    createAircraft() {
        this.aircraft = createSky172();

        this.aircraft.position.set(
            0,
            0.12,
            1250
        );

        this.aircraft.rotation.order = "YXZ";

        this.scene.add(this.aircraft);
        this.updateAircraftRotation();

        this.camera.position.set(
            0,
            this.aircraft.position.y + 5.5,
            this.aircraft.position.z + 18
        );

        this.smoothedCameraTarget.set(
            0,
            this.aircraft.position.y + 1.8,
            this.aircraft.position.z - 22
        );

        this.camera.lookAt(
            this.smoothedCameraTarget
        );
    }

    createHUD() {
        this.hud = new FlightHUD();
        this.updateHUD();
    }

    bindEvents() {
        window.addEventListener(
            "resize",
            this.handleResize
        );

        window.addEventListener(
            "keydown",
            this.handleKeyDown
        );

        window.addEventListener(
            "keyup",
            this.handleKeyUp
        );
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
            this.cycleCameraMode();
            return;
        }

        this.keys.add(event.code);
    }

    handleKeyUp(event) {
        this.keys.delete(event.code);
    }

    cycleCameraMode() {
        this.cameraModeIndex =
            (this.cameraModeIndex + 1) %
            this.cameraModes.length;

        this.cameraMode =
            this.cameraModes[this.cameraModeIndex];

        console.log(
            `Camera mode: ${this.cameraMode}`
        );
    }

    isActionActive(keyboardCodes, touchAction) {
        const keyboardActive = keyboardCodes.some(
            (code) => this.keys.has(code)
        );

        const touchActive = this.hud?.isControlActive(
            touchAction
        );

        return Boolean(
            keyboardActive || touchActive
        );
    }

    updateControls(deltaTime) {
        const throttleRate = 0.35;

        if (
            this.isActionActive(
                ["KeyW"],
                "throttleUp"
            )
        ) {
            this.flightState.throttle +=
                throttleRate * deltaTime;
        }

        if (
            this.isActionActive(
                ["KeyS"],
                "throttleDown"
            )
        ) {
            this.flightState.throttle -=
                throttleRate * deltaTime;
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
            this.updateGroundSteering(
                deltaTime,
                turnLeft,
                turnRight,
                pitchUp,
                pitchDown
            );
        }
    }

    updateGroundSteering(
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

        const takeoffSpeed = 27;

        if (pitchUp && speed >= takeoffSpeed) {
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
        const pitchRate = THREE.MathUtils.degToRad(22);
        const rollRate = THREE.MathUtils.degToRad(42);

        if (pitchUp) {
            this.flightState.pitch += pitchRate * deltaTime;
        }

        if (pitchDown) {
            this.flightState.pitch -= pitchRate * deltaTime;
        }

        if (turnLeft) {
            this.flightState.roll += rollRate * deltaTime;
        }

        if (turnRight) {
            this.flightState.roll -= rollRate * deltaTime;
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

    updateGroundPhysics(deltaTime) {
        const speed = this.flightState.speedMetersPerSecond;

        const engineAcceleration =
            4.8 * this.flightState.throttle;

        const rollingResistance = 0.7;
        const aerodynamicDrag = 0.0022 * speed * speed;

        let acceleration =
            engineAcceleration -
            rollingResistance -
            aerodynamicDrag;

        if (this.flightState.brakeActive) {
            acceleration -= 12;
        }

        this.flightState.speedMetersPerSecond +=
            acceleration * deltaTime;

        this.flightState.speedMetersPerSecond =
            THREE.MathUtils.clamp(
                this.flightState.speedMetersPerSecond,
                0,
                62
            );

        const takeoffSpeed = 27;
        const takeoffPitch = THREE.MathUtils.degToRad(5);

        if (
            this.flightState.speedMetersPerSecond >=
                takeoffSpeed &&
            this.flightState.pitch >= takeoffPitch
        ) {
            this.flightState.airborne = true;
            this.flightState.verticalSpeed = 1.5;
        }

        this.updateForwardMovement(deltaTime);

        this.aircraft.position.y = 0.12;
        this.flightState.altitudeMeters = 0;
    }

    updateAirPhysics(deltaTime) {
        const speed = this.flightState.speedMetersPerSecond;

        const engineAcceleration =
            this.flightState.throttle * 2.6;

        const aerodynamicDrag = 0.0016 * speed * speed;

        const acceleration =
            engineAcceleration -
            aerodynamicDrag -
            0.15;

        this.flightState.speedMetersPerSecond +=
            acceleration * deltaTime;

        this.flightState.speedMetersPerSecond =
            THREE.MathUtils.clamp(
                this.flightState.speedMetersPerSecond,
                18,
                75
            );

        const pitchLift =
            Math.sin(this.flightState.pitch) *
            speed *
            0.52;

        const baseLift = Math.max(0, speed - 23) * 0.08;
        const gravityEffect = 1.2;

        const targetVerticalSpeed =
            pitchLift + baseLift - gravityEffect;

        this.flightState.verticalSpeed = THREE.MathUtils.damp(
            this.flightState.verticalSpeed,
            targetVerticalSpeed,
            2,
            deltaTime
        );

        this.aircraft.position.y +=
            this.flightState.verticalSpeed * deltaTime;

        this.updateForwardMovement(deltaTime);

        if (
            this.aircraft.position.y <= 0.12 &&
            this.flightState.verticalSpeed <= 0
        ) {
            this.aircraft.position.y = 0.12;
            this.flightState.airborne = false;
            this.flightState.verticalSpeed = 0;
            this.flightState.pitch = Math.max(
                0,
                this.flightState.pitch
            );
            this.flightState.roll = 0;
        }

        this.flightState.altitudeMeters = Math.max(
            0,
            this.aircraft.position.y - 0.12
        );
    }

    updateForwardMovement(deltaTime) {
        this.forwardVector.set(
            -Math.sin(this.flightState.heading),
            0,
            -Math.cos(this.flightState.heading)
        );

        this.aircraft.position.addScaledVector(
            this.forwardVector,
            this.flightState.speedMetersPerSecond * deltaTime
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

        const rotationSpeed =
            5 + this.flightState.throttle * 70;

        propeller.rotation.z += rotationSpeed * deltaTime;
    }

    updateCamera(deltaTime) {
        if (!this.aircraft || !this.camera) {
            return;
        }

        this.cameraHeadingQuaternion.setFromAxisAngle(
            this.worldUpAxis,
            this.flightState.heading
        );

        if (this.cameraMode === "COCKPIT") {
            this.updateCockpitCamera();
            return;
        }

        this.updateChaseCamera(deltaTime);
    }

    updateChaseCamera(deltaTime) {
        void deltaTime;

        if (!this.flightState.airborne) {
            this.desiredCameraPosition.set(
                0,
                this.aircraft.position.y + 5.5,
                this.aircraft.position.z + 18
            );

            this.desiredCameraTarget.set(
                0,
                this.aircraft.position.y + 1.8,
                this.aircraft.position.z - 22
            );
        } else {
            this.desiredCameraPosition
                .copy(this.cameraOffset)
                .applyQuaternion(
                    this.cameraHeadingQuaternion
                )
                .add(this.aircraft.position);

            this.desiredCameraTarget
                .copy(this.cameraTargetOffset)
                .applyQuaternion(
                    this.cameraHeadingQuaternion
                )
                .add(this.aircraft.position);
        }

        this.camera.position.copy(
            this.desiredCameraPosition
        );

        this.camera.up.set(0, 1, 0);

        this.camera.lookAt(
            this.desiredCameraTarget
        );
    }

    updateCockpitCamera() {
        this.desiredCameraPosition
            .copy(this.cockpitOffset)
            .applyQuaternion(
                this.aircraft.quaternion
            )
            .add(this.aircraft.position);

        this.desiredCameraTarget
            .copy(this.cockpitTargetOffset)
            .applyQuaternion(
                this.aircraft.quaternion
            )
            .add(this.aircraft.position);

        this.camera.position.copy(
            this.desiredCameraPosition
        );

        this.camera.up
            .set(0, 1, 0)
            .applyQuaternion(
                this.aircraft.quaternion
            );

        this.camera.lookAt(
            this.desiredCameraTarget
        );
    }

    updateHUD() {
        if (!this.hud || !this.aircraft) {
            return;
        }

        this.hud.update({
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
                this.cameraMode
        });
    }

    update(deltaTime) {
        if (!this.aircraft) {
            return;
        }

        this.updateControls(deltaTime);

        if (this.flightState.airborne) {
            this.updateAirPhysics(deltaTime);
        } else {
            this.updateGroundPhysics(deltaTime);
        }

        this.updateAircraftRotation();
        this.updatePropeller(deltaTime);
        this.updateCamera(deltaTime);
        this.updateHUD();
    }

    animate() {
        if (!this.isRunning) {
            return;
        }

        this.animationFrameId =
            window.requestAnimationFrame(
                this.animate
            );

        const deltaTime = Math.min(
            this.clock.getDelta(),
            1 / 20
        );

        this.update(deltaTime);

        this.renderer.render(
            this.scene,
            this.camera
        );
    }

    handleResize() {
        if (!this.camera || !this.renderer) {
            return;
        }

        const width = Math.max(
            this.container.clientWidth,
            1
        );

        const height = Math.max(
            this.container.clientHeight,
            1
        );

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        this.renderer.setSize(
            width,
            height,
            false
        );
    }

    stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;

        if (this.animationFrameId !== null) {
            window.cancelAnimationFrame(
                this.animationFrameId
            );
        }

        window.removeEventListener(
            "resize",
            this.handleResize
        );

        window.removeEventListener(
            "keydown",
            this.handleKeyDown
        );

        window.removeEventListener(
            "keyup",
            this.handleKeyUp
        );

        this.keys.clear();
        this.clock.stop();
    }

    dispose() {
        this.stop();
        this.hud?.dispose();

        this.scene?.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }

            if (Array.isArray(object.material)) {
                object.material.forEach((material) => {
                    material.dispose();
                });
            } else if (object.material) {
                object.material.dispose();
            }
        });

        this.renderer?.dispose();
        this.renderer?.domElement.remove();

        this.aircraft = null;
        this.hud = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }
}
