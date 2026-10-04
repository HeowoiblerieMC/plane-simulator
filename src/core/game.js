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

export class Game {
    constructor(container) {
        this.container = container;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.aircraft = null;

        this.clock = new THREE.Clock();

        this.keys = new Set();

        this.throttle = 0;
        this.speedMetersPerSecond = 0;
        this.heading = 0;
        this.brakeActive = false;

        this.forwardVector =
            new THREE.Vector3();

        this.cameraPosition =
            new THREE.Vector3();

        this.cameraTarget =
            new THREE.Vector3();

        this.animationFrameId = null;
        this.isRunning = false;

        this.animate =
            this.animate.bind(this);

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
        this.bindEvents();

        this.isRunning = true;

        this.clock.start();
        this.animate();

        console.log(
            "Aircraft steering test started."
        );
    }

    createScene() {
        this.scene =
            new THREE.Scene();

        this.scene.background =
            new THREE.Color(
                0x87b9e8
            );

        this.scene.fog =
            new THREE.Fog(
                0x87b9e8,
                3000,
                12000
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
                48,
                width / height,
                0.25,
                20000
            );
    }

    createRenderer() {
        document
            .querySelector(
                "#startup-status"
            )
            ?.remove();

        this.renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                powerPreference:
                    "high-performance"
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

        this.renderer.shadowMap.enabled =
            false;

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

        this.scene.add(
            hemisphereLight
        );

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

        sunlight.castShadow = false;

        this.scene.add(
            sunlight
        );
    }

    createGround() {
        const ground =
            new THREE.Mesh(
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

        ground.name =
            "AirportGround";

        ground.rotation.x =
            -Math.PI / 2;

        ground.position.y = -0.08;

        this.scene.add(
            ground
        );
    }

    createAirport() {
        const airport =
            new THREE.Group();

        airport.name =
            "JFKAirport";

        airport.add(
            createRunways(),
            createRunwayMarkings()
        );

        this.scene.add(
            airport
        );
    }

    createAircraft() {
        this.aircraft =
            createSky172();

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

        this.aircraft.rotation.order =
            "YXZ";

        this.scene.add(
            this.aircraft
        );

        this.updateDirection();
        this.updateCamera();
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
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Space"
        ];

        if (
            controlledKeys.includes(
                event.code
            )
        ) {
            event.preventDefault();
        }

        this.keys.add(
            event.code
        );
    }

    handleKeyUp(event) {
        this.keys.delete(
            event.code
        );
    }

    updateControls(deltaTime) {
        const throttleUp =
            this.keys.has("KeyW") ||
            this.keys.has("ArrowUp");

        const throttleDown =
            this.keys.has("KeyS") ||
            this.keys.has("ArrowDown");

        const turnLeft =
            this.keys.has("KeyA") ||
            this.keys.has("ArrowLeft");

        const turnRight =
            this.keys.has("KeyD") ||
            this.keys.has("ArrowRight");

        this.brakeActive =
            this.keys.has("Space");

        const throttleRate = 0.45;

        if (throttleUp) {
            this.throttle +=
                throttleRate *
                deltaTime;
        }

        if (throttleDown) {
            this.throttle -=
                throttleRate *
                deltaTime;
        }

        this.throttle =
            THREE.MathUtils.clamp(
                this.throttle,
                0,
                1
            );

        this.updateSteering(
            deltaTime,
            turnLeft,
            turnRight
        );
    }

    updateSteering(
        deltaTime,
        turnLeft,
        turnRight
    ) {
        const minimumSteeringEffect = 0.12;

        const speedSteeringEffect =
            THREE.MathUtils.clamp(
                this.speedMetersPerSecond / 8,
                0,
                1
            );

        const steeringEffect =
            Math.max(
                minimumSteeringEffect,
                speedSteeringEffect
            );

        const steeringRate =
            THREE.MathUtils.degToRad(
                28
            );

        if (turnLeft) {
            this.heading +=
                steeringRate *
                steeringEffect *
                deltaTime;
        }

        if (turnRight) {
            this.heading -=
                steeringRate *
                steeringEffect *
                deltaTime;
        }

        this.heading =
            THREE.MathUtils.euclideanModulo(
                this.heading + Math.PI,
                Math.PI * 2
            ) - Math.PI;
    }

    updateDirection() {
        this.forwardVector.set(
            -Math.sin(
                this.heading
            ),
            0,
            -Math.cos(
                this.heading
            )
        );
    }

    updateGroundMovement(deltaTime) {
        const maximumSpeed = 40;

        const engineAcceleration =
            this.throttle * 4.5;

        const rollingResistance =
            this.speedMetersPerSecond > 0
                ? 0.55
                : 0;

        const aerodynamicDrag =
            0.0025 *
            this.speedMetersPerSecond *
            this.speedMetersPerSecond;

        const brakeDeceleration =
            this.brakeActive
                ? 10
                : 0;

        const acceleration =
            engineAcceleration -
            rollingResistance -
            aerodynamicDrag -
            brakeDeceleration;

        this.speedMetersPerSecond +=
            acceleration *
            deltaTime;

        this.speedMetersPerSecond =
            THREE.MathUtils.clamp(
                this.speedMetersPerSecond,
                0,
                maximumSpeed
            );

        this.updateDirection();

        this.aircraft.position.addScaledVector(
            this.forwardVector,
            this.speedMetersPerSecond *
                deltaTime
        );

        this.aircraft.position.y = 0.12;

        this.aircraft.rotation.y =
            this.heading;
    }

    updateCamera() {
        if (
            !this.aircraft ||
            !this.camera
        ) {
            return;
        }

        this.updateDirection();

        this.cameraPosition
            .copy(
                this.aircraft.position
            )
            .addScaledVector(
                this.forwardVector,
                -38
            );

        this.cameraPosition.y += 4.8;

        this.cameraTarget
            .copy(
                this.aircraft.position
            )
            .addScaledVector(
                this.forwardVector,
                2
            );

        this.cameraTarget.y += 3.2;

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

    updatePropeller(deltaTime) {
        const propeller =
            this.aircraft?.userData
                .propeller;

        if (!propeller) {
            return;
        }

        const idleSpeed = 5;

        const throttleSpeed =
            this.throttle * 70;

        propeller.rotation.z +=
            (
                idleSpeed +
                throttleSpeed
            ) *
            deltaTime;
    }

    update(deltaTime) {
        if (!this.aircraft) {
            return;
        }

        this.updateControls(
            deltaTime
        );

        this.updateGroundMovement(
            deltaTime
        );

        this.updatePropeller(
            deltaTime
        );

        this.updateCamera();
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

        this.update(
            deltaTime
        );

        this.renderer.render(
            this.scene,
            this.camera
        );
    }

    handleResize() {
        if (
            !this.camera ||
            !this.renderer
        ) {
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

        if (
            this.animationFrameId !== null
        ) {
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
}
