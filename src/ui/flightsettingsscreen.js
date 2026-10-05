import {
    getAircraftById
} from "../aircraft/aircraftcatalog.js";

const AIRCRAFT_PASSENGER_LIMITS = {
    sky172: 3,
    airliner100: 150,
    airliner200: 210,
    widebody300: 330,
    jumbo400: 480,
    falconf1: 0,
    phantomf2: 0,
    rotorh1: 6,
    hyperx: 0
};

const TIME_OPTIONS = [
    {
        label: "MORNING",
        time: "07:00",
        startHour: 7
    },
    {
        label: "DAY",
        time: "12:00",
        startHour: 12
    },
    {
        label: "NIGHT",
        time: "20:00",
        startHour: 20
    }
];

const TIME_SCALE_OPTIONS = [
    {
        label: "REAL TIME",
        value: 1
    },
    {
        label: "RELAXED",
        value: 5
    },
    {
        label: "STANDARD",
        value: 10
    },
    {
        label: "FAST",
        value: 30
    }
];

const WEATHER_OPTIONS = [
    {
        label: "CLEAR",
        description: "High visibility and normal runway conditions.",
        value: "CLEAR"
    },
    {
        label: "CLOUDY",
        description: "Reduced sunlight and moderate visibility.",
        value: "CLOUDY"
    },
    {
        label: "RAIN",
        description: "Reduced visibility and weaker runway braking.",
        value: "RAIN"
    }
];

export class FlightSettingsScreen {
    constructor({
        selectedAircraftId,
        flightSettings,
        onSettingsChanged,
        onBack,
        onStartFlight
    }) {
        this.selectedAircraftId =
            selectedAircraftId;

        this.aircraft =
            getAircraftById(
                this.selectedAircraftId
            );

        this.onSettingsChanged =
            onSettingsChanged;

        this.onBack =
            onBack;

        this.onStartFlight =
            onStartFlight;

        this.root = null;

        this.flightSettings = {
            startHour:
                flightSettings
                    ?.startHour ??
                7,

            timeScale:
                flightSettings
                    ?.timeScale ??
                10,

            initialWeather:
                flightSettings
                    ?.initialWeather ??
                "CLEAR",

            passengers:
                flightSettings
                    ?.passengers ??
                0
        };

        this.maximumPassengers =
            AIRCRAFT_PASSENGER_LIMITS[
                this.selectedAircraftId
            ] ??
            0;

        this.flightSettings.passengers =
            Math.min(
                this.flightSettings
                    .passengers,
                this.maximumPassengers
            );
    }

    show() {
        this.hide();

        this.root =
            document.createElement(
                "section"
            );

        this.root.className =
            "flight-settings-screen";

        this.root.innerHTML = `
            <div class="flight-settings-background"></div>

            <header class="flight-settings-header">
                <div>
                    <p class="flight-settings-eyebrow">
                        FLIGHT CONFIGURATION
                    </p>

                    <h1>
                        FLIGHT SETTINGS
                    </h1>
                </div>

                <button
                    class="menu-button menu-button--compact"
                    data-action="back"
                >
                    BACK
                </button>
            </header>

            <main class="flight-settings-content">
                <section class="flight-settings-aircraft">
                    <span class="flight-settings-label">
                        SELECTED AIRCRAFT
                    </span>

                    <strong>
                        ${this.aircraft.displayName}
                    </strong>

                    <span>
                        ${this.aircraft.category}
                    </span>
                </section>

                <section class="settings-section">
                    <div class="settings-section-heading">
                        <div>
                            <span class="settings-number">
                                01
                            </span>

                            <h2>
                                START TIME
                            </h2>
                        </div>

                        <p>
                            Select the starting time. Time will continue moving during the flight.
                        </p>
                    </div>

                    <div class="settings-option-grid settings-option-grid--three">
                        ${TIME_OPTIONS
                            .map(
                                (option) =>
                                    this.createTimeOption(
                                        option
                                    )
                            )
                            .join("")}
                    </div>
                </section>

                <section class="settings-section">
                    <div class="settings-section-heading">
                        <div>
                            <span class="settings-number">
                                02
                            </span>

                            <h2>
                                TIME SPEED
                            </h2>
                        </div>

                        <p>
                            Select how quickly simulation time advances.
                        </p>
                    </div>

                    <div class="settings-option-grid settings-option-grid--four">
                        ${TIME_SCALE_OPTIONS
                            .map(
                                (option) =>
                                    this.createTimeScaleOption(
                                        option
                                    )
                            )
                            .join("")}
                    </div>
                </section>

                <section class="settings-section">
                    <div class="settings-section-heading">
                        <div>
                            <span class="settings-number">
                                03
                            </span>

                            <h2>
                                STARTING WEATHER
                            </h2>
                        </div>

                        <p>
                            Weather may change naturally after the flight begins.
                        </p>
                    </div>

                    <div class="settings-option-grid settings-option-grid--three">
                        ${WEATHER_OPTIONS
                            .map(
                                (option) =>
                                    this.createWeatherOption(
                                        option
                                    )
                            )
                            .join("")}
                    </div>
                </section>

                <section class="settings-section">
                    <div class="settings-section-heading">
                        <div>
                            <span class="settings-number">
                                04
                            </span>

                            <h2>
                                PASSENGERS
                            </h2>
                        </div>

                        <p>
                            Passenger load affects acceleration, takeoff distance, climb performance, and braking.
                        </p>
                    </div>

                    ${this.createPassengerControls()}
                </section>

                <section class="flight-summary">
                    <div>
                        <span>
                            START TIME
                        </span>

                        <strong id="summary-time">
                            ${this.getFormattedStartTime()}
                        </strong>
                    </div>

                    <div>
                        <span>
                            TIME RATE
                        </span>

                        <strong id="summary-time-rate">
                            ${this.flightSettings.timeScale}x
                        </strong>
                    </div>

                    <div>
                        <span>
                            WEATHER
                        </span>

                        <strong id="summary-weather">
                            ${this.flightSettings.initialWeather}
                        </strong>
                    </div>

                    <div>
                        <span>
                            PASSENGERS
                        </span>

                        <strong id="summary-passengers">
                            ${this.flightSettings.passengers} / ${this.maximumPassengers}
                        </strong>
                    </div>

                    <div>
                        <span>
                            LOAD
                        </span>

                        <strong id="summary-load">
                            ${this.getLoadLabel()}
                        </strong>
                    </div>
                </section>

                <button
                    class="menu-button menu-button--primary flight-settings-start"
                    data-action="start-flight"
                >
                    START FLIGHT
                </button>
            </main>
        `;

        document.body.appendChild(
            this.root
        );

        this.bindEvents();
        this.updateScreen();
    }

    createTimeOption(
        option
    ) {
        const selected =
            this.flightSettings
                .startHour ===
            option.startHour;

        return `
            <button
                class="
                    settings-option
                    ${
                        selected
                            ? "settings-option--selected"
                            : ""
                    }
                "
                data-setting="time"
                data-value="${option.startHour}"
            >
                <span class="settings-option-title">
                    ${option.label}
                </span>

                <strong class="settings-option-value">
                    ${option.time}
                </strong>
            </button>
        `;
    }

    createTimeScaleOption(
        option
    ) {
        const selected =
            this.flightSettings
                .timeScale ===
            option.value;

        return `
            <button
                class="
                    settings-option
                    ${
                        selected
                            ? "settings-option--selected"
                            : ""
                    }
                "
                data-setting="time-scale"
                data-value="${option.value}"
            >
                <span class="settings-option-title">
                    ${option.label}
                </span>

                <strong class="settings-option-value">
                    ${option.value}x
                </strong>
            </button>
        `;
    }

    createWeatherOption(
        option
    ) {
        const selected =
            this.flightSettings
                .initialWeather ===
            option.value;

        return `
            <button
                class="
                    settings-option
                    settings-option--weather
                    ${
                        selected
                            ? "settings-option--selected"
                            : ""
                    }
                "
                data-setting="weather"
                data-value="${option.value}"
            >
                <span class="weather-icon weather-icon--${option.value.toLowerCase()}">
                    ${this.getWeatherIcon(option.value)}
                </span>

                <strong class="settings-option-value">
                    ${option.label}
                </strong>

                <span class="settings-option-description">
                    ${option.description}
                </span>
            </button>
        `;
    }

    createPassengerControls() {
        if (
            this.maximumPassengers <=
            0
        ) {
            return `
                <div class="passenger-unavailable">
                    <strong>
                        PASSENGER LOAD NOT AVAILABLE
                    </strong>

                    <span>
                        This aircraft does not carry passengers.
                    </span>
                </div>
            `;
        }

        return `
            <div class="passenger-controls">
                <button
                    class="passenger-button"
                    data-action="passenger-decrease"
                >
                    -
                </button>

                <div class="passenger-value">
                    <strong id="passenger-count">
                        ${this.flightSettings.passengers}
                    </strong>

                    <span>
                        OF ${this.maximumPassengers}
                    </span>
                </div>

                <button
                    class="passenger-button"
                    data-action="passenger-increase"
                >
                    +
                </button>
            </div>

            <input
                id="passenger-slider"
                class="passenger-slider"
                type="range"
                min="0"
                max="${this.maximumPassengers}"
                step="1"
                value="${this.flightSettings.passengers}"
            >

            <div class="passenger-scale">
                <span>
                    0
                </span>

                <span>
                    ${Math.round(
                        this.maximumPassengers /
                        2
                    )}
                </span>

                <span>
                    ${this.maximumPassengers}
                </span>
            </div>
        `;
    }

    getWeatherIcon(
        weather
    ) {
        const icons = {
            CLEAR: "SUN",
            CLOUDY: "CLOUD",
            RAIN: "RAIN"
        };

        return (
            icons[weather] ||
            "WEATHER"
        );
    }

    bindEvents() {
        this.root
            .querySelector(
                '[data-action="back"]'
            )
            .addEventListener(
                "click",
                () => {
                    this.saveSettings();
                    this.onBack();
                }
            );

        this.root
            .querySelector(
                '[data-action="start-flight"]'
            )
            .addEventListener(
                "click",
                () => {
                    this.saveSettings();

                    this.onStartFlight(
                        this.getSettings()
                    );
                }
            );

        for (
            const button of
            this.root.querySelectorAll(
                '[data-setting="time"]'
            )
        ) {
            button.addEventListener(
                "click",
                () => {
                    this.flightSettings
                        .startHour =
                        Number(
                            button.dataset
                                .value
                        );

                    this.updateScreen();
                }
            );
        }

        for (
            const button of
            this.root.querySelectorAll(
                '[data-setting="time-scale"]'
            )
        ) {
            button.addEventListener(
                "click",
                () => {
                    this.flightSettings
                        .timeScale =
                        Number(
                            button.dataset
                                .value
                        );

                    this.updateScreen();
                }
            );
        }

        for (
            const button of
            this.root.querySelectorAll(
                '[data-setting="weather"]'
            )
        ) {
            button.addEventListener(
                "click",
                () => {
                    this.flightSettings
                        .initialWeather =
                        button.dataset
                            .value;

                    this.updateScreen();
                }
            );
        }

        const decreaseButton =
            this.root.querySelector(
                '[data-action="passenger-decrease"]'
            );

        const increaseButton =
            this.root.querySelector(
                '[data-action="passenger-increase"]'
            );

        const passengerSlider =
            this.root.querySelector(
                "#passenger-slider"
            );

        decreaseButton?.addEventListener(
            "click",
            () => {
                const changeAmount =
                    this.getPassengerChangeAmount();

                this.flightSettings.passengers =
                    Math.max(
                        0,
                        this.flightSettings
                            .passengers -
                            changeAmount
                    );

                this.updateScreen();
            }
        );

        increaseButton?.addEventListener(
            "click",
            () => {
                const changeAmount =
                    this.getPassengerChangeAmount();

                this.flightSettings.passengers =
                    Math.min(
                        this.maximumPassengers,
                        this.flightSettings
                            .passengers +
                            changeAmount
                    );

                this.updateScreen();
            }
        );

        passengerSlider?.addEventListener(
            "input",
            () => {
                this.flightSettings.passengers =
                    Number(
                        passengerSlider.value
                    );

                this.updatePassengerDisplay();
                this.updateSummary();
                this.saveSettings();
            }
        );
    }

    getPassengerChangeAmount() {
        if (
            this.maximumPassengers <=
            6
        ) {
            return 1;
        }

        if (
            this.maximumPassengers <=
            150
        ) {
            return 5;
        }

        return 10;
    }

    updateScreen() {
        this.updateOptionButtons();
        this.updatePassengerDisplay();
        this.updateSummary();
        this.saveSettings();
    }

    updateOptionButtons() {
        for (
            const button of
            this.root.querySelectorAll(
                '[data-setting="time"]'
            )
        ) {
            button.classList.toggle(
                "settings-option--selected",
                Number(
                    button.dataset.value
                ) ===
                    this.flightSettings
                        .startHour
            );
        }

        for (
            const button of
            this.root.querySelectorAll(
                '[data-setting="time-scale"]'
            )
        ) {
            button.classList.toggle(
                "settings-option--selected",
                Number(
                    button.dataset.value
                ) ===
                    this.flightSettings
                        .timeScale
            );
        }

        for (
            const button of
            this.root.querySelectorAll(
                '[data-setting="weather"]'
            )
        ) {
            button.classList.toggle(
                "settings-option--selected",
                button.dataset.value ===
                    this.flightSettings
                        .initialWeather
            );
        }
    }

    updatePassengerDisplay() {
        const countElement =
            this.root.querySelector(
                "#passenger-count"
            );

        const slider =
            this.root.querySelector(
                "#passenger-slider"
            );

        if (countElement) {
            countElement.textContent =
                String(
                    this.flightSettings
                        .passengers
                );
        }

        if (slider) {
            slider.value =
                String(
                    this.flightSettings
                        .passengers
                );
        }
    }

    updateSummary() {
        const timeElement =
            this.root.querySelector(
                "#summary-time"
            );

        const timeRateElement =
            this.root.querySelector(
                "#summary-time-rate"
            );

        const weatherElement =
            this.root.querySelector(
                "#summary-weather"
            );

        const passengersElement =
            this.root.querySelector(
                "#summary-passengers"
            );

        const loadElement =
            this.root.querySelector(
                "#summary-load"
            );

        if (timeElement) {
            timeElement.textContent =
                this.getFormattedStartTime();
        }

        if (timeRateElement) {
            timeRateElement.textContent =
                `${this.flightSettings.timeScale}x`;
        }

        if (weatherElement) {
            weatherElement.textContent =
                this.flightSettings
                    .initialWeather;
        }

        if (passengersElement) {
            passengersElement.textContent =
                `${this.flightSettings.passengers} / ${this.maximumPassengers}`;
        }

        if (loadElement) {
            loadElement.textContent =
                this.getLoadLabel();
        }
    }

    getFormattedStartTime() {
        return `${String(
            this.flightSettings
                .startHour
        ).padStart(
            2,
            "0"
        )}:00`;
    }

    getLoadRatio() {
        if (
            this.maximumPassengers <=
            0
        ) {
            return 0;
        }

        return (
            this.flightSettings
                .passengers /
            this.maximumPassengers
        );
    }

    getLoadLabel() {
        if (
            this.maximumPassengers <=
            0
        ) {
            return "NOT APPLICABLE";
        }

        const loadRatio =
            this.getLoadRatio();

        if (loadRatio <= 0.25) {
            return "LIGHT";
        }

        if (loadRatio <= 0.7) {
            return "NORMAL";
        }

        return "HEAVY";
    }

    saveSettings() {
        this.onSettingsChanged?.(
            this.getSettings()
        );
    }

    getSettings() {
        return {
            startHour:
                this.flightSettings
                    .startHour,

            timeScale:
                this.flightSettings
                    .timeScale,

            initialWeather:
                this.flightSettings
                    .initialWeather,

            passengers:
                this.flightSettings
                    .passengers
        };
    }

    hide() {
        this.root?.remove();
        this.root = null;
    }
}
