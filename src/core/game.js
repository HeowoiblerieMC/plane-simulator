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

        this.flightState = {
            throttle: 0,
            speedMetersPerSecond: 0,
            brakeActive: false,
            altitudeMeters: 0
        };

        this.cameraOffset =
            new THREE.Vector3(
                14,
                7,
                24
            );

        this.cameraTargetOffset =
            new THREE.Vector3(
                0,
                1.5,
                -10
            );

        this.desiredCameraPosition =
            new THREE.Vector3();

        this.desiredCameraTarget =
            new THREE.Vector3();

        this.animationFrameId = null;
        this.isRunning = false;

        this.animate = this.animate.bind(this);
        this.handleResize =
            this.handleResize.bind(this);

        this.handleKeyDown =
            this.handleKeyDown.bind(this);

        this.handleKeyUp =
            this.handleKeyUp.bind(this);
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

        console.log(
            "Nova Flight Simulator started successfully."
        );
    }

    createScene() {
        this.scene = new THREE.Scene();

        this.scene.background =
            new THREE.Color(0x87b9e8);

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

        this.camera =
            new THREE.PerspectiveCamera(
                55,
                width / height,
                0.1,
                30000
            );

        this.camera.position.set(
            14,
            8,
            1276
        );
    }

    createRenderer() {
        const startupStatus =
            document.querySelector(
                "#startup-status"
            );

        if (startupStatus) {
            startupStatus.remove();
        }

        this.renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                powerPreference: "high-performance"
            });

        this.renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );

        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight,
            false
        );

        this.renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        this.container.appendChild(
            this.renderer.domElement
        );
    }

    createLights() {
        const hemisphereLight =
            new THREE.HemisphereLight(
                0xd9efff,
                0x3d5134,
                2
            );

        this.scene.add(hemisphereLight);

        const sunlight =
            new THREE.DirectionalLight(
                0xffffff,
                2.4
            );

        sunlight.position.set(
            900,
            1400,
            700
        );

        sunlight.castShadow = true;

        sunlight.shadow.mapSize.set(
            2048,
            2048
        );

        sunlight.shadow.camera.left = -2200;
        sunlight.shadow.camera.right = 2200;
        sunlight.shadow.camera.top = 2200;
        sunlight.shadow.camera.bottom = -2200;
        sunlight.shadow.camera.near = 1;
        sunlight.shadow.camera.far = 5000;

        this.scene.add(sunlight);
    }

    createGround() {
        const groundGeometry =
            new THREE.PlaneGeometry(
                20000,
                20000
            );

        const groundMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x557744,
                roughness: 1,
                metalness: 0
            });

        const ground = new THREE.Mesh(
            groundGeometry,
            groundMaterial
        );

        ground.name = "AirportGround";
        ground.rotation.x =
            -Math.PI / 2;

        ground.position.y = -0.01;
        ground.receiveShadow = true;

        this.scene.add(ground);

        const grid =
            new THREE.GridHelper(
                5000,
                100,
                0x73896c,
                0x5f7659
            );

        grid.name = "DevelopmentGrid";
        grid.position.y = 0.005;
        grid.material.transparent = true;
        grid.material.opacity = 0.16;
        grid.material.depthWrite = false;

        this.scene.add(grid);
    }

    createAirport() {
        const airportGroup =
            new THREE.Group();

        airportGroup.name = "JFKAirport";

        const runways =
            createRunways();

        const runwayMarkings =
            createRunwayMarkings();

        airportGroup.add(
            runways,
            runwayMarkings
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

        this.aircraft.rotation.set(
            0,
            0,
            0
        );

        this.scene.add(this.aircraft);

        this.updateCamera(1);
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
        if (
            event.code === "KeyW" ||
            event.code === "KeyS" ||
            event.code === "Space"
        ) {
            event.preventDefault();
        }

        this.keys.add(event.code);
    }

    handleKeyUp(event) {
        this.keys.delete(event.code);
    }

    isThrottleUpActive() {
        return (
            this.keys.has("KeyW") ||
            this.hud?.isControlActive(
                "throttleUp"
            )
        );
    }

    isThrottleDownActive() {
        return (
            this.keys.has("KeyS") ||
            this.hud?.isControlActive(
                "throttleDown"
            )
        );
    }

    isBrakeActive() {
        return (
            this.keys.has("Space") ||
            this.hud?.isControlActive(
                "brake"
            )
        );
    }

    updateControls(deltaTime) {
        const throttleChangeRate = 0.35;

        if (this.isThrottleUpActive()) {
            this.flightState.throttle +=
                throttleChangeRate * deltaTime;
        }

        if (this.isThrottleDownActive()) {
            this.flightState.throttle -=
                throttleChangeRate * deltaTime;
        }

        this.flightState.throttle =
            THREE.MathUtils.clamp(
                this.flightState.throttle,
                0,
                1
            );

        this.flightState.brakeActive =
            this.isBrakeActive();
    }

    updateGroundPhysics(deltaTime) {
        const maximumGroundSpeed = 62;
        const engineAcceleration = 4.8;
        const rollingResistance = 0.7;
        const aerodynamicResistance = 0.0022;
        const brakeDeceleration = 12;

        const speed =
            this.flightState
                .speedMetersPerSecond;

        const engineForce =
            this.flightState.throttle *
            engineAcceleration;

        const dragForce =
            rollingResistance +
            aerodynamicResistance *
            speed *
            speed;

        let acceleration =
            engineForce - dragForce;

        if (
            this.flightState.brakeActive
        ) {
            acceleration -=
                brakeDeceleration;
        }

        this.flightState
            .speedMetersPerSecond +=
                acceleration * deltaTime;

        this.flightState
            .speedMetersPerSecond =
                THREE.MathUtils.clamp(
                    this.flightState
                        .speedMetersPerSecond,
                    0,
                    maximumGroundSpeed
                );

        this.aircraft.position.z -=
            this.flightState
                .speedMetersPerSecond *
            deltaTime;

        this.flightState.altitudeMeters =
            Math.max(
                0,
                this.aircraft.position.y -
                0.12
            );
    }

    updatePropeller(deltaTime) {
        const propeller =
            this.aircraft?.userData
                .propeller;

        if (!propeller) {
            return;
        }

        const idleRotationSpeed = 5;

        const throttleRotationSpeed =
            this.flightState.throttle * 65;

        propeller.rotation.z +=
            (
                idleRotationSpeed +
                throttleRotationSpeed
            ) *
            deltaTime;
    }

    updateCamera(deltaTime) {
        if (!this.aircraft) {
            return;
        }

        this.desiredCameraPosition
            .copy(this.cameraOffset)
            .applyQuaternion(
                this.aircraft.quaternion
            )
            .add(
                this.aircraft.position
            );

        this.desiredCameraTarget
            .copy(this.cameraTargetOffset)
            .applyQuaternion(
                this.aircraft.quaternion
            )
            .add(
                this.aircraft.position
            );

        const cameraSmoothing =
            1 -
            Math.exp(
                -5 * deltaTime
            );

        this.camera.position.lerp(
            this.desiredCameraPosition,
            cameraSmoothing
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
            aircraftName:
                "NOVA SKY 172",

            speedKmh:
                this.flightState
                    .speedMetersPerSecond *
                3.6,

            altitudeMeters:
                this.flightState
                    .altitudeMeters,

            throttle:
                this.flightState
                    .throttle,

            brakeActive:
                this.flightState
                    .brakeActive
        });
    }

    update(deltaTime) {
        if (!this.aircraft) {
            return;
        }

        this.updateControls(deltaTime);
        this.updateGroundPhysics(deltaTime);
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

        this.camera.aspect =
            width / height;

        this.camera.updateProjectionMatrix();

        this.renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
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
                object.material.forEach(
                    (material) => {
                        material.dispose();
                    }
                );
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
