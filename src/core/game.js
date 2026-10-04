import * as THREE from "three";
import { createSky172 } from "../aircraft/general/createsky172.js";
import { createJFK } from "../airport/JFK/createjfk.js";

export class Game {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.aircraft = null;
        this.clock = new THREE.Clock();

        this.keys = new Set();
        this.touchState = {
            throttleUp: false,
            throttleDown: false,
            turnLeft: false,
            turnRight: false,
            pitchUp: false,
            pitchDown: false,
            brake: false
        };

        this.flightState = {
            throttle: 0,
            speedMetersPerSecond: 0,
            verticalSpeed: 0,
            altitudeMeters: 0,
            heading: 0,
            pitch: 0,
            roll: 0,
            brakeActive: false,
            airborne: false
        };

        this.cameraMode = "EXTERNAL";
        this.forwardVector = new THREE.Vector3();
        this.cameraPosition = new THREE.Vector3();
        this.cameraTarget = new THREE.Vector3();

        this.hudRoot = null;
        this.hudValues = {};
        this.timeFormatter = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });

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
        this.scene.fog = new THREE.Fog(0x87b9e8, 3000, 12000);
    }

    createCamera() {
        const width = Math.max(this.container.clientWidth, 1);
        const height = Math.max(this.container.clientHeight, 1);

        this.camera = new THREE.PerspectiveCamera(
            48,
            width / height,
            0.25,
            20000
        );
    }

    createRenderer() {
        document.querySelector("#startup-status")?.remove();

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
        this.scene.add(new THREE.HemisphereLight(0xd9efff, 0x3d5134, 2));

        const sunlight = new THREE.DirectionalLight(0xffffff, 2.4);
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
        this.scene.add(ground);
    }

    createAirport() {
        this.scene.add(createJFK());
    }

    createAircraft() {
        this.aircraft = createSky172();
        this.aircraft.position.set(0, 0.12, 1250);
        this.aircraft.rotation.order = "YXZ";
        this.aircraft.rotation.set(0, 0, 0);
        this.scene.add(this.aircraft);

        this.updateDirection();
        this.updateAircraftRotation();
        this.updateCamera();
    }

    createHUD() {
        this.hudRoot?.remove();
        this.hudRoot = document.createElement("div");
        this.hudRoot.id = "flight-hud";

        Object.assign(this.hudRoot.style, {
            position: "fixed",
            inset: "0",
            zIndex: "20",
            pointerEvents: "none",
            color: "#ffffff",
            fontFamily: "Arial, sans-serif",
            userSelect: "none"
        });

        this.hudRoot.innerHTML = `
            <div style="position:absolute;top:14px;right:14px;width:238px;padding:12px 14px;border:1px solid rgba(112,200,255,.65);border-radius:10px;background:rgba(5,18,32,.82);backdrop-filter:blur(6px);box-shadow:0 8px 24px rgba(0,0,0,.25);font-family:Consolas,monospace;font-size:12px;">
                <div style="margin-bottom:8px;color:#70c8ff;font-weight:700;letter-spacing:.14em;text-align:center;">NOVA FLIGHT</div>
                <div class="hud-row"><span>TIME ET</span><strong id="hud-time">00:00:00</strong></div>
                <div class="hud-row"><span>SPEED</span><strong id="hud-speed">0 km/h</strong></div>
                <div class="hud-row"><span>ALTITUDE</span><strong id="hud-altitude">0 m</strong></div>
                <div class="hud-row"><span>THROTTLE</span><strong id="hud-throttle">0%</strong></div>
                <div class="hud-row"><span>PITCH</span><strong id="hud-pitch">0.0 deg</strong></div>
                <div class="hud-row"><span>MODE</span><strong id="hud-mode">GROUND</strong></div>
                <div class="hud-row"><span>BRAKE</span><strong id="hud-brake">OFF</strong></div>
                <div class="hud-row"><span>CAMERA</span><strong id="hud-camera">EXTERNAL</strong></div>
                <div style="height:6px;margin-top:8px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden;"><div id="hud-throttle-bar" style="width:0;height:100%;background:linear-gradient(90deg,#33c7ff,#48f08b);"></div></div>
            </div>
            <div style="position:absolute;left:14px;bottom:14px;display:flex;flex-direction:column;gap:8px;pointer-events:auto;">
                <div style="display:flex;gap:8px;"><button id="control-left">LEFT</button><button id="control-right">RIGHT</button></div>
                <div style="display:flex;gap:8px;"><button id="control-pitch-up">PITCH +</button><button id="control-pitch-down">PITCH -</button></div>
            </div>
            <div style="position:absolute;right:14px;bottom:14px;display:flex;gap:8px;pointer-events:auto;">
                <button id="control-throttle-up">THR +</button>
                <button id="control-throttle-down">THR -</button>
                <button id="control-brake">BRAKE</button>
                <button id="control-camera">CAMERA</button>
            </div>
        `;

        document.body.appendChild(this.hudRoot);

        for (const row of this.hudRoot.querySelectorAll(".hud-row")) {
            Object.assign(row.style, {
                display: "flex",
                justifyContent: "space-between",
                padding: "3px 0"
            });
            row.querySelector("span").style.color = "#8da9bb";
        }

        for (const button of this.hudRoot.querySelectorAll("button")) {
            Object.assign(button.style, {
                minWidth: "72px",
                minHeight: "46px",
                padding: "8px 10px",
                border: "1px solid rgba(255,255,255,.4)",
                borderRadius: "10px",
                color: "#ffffff",
                background: "rgba(10,25,40,.88)",
                fontWeight: "700",
                touchAction: "none"
            });
        }

        this.hudValues.time = this.hudRoot.querySelector("#hud-time");
        this.hudValues.speed = this.hudRoot.querySelector("#hud-speed");
        this.hudValues.altitude = this.hudRoot.querySelector("#hud-altitude");
        this.hudValues.throttle = this.hudRoot.querySelector("#hud-throttle");
        this.hudValues.pitch = this.hudRoot.querySelector("#hud-pitch");
        this.hudValues.mode = this.hudRoot.querySelector("#hud-mode");
        this.hudValues.brake = this.hudRoot.querySelector("#hud-brake");
        this.hudValues.camera = this.hudRoot.querySelector("#hud-camera");
        this.hudValues.throttleBar = this.hudRoot.querySelector("#hud-throttle-bar");

        this.bindTouchControl("#control-left", "turnLeft");
        this.bindTouchControl("#control-right", "turnRight");
        this.bindTouchControl("#control-pitch-up", "pitchUp");
        this.bindTouchControl("#control-pitch-down", "pitchDown");
        this.bindTouchControl("#control-throttle-up", "throttleUp");
        this.bindTouchControl("#control-throttle-down", "throttleDown");
        this.bindTouchControl("#control-brake", "brake");

        this.hudRoot
            .querySelector("#control-camera")
            .addEventListener("click", (event) => {
                event.preventDefault();
                this.toggleCamera();
            });

        this.updateHUD();
    }

    bindTouchControl(selector, action) {
        const button = this.hudRoot.querySelector(selector);

        const activate = (event) => {
            event.preventDefault();
            this.touchState[action] = true;
            button.style.filter = "brightness(1.5)";
            button.style.transform = "translateY(2px)";
        };

        const deactivate = (event) => {
            event.preventDefault();
            this.touchState[action] = false;
            button.style.filter = "none";
            button.style.transform = "none";
        };

        button.addEventListener("pointerdown", activate);
        button.addEventListener("pointerup", deactivate);
        button.addEventListener("pointercancel", deactivate);
        button.addEventListener("pointerleave", deactivate);
        button.addEventListener("contextmenu", (event) => event.preventDefault());
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
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Space",
            "KeyC"
        ];

        if (controlledKeys.includes(event.code)) {
            event.preventDefault();
        }

        if (event.code === "KeyC" && !event.repeat) {
            this.toggleCamera();
            return;
        }

        this.keys.add(event.code);
    }

    handleKeyUp(event) {
        this.keys.delete(event.code);
    }

    toggleCamera() {
        this.cameraMode =
            this.cameraMode === "EXTERNAL"
                ? "COCKPIT"
                : "EXTERNAL";
    }

    isActive(codes, touchAction) {
        return (
            codes.some((code) => this.keys.has(code)) ||
            this.touchState[touchAction]
        );
    }

    updateControls(deltaTime) {
        const throttleUp = this.isActive(["KeyW"], "throttleUp");
        const throttleDown = this.isActive(["KeyS"], "throttleDown");
        const turnLeft = this.isActive(["KeyA", "ArrowLeft"], "turnLeft");
        const turnRight = this.isActive(["KeyD", "ArrowRight"], "turnRight");
        const pitchUp = this.isActive(["ArrowDown"], "pitchUp");
        const pitchDown = this.isActive(["ArrowUp"], "pitchDown");

        this.flightState.brakeActive = this.isActive(["Space"], "brake");

        const throttleRate = 0.45;

        if (throttleUp) {
            this.flightState.throttle += throttleRate * deltaTime;
        }

        if (throttleDown) {
            this.flightState.throttle -= throttleRate * deltaTime;
        }

        this.flightState.throttle = THREE.MathUtils.clamp(
            this.flightState.throttle,
            0,
            1
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
        const speedEffect = THREE.MathUtils.clamp(
            this.flightState.speedMetersPerSecond / 8,
            0,
            1
        );

        const steeringEffect = Math.max(0.12, speedEffect);
        const steeringRate = THREE.MathUtils.degToRad(28);

        if (turnLeft) {
            this.flightState.heading +=
                steeringRate * steeringEffect * deltaTime;
        }

        if (turnRight) {
            this.flightState.heading -=
                steeringRate * steeringEffect * deltaTime;
        }

        const rotationSpeed = 27;

        if (
            pitchUp &&
            this.flightState.speedMetersPerSecond >= rotationSpeed
        ) {
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
                6,
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

    updateDirection() {
        this.forwardVector.set(
            -Math.sin(this.flightState.heading),
            0,
            -Math.cos(this.flightState.heading)
        );
    }

    updatePhysics(deltaTime) {
        const speed = this.flightState.speedMetersPerSecond;
        const engineAcceleration =
            this.flightState.throttle *
            (this.flightState.airborne ? 2.8 : 4.5);
        const rollingResistance = this.flightState.airborne
            ? 0
            : speed > 0
                ? 0.55
                : 0;
        const aerodynamicDrag = 0.0022 * speed * speed;
        const brakeDeceleration =
            this.flightState.brakeActive && !this.flightState.airborne
                ? 10
                : 0;

        const acceleration =
            engineAcceleration -
            rollingResistance -
            aerodynamicDrag -
            brakeDeceleration;

        this.flightState.speedMetersPerSecond = THREE.MathUtils.clamp(
            speed + acceleration * deltaTime,
            0,
            75
        );

        const takeoffSpeed = 27;
        const takeoffPitch = THREE.MathUtils.degToRad(5);

        if (
            !this.flightState.airborne &&
            this.flightState.speedMetersPerSecond >= takeoffSpeed &&
            this.flightState.pitch >= takeoffPitch
        ) {
            this.flightState.airborne = true;
            this.flightState.verticalSpeed = 1.5;
        }

        this.updateDirection();

        this.aircraft.position.addScaledVector(
            this.forwardVector,
            this.flightState.speedMetersPerSecond * deltaTime
        );

        if (this.flightState.airborne) {
            const pitchLift =
                Math.sin(this.flightState.pitch) *
                this.flightState.speedMetersPerSecond *
                0.52;
            const baseLift =
                Math.max(
                    0,
                    this.flightState.speedMetersPerSecond - 23
                ) * 0.08;
            const targetVerticalSpeed = pitchLift + baseLift - 1.2;

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
                this.flightState.pitch = Math.max(
                    0,
                    this.flightState.pitch
                );
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

    updateCamera() {
        if (!this.aircraft || !this.camera) {
            return;
        }

        this.updateDirection();

        if (this.cameraMode === "COCKPIT") {
            this.updateCockpitCamera();
        } else {
            this.updateExternalCamera();
        }
    }

    updateExternalCamera() {
        this.cameraPosition
            .copy(this.aircraft.position)
            .addScaledVector(this.forwardVector, -38);

        this.cameraPosition.y += 4.8;

        this.cameraTarget
            .copy(this.aircraft.position)
            .addScaledVector(this.forwardVector, 2);

        this.cameraTarget.y += 3.2;

        this.camera.position.copy(this.cameraPosition);
        this.camera.up.set(0, 1, 0);
        this.camera.lookAt(this.cameraTarget);
        this.camera.updateMatrixWorld(true);
    }

    updateCockpitCamera() {
        this.cameraPosition
            .copy(this.aircraft.position)
            .addScaledVector(this.forwardVector, 1.15);

        this.cameraPosition.y += 2.35;

        this.cameraTarget
            .copy(this.aircraft.position)
            .addScaledVector(this.forwardVector, 60);

        this.cameraTarget.y += 2.25;

        this.camera.position.copy(this.cameraPosition);
        this.camera.up
            .set(0, 1, 0)
            .applyEuler(this.aircraft.rotation);
        this.camera.lookAt(this.cameraTarget);
        this.camera.updateMatrixWorld(true);
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
        if (!this.hudRoot) {
            return;
        }

        const speedKmh = Math.round(
            this.flightState.speedMetersPerSecond * 3.6
        );
        const throttlePercent = Math.round(
            this.flightState.throttle * 100
        );
        const altitudeMeters = Math.round(
            this.flightState.altitudeMeters
        );
        const pitchDegrees = THREE.MathUtils.radToDeg(
            this.flightState.pitch
        );

        this.hudValues.time.textContent =
            this.timeFormatter.format(new Date());
        this.hudValues.speed.textContent = `${speedKmh} km/h`;
        this.hudValues.altitude.textContent = `${altitudeMeters} m`;
        this.hudValues.throttle.textContent = `${throttlePercent}%`;
        this.hudValues.pitch.textContent = `${pitchDegrees.toFixed(1)} deg`;
        this.hudValues.mode.textContent =
            this.flightState.airborne ? "AIR" : "GROUND";
        this.hudValues.mode.style.color =
            this.flightState.airborne ? "#48f08b" : "#ffffff";
        this.hudValues.brake.textContent =
            this.flightState.brakeActive ? "ON" : "OFF";
        this.hudValues.brake.style.color =
            this.flightState.brakeActive ? "#ff8a74" : "#ffffff";
        this.hudValues.camera.textContent = this.cameraMode;
        this.hudValues.throttleBar.style.width = `${throttlePercent}%`;
    }

    update(deltaTime) {
        if (!this.aircraft) {
            return;
        }

        this.updateControls(deltaTime);
        this.updatePhysics(deltaTime);
        this.updateAircraftRotation();
        this.updatePropeller(deltaTime);
        this.updateCamera();
        this.updateHUD();
    }

    animate() {
        if (!this.isRunning) {
            return;
        }

        this.animationFrameId = window.requestAnimationFrame(this.animate);

        const deltaTime = Math.min(this.clock.getDelta(), 1 / 20);
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
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
}
