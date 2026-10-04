import * as THREE from "three";

function createMaterial(
    color,
    roughness = 0.65,
    metalness = 0
) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness
    });
}

function createFuselage() {
    const fuselage = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.72,
            0.58,
            5.8,
            24
        ),
        createMaterial(
            0xf2f4f7,
            0.52
        )
    );

    fuselage.name = "Fuselage";

    fuselage.rotation.x =
        Math.PI / 2;

    fuselage.position.set(
        0,
        1.55,
        0
    );

    fuselage.castShadow = false;
    fuselage.receiveShadow = false;

    return fuselage;
}

function createNose() {
    const nose = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.74,
            24,
            16
        ),
        createMaterial(
            0xf2f4f7,
            0.48
        )
    );

    nose.name = "Nose";

    nose.scale.set(
        1,
        0.92,
        1.35
    );

    nose.position.set(
        0,
        1.55,
        -3.05
    );

    return nose;
}

function createTailCone() {
    const tailCone = new THREE.Mesh(
        new THREE.ConeGeometry(
            0.56,
            3.4,
            20
        ),
        createMaterial(
            0xf2f4f7,
            0.55
        )
    );

    tailCone.name = "TailCone";

    tailCone.rotation.x =
        -Math.PI / 2;

    tailCone.position.set(
        0,
        1.6,
        4.45
    );

    return tailCone;
}

function createCockpitWindow() {
    const windowMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x17364f,
            roughness: 0.22,
            metalness: 0.05,
            transparent: true,
            opacity: 0.88
        });

    const cockpitWindow =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.78,
                24,
                16
            ),
            windowMaterial
        );

    cockpitWindow.name =
        "CockpitWindow";

    cockpitWindow.scale.set(
        0.94,
        0.65,
        1.3
    );

    cockpitWindow.position.set(
        0,
        2.08,
        -1.15
    );

    return cockpitWindow;
}

function createMainWing() {
    const wing = new THREE.Mesh(
        new THREE.BoxGeometry(
            10.8,
            0.16,
            1.5
        ),
        createMaterial(
            0xe7eaee,
            0.6
        )
    );

    wing.name = "MainWing";

    wing.position.set(
        0,
        2.02,
        0.05
    );

    return wing;
}

function createHorizontalTail() {
    const horizontalTail =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                4.2,
                0.12,
                0.9
            ),
            createMaterial(
                0xe7eaee,
                0.6
            )
        );

    horizontalTail.name =
        "HorizontalTail";

    horizontalTail.position.set(
        0,
        1.72,
        4.75
    );

    return horizontalTail;
}

function createVerticalTail() {
    const verticalTail =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.16,
                2.1,
                1.25
            ),
            createMaterial(
                0x1d5f99,
                0.55
            )
        );

    verticalTail.name =
        "VerticalTail";

    verticalTail.position.set(
        0,
        2.55,
        4.35
    );

    verticalTail.rotation.x =
        THREE.MathUtils.degToRad(10);

    return verticalTail;
}

function createPropeller() {
    const propeller =
        new THREE.Group();

    propeller.name = "Propeller";

    propeller.position.set(
        0,
        1.55,
        -3.9
    );

    const hub = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.22,
            16,
            12
        ),
        createMaterial(
            0xaeb6bf,
            0.35,
            0.45
        )
    );

    hub.scale.z = 1.6;

    propeller.add(hub);

    const bladeMaterial =
        createMaterial(
            0x20252a,
            0.5
        );

    const upperBlade =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.14,
                1.65,
                0.08
            ),
            bladeMaterial
        );

    upperBlade.position.y = 0.74;

    upperBlade.rotation.z =
        THREE.MathUtils.degToRad(6);

    propeller.add(upperBlade);

    const lowerBlade =
        upperBlade.clone();

    lowerBlade.position.y = -0.74;

    lowerBlade.rotation.z =
        THREE.MathUtils.degToRad(186);

    propeller.add(lowerBlade);

    return propeller;
}

function createWheel(
    x,
    y,
    z,
    radius
) {
    const wheelGroup =
        new THREE.Group();

    const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.045,
            0.045,
            0.72,
            10
        ),
        createMaterial(
            0xbfc5ca,
            0.4,
            0.45
        )
    );

    strut.position.set(
        x,
        y + 0.35,
        z
    );

    wheelGroup.add(strut);

    const wheel = new THREE.Mesh(
        new THREE.TorusGeometry(
            radius,
            radius * 0.34,
            10,
            20
        ),
        createMaterial(
            0x17191c,
            0.92
        )
    );

    wheel.position.set(
        x,
        y,
        z
    );

    wheel.rotation.y =
        Math.PI / 2;

    wheelGroup.add(wheel);

    return wheelGroup;
}

function createNavigationLight(
    color,
    x
) {
    const light = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.11,
            12,
            8
        ),
        new THREE.MeshBasicMaterial({
            color
        })
    );

    light.position.set(
        x,
        2.04,
        0.05
    );

    return light;
}

export function createSky172() {
    const aircraft =
        new THREE.Group();

    aircraft.name = "NovaSky172";

    aircraft.add(
        createFuselage(),
        createNose(),
        createTailCone(),
        createCockpitWindow(),
        createMainWing(),
        createHorizontalTail(),
        createVerticalTail()
    );

    const propeller =
        createPropeller();

    aircraft.add(propeller);

    aircraft.add(
        createWheel(
            -1.18,
            0.38,
            0.55,
            0.3
        ),
        createWheel(
            1.18,
            0.38,
            0.55,
            0.3
        ),
        createWheel(
            0,
            0.32,
            -2.45,
            0.22
        )
    );

    aircraft.add(
        createNavigationLight(
            0xff2222,
            -5.42
        ),
        createNavigationLight(
            0x22ff44,
            5.42
        )
    );

    aircraft.userData = {
        aircraftId: "sky172",
        displayName: "Nova Sky 172",
        propeller
    };

    return aircraft;
}
