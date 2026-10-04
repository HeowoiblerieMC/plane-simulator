import * as THREE from "three";

function material(color, roughness = 0.65, metalness = 0) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function box(name, size, position, color, parent, rotation = [0, 0, 0]) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(...size),
        material(color)
    );
    mesh.name = name;
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
}

function cylinder(name, radii, height, position, color, parent, rotation = [0, 0, 0]) {
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radii[0], radii[1], height, 24),
        material(color, 0.55)
    );
    mesh.name = name;
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
}

function createAircraftBody(aircraft) {
    cylinder(
        "Fuselage",
        [0.72, 0.58],
        5.8,
        [0, 1.55, 0],
        0xf3f5f7,
        aircraft,
        [Math.PI / 2, 0, 0]
    );

    const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.74, 24, 16),
        material(0xf3f5f7, 0.5)
    );
    nose.name = "Nose";
    nose.scale.set(1, 0.92, 1.35);
    nose.position.set(0, 1.55, -3.05);
    nose.castShadow = true;
    aircraft.add(nose);

    const tailCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.56, 3.5, 20),
        material(0xf3f5f7, 0.55)
    );
    tailCone.name = "TailCone";
    tailCone.rotation.x = -Math.PI / 2;
    tailCone.position.set(0, 1.6, 4.5);
    tailCone.castShadow = true;
    aircraft.add(tailCone);

    const canopy = new THREE.Mesh(
        new THREE.SphereGeometry(0.78, 24, 16),
        new THREE.MeshStandardMaterial({
            color: 0x16344d,
            roughness: 0.2,
            transparent: true,
            opacity: 0.88
        })
    );
    canopy.name = "ExteriorCanopy";
    canopy.scale.set(0.94, 0.65, 1.3);
    canopy.position.set(0, 2.08, -1.15);
    aircraft.add(canopy);

    box("MainWing", [10.8, 0.16, 1.5], [0, 2.02, 0.05], 0xe8ebee, aircraft);
    box("HorizontalTail", [4.2, 0.12, 0.9], [0, 1.72, 4.75], 0xe8ebee, aircraft);
    box("VerticalTail", [0.16, 2.1, 1.25], [0, 2.55, 4.35], 0x1d5f99, aircraft, [0.18, 0, 0]);
}

function createLandingGear(aircraft) {
    const wheelMaterial = material(0x17191c, 0.95);
    const strutMaterial = material(0xbfc5ca, 0.4, 0.45);

    for (const [x, y, z, radius] of [
        [-1.18, 0.38, 0.55, 0.3],
        [1.18, 0.38, 0.55, 0.3],
        [0, 0.32, -2.45, 0.22]
    ]) {
        const strut = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.045, 0.72, 10),
            strutMaterial
        );
        strut.position.set(x, y + 0.35, z);
        strut.castShadow = true;
        aircraft.add(strut);

        const wheel = new THREE.Mesh(
            new THREE.TorusGeometry(radius, radius * 0.34, 10, 20),
            wheelMaterial
        );
        wheel.position.set(x, y, z);
        wheel.rotation.y = Math.PI / 2;
        wheel.castShadow = true;
        aircraft.add(wheel);
    }
}

function createPropeller(aircraft) {
    const propeller = new THREE.Group();
    propeller.name = "Propeller";
    propeller.position.set(0, 1.55, -3.9);

    const hub = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 16, 12),
        material(0xaeb6bf, 0.35, 0.5)
    );
    hub.scale.z = 1.6;
    propeller.add(hub);

    const bladeMaterial = material(0x20252a, 0.5);
    for (const angle of [0, Math.PI]) {
        const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, 1.65, 0.08),
            bladeMaterial
        );
        blade.position.y = angle === 0 ? 0.74 : -0.74;
        blade.rotation.z = angle + THREE.MathUtils.degToRad(6);
        blade.castShadow = true;
        propeller.add(blade);
    }

    aircraft.add(propeller);
    return propeller;
}

function createCockpit(cockpit) {
    const shell = material(0x24272b, 0.85);
    const trim = material(0x111317, 0.8);
    const panelMaterial = material(0x181a1e, 0.82);

    box("CockpitRoof", [4.7, 0.28, 2.1], [0, 3.35, -0.4], 0x2a2d31, cockpit);
    box("CockpitLeftSide", [0.32, 2.7, 4.2], [-2.25, 1.85, -0.4], 0x2d3034, cockpit);
    box("CockpitRightSide", [0.32, 2.7, 4.2], [2.25, 1.85, -0.4], 0x2d3034, cockpit);
    box("LeftPillar", [0.3, 3.1, 0.35], [-1.95, 2.3, -2.15], 0x25282c, cockpit, [0, 0, -0.1]);
    box("RightPillar", [0.3, 3.1, 0.35], [1.95, 2.3, -2.15], 0x25282c, cockpit, [0, 0, 0.1]);
    box("CenterPost", [0.16, 2.55, 0.22], [0, 2.35, -2.22], 0x202327, cockpit);

    const panel = box("InstrumentPanel", [4.0, 1.45, 0.48], [0, 1.55, -2.0], 0x191b1f, cockpit, [-0.12, 0, 0]);
    panel.material = panelMaterial;
    box("PanelBrow", [4.18, 0.28, 0.75], [0, 2.28, -1.88], 0x111317, cockpit);
    box("CenterConsole", [0.72, 1.05, 2.3], [0, 0.82, -0.95], 0x202328, cockpit, [-0.18, 0, 0]);

    const displayColors = [0x1ca7ec, 0x0b5fa5];
    for (const [x, color] of [[-0.85, displayColors[0]], [0.85, displayColors[1]]]) {
        const screen = box("GlassDisplay", [1.25, 0.82, 0.05], [x, 1.68, -2.27], color, cockpit, [-0.12, 0, 0]);
        screen.material = new THREE.MeshBasicMaterial({ color });
    }

    for (const x of [-1.55, 0, 1.55]) {
        const gauge = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.05, 24),
            new THREE.MeshBasicMaterial({ color: 0x172c3b })
        );
        gauge.rotation.x = Math.PI / 2;
        gauge.position.set(x, 1.0, -2.25);
        cockpit.add(gauge);
    }

    for (const x of [-0.9, 0.9]) {
        const yoke = new THREE.Group();
        yoke.name = x < 0 ? "LeftYoke" : "RightYoke";
        cylinder("YokeColumn", [0.055, 0.055], 0.78, [x, 1.0, -1.5], 0x15171a, yoke, [Math.PI / 2, 0, 0]);
        box("YokeBar", [0.85, 0.12, 0.12], [x, 1.18, -1.9], 0x111316, yoke);
        box("YokeLeftGrip", [0.14, 0.58, 0.14], [x - 0.35, 1.05, -1.9], 0x111316, yoke, [0, 0, -0.18]);
        box("YokeRightGrip", [0.14, 0.58, 0.14], [x + 0.35, 1.05, -1.9], 0x111316, yoke, [0, 0, 0.18]);
        cockpit.add(yoke);
    }

    box("LeftSeat", [1.25, 0.35, 1.55], [-0.9, 0.35, 0.55], 0x32363b, cockpit);
    box("RightSeat", [1.25, 0.35, 1.55], [0.9, 0.35, 0.55], 0x32363b, cockpit);
    box("LeftSeatBack", [1.25, 1.6, 0.3], [-0.9, 1.1, 1.2], 0x32363b, cockpit, [-0.12, 0, 0]);
    box("RightSeatBack", [1.25, 1.6, 0.3], [0.9, 1.1, 1.2], 0x32363b, cockpit, [-0.12, 0, 0]);

    const throttle = cylinder("ThrottleLever", [0.055, 0.055], 0.65, [-0.15, 1.05, -0.55], 0x202327, cockpit, [0.35, 0, 0]);
    throttle.material = trim;
    const mixture = cylinder("MixtureLever", [0.055, 0.055], 0.65, [0.15, 1.05, -0.55], 0x9f1f20, cockpit, [0.35, 0, 0]);
    mixture.material = material(0xb3262a, 0.5);

    const chaseMount = new THREE.Object3D();
    chaseMount.name = "ChaseCameraMount";
    chaseMount.position.set(0, 5.8, 18);
    cockpit.add(chaseMount);

    const chaseTarget = new THREE.Object3D();
    chaseTarget.name = "ChaseLookTarget";
    chaseTarget.position.set(0, 1.9, -6);
    cockpit.add(chaseTarget);

    const cockpitMount = new THREE.Object3D();
    cockpitMount.name = "CockpitCameraMount";
    cockpitMount.position.set(0, 2.55, -0.7);
    cockpit.add(cockpitMount);

    const cockpitTarget = new THREE.Object3D();
    cockpitTarget.name = "CockpitLookTarget";
    cockpitTarget.position.set(0, 2.45, -50);
    cockpit.add(cockpitTarget);
}

export function createSky172() {
    const aircraft = new THREE.Group();
    aircraft.name = "NovaSky172";

    createAircraftBody(aircraft);
    createLandingGear(aircraft);
    const propeller = createPropeller(aircraft);

    const cockpit = new THREE.Group();
    cockpit.name = "CockpitInterior";
    createCockpit(cockpit);
    aircraft.add(cockpit);

    aircraft.userData = {
        aircraftId: "sky172",
        displayName: "Nova Sky 172",
        aircraftType: "FIXED_WING",
        propeller,
        cockpit,
        chaseCameraMount: aircraft.getObjectByName("ChaseCameraMount"),
        chaseLookTarget: aircraft.getObjectByName("ChaseLookTarget"),
        cockpitCameraMount: aircraft.getObjectByName("CockpitCameraMount"),
        cockpitLookTarget: aircraft.getObjectByName("CockpitLookTarget")
    };

    return aircraft;
}
