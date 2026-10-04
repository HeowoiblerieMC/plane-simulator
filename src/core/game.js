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
        this.clock = new THREE.Clock();

        this.aircraft = null;

        this.animationFrameId = null;
        this.isRunning = false;

        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);
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
            18,
            8,
            1278
        );

        this.camera.lookAt(
            0,
            1.7,
            1242
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
        grid.material.opacity = 0.2;
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

        this.camera.lookAt(
            this.aircraft.position.x,
            this.aircraft.position.y + 1.6,
            this.aircraft.position.z - 8
        );
    }

    update(deltaTime) {
        if (!this.aircraft) {
            return;
        }

        const propeller =
            this.aircraft.userData.propeller;

        if (propeller) {
            propeller.rotation.z +=
                deltaTime * 18;
        }
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

        this.clock.stop();
    }
}
