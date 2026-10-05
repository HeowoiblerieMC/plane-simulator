import * as THREE from "three";

import {
    createJFK
} from "../airport/JFK/createjfk.js";

import {
    createCity
} from "../environment/createcity.js";

import {
    TimeOfDaySystem
} from "../environment/timeofday.js";

import {
    WeatherSystem
} from "../environment/weather.js";

import {
    IncidentSystem
} from "../events/incidentsystem.js";

import {
    getAircraftById
} from "../aircraft/aircraftcatalog.js";

export class Game {
    constructor(
        container,
        options = {}
    ) {
        this.container = container;

        this.selectedAircraftId =
            options.selectedAircraftId ||
            "sky172";

        this.aircraftDefinition =
            getAircraftById(
                this.selectedAircraftId
            );

        this.flightSettings = {
            startHour:
                options.flightSettings
                    ?.startHour ??
                7,

            timeScale:
                options.flightSettings
                    ?.timeScale ??
                10,

            initialWeather:
                options.flightSettings
                    ?.initialWeather ??
                "CLEAR",

            passengers:
                options.flightSettings
                    ?.passengers ??
                0
        };

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.airport = null;
        this.city = null;
        this.aircraft = null;

        this.hemisphereLight = null;
        this.sunlight = null;

        this.timeOfDaySystem = null;
        this.weatherSystem = null;
        this.incidentSystem = null;

        this.clock =
            new THREE.Clock();

        this.keys =
            new Set();

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
            airborne: false,
            crashed: false
        };

        this.cameraMode =
            "EXTERNAL";

        this.forwardVector =
            new THREE.Vector3();

        this.cameraPosition =
            new THREE.Vector3();

        this.cameraTarget =
            new THREE.Vector3();

        this.hudRoot = null;
        this.hudValues = {};

        this.messageRoot = null;
        this.messageQueue = [];

        this.weatherState = "CLEAR";
        this.simulationTime = "07:00";

        this.cameraShake = {
            remaining: 0,
            strength: 0
        };

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
        this.createEnvironment();
        this.createAircraft();
        this.createMessageDisplay();
        this.createHUD();
        this.createTimeSystem();
        this.createWeatherSystem();
        this.createIncidentSystem();
        this.bindEvents();

        this.isRunning = true;

        this.clock.start();
        this.animate();

        this.showMessage({
            source:
                "AIR TRAFFIC CONTROL",

            level:
                "INFO",

            title:
                "Flight cleared",

            message:
                `${this.aircraftDefinition.displayName} is cleared for departure.`,

            duration:
                7
        });

        console.log(
            `Started with ${this.aircraftDefinition.displayName}.`
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
        const width =
            Math.max(
                this.container.clientWidth,
                1
            );

        const height =
            Math.max(
                this.container.clientHeight,
                1
            );

        this.camera =
            new THREE.PerspectiveCamera(
                48,
                width / height,
                0.25,
                18000
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
        this.hemisphereLight =
            new THREE.HemisphereLight(
                0xd9efff,
                0x3d5134,
                2
            );

        this.scene.add(
            this.hemisphereLight
        );

        this.sunlight =
            new THREE.DirectionalLight(
                0xffffff,
                2.4
            );

        this.sunlight.position.set(
            900,
            1400,
            700
        );

        this.sunlight.castShadow =
            false;

        this.scene.add(
            this.sunlight
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

        ground.position.y =
            -0.08;

        ground.receiveShadow =
            false;

        this.scene.add(
            ground
        );
    }

    createAirport() {
        this.airport =
            createJFK();

        this.scene.add(
            this.airport
        );
    }

    createEnvironment() {
        this.city =
            createCity();

        this.scene.add(
            this.city
        );
    }

    createAircraft() {
        this.aircraftDefinition =
            getAircraftById(
                this.selectedAircraftId
            );

        if (
            !this.aircraftDefinition
                .available ||
            typeof this
                .aircraftDefinition
                .createModel !==
                "function"
        ) {
            this.aircraftDefinition =
                getAircraftById(
                    "sky172"
                );
        }

        this.aircraft =
            this.aircraftDefinition
                .createModel();

        const spawn =
            this.aircraftDefinition
                .spawn;

        this.aircraft.position.set(
            spawn.x,
            spawn.y,
            spawn.z
        );

        this.aircraft.rotation.order =
            "YXZ";

        this.aircraft.rotation.set(
            0,
            0,
            0
        );

        this.scene.add(
            this.aircraft
        );

        this.resetFlightState();

        this.updateDirection();
        this.updateAircraftRotation();
        this.updateCamera();
    }

    resetFlightState() {
        this.flightState.throttle =
            0;

        this.flightState
            .speedMetersPerSecond =
            0;

        this.flightState.verticalSpeed =
            0;

        this.flightState.altitudeMeters =
            0;

        this.flightState.heading =
            0;

        this.flightState.pitch =
            0;

        this.flightState.roll =
            0;

        this.flightState.brakeActive =
            false;

        this.flightState.airborne =
            false;

        this.flightState.crashed =
            false;
    }

    createTimeSystem() {
        this.timeOfDaySystem =
            new TimeOfDaySystem({
                scene:
                    this.scene,

                sunlight:
                    this.sunlight,

                hemisphereLight:
                    this.hemisphereLight,

                city:
                    this.city,

                airport:
                    this.airport,

                startHour:
                    this.flightSettings
                        .startHour,

                timeScale:
                    this.flightSettings
                        .timeScale
            });

        this.timeOfDaySystem.setCallbacks({
            onPeriodChanged:
                ({ period }) => {
                    if (
                        period ===
                        "NIGHT"
                    ) {
                        this.showMessage({
                            source:
                                "AIR TRAFFIC CONTROL",

                            level:
                                "INFO",

                            title:
                                "Night operations",

                            message:
                                "Runway and taxiway lighting is now active.",

                            duration:
                                8
                        });
                    }
                },

            onSunsetApproaching:
                () => {
                    this.showMessage({
                        source:
                            "AIR TRAFFIC CONTROL",

                        level:
                            "INFO",

                        title:
                            "Sunset approaching",

                        message:
                            "Sunset is approaching. Airport lighting is being activated.",

                        duration:
                            9
                    });
                },

            onSunriseApproaching:
                () => {
                    this.showMessage({
                        source:
                            "AIR TRAFFIC CONTROL",

                        level:
                            "INFO",

                        title:
                            "Sunrise approaching",

                        message:
                            "Sunrise is approaching. Visibility should improve shortly.",

                        duration:
                            8
                    });
                }
        });
    }

    createWeatherSystem() {
        this.weatherSystem =
            new WeatherSystem({
                scene:
                    this.scene,

                camera:
                    this.camera,

                renderer:
                    this.renderer,

                sunlight:
                    this.sunlight,

                hemisphereLight:
                    this.hemisphereLight,

                initialWeather:
                    this.flightSettings
                        .initialWeather,

                minimumWeatherDuration:
                    150,

                maximumWeatherDuration:
                    360,

                warningDuration:
                    25,

                transitionDuration:
                    35
            });

        this.weatherState =
            this.flightSettings
                .initialWeather;

        this.weatherSystem.setCallbacks({
            onWeatherForecast:
                ({
                    currentWeather,
                    targetWeather
                }) => {
                    this.handleWeatherForecast(
                        currentWeather,
                        targetWeather
                    );
                },

            onWeatherChanged:
                ({
                    currentWeather
                }) => {
                    this.weatherState =
                        currentWeather;

                    this.showMessage({
                        source:
                            "WEATHER CENTER",

                        level:
                            currentWeather ===
                            "RAIN"
                                ? "WARNING"
                                : "INFO",

                        title:
                            "Weather updated",

                        message:
                            `Current airport weather is now ${currentWeather}.`,

                        duration:
                            8
                    });
                },

            onRainStarted:
                () => {
                    this.showMessage({
                        source:
                            "WEATHER CENTER",

                        level:
                            "WARNING",

                        title:
                            "Rain started",

                        message:
                            "Rain is reducing visibility and runway braking performance.",

                        duration:
                            11
                    });
                },

            onRainStopped:
                () => {
                    this.showMessage({
                        source:
                            "WEATHER CENTER",

                        level:
                            "INFO",

                        title:
                            "Rain weakening",

                        message:
                            "Rain has ended. Visibility should improve gradually.",

                        duration:
                            8
                    });
                }
        });
    }

    handleWeatherForecast(
        currentWeather,
        targetWeather
    ) {
        if (
            targetWeather ===
            "CLOUDY"
        ) {
            this.showMessage({
                source:
                    "WEATHER CENTER",

                level:
                    "ADVISORY",

                title:
                    "Cloud cover increasing",

                message:
                    "Increasing cloud cover is expected. Visibility may decrease.",

                duration:
                    10
            });

            return;
        }

        if (
            targetWeather ===
            "RAIN"
        ) {
            this.showMessage({
                source:
                    "WEATHER CENTER",

                level:
                    "WARNING",

                title:
                    "Rain forecast",

                message:
                    "Rain is expected shortly. Use caution during takeoff and landing.",

                duration:
                    12
            });

            return;
        }

        if (
            currentWeather !==
            "CLEAR"
        ) {
            this.showMessage({
                source:
                    "WEATHER CENTER",

                level:
                    "INFO",

                title:
                    "Conditions improving",

                message:
                    "Cloud cover is clearing. Visibility should improve.",

                duration:
                    8
            });
        }
    }

    createIncidentSystem() {
        this.incidentSystem =
            new IncidentSystem({
                aircraftDefinition:
                    this.aircraftDefinition,

                passengers:
                    this.flightSettings
                        .passengers,

                minimumMajorIncidentTime:
                    90,

                minimumCheckInterval:
                    45,

                maximumCheckInterval:
                    85,

                majorIncidentChance:
                    0.035,

                minorIncidentChance:
                    0.09
            });

        this.incidentSystem.setCallbacks({
            onIncidentStarted:
                (incident) => {
                    this.showMessage({
                        source:
                            incident.category,

                        level:
                            incident.level,

                        title:
                            incident.title,

                        message:
                            incident.message,

                        duration:
                            incident.level ===
                            "EMERGENCY"
                                ? 14
                                : 10
                    });
                },

            onIncidentEnded:
                (incident) => {
                    if (
                        incident.reason ===
                        "RESOLVED"
                    ) {
                        this.showMessage({
                            source:
                                "FLIGHT OPERATIONS",

                            level:
                                "INFO",

                            title:
                                "Incident resolved",

                            message:
                                `${incident.title} has been resolved.`,

                            duration:
                                7
                        });
                    }
                },

            onFireRequested:
                ({
                    active,
                    affectedEngine
                }) => {
                    if (active) {
                        this.aircraft.userData
                            .activeFirePoint =
                            affectedEngine;

                        this.aircraft.userData
                            .engineFireActive =
                            true;
                    } else {
                        this.aircraft.userData
                            .activeFirePoint =
                            null;

                        this.aircraft.userData
                            .engineFireActive =
                            false;
                    }
                },

            onSmokeRequested:
                ({
                    active,
                    smokeType
                }) => {
                    this.aircraft.userData
                        .smokeActive =
                        active;

                    this.aircraft.userData
                        .smokeType =
                        smokeType;
                },

            onCameraShakeRequested:
                ({
                    duration,
                    strength
                }) => {
                    this.cameraShake.remaining =
                        duration;

                    this.cameraShake.strength =
                        strength;
                }
        });
    }

    createMessageDisplay() {
        this.messageRoot?.remove();

        this.messageRoot =
            document.createElement(
                "div"
            );

        this.messageRoot.id =
            "flight-messages";

        Object.assign(
            this.messageRoot.style,
            {
                position:
                    "fixed",

                top:
                    "78px",

                left:
                    "14px",

                zIndex:
                    "80",

                display:
                    "flex",

                flexDirection:
                    "column",

                gap:
                    "10px",

                width:
                    "min(380px, calc(100vw - 28px))",

                pointerEvents:
                    "none"
            }
        );

        document.body.appendChild(
            this.messageRoot
        );
    }

    showMessage({
        source,
        level,
        title,
        message,
        duration = 8
    }) {
        if (!this.messageRoot) {
            return;
        }

        const colors = {
            INFO:
                "#61c9ff",

            ADVISORY:
                "#f5d45b",

            WARNING:
                "#ff9f43",

            EMERGENCY:
                "#ff5b5b"
        };

        const accentColor =
            colors[level] ||
            colors.INFO;

        const messageElement =
            document.createElement(
                "article"
            );

        Object.assign(
            messageElement.style,
            {
                padding:
                    "13px 15px",

                border:
                    `1px solid ${accentColor}`,

                borderLeft:
                    `5px solid ${accentColor}`,

                borderRadius:
                    "10px",

                color:
                    "#ffffff",

                background:
                    "rgba(6, 16, 26, 0.9)",

                backdropFilter:
                    "blur(8px)",

                boxShadow:
                    "0 10px 28px rgba(0,0,0,0.28)",

                opacity:
                    "0",

                transform:
                    "translateX(-35px)",

                transition:
                    "opacity 220ms ease, transform 220ms ease"
            }
        );

        messageElement.innerHTML = `
            <div
                style="
                    color: ${accentColor};
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.13em;
                "
            >
                ${source}
            </div>

            <div
                style="
                    margin-top: 4px;
                    font-size: 15px;
                    font-weight: 800;
                "
            >
                ${title}
            </div>

            <div
                style="
                    margin-top: 6px;
                    color: #d3e0e8;
                    font-size: 13px;
                    line-height: 1.45;
                "
            >
                ${message}
            </div>
        `;

        this.messageRoot.prepend(
            messageElement
        );

        while (
            this.messageRoot.children
                .length >
            3
        ) {
            this.messageRoot
                .lastElementChild
                ?.remove();
        }

        window.requestAnimationFrame(
            () => {
                messageElement.style.opacity =
                    "1";

                messageElement.style.transform =
                    "translateX(0)";
            }
        );

        window.setTimeout(
            () => {
                messageElement.style.opacity =
                    "0";

                messageElement.style.transform =
                    "translateX(-35px)";

                window.setTimeout(
                    () => {
                        messageElement.remove();
                    },
                    260
                );
            },
            duration * 1000
        );
    }

    createHUD() {
        this.hudRoot?.remove();

        this.hudRoot =
            document.createElement(
                "div"
            );

        this.hudRoot.id =
            "flight-hud";

        Object.assign(
            this.hudRoot.style,
            {
                position:
                    "fixed",

                inset:
                    "0",

                zIndex:
                    "20",

                pointerEvents:
                    "none",

                color:
                    "#ffffff",

                fontFamily:
                    "Arial, sans-serif",

                userSelect:
                    "none"
            }
        );

        this.hudRoot.innerHTML = `
            <div
                style="
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    width: 260px;
                    padding: 12px 14px;
                    border: 1px solid rgba(112,200,255,0.65);
                    border-radius: 10px;
                    background: rgba(5,18,32,0.84);
                    backdrop-filter: blur(6px);
                    font-family: Consolas, monospace;
                    font-size: 12px;
                "
            >
                <div
                    style="
                        margin-bottom: 8px;
                        color: #70c8ff;
                        font-weight: 700;
                        letter-spacing: 0.12em;
                        text-align: center;
                    "
                >
                    NOVA FLIGHT
                </div>

                <div class="hud-row">
                    <span>AIRCRAFT</span>
                    <strong>
                        ${this.aircraftDefinition.displayName}
                    </strong>
                </div>

                <div class="hud-row">
                    <span>TIME</span>
                    <strong id="hud-time">
                        07:00
                    </strong>
                </div>

                <div class="hud-row">
                    <span>TIME RATE</span>
                    <strong>
                        ${this.flightSettings.timeScale}x
                    </strong>
                </div>

                <div class="hud-row">
                    <span>WEATHER</span>
                    <strong id="hud-weather">
                        ${this.weatherState}
                    </strong>
                </div>

                <div class="hud-row">
                    <span>SPEED</span>
                    <strong id="hud-speed">
                        0 km/h
                    </strong>
                </div>

                <div class="hud-row">
                    <span>ALTITUDE</span>
                    <strong id="hud-altitude">
                        0 m
                    </strong>
                </div>

                <div class="hud-row">
                    <span>THROTTLE</span>
                    <strong id="hud-throttle">
                        0%
                    </strong>
                </div>

                <div class="hud-row">
                    <span>PITCH</span>
                    <strong id="hud-pitch">
                        0.0 deg
                    </strong>
                </div>

                <div class="hud-row">
                    <span>MODE</span>
                    <strong id="hud-mode">
                        GROUND
                    </strong>
                </div>

                <div class="hud-row">
                    <span>BRAKE</span>
                    <strong id="hud-brake">
                        OFF
                    </strong>
                </div>

                <div class="hud-row">
                    <span>CAMERA</span>
                    <strong id="hud-camera">
                        EXTERNAL
                    </strong>
                </div>

                <div
                    style="
                        height: 6px;
                        margin-top: 8px;
                        border-radius: 999px;
                        background: rgba(255,255,255,0.12);
                        overflow: hidden;
                    "
                >
                    <div
                        id="hud-throttle-bar"
                        style="
                            width: 0;
                            height: 100%;
                            background: linear-gradient(
                                90deg,
                                #33c7ff,
                                #48f08b
                            );
                        "
                    ></div>
                </div>
            </div>

            <div
                style="
                    position: absolute;
                    left: 14px;
                    bottom: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    pointer-events: auto;
                "
            >
                <div
                    style="
                        display: flex;
                        gap: 8px;
                    "
                >
                    <button id="control-left">
                        LEFT
                    </button>

                    <button id="control-right">
                        RIGHT
                    </button>
                </div>

                <div
                    style="
                        display: flex;
                        gap: 8px;
                    "
                >
                    <button id="control-pitch-up">
                        PITCH +
                    </button>

                    <button id="control-pitch-down">
                        PITCH -
                    </button>
                </div>
            </div>

            <div
                style="
                    position: absolute;
                    right: 14px;
                    bottom: 14px;
                    display: flex;
                    gap: 8px;
                    pointer-events: auto;
                "
            >
                <button id="control-throttle-up">
                    THR +
                </button>

                <button id="control-throttle-down">
                    THR -
                </button>

                <button id="control-brake">
                    BRAKE
                </button>

                <button id="control-camera">
                    CAMERA
                </button>
            </div>
        `;

        document.body.appendChild(
            this.hudRoot
        );

        for (
            const row of
            this.hudRoot.querySelectorAll(
                ".hud-row"
            )
        ) {
            Object.assign(
                row.style,
                {
                    display:
                        "flex",

                    justifyContent:
                        "space-between",

                    gap:
                        "10px",

                    padding:
                        "3px 0"
                }
            );

            row.querySelector(
                "span"
            ).style.color =
                "#8da9bb";
        }

        for (
            const button of
            this.hudRoot.querySelectorAll(
                "button"
            )
        ) {
            Object.assign(
                button.style,
                {
                    minWidth:
                        "72px",

                    minHeight:
                        "46px",

                    padding:
                        "8px 10px",

                    border:
                        "1px solid rgba(255,255,255,0.4)",

                    borderRadius:
                        "10px",

                    color:
                        "#ffffff",

                    background:
                        "rgba(10,25,40,0.88)",

                    fontWeight:
                        "700",

                    touchAction:
                        "none"
                }
            );
        }

        this.hudValues.time =
            this.hudRoot.querySelector(
                "#hud-time"
            );

        this.hudValues.weather =
            this.hudRoot.querySelector(
                "#hud-weather"
            );

        this.hudValues.speed =
            this.hudRoot.querySelector(
                "#hud-speed"
            );

        this.hudValues.altitude =
            this.hudRoot.querySelector(
                "#hud-altitude"
            );

        this.hudValues.throttle =
            this.hudRoot.querySelector(
                "#hud-throttle"
            );

        this.hudValues.pitch =
            this.hudRoot.querySelector(
                "#hud-pitch"
            );

        this.hudValues.mode =
            this.hudRoot.querySelector(
                "#hud-mode"
            );

        this.hudValues.brake =
            this.hudRoot.querySelector(
                "#hud-brake"
            );

        this.hudValues.camera =
            this.hudRoot.querySelector(
                "#hud-camera"
            );

        this.hudValues.throttleBar =
            this.hudRoot.querySelector(
                "#hud-throttle-bar"
            );

        this.bindTouchControl(
            "#control-left",
            "turnLeft"
        );

        this.bindTouchControl(
            "#control-right",
            "turnRight"
        );

        this.bindTouchControl(
            "#control-pitch-up",
            "pitchUp"
        );

        this.bindTouchControl(
            "#control-pitch-down",
            "pitchDown"
        );

        this.bindTouchControl(
            "#control-throttle-up",
            "throttleUp"
        );

        this.bindTouchControl(
            "#control-throttle-down",
            "throttleDown"
        );

        this.bindTouchControl(
            "#control-brake",
            "brake"
        );

        this.hudRoot
            .querySelector(
                "#control-camera"
            )
            .addEventListener(
                "click",
                (event) => {
                    event.preventDefault();
                    this.toggleCamera();
                }
            );
    }

    bindTouchControl(
        selector,
        action
    ) {
        const button =
            this.hudRoot.querySelector(
                selector
            );

        const activate =
            (event) => {
                event.preventDefault();

                this.touchState[action] =
                    true;

                button.style.filter =
                    "brightness(1.5)";

                button.style.transform =
                    "translateY(2px)";
            };

        const deactivate =
            (event) => {
                event.preventDefault();

                this.touchState[action] =
                    false;

                button.style.filter =
                    "none";

                button.style.transform =
                    "none";
            };

        button.addEventListener(
            "pointerdown",
            activate
        );

        button.addEventListener(
            "pointerup",
            deactivate
        );

        button.addEventListener(
            "pointercancel",
            deactivate
        );

        button.addEventListener(
            "pointerleave",
            deactivate
        );

        button.addEventListener(
            "contextmenu",
            (event) =>
                event.preventDefault()
        );
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
            "Space",
            "KeyC"
        ];

        if (
            controlledKeys.includes(
                event.code
            )
        ) {
            event.preventDefault();
        }

        if (
            event.code ===
                "KeyC" &&
            !event.repeat
        ) {
            this.toggleCamera();
            return;
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

    toggleCamera() {
        this.cameraMode =
            this.cameraMode ===
            "EXTERNAL"
                ? "COCKPIT"
                : "EXTERNAL";
    }

    isActive(
        codes,
        touchAction
    ) {
        return (
            codes.some(
                (code) =>
                    this.keys.has(
                        code
                    )
            ) ||
            this.touchState[
                touchAction
            ]
        );
    }

    updateControls(
        deltaTime
    ) {
        if (
            this.flightState
                .crashed
        ) {
            return;
        }

        const throttleUp =
            this.isActive(
                ["KeyW"],
                "throttleUp"
            );

        const throttleDown =
            this.isActive(
                ["KeyS"],
                "throttleDown"
            );

        const turnLeft =
            this.isActive(
                [
                    "KeyA",
                    "ArrowLeft"
                ],
                "turnLeft"
            );

        const turnRight =
            this.isActive(
                [
                    "KeyD",
                    "ArrowRight"
                ],
                "turnRight"
            );

        const pitchUp =
            this.isActive(
                ["ArrowDown"],
                "pitchUp"
            );

        const pitchDown =
            this.isActive(
                ["ArrowUp"],
                "pitchDown"
            );

        this.flightState
            .brakeActive =
            this.isActive(
                ["Space"],
                "brake"
            );

        const throttleRate =
            0.45;

        if (throttleUp) {
            this.flightState
                .throttle +=
                throttleRate *
                deltaTime;
        }

        if (throttleDown) {
            this.flightState
                .throttle -=
                throttleRate *
                deltaTime;
        }

        this.flightState.throttle =
            THREE.MathUtils.clamp(
                this.flightState
                    .throttle,
                0,
                1
            );

        if (
            this.flightState.airborne
        ) {
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
        const handling =
            this.aircraftDefinition
                .handlingConfig;

        const performance =
            this.aircraftDefinition
                .performance;

        const incidentEffects =
            this.incidentSystem
                ?.getEffects() ??
            {
                steeringMultiplier:
                    1
            };

        const speedEffect =
            THREE.MathUtils.clamp(
                this.flightState
                    .speedMetersPerSecond /
                    8,
                0,
                1
            );

        const steeringEffect =
            Math.max(
                0.12,
                speedEffect
            );

        const steeringRate =
            THREE.MathUtils.degToRad(
                handling
                    .groundSteeringRateDegrees
            ) *
            incidentEffects
                .steeringMultiplier;

        if (turnLeft) {
            this.flightState.heading +=
                steeringRate *
                steeringEffect *
                deltaTime;
        }

        if (turnRight) {
            this.flightState.heading -=
                steeringRate *
                steeringEffect *
                deltaTime;
        }

        if (
            pitchUp &&
            this.flightState
                .speedMetersPerSecond >=
                performance
                    .rotationSpeedMetersPerSecond
        ) {
            this.flightState.pitch +=
                THREE.MathUtils.degToRad(
                    handling
                        .pitchRateDegrees
                ) *
                deltaTime;
        }

        if (pitchDown) {
            this.flightState.pitch -=
                THREE.MathUtils.degToRad(
                    handling
                        .pitchRateDegrees
                ) *
                deltaTime;
        }

        this.flightState.pitch =
            THREE.MathUtils.clamp(
                this.flightState.pitch,
                0,
                THREE.MathUtils.degToRad(
                    handling
                        .maximumGroundPitchDegrees
                )
            );

        if (
            !pitchUp &&
            !pitchDown
        ) {
            this.flightState.pitch =
                THREE.MathUtils.damp(
                    this.flightState
                        .pitch,
                    0,
                    6,
                    deltaTime
                );
        }

        this.flightState.roll =
            THREE.MathUtils.damp(
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
        const handling =
            this.aircraftDefinition
                .handlingConfig;

        const incidentEffects =
            this.incidentSystem
                ?.getEffects() ??
            {
                pitchControlMultiplier:
                    1,

                rollControlMultiplier:
                    1,

                asymmetricThrust:
                    0
            };

        const pitchRate =
            THREE.MathUtils.degToRad(
                handling
                    .pitchRateDegrees
            ) *
            incidentEffects
                .pitchControlMultiplier;

        const rollRate =
            THREE.MathUtils.degToRad(
                handling
                    .rollRateDegrees
            ) *
            incidentEffects
                .rollControlMultiplier;

        if (pitchUp) {
            this.flightState.pitch +=
                pitchRate *
                deltaTime;
        }

        if (pitchDown) {
            this.flightState.pitch -=
                pitchRate *
                deltaTime;
        }

        if (turnLeft) {
            this.flightState.roll +=
                rollRate *
                deltaTime;
        }

        if (turnRight) {
            this.flightState.roll -=
                rollRate *
                deltaTime;
        }

        if (
            !turnLeft &&
            !turnRight
        ) {
            this.flightState.roll =
                THREE.MathUtils.damp(
                    this.flightState
                        .roll,
                    0,
                    2.5,
                    deltaTime
                );
        }

        this.flightState.pitch =
            THREE.MathUtils.clamp(
                this.flightState.pitch,
                THREE.MathUtils.degToRad(
                    handling
                        .maximumPitchDownDegrees
                ),
                THREE.MathUtils.degToRad(
                    handling
                        .maximumPitchUpDegrees
                )
            );

        this.flightState.roll =
            THREE.MathUtils.clamp(
                this.flightState.roll,
                THREE.MathUtils.degToRad(
                    -handling
                        .maximumRollDegrees
                ),
                THREE.MathUtils.degToRad(
                    handling
                        .maximumRollDegrees
                )
            );

        this.flightState.heading +=
            (
                Math.sin(
                    this.flightState
                        .roll
                ) *
                THREE.MathUtils.degToRad(
                    handling
                        .turnRateDegrees
                ) +
                incidentEffects
                    .asymmetricThrust
            ) *
            deltaTime;
    }

    updateDirection() {
        this.forwardVector.set(
            -Math.sin(
                this.flightState
                    .heading
            ),
            0,
            -Math.cos(
                this.flightState
                    .heading
            )
        );
    }

    updatePhysics(
        deltaTime
    ) {
        const performance =
            this.aircraftDefinition
                .performance;

        const incidentEffects =
            this.incidentSystem
                ?.getEffects() ??
            {
                enginePowerMultiplier:
                    1,

                brakingMultiplier:
                    1
            };

        const weatherBraking =
            this.weatherSystem
                ?.getBrakingMultiplier() ??
            1;

        const weatherDrag =
            this.weatherSystem
                ?.getDragMultiplier() ??
            1;

        const speed =
            this.flightState
                .speedMetersPerSecond;

        const engineAcceleration =
            this.flightState.throttle *
            (
                this.flightState.airborne
                    ? performance
                        .airEngineAcceleration
                    : performance
                        .groundEngineAcceleration
            ) *
            incidentEffects
                .enginePowerMultiplier;

        const rollingResistance =
            this.flightState.airborne
                ? 0
                : speed > 0
                    ? performance
                        .rollingResistance
                    : 0;

        const aerodynamicDrag =
            performance
                .aerodynamicDrag *
            weatherDrag *
            speed *
            speed;

        const brakeDeceleration =
            this.flightState
                .brakeActive &&
            !this.flightState
                .airborne
                ? performance
                    .brakeDeceleration *
                    weatherBraking *
                    incidentEffects
                        .brakingMultiplier
                : 0;

        const acceleration =
            engineAcceleration -
            rollingResistance -
            aerodynamicDrag -
            brakeDeceleration;

        this.flightState
            .speedMetersPerSecond =
            THREE.MathUtils.clamp(
                speed +
                    acceleration *
                    deltaTime,
                0,
                performance
                    .maximumSpeedMetersPerSecond
            );

        const minimumTakeoffPitch =
            THREE.MathUtils.degToRad(
                5
            );

        if (
            !this.flightState.airborne &&
            this.flightState
                .speedMetersPerSecond >=
                performance
                    .rotationSpeedMetersPerSecond &&
            this.flightState.pitch >=
                minimumTakeoffPitch
        ) {
            this.flightState.airborne =
                true;

            this.flightState
                .verticalSpeed =
                1.5;
        }

        this.updateDirection();

        this.aircraft.position
            .addScaledVector(
                this.forwardVector,
                this.flightState
                    .speedMetersPerSecond *
                    deltaTime
            );

        const groundHeight =
            this.aircraftDefinition
                .spawn.y;

        if (
            this.flightState.airborne
        ) {
            const pitchLift =
                Math.sin(
                    this.flightState
                        .pitch
                ) *
                this.flightState
                    .speedMetersPerSecond *
                performance
                    .liftStrength;

            const baseLift =
                Math.max(
                    0,
                    this.flightState
                        .speedMetersPerSecond -
                        performance
                            .stallSpeedMetersPerSecond
                ) *
                performance
                    .baseLiftStrength;

            const targetVerticalSpeed =
                pitchLift +
                baseLift -
                performance
                    .gravityEffect;

            this.flightState
                .verticalSpeed =
                THREE.MathUtils.damp(
                    this.flightState
                        .verticalSpeed,
                    targetVerticalSpeed,
                    2,
                    deltaTime
                );

            this.aircraft.position.y +=
                this.flightState
                    .verticalSpeed *
                deltaTime;

            if (
                this.aircraft
                    .position.y <=
                    groundHeight &&
                this.flightState
                    .verticalSpeed <=
                    0
            ) {
                this.aircraft
                    .position.y =
                    groundHeight;

                this.flightState.airborne =
                    false;

                this.flightState
                    .verticalSpeed =
                    0;

                this.flightState.roll =
                    0;

                this.flightState.pitch =
                    Math.max(
                        0,
                        this.flightState
                            .pitch
                    );
            }
        } else {
            this.aircraft.position.y =
                groundHeight;
        }

        this.flightState
            .altitudeMeters =
            Math.max(
                0,
                this.aircraft
                    .position.y -
                    groundHeight
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

    updateRotatingParts(
        deltaTime
    ) {
        const incidentEffects =
            this.incidentSystem
                ?.getEffects() ??
            {
                enginePowerMultiplier:
                    1
            };

        const rotationSpeed =
            (
                5 +
                this.flightState
                    .throttle *
                    70
            ) *
            incidentEffects
                .enginePowerMultiplier *
            deltaTime;

        const propeller =
            this.aircraft
                ?.userData
                .propeller;

        if (propeller) {
            propeller.rotation.z +=
                rotationSpeed;
        }

        const rotatingParts =
            this.aircraft
                ?.userData
                .rotatingParts;

        if (
            Array.isArray(
                rotatingParts
            )
        ) {
            for (
                const rotatingPart of
                rotatingParts
            ) {
                rotatingPart.rotation.z +=
                    rotationSpeed;
            }
        }
    }

    updateSystems(
        deltaTime
    ) {
        this.timeOfDaySystem?.update(
            deltaTime
        );

        if (
            this.timeOfDaySystem
        ) {
            this.simulationTime =
                this.timeOfDaySystem
                    .getFormattedTime();

            this.sunlight.userData
                .timeIntensity =
                this.sunlight.intensity;

            this.hemisphereLight
                .userData
                .timeIntensity =
                this.hemisphereLight
                    .intensity;
        }

        this.weatherSystem?.update(
            deltaTime,
            {
                aircraftPosition:
                    this.aircraft
                        ?.position,

                aircraftSpeed:
                    this.flightState
                        .speedMetersPerSecond,

                timeLightMultiplier:
                    1
            }
        );

        this.incidentSystem?.update(
            deltaTime,
            {
                airborne:
                    this.flightState
                        .airborne,

                altitudeMeters:
                    this.flightState
                        .altitudeMeters,

                speedMetersPerSecond:
                    this.flightState
                        .speedMetersPerSecond,

                verticalSpeed:
                    this.flightState
                        .verticalSpeed,

                approachingRunway:
                    this.flightState
                        .airborne &&
                    this.flightState
                        .altitudeMeters <
                        100,

                crashed:
                    this.flightState
                        .crashed
            }
        );
    }

    updateCamera() {
        if (
            !this.aircraft ||
            !this.camera
        ) {
            return;
        }

        this.updateDirection();

        if (
            this.cameraMode ===
            "COCKPIT"
        ) {
            this.updateCockpitCamera();
        } else {
            this.updateExternalCamera();
        }

        this.applyCameraShake();
    }

    updateExternalCamera() {
        const config =
            this.aircraftDefinition
                .camera;

        this.cameraPosition
            .copy(
                this.aircraft.position
            )
            .addScaledVector(
                this.forwardVector,
                -config
                    .externalDistance
            );

        this.cameraPosition.y +=
            config
                .externalHeight;

        this.cameraTarget
            .copy(
                this.aircraft.position
            )
            .addScaledVector(
                this.forwardVector,
                config
                    .externalTargetDistance
            );

        this.cameraTarget.y +=
            config
                .externalTargetHeight;

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
    }

    updateCockpitCamera() {
        const config =
            this.aircraftDefinition
                .camera;

        this.cameraPosition
            .copy(
                this.aircraft.position
            )
            .addScaledVector(
                this.forwardVector,
                config
                    .cockpitForward
            );

        this.cameraPosition.y +=
            config
                .cockpitHeight;

        this.cameraTarget
            .copy(
                this.aircraft.position
            )
            .addScaledVector(
                this.forwardVector,
                config
                    .cockpitLookDistance
            );

        this.cameraTarget.y +=
            config
                .cockpitTargetHeight;

        this.camera.position.copy(
            this.cameraPosition
        );

        this.camera.up
            .set(
                0,
                1,
                0
            )
            .applyEuler(
                this.aircraft.rotation
            );

        this.camera.lookAt(
            this.cameraTarget
        );
    }

    applyCameraShake() {
        if (
            this.cameraShake.remaining <=
            0
        ) {
            return;
        }

        const strength =
            this.cameraShake.strength;

        this.camera.position.x +=
            (
                Math.random() -
                0.5
            ) *
            strength;

        this.camera.position.y +=
            (
                Math.random() -
                0.5
            ) *
            strength;

        this.camera.position.z +=
            (
                Math.random() -
                0.5
            ) *
            strength;
    }

    updateHUD() {
        if (!this.hudRoot) {
            return;
        }

        const speedKmh =
            Math.round(
                this.flightState
                    .speedMetersPerSecond *
                    3.6
            );

        const throttlePercent =
            Math.round(
                this.flightState
                    .throttle *
                    100
            );

        const altitudeMeters =
            Math.round(
                this.flightState
                    .altitudeMeters
            );

        const pitchDegrees =
            THREE.MathUtils.radToDeg(
                this.flightState
                    .pitch
            );

        this.hudValues.time.textContent =
            this.simulationTime;

        this.hudValues.weather.textContent =
            this.weatherState;

        this.hudValues.speed.textContent =
            `${speedKmh} km/h`;

        this.hudValues.altitude.textContent =
            `${altitudeMeters} m`;

        this.hudValues.throttle.textContent =
            `${throttlePercent}%`;

        this.hudValues.pitch.textContent =
            `${pitchDegrees.toFixed(1)} deg`;

        this.hudValues.mode.textContent =
            this.flightState.airborne
                ? "AIR"
                : "GROUND";

        this.hudValues.mode.style.color =
            this.flightState.airborne
                ? "#48f08b"
                : "#ffffff";

        this.hudValues.brake.textContent =
            this.flightState.brakeActive
                ? "ON"
                : "OFF";

        this.hudValues.brake.style.color =
            this.flightState.brakeActive
                ? "#ff8a74"
                : "#ffffff";

        this.hudValues.camera.textContent =
            this.cameraMode;

        this.hudValues
            .throttleBar
            .style.width =
            `${throttlePercent}%`;

        const incidentEffects =
            this.incidentSystem
                ?.getEffects();

        if (
            incidentEffects
                ?.instrumentVisibility <
            0.5
        ) {
            this.hudRoot.style.opacity =
                "0.55";
        } else {
            this.hudRoot.style.opacity =
                "1";
        }
    }

    update(
        deltaTime
    ) {
        if (!this.aircraft) {
            return;
        }

        this.cameraShake.remaining =
            Math.max(
                0,
                this.cameraShake.remaining -
                    deltaTime
            );

        this.updateSystems(
            deltaTime
        );

        this.updateControls(
            deltaTime
        );

        this.updatePhysics(
            deltaTime
        );

        this.updateAircraftRotation();

        this.updateRotatingParts(
            deltaTime
        );

        this.updateCamera();
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

        const deltaTime =
            Math.min(
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

        const width =
            Math.max(
                this.container
                    .clientWidth,
                1
            );

        const height =
            Math.max(
                this.container
                    .clientHeight,
                1
            );

        this.camera.aspect =
            width / height;

        this.camera
            .updateProjectionMatrix();

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

        this.isRunning =
            false;

        if (
            this.animationFrameId !==
            null
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

        this.incidentSystem
            ?.resolveAllIncidents();

        this.weatherSystem
            ?.dispose();

        this.hudRoot?.remove();
        this.messageRoot?.remove();

        this.hudRoot = null;
        this.messageRoot = null;

        this.renderer?.dispose();
        this.renderer
            ?.domElement
            .remove();

        this.aircraft = null;
        this.airport = null;
        this.city = null;

        this.timeOfDaySystem = null;
        this.weatherSystem = null;
        this.incidentSystem = null;

        this.renderer = null;
        this.camera = null;
        this.scene = null;
    }
}
