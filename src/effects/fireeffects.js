import * as THREE from "three";

function createFlameMaterial(
    color,
    opacity
) {
    return new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });
}

export class FireEffect {
    constructor({
        parent,
        localPosition = new THREE.Vector3(),
        scale = 1
    }) {
        this.parent = parent;
        this.localPosition =
            localPosition.clone();
        this.effectScale = scale;

        this.root =
            new THREE.Group();

        this.root.name =
            "AircraftFireEffect";

        this.root.position.copy(
            this.localPosition
        );

        this.root.visible =
            false;

        this.elapsedTime = 0;
        this.intensity = 0;
        this.targetIntensity = 0;

        this.flames = [];
        this.pointLight = null;

        this.createFlames();

        this.parent.add(
            this.root
        );
    }

    createFlames() {
        const flameSettings = [
            {
                color: 0xffffcc,
                opacity: 0.92,
                radius: 0.2,
                height: 1.2,
                offset: 0
            },
            {
                color: 0xffd83d,
                opacity: 0.88,
                radius: 0.32,
                height: 1.8,
                offset: 0.18
            },
            {
                color: 0xff7a19,
                opacity: 0.78,
                radius: 0.46,
                height: 2.5,
                offset: 0.4
            },
            {
                color: 0xe62d12,
                opacity: 0.5,
                radius: 0.6,
                height: 3.2,
                offset: 0.65
            }
        ];

        for (
            const settings of
            flameSettings
        ) {
            const flame =
                new THREE.Mesh(
                    new THREE.ConeGeometry(
                        settings.radius,
                        settings.height,
                        10,
                        1,
                        true
                    ),
                    createFlameMaterial(
                        settings.color,
                        settings.opacity
                    )
                );

            flame.rotation.x =
                -Math.PI / 2;

            flame.position.z =
                settings.offset;

            flame.userData = {
                baseScale:
                    0.8 +
                    settings.radius,
                phase:
                    Math.random() *
                    Math.PI *
                    2,
                baseOpacity:
                    settings.opacity
            };

            this.root.add(
                flame
            );

            this.flames.push(
                flame
            );
        }

        this.pointLight =
            new THREE.PointLight(
                0xff6a1f,
                0,
                18,
                2
            );

        this.pointLight.position.set(
            0,
            0,
            0.5
        );

        this.root.add(
            this.pointLight
        );
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

    update(
        deltaTime,
        {
            aircraftSpeed = 0,
            rainIntensity = 0,
            nightFactor = 0
        } = {}
    ) {
        this.elapsedTime +=
            deltaTime;

        this.intensity =
            THREE.MathUtils.damp(
                this.intensity,
                this.targetIntensity,
                5,
                deltaTime
            );

        if (
            this.intensity <
                0.01 &&
            this.targetIntensity ===
                0
        ) {
            this.root.visible =
                false;

            return;
        }

        this.root.visible =
            true;

        const rainReduction =
            THREE.MathUtils.lerp(
                1,
                0.72,
                THREE.MathUtils.clamp(
                    rainIntensity,
                    0,
                    1
                )
            );

        const speedStretch =
            1 +
            Math.min(
                aircraftSpeed /
                    90,
                2.4
            );

        for (
            let index = 0;
            index <
            this.flames.length;
            index += 1
        ) {
            const flame =
                this.flames[index];

            const flicker =
                0.78 +
                Math.sin(
                    this.elapsedTime *
                        (
                            12 +
                            index *
                                2.7
                        ) +
                        flame.userData
                            .phase
                ) *
                    0.18 +
                Math.random() *
                    0.09;

            const baseScale =
                flame.userData
                    .baseScale;

            flame.scale.set(
                baseScale *
                    flicker *
                    this.intensity *
                    rainReduction *
                    this.effectScale,
                baseScale *
                    flicker *
                    this.intensity *
                    rainReduction *
                    this.effectScale,
                speedStretch *
                    this.intensity *
                    this.effectScale
            );

            flame.material.opacity =
                flame.userData
                    .baseOpacity *
                this.intensity *
                rainReduction;

            flame.rotation.z =
                Math.sin(
                    this.elapsedTime *
                        7 +
                        index
                ) *
                0.12;
        }

        this.pointLight.intensity =
            this.intensity *
            THREE.MathUtils.lerp(
                1.2,
                3.8,
                nightFactor
            );

        this.pointLight.distance =
            14 +
            this.intensity *
                12;
    }

    dispose() {
        this.parent.remove(
            this.root
        );

        for (
            const flame of
            this.flames
        ) {
            flame.geometry.dispose();
            flame.material.dispose();
        }

        this.flames = [];
        this.pointLight = null;
    }
}
