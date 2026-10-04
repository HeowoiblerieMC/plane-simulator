export class FlightHUD {
    constructor() {
        this.root = null;
        this.values = {};
        this.controls = {};
        this.controlState = {
            throttleUp: false,
            throttleDown: false,
            brake: false
        };

        this.create();
    }

    create() {
        this.root = document.createElement("div");
        this.root.id = "flight-hud";

        this.root.innerHTML = `
            <div class="hud-panel">
                <div class="hud-title">NOVA FLIGHT</div>

                <div class="hud-row">
                    <span>AIRCRAFT</span>
                    <strong id="hud-aircraft">NOVA SKY 172</strong>
                </div>

                <div class="hud-row">
                    <span>TIME</span>
                    <strong id="hud-time">00:00:00</strong>
                </div>

                <div class="hud-row">
                    <span>SPD</span>
                    <strong id="hud-speed">0 km/h</strong>
                </div>

                <div class="hud-row">
                    <span>ALT</span>
                    <strong id="hud-altitude">0 m</strong>
                </div>

                <div class="hud-row">
                    <span>THR</span>
                    <strong id="hud-throttle">0%</strong>
                </div>

                <div class="hud-row">
                    <span>BRAKE</span>
                    <strong id="hud-brake">OFF</strong>
                </div>

                <div class="hud-throttle-track">
                    <div id="hud-throttle-fill"></div>
                </div>
            </div>

            <div class="touch-controls">
                <button
                    id="control-throttle-up"
                    class="control-button control-button-primary"
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

                <button
                    id="control-brake"
                    class="control-button control-button-danger"
                    type="button"
                >
                    BRAKE
                </button>
            </div>
        `;

        document.body.appendChild(this.root);

        this.values.aircraft =
            document.querySelector("#hud-aircraft");

        this.values.time =
            document.querySelector("#hud-time");

        this.values.speed =
            document.querySelector("#hud-speed");

        this.values.altitude =
            document.querySelector("#hud-altitude");

        this.values.throttle =
            document.querySelector("#hud-throttle");

        this.values.brake =
            document.querySelector("#hud-brake");

        this.values.throttleFill =
            document.querySelector("#hud-throttle-fill");

        this.controls.throttleUp =
            document.querySelector(
                "#control-throttle-up"
            );

        this.controls.throttleDown =
            document.querySelector(
                "#control-throttle-down"
            );

        this.controls.brake =
            document.querySelector(
                "#control-brake"
            );

        this.bindControl(
            this.controls.throttleUp,
            "throttleUp"
        );

        this.bindControl(
            this.controls.throttleDown,
            "throttleDown"
        );

        this.bindControl(
            this.controls.brake,
            "brake"
        );
    }

    bindControl(element, action) {
        const activate = (event) => {
            event.preventDefault();

            this.controlState[action] = true;

            element.classList.add(
                "control-button-active"
            );
        };

        const deactivate = (event) => {
            event.preventDefault();

            this.controlState[action] = false;

            element.classList.remove(
                "control-button-active"
            );
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
            "pointerleave",
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

    update(data) {
        const time =
            new Date().toLocaleTimeString(
                "en-US",
                {
                    hour12: false
                }
            );

        const speedKmh =
            Math.max(
                0,
                Math.round(data.speedKmh)
            );

        const altitudeMeters =
            Math.max(
                0,
                Math.round(data.altitudeMeters)
            );

        const throttlePercent =
            Math.round(data.throttle * 100);

        this.values.aircraft.textContent =
            data.aircraftName;

        this.values.time.textContent =
            time;

        this.values.speed.textContent =
            `${speedKmh} km/h`;

        this.values.altitude.textContent =
            `${altitudeMeters} m`;

        this.values.throttle.textContent =
            `${throttlePercent}%`;

        this.values.brake.textContent =
            data.brakeActive
                ? "ON"
                : "OFF";

        this.values.brake.classList.toggle(
            "hud-warning",
            data.brakeActive
        );

        this.values.throttleFill.style.width =
            `${throttlePercent}%`;
    }

    dispose() {
        this.root?.remove();

        this.root = null;
        this.values = {};
        this.controls = {};
    }
}
