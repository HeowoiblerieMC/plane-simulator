export class TitleScreen {
    constructor({ onPlay, onSelectPlane, selectedAircraft }) {
        this.onPlay = onPlay;
        this.onSelectPlane = onSelectPlane;
        this.selectedAircraft = selectedAircraft;
        this.root = null;
    }

    show() {
        this.hide();

        const backgroundUrl = `${import.meta.env.BASE_URL}images/IMG_2227.jpeg`;

        this.root = document.createElement("section");
        this.root.className = "title-screen";
        this.root.style.backgroundImage = `
            linear-gradient(
                90deg,
                rgba(3, 12, 22, 0.96) 0%,
                rgba(3, 12, 22, 0.77) 38%,
                rgba(3, 12, 22, 0.24) 72%,
                rgba(3, 12, 22, 0.38) 100%
            ),
            url("${backgroundUrl}")
        `;

        this.root.innerHTML = `
            <div class="title-screen__content">
                <p class="title-screen__eyebrow">NOVA AVIATION PRESENTS</p>
                <h1 class="title-screen__title">
                    <span>NOVA</span>
                    <span>FLIGHT SIMULATOR</span>
                </h1>
                <p class="title-screen__subtitle">
                    Choose an aircraft, take the runway, and fly.
                </p>

                <div class="selected-aircraft-panel">
                    <span class="selected-aircraft-panel__label">SELECTED AIRCRAFT</span>
                    <strong class="selected-aircraft-panel__name">
                        ${this.selectedAircraft.displayName}
                    </strong>
                    <span class="selected-aircraft-panel__category">
                        ${this.selectedAircraft.category}
                    </span>
                </div>

                <div class="title-screen__actions">
                    <button class="menu-button menu-button--primary" data-action="play">
                        PLAY
                    </button>
                    <button class="menu-button" data-action="select-plane">
                        SELECT PLANE
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.root);

        this.root
            .querySelector('[data-action="play"]')
            .addEventListener("click", () => this.onPlay());

        this.root
            .querySelector('[data-action="select-plane"]')
            .addEventListener("click", () => this.onSelectPlane());
    }

    hide() {
        this.root?.remove();
        this.root = null;
    }
}
