import { getAircraftById } from "../aircraft/aircraftcatalog.js";
import { TitleScreen } from "./titlescreen.js";
import { AircraftSelectScreen } from "./aircraftselectscreen.js";

export class UIManager {
    constructor({ onPlay }) {
        this.onPlay = onPlay;
        this.selectedAircraftId = "sky172";
        this.currentScreen = null;
    }

    showTitleScreen() {
        this.hideCurrentScreen();

        this.currentScreen = new TitleScreen({
            selectedAircraft: getAircraftById(this.selectedAircraftId),
            onPlay: () => {
                this.hideCurrentScreen();
                this.onPlay(this.selectedAircraftId);
            },
            onSelectPlane: () => this.showAircraftSelectScreen()
        });

        this.currentScreen.show();
    }

    showAircraftSelectScreen() {
        this.hideCurrentScreen();

        this.currentScreen = new AircraftSelectScreen({
            selectedAircraftId: this.selectedAircraftId,
            onSelect: (aircraftId) => {
                this.selectedAircraftId = aircraftId;
            },
            onBack: () => this.showTitleScreen()
        });

        this.currentScreen.show();
    }

    hideCurrentScreen() {
        this.currentScreen?.hide();
        this.currentScreen = null;
    }
}
