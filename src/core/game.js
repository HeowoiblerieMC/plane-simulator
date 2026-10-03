import * as THREE from "three";

export class Game {
    constructor(container) {
        this.container = container;

        this.scene = null;
        this.camera = null;
        this.renderer = null;

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

        window.addEventListener(
            "resize",
            this.handleResize
        );

        this.isRunning = true;
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
            1200,
            10000
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
                60,
                width / height,
                0.1,
                20000
            );

        this.camera.position.set(
            100,
            70,
            140
        );

        this.camera.lookAt(0, 0, 0);
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
                2.5
            );

        sunlight.position.set(
            500,
            900,
            400
        );

        sunlight.castShadow = true;

        this.scene.add(sunlight);
    }

    createGround() {
        const ground =
            new THREE.Mesh(
                new THREE.PlaneGeometry(
                    10000,
                    10000
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x557744,
                    roughness: 1
                })
            );

        ground.rotation.x =
            -Math.PI / 2;

        ground.receiveShadow = true;

        this.scene.add(ground);

        const grid =
            new THREE.GridHelper(
                2000,
                100,
                0xffffff,
                0x668866
            );

        grid.position.y = 0.02;

        this.scene.add(grid);

        const marker =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    20,
                    20,
                    20
                ),
                new THREE.MeshStandardMaterial({
                    color: 0xffc107
                })
            );

        marker.position.y = 10;
        marker.castShadow = true;

        this.scene.add(marker);
    }

    animate() {
        if (!this.isRunning) {
            return;
        }

        this.animationFrameId =
            window.requestAnimationFrame(
                this.animate
            );

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

        this.renderer.setSize(
            width,
            height,
            false
        );
    }
}
