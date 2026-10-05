import * as THREE from "three";

function createSmokeTexture() {
    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = 128;
    canvas.height = 128;

    const context =
        canvas.getContext(
            "2d"
        );

    const gradient =
        context.createRadialGradient(
            64,
            64,
            4,
            64,
            64,
            62
        );

    gradient.addColorStop(
        0,
        "rgba(40, 40, 40, 0.88)"
    );

    gradient.addColorStop(
        0.42,
        "rgba(28, 28, 28, 0.68)"
    );

    gradient.addColorStop(
        0.78,
        "rgba(18, 18, 18, 0.3)"
    );

    gradient.addColorStop(
        1,
        "rgba(10, 10, 10, 0)"
    );

    context.fillStyle =
        gradient;

    context.fillRect(
        0,
        0,
        128,
        128
    );

    const texture =
        new THREE.CanvasTexture(
            canvas
        );

    texture.colorSpace =
        THREE.SRGBColorSpace;

    return texture;
}

export class SmokeEffect {
    constructor({
        parent,
        localPosition = new THREE.Vector3(),
        scale = 1,
        particleCount = 70
    }) {
        this.parent = parent;
        this.localPosition =
            localPosition.clone();
        this.effectScale = scale;
        this.particleCount =
            particleCount;

        this.root =
            new THREE.Group();

        this.root.name =
            "AircraftSmokeEffect";

        this.root.position.copy(
            this.localPosition
        );

        this.root.visible =
            false;

        this.texture =
            createSmokeTexture();

        this.material =
            new THREE.SpriteMaterial({
                map: this.texture,
                color: 0x202020,
                transparent: true,
                opacity: 0,
                depthWrite: false,
                blending:
                    THREE.NormalBlending
            });

        this.particles = [];
        this.spawnTimer = 0;
        this.intensity = 0;
        this.targetIntensity = 0;

        this.parent.add(
            this.root
        );

        this.createParticles();
    }

    createParticles() {
        for (
            let index = 0;
            index <
            this.particleCount;
            index += 1
        ) {
            const sprite =
                new THREE.Sprite(
                    this.material.clone()
                );

            sprite.visible =
                false;

            sprite.userData = {
                active: false,
                life: 0,
                maximumLife: 0,
                velocity:
                    new THREE.Vector3(),
                rotationSpeed: 0
            };

            this.root.add(
                sprite
            );

            this.particles.push(
                sprite
            );
        }
    }

    setActive(
        active,
        intensity = 1
    ) {
        this.targetIntensity =
            active
                ? THREE.MathUtils.clamp(
                    intensity,
                    0,
                    1.5
                )
                : 0;

        if (active) {
            this.root.visible =
                true;
        }
    }

    setPosition(
        localPosition
    ) {
        this.localPosition.copy(
            localPosition
        );

        this.root.position.copy(
            this.localPosition
        );
    }

    spawnParticle(
        aircraftSpeed,
        smokeColor
    ) {
        const particle =
            this.particles.find(
                (entry) =>
                    !entry.userData
                        .active
            );

        if (!particle) {
            return;
        }

        particle.userData.active =
            true;

        particle.userData.life = 0;

        particle.userData.maximumLife =
            2.8 +
            Math.random() *
                3.4;

        particle.userData.velocity.set(
            (
                Math.random() -
                0.5
            ) *
                0.8,
            0.45 +
                Math.random() *
                    1.1,
            2.2 +
                Math.min(
                    aircraftSpeed *
                        0.08,
                    12
                ) +
                Math.random() *
                    1.8
        );

        particle.userData
            .rotationSpeed =
            (
                Math.random() -
                0.5
            ) *
            1.2;

        particle.position.set(
            (
                Math.random() -
                0.5
            ) *
                0.35,
            (
                Math.random() -
                0.5
            ) *
                0.25,
            0
        );

        particle.scale.setScalar(
            (
                0.42 +
                Math.random() *
                    0.45
            ) *
            this.effectScale
        );

        particle.material.color.set(
            smokeColor
        );

        particle.material.opacity =
            0.2;

        particle.visible =
            true;
    }

    update(
        deltaTime,
        {
            aircraftSpeed = 0,
            rainIntensity = 0,
            smokeType = "BLACK"
        } = {}
    ) {
        this.intensity =
            THREE.MathUtils.damp(
                this.intensity,
                this.targetIntensity,
                3.5,
                deltaTime
            );

        if (
            this.intensity >
            0.015
        ) {
            this.root.visible =
                true;

            this.spawnTimer -=
                deltaTime;

            const spawnInterval =
                THREE.MathUtils.lerp(
                    0.12,
                    0.025,
                    THREE.MathUtils.clamp(
                        this.intensity,
                        0,
                        1
                    )
                );

            while (
                this.spawnTimer <=
                0
            ) {
                this.spawnTimer +=
                    spawnInterval;

                this.spawnParticle(
                    aircraftSpeed,
                    smokeType ===
                        "GRAY"
                        ? 0x555555
                        : 0x151515
                );
            }
        }

        const rainFade =
            THREE.MathUtils.lerp(
                1,
                0.65,
                THREE.MathUtils.clamp(
                    rainIntensity,
                    0,
                    1
                )
            );

        let activeCount = 0;

        for (
            const particle of
            this.particles
        ) {
            if (
                !particle.userData
                    .active
            ) {
                continue;
            }

            activeCount += 1;

            particle.userData.life +=
                deltaTime;

            const progress =
                particle.userData.life /
                particle.userData
                    .maximumLife;

            particle.position.addScaledVector(
                particle.userData
                    .velocity,
                deltaTime
            );

            particle.userData
                .velocity.y +=
                deltaTime *
                0.16;

            particle.material.rotation +=
                particle.userData
                    .rotationSpeed *
                deltaTime;

            const scale =
                THREE.MathUtils.lerp(
                    0.55,
                    3.8,
                    progress
                ) *
                this.effectScale;

            particle.scale.setScalar(
                scale
            );

            const fadeIn =
                THREE.MathUtils.smoothstep(
                    progress,
                    0,
                    0.12
                );

            const fadeOut =
                1 -
                THREE.MathUtils.smoothstep(
                    progress,
                    0.46,
                    1
                );

            particle.material.opacity =
                fadeIn *
                fadeOut *
                0.72 *
                rainFade *
                Math.max(
                    this.intensity,
                    0.32
                );

            if (
                progress >=
                1
            ) {
                particle.userData
                    .active =
                    false;

                particle.visible =
                    false;

                particle.material.opacity =
                    0;
            }
        }

        if (
            this.intensity <
                0.01 &&
            activeCount ===
                0
        ) {
            this.root.visible =
                false;
        }
    }

    dispose() {
        this.parent.remove(
            this.root
        );

        for (
            const particle of
            this.particles
        ) {
            particle.material.dispose();
        }

        this.texture.dispose();
        this.material.dispose();

        this.particles = [];
    }
}
