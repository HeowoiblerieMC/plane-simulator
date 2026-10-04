import {
    AIRCRAFT_CATALOG
} from "../aircraft/aircraftcatalog.js";

export class AircraftSelectScreen {
    constructor({
        selectedAircraftId,
        onSelect,
        onBack
    }) {
        this.selectedAircraftId =
            selectedAircraftId;

        this.onSelect = onSelect;
        this.onBack = onBack;

        this.root = null;
        this.infoOverlay = null;
    }

    show() {
        this.hide();

        this.root =
            document.createElement(
                "section"
            );

        this.root.className =
            "aircraft-select-screen";

        this.root.innerHTML = `
            <header class="aircraft-select-header">
                <div>
                    <p class="aircraft-select-header__eyebrow">
                        NOVA FLEET
                    </p>

                    <h1>
                        SELECT AIRCRAFT
                    </h1>
                </div>

                <button
                    class="menu-button menu-button--compact"
                    data-action="back"
                >
                    BACK
                </button>
            </header>

            <main class="aircraft-grid">
                ${AIRCRAFT_CATALOG
                    .map(
                        (aircraft) =>
                            this.createCard(
                                aircraft
                            )
                    )
                    .join("")}
            </main>
        `;

        document.body.appendChild(
            this.root
        );

        this.root
            .querySelector(
                '[data-action="back"]'
            )
            .addEventListener(
                "click",
                () => {
                    this.onBack();
                }
            );

        for (
            const button of
            this.root.querySelectorAll(
                '[data-action="info"]'
            )
        ) {
            button.addEventListener(
                "click",
                () => {
                    this.showInfo(
                        button.dataset
                            .aircraftId
                    );
                }
            );
        }

        for (
            const button of
            this.root.querySelectorAll(
                '[data-action="select"]'
            )
        ) {
            button.addEventListener(
                "click",
                () => {
                    const aircraftId =
                        button.dataset
                            .aircraftId;

                    const aircraft =
                        AIRCRAFT_CATALOG.find(
                            (entry) =>
                                entry.id ===
                                aircraftId
                        );

                    if (
                        !aircraft ||
                        !aircraft.available ||
                        typeof aircraft
                            .createModel !==
                            "function"
                    ) {
                        this.showInfo(
                            aircraftId
                        );

                        return;
                    }

                    this.selectedAircraftId =
                        aircraftId;

                    this.onSelect(
                        aircraftId
                    );

                    this.show();
                }
            );
        }
    }

    createCard(aircraft) {
        const selected =
            aircraft.id ===
            this.selectedAircraftId;

        const available =
            aircraft.available &&
            typeof aircraft.createModel ===
                "function";

        const availabilityLabel =
            available
                ? "AVAILABLE"
                : "IN DEVELOPMENT";

        let selectLabel = "LOCKED";

        if (selected && available) {
            selectLabel = "SELECTED";
        } else if (available) {
            selectLabel = "SELECT";
        }

        const silhouetteText =
            aircraft.secret
                ? "?"
                : this.getAircraftCode(
                    aircraft
                );

        return `
            <article
                class="
                    aircraft-card
                    ${
                        selected
                            ? "aircraft-card--selected"
                            : ""
                    }
                "
            >
                <div class="aircraft-card__topline">
                    <span>
                        ${aircraft.category}
                    </span>

                    <span
                        class="
                            difficulty
                            difficulty--${aircraft.difficulty.toLowerCase()}
                        "
                    >
                        ${aircraft.difficulty}
                    </span>
                </div>

                <div
                    class="
                        aircraft-card__silhouette
                        aircraft-card__silhouette--${aircraft.id}
                    "
                >
                    ${silhouetteText}
                </div>

                <h2>
                    ${aircraft.displayName}
                </h2>

                <p>
                    ${aircraft.engineType}
                </p>

                <dl class="aircraft-card__stats">
                    <div>
                        <dt>
                            MAX SPEED
                        </dt>

                        <dd>
                            ${aircraft.maximumSpeed}
                        </dd>
                    </div>

                    <div>
                        <dt>
                            TAKEOFF
                        </dt>

                        <dd>
                            ${aircraft.rotationSpeed}
                        </dd>
                    </div>
                </dl>

                <span class="aircraft-card__availability">
                    ${availabilityLabel}
                </span>

                <div class="aircraft-card__actions">
                    <button
                        class="
                            menu-button
                            menu-button--small
                        "
                        data-action="info"
                        data-aircraft-id="${aircraft.id}"
                    >
                        INFO
                    </button>

                    <button
                        class="
                            menu-button
                            menu-button--small
                            menu-button--primary
                        "
                        data-action="select"
                        data-aircraft-id="${aircraft.id}"
                        ${
                            available &&
                            !selected
                                ? ""
                                : "disabled"
                        }
                    >
                        ${selectLabel}
                    </button>
                </div>
            </article>
        `;
    }

    getAircraftCode(aircraft) {
        const codes = {
            sky172: "S172",
            airliner100: "A100",
            airliner200: "A200",
            widebody300: "W300",
            jumbo400: "J400",
            falconf1: "F1",
            phantomf2: "F2",
            rotorh1: "H1",
            hyperx: "X"
        };

        return (
            codes[aircraft.id] ||
            aircraft.displayName
                .replace("NOVA ", "")
                .slice(0, 4)
        );
    }

    showInfo(aircraftId) {
        const aircraft =
            AIRCRAFT_CATALOG.find(
                (entry) =>
                    entry.id === aircraftId
            );

        if (!aircraft) {
            return;
        }

        this.infoOverlay?.remove();

        this.infoOverlay =
            document.createElement(
                "div"
            );

        this.infoOverlay.className =
            "aircraft-info-overlay";

        this.infoOverlay.innerHTML = `
            <article class="aircraft-info-panel">
                <button
                    class="aircraft-info-panel__close"
                    aria-label="Close"
                >
                    ×
                </button>

                <p class="aircraft-info-panel__category">
                    ${aircraft.category}
                </p>

                <h2>
                    ${aircraft.displayName}
                </h2>

                <div class="aircraft-info-panel__difficulty">
                    DIFFICULTY:
                    <strong>
                        ${aircraft.difficulty}
                    </strong>
                </div>

                <dl>
                    <div>
                        <dt>
                            ENGINE
                        </dt>

                        <dd>
                            ${aircraft.engineType}
                        </dd>
                    </div>

                    <div>
                        <dt>
                            MAXIMUM SPEED
                        </dt>

                        <dd>
                            ${aircraft.maximumSpeed}
                        </dd>
                    </div>

                    <div>
                        <dt>
                            ROTATION SPEED
                        </dt>

                        <dd>
                            ${aircraft.rotationSpeed}
                        </dd>
                    </div>

                    <div>
                        <dt>
                            HANDLING
                        </dt>

                        <dd>
                            ${aircraft.handling}
                        </dd>
                    </div>

                    <div>
                        <dt>
                            STATUS
                        </dt>

                        <dd>
                            ${
                                aircraft.available
                                    ? "AVAILABLE"
                                    : "IN DEVELOPMENT"
                            }
                        </dd>
                    </div>
                </dl>

                <p class="aircraft-info-panel__description">
                    ${aircraft.description}
                </p>

                <button
                    class="
                        menu-button
                        menu-button--primary
                    "
                    data-action="close-info"
                >
                    CLOSE
                </button>
            </article>
        `;

        document.body.appendChild(
            this.infoOverlay
        );

        const close = () => {
            this.infoOverlay?.remove();
            this.infoOverlay = null;
        };

        this.infoOverlay
            .querySelector(
                ".aircraft-info-panel__close"
            )
            .addEventListener(
                "click",
                close
            );

        this.infoOverlay
            .querySelector(
                '[data-action="close-info"]'
            )
            .addEventListener(
                "click",
                close
            );

        this.infoOverlay.addEventListener(
            "click",
            (event) => {
                if (
                    event.target ===
                    this.infoOverlay
                ) {
                    close();
                }
            }
        );
    }

    hide() {
        this.infoOverlay?.remove();
        this.infoOverlay = null;

        this.root?.remove();
        this.root = null;
    }
}
