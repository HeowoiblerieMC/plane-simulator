import * as THREE from "three";

export class Game {
    constructor(container) {
        this.container = container;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        this.animationFrameId = null;
        this.isRunning = false;

        this.handleResize = this.handleResize.bind(this);
        this.animate = this.animate.bind(this);
    }

    start() {
        if (this.isRunning) {
            return;
        }

        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLighting();
        this.createTemporaryGround();

        window.addEventListener("resize", this.handleResize);

        this.isRunning = true;
        this.clock.start();
        this.animate();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87b9e8);

        this.scene.fog = new THREE.Fog(
            0x87b9e8,
            1500,
            12000
        );
    }

    createCamera() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        const aspect = width / Math.max(height, 1);

        this.camera = new THREE.PerspectiveCamera(
            60,
            aspect,
            0.1,
            150000
        );

        this.camera.position.set(80, 55, 120);
        this.camera.lookAt(0, 0, 0);
    }

    createRenderer() {
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

        this.container.appendChild(this.renderer.domElement);
    }

    createLighting() {
        const hemisphereLight = new THREE.HemisphereLight(
            0xd9efff,
            0x50633e,
            1.8
        );

        this.scene.add(hemisphereLight);

        const sunlight = new THREE.DirectionalLight(
            0xffffff,
            2.5
        );

        sunlight.position.set(500, 1000, 300);
        sunlight.castShadow = true;

        sunlight.shadow.mapSize.set(2048, 2048);

        sunlight.shadow.camera.left = -1000;
        sunlight.shadow.camera.right = 1000;
        sunlight.shadow.camera.top = 1000;
        sunlight.shadow.camera.bottom = -1000;
        sunlight.shadow.camera.near = 1;
        sunlight.shadow.camera.far = 4000;

        this.scene.add(sunlight);
    }

    createTemporaryGround() {
        const geometry = new THREE.PlaneGeometry(
            10000,
            10000
        );

        const material = new THREE.MeshStandardMaterial({
            color: 0x547747,
            roughness: 1,
            metalness: 0
        });

        const ground = new THREE.Mesh(
            geometry,
            material
        );

        ground.name = "TemporaryGround";
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;

        this.scene.add(ground);

        const grid = new THREE.GridHelper(
            2000,
            100,
            0xffffff,
            0x6f8c65
        );

        grid.name = "DevelopmentGrid";
        grid.position.y = 0.01;

        this.scene.add(grid);
    }

    update(deltaTime) {
        // Game systems will be updated here
        void deltaTime;
    }

    render() {
        this.renderer.render(
            this.scene,
            this.camera
        );
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
        this.render();
    }

    handleResize() {
        if (!this.camera || !this.renderer) {
            return;
        }

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / Math.max(height, 1);
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

        window.cancelAnimationFrame(
            this.animationFrameId
        );

        window.removeEventListener(
            "resize",
            this.handleResize
        );

        this.clock.stop();
    }

    dispose() {
        this.stop();

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

        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }
}
