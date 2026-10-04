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
            0.78,
            0.58,
            5.8,
            24
        ),
        createMaterial(0xf5f7fa, 0.5)
    );

    fuselage.name = "Fuselage";
    fuselage.rotation.x = Math.PI / 2;
    fuselage.position.set(0, 1.55, 0);
    fuselage.castShadow = true;
    fuselage.receiveShadow = true;

    return fuselage;
}

function createNose() {
    const nose = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.79,
            24,
            16
        ),
        createMaterial(0xf5f7fa, 0.45)
    );

    nose.name = "Nose";
    nose.scale.set(1, 0.93, 1.35);
    nose.position.set(0, 1.55, -3);
    nose.castShadow = true;

    return nose;
}

function createRearFuselage() {
    const rearFuselage = new THREE.Mesh(
        new THREE.ConeGeometry(
            0.58,
            3.4,
            20
        ),
        createMaterial(0xf5f7fa, 0.55)
    );

    rearFuselage.name = "RearFuselage";
    rearFuselage.rotation.x = -Math.PI / 2;
    rearFuselage.position.set(0, 1.62, 4.45);
    rearFuselage.castShadow = true;

    return rearFuselage;
}

function createCockpit() {
    const cockpitMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x18344f,
            roughness: 0.25,
            metalness: 0.05,
            transparent: true,
            opacity: 0.9
        });

    const cockpit = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.82,
            24,
            16
        ),
        cockpitMaterial
    );

    cockpit.name = "Cockpit";
    cockpit.scale.set(0.92, 0.68, 1.25);
    cockpit.position.set(0, 2.1, -1.25);
    cockpit.castShadow = true;

    return cockpit;
}

function createMainWing() {
    const wing = new THREE.Mesh(
        new THREE.BoxGeometry(
            10.8,
            0.16,
            1.45
        ),
        createMaterial(0xe7ebef, 0.6)
    );

    wing.name = "MainWing";
    wing.position.set(0, 2.05, 0.15);
    wing.rotation.x = THREE.MathUtils.degToRad(1.5);
    wing.castShadow = true;
    wing.receiveShadow = true;

    return wing;
}

function createWingStrut(
    xPosition,
    rotationZ
) {
    const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.055,
            0.055,
            2.55,
            10
        ),
        createMaterial(0xd0d5da, 0.6, 0.1)
    );

    strut.name = "WingStrut";
    strut.position.set(
        xPosition,
        1.22,
        0.25
    );

    strut.rotation.z = rotationZ;
    strut.castShadow = true;

    return strut;
}

function createHorizontalTail() {
    const tail = new THREE.Mesh(
        new THREE.BoxGeometry(
            4.2,
            0.12,
            0.9
        ),
        createMaterial(0xe7ebef, 0.6)
    );

    tail.name = "HorizontalTail";
    tail.position.set(0, 1.72, 4.82);
    tail.castShadow = true;

    return tail;
}

function createVerticalTail() {
    const geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array([
        0, 0, 0,
        0, 2.25, 0.8,
        0, 0, 1.5,

        0.12, 0, 0,
        0.12, 0, 1.5,
        0.12, 2.25, 0.8
    ]);

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            vertices,
            3
        )
    );

    geometry.computeVertexNormals();

    const tail = new THREE.Mesh(
        geometry,
        createMaterial(0x1d5f99, 0.5)
    );

    tail.name = "VerticalTail";
    tail.position.set(-0.06, 1.72, 4.15);
    tail.castShadow = true;

    return tail;
}

function createPropeller() {
    const propellerGroup =
        new THREE.Group();

    propellerGroup.name = "Propeller";

    const hub = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.22,
            16,
            12
        ),
        createMaterial(0xaeb6bf, 0.35, 0.45)
    );

    hub.scale.z = 1.8;
    hub.position.z = -3.92;
    hub.castShadow = true;

    propellerGroup.add(hub);

    const bladeMaterial =
        createMaterial(0x20252a, 0.5);

    const upperBlade = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.14,
            1.65,
            0.08
        ),
        bladeMaterial
    );

    upperBlade.position.set(
        0,
        0.74,
        -4.05
    );

    upperBlade.rotation.z =
        THREE.MathUtils.degToRad(6);

    upperBlade.castShadow = true;

    propellerGroup.add(upperBlade);

    const lowerBlade =
        upperBlade.clone();

    lowerBlade.position.y = -0.74;
    lowerBlade.rotation.z =
        THREE.MathUtils.degToRad(186);

    propellerGroup.add(lowerBlade);

    propellerGroup.position.y = 1.55;

    return propellerGroup;
}

function createWheelAssembly(
    x,
    y,
    z,
    wheelRadius
) {
    const wheelGroup =
        new THREE.Group();

    wheelGroup.name = "LandingGear";

    const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.045,
            0.045,
            0.75,
            10
        ),
        createMaterial(0xbfc5ca, 0.45, 0.5)
    );

    strut.position.set(
        x,
        y + 0.35,
        z
    );

    strut.castShadow = true;

    wheelGroup.add(strut);

    const wheel = new THREE.Mesh(
        new THREE.TorusGeometry(
            wheelRadius,
            wheelRadius * 0.34,
            10,
            20
        ),
        createMaterial(0x17191c, 0.9)
    );

    wheel.position.set(x, y, z);
    wheel.rotation.y = Math.PI / 2;
    wheel.castShadow = true;

    wheelGroup.add(wheel);

    return wheelGroup;
}

function createNavigationLight(
    color,
    x,
    y,
    z
) {
    const lightGroup =
        new THREE.Group();

    const lens = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.12,
            12,
            8
        ),
        new THREE.MeshBasicMaterial({
            color
        })
    );

    lens.position.set(x, y, z);

    const glow = new THREE.PointLight(
        color,
        1.2,
        8,
        2
    );

    glow.position.set(x, y, z);

    lightGroup.add(lens, glow);

    return lightGroup;
}

export function createSky172() {
    const aircraft =
        new THREE.Group();

    aircraft.name = "NovaSky172";

    aircraft.add(
        createFuselage(),
        createNose(),
        createRearFuselage(),
        createCockpit(),
        createMainWing(),
        createHorizontalTail(),
        createVerticalTail(),
        createPropeller()
    );

    aircraft.add(
        createWingStrut(
            -2.05,
            THREE.MathUtils.degToRad(-57)
        ),
        createWingStrut(
            2.05,
            THREE.MathUtils.degToRad(57)
        )
    );

    aircraft.add(
        createWheelAssembly(
            -1.18,
            0.38,
            0.55,
            0.3
        ),
        createWheelAssembly(
            1.18,
            0.38,
            0.55,
            0.3
        ),
        createWheelAssembly(
            0,
            0.32,
            -2.48,
            0.22
        )
    );

    aircraft.add(
        createNavigationLight(
            0xff2020,
            -5.45,
            2.06,
            0.15
        ),
        createNavigationLight(
            0x20ff40,
            5.45,
            2.06,
            0.15
        )
    );

    aircraft.userData = {
        aircraftId: "sky172",
        displayName: "Nova Sky 172",
        aircraftType: "FIXED_WING",
        forwardDirection: new THREE.Vector3(
            0,
            0,
            -1
        ),
        propeller: aircraft.getObjectByName(
            "Propeller"
        )
    };

    return aircraft;
}
