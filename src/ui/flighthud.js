export class FlightHUD {
    constructor() {
        this.root = null;
        this.values = {};
        this.controls = {};

        this.controlState = {
            throttleUp: false,
            throttleDown: false,
            turnLeft: false,
            turnRight: false,
            pitchUp: false,
            pitchDown: false,
            brake: false
        };

        this.timeFormatter =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone: "America/New_York",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                }
            );

        this.create();
    }

    create() {
        this.root =
            document.createElement("div");

        this.root.id = "flight-hud";

        this.root.innerHTML = `
            <div class="hud-panel">
                <div class="hud-title">
                    NOVA FLIGHT
                </div>

                <div class="hud-row">
                    <span>AIRCRAFT</span>
                    <strong id="hud-aircraft">
                        NOVA SKY 172
                    </strong>
                </div>

                <div class="hud-row">
                    <span>TIME</span>
                    <strong id="hud-time">
                        00:00:00 ET
                    </strong>
                </div>

                <div class="hud-row">
                    <span>SPD</span>
                    <strong id="hud-speed">
                        0 km/h
                    </strong>
                </div>

                <div class="hud-row">
                    <span>ALT</span>
                    <strong id="hud-altitude">
                        0 m
                    </strong>
                </div>

                <div class="hud-row">
                    <span>THR</span>
                    <strong id="hud-throttle">
                        0%
                    </strong>
                </div>

                <div class="hud-row">
                    <span>PITCH</span>
                    <strong id="hud-pitch">
                        0.0 deg
                    </strong>
                </div>

                <div class="hud-row">
                    <span>MODE</span>
                    <strong id="hud-mode">
                        GROUND
                    </strong>
                </div>

                <div class="hud-row">
                    <span>BRAKE</span>
                    <strong id="hud-brake">
                        OFF
                    </strong>
                </div>

                <div class="hud-throttle-track">
                    <div id="hud-throttle-fill"></div>
                </div>
            </div>

            <div
                class="
                    touch-controls
                    touch-controls-left
                "
            >
                <div class="control-row">
                    <button
                        id="control-turn-left"
                        class="control-button"
                        type="button"
                    >
                        LEFT
                    </button>

                    <button
                        id="control-turn-right"
                        class="control-button"
                        type="button"
                    >
                        RIGHT
                    </button>
                </div>

                <div class="control-row">
                    <button
                        id="control-pitch-up"
                        class="
                            control-button
                            control-button-primary
                        "
                        type="button"
                    >
                        PITCH +
                    </button>

                    <button
                        id="control-pitch-down"
                        class="control-button"
                        type="button"
                    >
                        PITCH -
                    </button>
                </div>
            </div>

            <div
                class="
                    touch-controls
                    touch-controls-right
                "
            >
                <div class="control-row">
                    <button
                        id="control-throttle-up"
                        class="
                            control-button
                            control-button-primary
                        "
                        type="button"
                    >
                        THR +
                    </button>

                    <button
                        id="control-throttle-down"
                        class="control-button"
                        type="button"
                    >
                        THR -
                    </button>
                </div>

                <button
                    id="control-brake"
                    class="
                        control-button
                        control-button-danger
                        control-button-wide
                    "
                    type="button"
                >
                    BRAKE
                </button>
            </div>
        `;

        document.body.appendChild(
            this.root
        );

        this.collectValueElements();
        this.collectControlElements();
        this.bindControls();
    }

    collectValueElements() {
        this.values.aircraft =
            this.root.querySelector(
                "#hud-aircraft"
            );

        this.values.time =
            this.root.querySelector(
                "#hud-time"
            );

        this.values.speed =
            this.root.querySelector(
                "#hud-speed"
            );

        this.values.altitude =
            this.root.querySelector(
                "#hud-altitude"
            );

        this.values.throttle =
            this.root.querySelector(
                "#hud-throttle"
            );

        this.values.pitch =
            this.root.querySelector(
                "#hud-pitch"
            );

        this.values.mode =
            this.root.querySelector(
                "#hud-mode"
            );

        this.values.brake =
            this.root.querySelector(
                "#hud-brake"
            );

        this.values.throttleFill =
            this.root.querySelector(
                "#hud-throttle-fill"
            );
    }

    collectControlElements() {
        this.controls.throttleUp =
            this.root.querySelector(
                "#control-throttle-up"
            );

        this.controls.throttleDown =
            this.root.querySelector(
                "#control-throttle-down"
            );

        this.controls.turnLeft =
            this.root.querySelector(
                "#control-turn-left"
            );

        this.controls.turnRight =
            this.root.querySelector(
                "#control-turn-right"
            );

        this.controls.pitchUp =
            this.root.querySelector(
                "#control-pitch-up"
            );

        this.controls.pitchDown =
            this.root.querySelector(
                "#control-pitch-down"
            );

        this.controls.brake =
            this.root.querySelector(
                "#control-brake"
            );
    }

    bindControls() {
        for (
            const [action, element]
            of Object.entries(this.controls)
        ) {
            this.bindControl(
                element,
                action
            );
        }
    }

    bindControl(element, action) {
        if (!element) {
            return;
        }

        const activate = (event) => {
            event.preventDefault();

            this.controlState[action] = true;

            element.classList.add(
                "control-button-active"
            );

            if (
                element.setPointerCapture &&
                event.pointerId !== undefined
            ) {
                try {
                    element.setPointerCapture(
                        event.pointerId
                    );
                } catch (error) {
                    console.warn(
                        "Pointer capture was not available.",
                        error
                    );
                }
            }
        };

        const deactivate = (event) => {
            event.preventDefault();

            this.controlState[action] = false;

            element.classList.remove(
                "control-button-active"
            );

            if (
                element.releasePointerCapture &&
                event.pointerId !== undefined
            ) {
                try {
                    if (
                        element.hasPointerCapture(
                            event.pointerId
                        )
                    ) {
                        element.releasePointerCapture(
                            event.pointerId
                        );
                    }
                } catch (error) {
                    console.warn(
                        "Pointer capture could not be released.",
                        error
                    );
                }
            }
        };

        element.addEventListener(
            "pointerdown",
            activate
        );

        element.addEventListener(
            "pointerup",
            deactivate
        );

        element.addEventListener(
            "pointercancel",
            deactivate
        );

        element.addEventListener(
            "lostpointercapture",
            deactivate
        );

        element.addEventListener(
            "contextmenu",
            (event) => {
                event.preventDefault();
            }
        );
    }

    isControlActive(action) {
        return Boolean(
            this.controlState[action]
        );
    }

    getNewYorkTime() {
        try {
            return this.timeFormatter.format(
                new Date()
            );
        } catch (error) {
            console.warn(
                "New York time could not be formatted.",
                error
            );

            return "00:00:00";
        }
    }

    update(data = {}) {
        const newYorkTime =
            this.getNewYorkTime();

        const speedKmh =
            Math.max(
                0,
                Math.round(
                    Number(data.speedKmh) || 0
                )
            );

        const altitudeMeters =
            Math.max(
                0,
                Math.round(
                    Number(
                        data.altitudeMeters
                    ) || 0
                )
            );

        const throttle =
            Math.min(
                1,
                Math.max(
                    0,
                    Number(data.throttle) || 0
                )
            );

        const throttlePercent =
            Math.round(
                throttle * 100
            );

        const pitchDegrees =
            Number(
                data.pitchDegrees
            ) || 0;

        const airborne =
            Boolean(data.airborne);

        const brakeActive =
            Boolean(data.brakeActive);

        if (this.values.aircraft) {
            this.values.aircraft.textContent =
                data.aircraftName ||
                "NOVA SKY 172";
        }

        if (this.values.time) {
            this.values.time.textContent =
                `${newYorkTime} ET`;
        }

        if (this.values.speed) {
            this.values.speed.textContent =
                `${speedKmh} km/h`;
        }

        if (this.values.altitude) {
            this.values.altitude.textContent =
                `${altitudeMeters} m`;
        }

        if (this.values.throttle) {
            this.values.throttle.textContent =
                `${throttlePercent}%`;
        }

        if (this.values.pitch) {
            this.values.pitch.textContent =
                `${pitchDegrees.toFixed(1)} deg`;
        }

        if (this.values.mode) {
            this.values.mode.textContent =
                airborne
                    ? "AIR"
                    : "GROUND";

            this.values.mode.classList.toggle(
                "hud-airborne",
                airborne
            );
        }

        if (this.values.brake) {
            this.values.brake.textContent =
                brakeActive
                    ? "ON"
                    : "OFF";

            this.values.brake.classList.toggle(
                "hud-warning",
                brakeActive
            );
        }

        if (this.values.throttleFill) {
            this.values.throttleFill.style.width =
                `${throttlePercent}%`;
        }
    }

    resetControls() {
        for (
            const action
            of Object.keys(
                this.controlState
            )
        ) {
            this.controlState[action] = false;
        }

        for (
            const element
            of Object.values(
                this.controls
            )
        ) {
            element?.classList.remove(
                "control-button-active"
            );
        }
    }

    dispose() {
        this.resetControls();

        this.root?.remove();

        this.root = null;
        this.values = {};
        this.controls = {};
    }
}
