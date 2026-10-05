export class TitleScreen {
    constructor({
        onPlay,
        onSelectPlane,
        onFlightSettings,
        selectedAircraft,
        flightSettings
    }) {
        this.onPlay =
            onPlay;

        this.onSelectPlane =
            onSelectPlane;

        this.onFlightSettings =
            onFlightSettings;

        this.selectedAircraft =
            selectedAircraft;

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

        this.root = null;
    }

    show() {
        this.hide();

        const backgroundUrl =
            `${import.meta.env.BASE_URL}images/IMG_2227.jpeg`;

        this.root =
            document.createElement(
                "section"
            );

        this.root.className =
            "title-screen";

        this.root.style.backgroundImage = `
            linear-gradient(
                90deg,
                rgba(3, 12, 22, 0.96) 0%,
                rgba(3, 12, 22, 0.79) 40%,
                rgba(3, 12, 22, 0.25) 74%,
                rgba(3, 12, 22, 0.4) 100%
            ),
            url("${backgroundUrl}")
        `;

        this.root.innerHTML = `
            <div class="title-screen__content">
                <p class="title-screen__eyebrow">
                    NOVA AVIATION PRESENTS
                </p>

                <h1 class="title-screen__title">
                    <span>
                        NOVA
                    </span>

                    <span>
                        FLIGHT SIMULATOR
                    </span>
                </h1>

                <p class="title-screen__subtitle">
                    Choose an aircraft, configure the flight, and take the runway.
                </p>

                <div class="selected-aircraft-panel">
                    <span class="selected-aircraft-panel__label">
                        SELECTED AIRCRAFT
                    </span>

                    <strong class="selected-aircraft-panel__name">
                        ${this.selectedAircraft.displayName}
                    </strong>

                    <span class="selected-aircraft-panel__category">
                        ${this.selectedAircraft.category}
                    </span>
                </div>

                <div class="title-flight-summary">
                    <div>
                        <span>
                            START TIME
                        </span>

                        <strong>
                            ${this.getFormattedTime()}
                        </strong>
                    </div>

                    <div>
                        <span>
                            WEATHER
                        </span>

                        <strong>
                            ${this.flightSettings.initialWeather}
                        </strong>
                    </div>

                    <div>
                        <span>
                            TIME RATE
                        </span>

                        <strong>
                            ${this.flightSettings.timeScale}x
                        </strong>
                    </div>

                    <div>
                        <span>
                            PASSENGERS
                        </span>

                        <strong>
                            ${this.flightSettings.passengers}
                        </strong>
                    </div>
                </div>

                <div class="title-screen__actions">
                    <button
                        class="menu-button menu-button--primary"
                        data-action="play"
                    >
                        PLAY
                    </button>

                    <button
                        class="menu-button"
                        data-action="select-plane"
                    >
                        SELECT PLANE
                    </button>

                    <button
                        class="menu-button"
                        data-action="flight-settings"
                    >
                        FLIGHT SETTINGS
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(
            this.root
        );

        this.root
            .querySelector(
                '[data-action="play"]'
            )
            .addEventListener(
                "click",
                () => {
                    this.onPlay();
                }
            );

        this.root
            .querySelector(
                '[data-action="select-plane"]'
            )
            .addEventListener(
                "click",
                () => {
                    this.onSelectPlane();
                }
            );

        this.root
            .querySelector(
                '[data-action="flight-settings"]'
            )
            .addEventListener(
                "click",
                () => {
                    this.onFlightSettings();
                }
            );
    }

    getFormattedTime() {
        return `${String(
            this.flightSettings
                .startHour
        ).padStart(
            2,
            "0"
        )}:00`;
    }

    hide() {
        this.root?.remove();
        this.root = null;
    }
}
