import * as THREE from "three";

function createStandardMaterial(
    color,
    roughness = 0.58,
    metalness = 0.08
) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness
    });
}

function createBasicMaterial(color) {
    return new THREE.MeshBasicMaterial({ color });
}

function createFuselage() {
    const fuselage = new THREE.Mesh(
        new THREE.CapsuleGeometry(
            1.55,
            14.5,
            12,
            24
        ),
        createStandardMaterial(0xf0f3f6, 0.48)
    );

    fuselage.name = "Fuselage";
    fuselage.rotation.x = Math.PI / 2;
    fuselage.position.set(0, 2.65, 0.8);

    return fuselage;
}

function createNose() {
    const nose = new THREE.Mesh(
        new THREE.SphereGeometry(1.58, 32, 20),
        createStandardMaterial(0xf0f3f6, 0.46)
    );

    nose.name = "Nose";
    nose.scale.set(1, 0.92, 1.7);
    nose.position.set(0, 2.65, -8.5);

    return nose;
}

function createTailCone() {
    const tailCone = new THREE.Mesh(
        new THREE.ConeGeometry(1.25, 6.8, 28),
        createStandardMaterial(0xf0f3f6, 0.52)
    );

    tailCone.name = "TailCone";
    tailCone.rotation.x = -Math.PI / 2;
    tailCone.position.set(0, 2.74, 11.15);

    return tailCone;
}

function createCockpitWindows() {
    const group = new THREE.Group();
    group.name = "CockpitWindows";

    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x102a3d,
        roughness: 0.18,
        metalness: 0.08
    });

    for (const x of [-0.58, 0.58]) {
        const window = new THREE.Mesh(
            new THREE.BoxGeometry(0.82, 0.55, 0.08),
            windowMaterial
        );

        window.position.set(x, 3.25, -9.72);
        window.rotation.x = THREE.MathUtils.degToRad(-8);
        window.rotation.y = THREE.MathUtils.degToRad(
            x < 0 ? -12 : 12
        );

        group.add(window);
    }

    return group;
}

function createPassengerWindows() {
    const group = new THREE.Group();
    group.name = "PassengerWindows";

    const windowMaterial = createBasicMaterial(0x17384f);

    for (const side of [-1, 1]) {
        for (let index = 0; index < 18; index += 1) {
            const window = new THREE.Mesh(
                new THREE.CircleGeometry(0.16, 12),
                windowMaterial
            );

            window.position.set(
                side * 1.51,
                3.05,
                -6.7 + index * 0.72
            );

            window.rotation.y =
                side < 0
                    ? Math.PI / 2
                    : -Math.PI / 2;

            group.add(window);
        }
    }

    return group;
}

function createMainWing() {
    const group = new THREE.Group();
    group.name = "MainWing";

    const wingMaterial = createStandardMaterial(
        0xdce3e8,
        0.55
    );

    for (const side of [-1, 1]) {
        const shape = new THREE.Shape();
        shape.moveTo(0, -1.8);
        shape.lineTo(side * 11.5, 1.1);
        shape.lineTo(side * 11.1, 2.2);
        shape.lineTo(0, 1.7);
        shape.closePath();

        const wing = new THREE.Mesh(
            new THREE.ExtrudeGeometry(shape, {
                depth: 0.22,
                bevelEnabled: false
            }),
            wingMaterial
        );

        wing.rotation.x = Math.PI / 2;
        wing.position.set(0, 2.45, 0.8);
        group.add(wing);
    }

    return group;
}

function createHorizontalTail() {
    const group = new THREE.Group();
    group.name = "HorizontalTail";

    const material = createStandardMaterial(
        0xdce3e8,
        0.56
    );

    for (const side of [-1, 1]) {
        const shape = new THREE.Shape();
        shape.moveTo(0, -0.7);
        shape.lineTo(side * 4.8, 0.4);
        shape.lineTo(side * 4.5, 1.1);
        shape.lineTo(0, 0.8);
        shape.closePath();

        const stabilizer = new THREE.Mesh(
            new THREE.ExtrudeGeometry(shape, {
                depth: 0.16,
                bevelEnabled: false
            }),
            material
        );

        stabilizer.rotation.x = Math.PI / 2;
        stabilizer.position.set(0, 3.34, 9.5);
        group.add(stabilizer);
    }

    return group;
}

function createVerticalTail() {
    const shape = new THREE.Shape();
    shape.moveTo(-0.3, 0);
    shape.lineTo(-0.1, 5.5);
    shape.lineTo(1.3, 5.25);
    shape.lineTo(2.5, 0);
    shape.closePath();

    const tail = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, {
            depth: 0.22,
            bevelEnabled: false
        }),
        createStandardMaterial(0x1767a7, 0.48)
    );

    tail.name = "VerticalTail";
    tail.rotation.y = Math.PI / 2;
    tail.position.set(-0.11, 3.4, 8.4);

    return tail;
}

function createEngine(side) {
    const engine = new THREE.Group();
    engine.name = side < 0 ? "LeftEngine" : "RightEngine";
    engine.position.set(side * 4.6, 1.45, 0.2);

    const nacelle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.92, 1.08, 3.7, 28),
        createStandardMaterial(0xdfE5e9, 0.42, 0.14)
    );
    nacelle.rotation.x = Math.PI / 2;
    engine.add(nacelle);

    const intake = new THREE.Mesh(
        new THREE.TorusGeometry(0.82, 0.12, 10, 28),
        createStandardMaterial(0x8d99a2, 0.34, 0.42)
    );
    intake.position.z = -1.88;
    engine.add(intake);

    const fan = new THREE.Group();
    fan.name = "EngineFan";
    fan.position.z = -1.82;

    const fanHub = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 8),
        createStandardMaterial(0xaeb8bf, 0.3, 0.5)
    );
    fan.add(fanHub);

    const bladeMaterial = createStandardMaterial(
        0x343b42,
        0.38,
        0.45
    );

    for (let index = 0; index < 12; index += 1) {
        const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.68, 0.05),
            bladeMaterial
        );

        blade.position.y = 0.34;
        blade.rotation.z =
            (index / 12) * Math.PI * 2;
        fan.add(blade);
    }

    engine.add(fan);

    const exhaust = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.65, 1.3, 20),
        createStandardMaterial(0x4c545b, 0.44, 0.36)
    );
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.z = 2.1;
    engine.add(exhaust);

    engine.userData.fan = fan;
    return engine;
}

function createLandingGear() {
    const group = new THREE.Group();
    group.name = "LandingGear";

    const strutMaterial = createStandardMaterial(
        0xaeb7bf,
        0.35,
        0.5
    );
    const tireMaterial = createStandardMaterial(0x16181b, 0.95);

    function addGear(x, z, wheelCount, radius) {
        const strut = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 1.7, 10),
            strutMaterial
        );
        strut.position.set(x, 0.85, z);
        group.add(strut);

        for (let index = 0; index < wheelCount; index += 1) {
            const wheel = new THREE.Mesh(
                new THREE.TorusGeometry(radius, radius * 0.34, 10, 18),
                tireMaterial
            );

            const offset =
                wheelCount === 1
                    ? 0
                    : (index - (wheelCount - 1) / 2) * 0.48;

            wheel.position.set(x + offset, 0.18, z);
            wheel.rotation.y = Math.PI / 2;
            group.add(wheel);
        }
    }

    addGear(0, -7.25, 2, 0.32);
    addGear(-2.35, 2.2, 2, 0.42);
    addGear(2.35, 2.2, 2, 0.42);

    return group;
}

function createNavigationLights() {
    const group = new THREE.Group();
    group.name = "NavigationLights";

    const leftLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 12, 8),
        createBasicMaterial(0xff2b2b)
    );
    leftLight.position.set(-11.4, 2.52, 2.05);
    group.add(leftLight);

    const rightLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 12, 8),
        createBasicMaterial(0x24ff54)
    );
    rightLight.position.set(11.4, 2.52, 2.05);
    group.add(rightLight);

    return group;
}

function createLiveryStripe() {
    const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(3.05, 0.22, 14.4),
        createBasicMaterial(0x1686ca)
    );

    stripe.name = "LiveryStripe";
    stripe.position.set(0, 2.3, 0.4);

    return stripe;
}

export function createAirliner100() {
    const aircraft = new THREE.Group();
    aircraft.name = "NovaAirliner100";

    const leftEngine = createEngine(-1);
    const rightEngine = createEngine(1);

    aircraft.add(
        createFuselage(),
        createNose(),
        createTailCone(),
        createCockpitWindows(),
        createPassengerWindows(),
        createMainWing(),
        createHorizontalTail(),
        createVerticalTail(),
        createLiveryStripe(),
        leftEngine,
        rightEngine,
        createLandingGear(),
        createNavigationLights()
    );

    aircraft.userData = {
        aircraftId: "airliner100",
        displayName: "NOVA AIRLINER 100",
        aircraftType: "FIXED_WING",
        rotatingParts: [
            leftEngine.userData.fan,
            rightEngine.userData.fan
        ]
    };

    return aircraft;
}
