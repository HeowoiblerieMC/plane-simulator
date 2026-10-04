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

        this.animationFrameId = null;
        this.isRunning = false;

        this.animate =
            this.animate.bind(this);

        this.handleResize =
            this.handleResize.bind(this);
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

        window.addEventListener(
            "resize",
            this.handleResize
        );

        this.isRunning = true;
        this.clock.start();
        this.animate();

        console.log(
            "Aircraft display test started."
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
                55,
                width / height,
                0.25,
                20000
            );

        this.camera.position.set(
            0,
            5,
            1268
        );

        this.camera.up.set(
            0,
            1,
            0
        );

        this.camera.lookAt(
            0,
            1.6,
            1235
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

        ground.receiveShadow = false;

        this.scene.add(
            ground
        );
    }

    createAirport() {
        const airport =
            new THREE.Group();

        airport.name = "JFKAirport";

        airport.position.set(
            0,
            0,
            0
        );

        airport.rotation.set(
            0,
            0,
            0
        );

        const runways =
            createRunways();

        runways.position.set(
            0,
            0,
            0
        );

        runways.rotation.set(
            0,
            0,
            0
        );

        const runwayMarkings =
            createRunwayMarkings();

        runwayMarkings.position.x = 0;
        runwayMarkings.position.z = 0;

        runwayMarkings.rotation.set(
            0,
            0,
            0
        );

        airport.add(
            runways,
            runwayMarkings
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

        this.scene.add(
            this.aircraft
        );

        this.camera.position.set(
            this.aircraft.position.x,
            this.aircraft.position.y + 5,
            this.aircraft.position.z + 18
        );

        this.camera.up.set(
            0,
            1,
            0
        );

        this.camera.lookAt(
            this.aircraft.position.x,
            this.aircraft.position.y + 1.6,
            this.aircraft.position.z - 25
        );
    }

    updatePropeller(deltaTime) {
        const propeller =
            this.aircraft?.userData
                .propeller;

        if (!propeller) {
            return;
        }

        propeller.rotation.z +=
            deltaTime * 8;
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

        this.updatePropeller(
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

        this.clock.stop();
    }
}
