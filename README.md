<div align="center">

# ✈️ NOVA FLIGHT SIMULATOR

### Take off from JFK. Choose your aircraft. Own the sky.

A browser-based 3D flight simulator built with **Three.js** and **Vite**.
From personal aircraft to superjumbo airliners, helicopters, tiltrotors, and high-performance jets, every flight begins at New York's JFK Airport.

[![Development Status](https://img.shields.io/badge/status-in%20development-f5a623?style=for-the-badge)](#-development-status)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000000)](https://developer.mozilla.org/docs/Web/JavaScript)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=github&logoColor=white)](https://pages.github.com/)

[▶ Play the Latest Build](https://HeowoiblerieMC.github.io/plane-simulator/) · [Roadmap](#-roadmap) · [Aircraft](#-aircraft-lineup) · [Controls](#%EF%B8%8F-controls)

</div>

---

## 🌎 The Sky Is Not the Limit

**Nova Flight Simulator** is an ambitious browser flight simulator designed to make a wide variety of aircraft enjoyable from one unified experience.

Start with a small personal propeller aircraft, command a modern airliner, hover above the airport in a private helicopter, transition a tiltrotor from vertical lift to forward flight, or experience the responsiveness of a high-performance jet.

The first environment is inspired by **John F. Kennedy International Airport in New York**, with runways, markings, lighting, taxiways, terminals, a control tower, and a dedicated helipad planned as the project develops.

> No installation. No launcher. Just open the simulator and fly.

---

## ✨ Planned Features

- Multiple selectable aircraft with distinct sizes and flight characteristics
- JFK-inspired airport environment
- Runway, apron, taxiway, and helipad starting positions
- Fixed-wing, helicopter, tiltrotor, and VTOL flight systems
- External chase, cockpit, orbit, and tower cameras
- Real-time speed, altitude, throttle, and clock display
- Landing gear, flaps, navigation lights, and landing lights
- Day, night, clouds, weather, ocean, and terrain systems
- Engine, propeller, rotor, and interface audio
- Contrails, rotor effects, ground dust, and lighting effects
- Keyboard controls with a clean input-management system
- GitHub Pages deployment for instant browser access

---

## 🛩️ Aircraft Lineup

### General Aviation

#### Nova Sky 172
A forgiving four-seat personal propeller aircraft designed for training, sightseeing, and relaxed flights around New York.

#### Nova Vision 8
A compact personal and business jet offering greater speed while remaining easier to handle than a full-size airliner.

### Airliners

#### Nova Dream 900
A modern twin-engine long-range airliner with smooth handling and a large passenger-aircraft presence.

#### Nova Super 380
A four-engine, double-deck superjumbo with a massive wingspan, long takeoff roll, and heavy controls.

### Helicopter

#### Nova Raven 44
A lightweight private helicopter for vertical takeoff, hovering, airport exploration, and sightseeing flights.

### Tiltrotor

#### V-22-Style Tiltrotor
A transport aircraft capable of vertical lift, transitional flight, and efficient forward flight through rotating engine nacelles.

### High-Performance Jets

#### Nova Falcon 16
A lightweight single-engine jet focused on agility and accessible high-speed flight.

#### Nova Raptor 22
A twin-engine advanced jet with rapid climb performance and highly responsive controls.

#### Nova Lightning 35V
A short-takeoff and vertical-landing jet featuring conventional and hover-capable flight modes.

> Aircraft names and appearances may evolve during development. Original designs are used where appropriate.

---

## 🗽 First Location: JFK

The simulator begins in New York with a scalable JFK-inspired environment.

The initial airport build will include:

- One fully usable runway
- Runway centerlines, threshold markings, numbers, and touchdown zones
- Runway edge, centerline, and approach lights
- Taxiways and apron areas
- Aircraft-specific spawn positions
- A private helicopter pad
- A simplified control tower
- Expandable terminal areas

All aircraft use a unified coordinate convention:

```text
+X  Right
-X  Left
+Y  Up
-Y  Down
-Z  Aircraft forward
+Z  Aircraft rear
```

This convention keeps aircraft, cameras, runways, and physics aligned throughout the project.

---

## 🎮 Flight Experience

Each aircraft category uses a specialized flight system.

### Fixed-Wing Aircraft

- Thrust and aerodynamic drag
- Lift and stall behavior
- Pitch, roll, and yaw control
- Ground handling and braking
- Takeoff rotation and landing rollout
- Landing gear and flap states

### Helicopter

- Rotor power and collective input
- Vertical takeoff and landing
- Hover stabilization
- Cyclic movement
- Tail-rotor yaw control

### Tiltrotor

- Adjustable nacelle angle
- Helicopter mode
- Transition mode
- Airplane mode
- Runway or helipad operation

### VTOL Jet

- Conventional flight
- Short takeoff
- Transition control
- Hover mode
- Vertical landing

---

## 🖥️ Temporary Flight HUD

Until detailed cockpits are completed, flight information is displayed in the upper-right corner.

```text
AIRCRAFT  NOVA DREAM 900
TIME      14:32:18
SPD       245 km/h
ALT       1280 m
THR       78%
GEAR      DOWN
FLAPS     5°
```

Specialized aircraft receive additional information.

```text
NACELLE   75°
MODE      TRANSITION
```

```text
PWR       72%
V/S       +2.4 m/s
ROTOR     100%
```

---

## ⌨️ Controls

The final key layout may change as the flight model develops.

```text
W / S           Increase or decrease throttle
Arrow Up/Down   Pitch control
Arrow Left/Right Roll control
A / D           Yaw control
Space           Brakes
G               Toggle landing gear
F / V           Flaps up or down
C               Change camera
L               Toggle landing lights
Esc             Pause menu
```

Aircraft-specific controls will be shown automatically when selecting helicopters, tiltrotors, or VTOL aircraft.

---

## 📷 Camera Modes

- **Chase Camera**: Tracks the aircraft from behind
- **Cockpit Camera**: Provides a first-person pilot view
- **Orbit Camera**: Rotates around the aircraft for inspection
- **Tower Camera**: Observes takeoffs and landings from the airport

---

## 🧭 Roadmap

### Phase 1: First Flight

- [x] Create the repository structure
- [x] Configure Vite and Three.js
- [ ] Complete the rendering foundation
- [ ] Create the first JFK runway
- [ ] Add the temporary flight HUD
- [ ] Build the aircraft selection screen
- [ ] Create Nova Sky 172
- [ ] Implement ground movement and takeoff

### Phase 2: Airliner Operations

- [ ] Create Nova Dream 900
- [ ] Add landing gear and flap animation
- [ ] Add runway and navigation lighting
- [ ] Implement landing and braking
- [ ] Add cockpit and tower camera modes

### Phase 3: Vertical Flight

- [ ] Create Nova Raven 44
- [ ] Implement helicopter physics
- [ ] Create the V-22-style tiltrotor
- [ ] Implement nacelle transition
- [ ] Add the JFK helipad

### Phase 4: Expanded Fleet

- [ ] Create Nova Vision 8
- [ ] Create Nova Super 380
- [ ] Create the three high-performance jets
- [ ] Implement VTOL flight
- [ ] Add aircraft-specific sound and visual effects

### Phase 5: Living World

- [ ] Expand the JFK airport environment
- [ ] Add terminal and control tower detail
- [ ] Add clouds and weather
- [ ] Add day and night cycles
- [ ] Add ocean and surrounding terrain
- [ ] Begin detailed cockpit development

---

## 🧱 Project Structure

```text
plane-simulator/
├─ public/
│  ├─ audio/
│  ├─ textures/
│  └─ models/
├─ src/
│  ├─ aircraft/
│  ├─ airport/
│  ├─ cameras/
│  ├─ config/
│  ├─ controls/
│  ├─ core/
│  ├─ effects/
│  ├─ physics/
│  ├─ ui/
│  ├─ utils/
│  └─ world/
├─ index.html
├─ package.json
├─ vite.config.js
└─ README.md
```

The project separates visual models, aircraft performance, flight physics, controls, cameras, airport construction, and interface systems. This keeps individual files focused and makes future aircraft easier to add.

---

## 🚀 Run Locally

### Requirements

- Node.js
- npm
- A modern browser with WebGL support

### Installation

```bash
git clone https://github.com/HeowoiblerieMC/plane-simulator.git
cd plane-simulator
npm install
npm run dev
```

Open the local address displayed by Vite, usually:

```text
http://localhost:5173/
```

### Production Build

```bash
npm run build
npm run preview
```

The production build is generated in the `dist` directory.

---

## 🛠️ Technology

- **Three.js** for real-time 3D rendering
- **JavaScript ES Modules** for modular game systems
- **Vite** for development and production builds
- **HTML and CSS** for menus, HUD elements, and overlays
- **GitHub Actions** for automated deployment
- **GitHub Pages** for browser-based distribution

---

## 📌 Development Status

Nova Flight Simulator is currently in early development. Systems, aircraft, controls, visuals, names, and performance values may change frequently while the foundation is being built.

The immediate goal is simple:

> Select an aircraft, start on a JFK runway, accelerate, rotate, and take to the sky.

---

## 🤝 Contributing

Suggestions, bug reports, and development ideas are welcome through GitHub Issues.

When contributing code:

- Keep modules focused on one responsibility
- Preserve the project coordinate convention
- Keep source-code comments in English
- Avoid placing aircraft physics inside model-generation files
- Test both local development and production builds

---

## 📄 License

A license has not yet been selected. Until a license is added, the source code remains under standard copyright protection.

---

<div align="center">

## Ready for Departure?

**Choose your aircraft. Start the engines. Take off from JFK.**

⭐ Star the repository to follow the development of Nova Flight Simulator.

</div>
