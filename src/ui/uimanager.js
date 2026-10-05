import {
    getAircraftById
} from "../aircraft/aircraftcatalog.js";

import {
    TitleScreen
} from "./titlescreen.js";

import {
    AircraftSelectScreen
} from "./aircraftselectscreen.js";

import {
    FlightSettingsScreen
} from "./flightsettingsscreen.js";

export class UIManager {
    constructor({
        onPlay
    }) {
        this.onPlay =
            onPlay;

        this.selectedAircraftId =
            "sky172";

        this.flightSettings = {
            startHour: 7,
            timeScale: 10,
            initialWeather:
                "CLEAR",
            passengers: 0
        };

        this.currentScreen =
            null;
    }

    showTitleScreen() {
        this.hideCurrentScreen();

        const selectedAircraft =
            getAircraftById(
                this.selectedAircraftId
            );

        this.currentScreen =
            new TitleScreen({
                selectedAircraft,

                flightSettings:
                    this.flightSettings,

                onPlay:
                    () => {
                        this.startFlight();
                    },

                onSelectPlane:
                    () => {
                        this.showAircraftSelectScreen();
                    },

                onFlightSettings:
                    () => {
                        this.showFlightSettingsScreen();
                    }
            });

        this.currentScreen.show();
    }

    showAircraftSelectScreen() {
        this.hideCurrentScreen();

        this.currentScreen =
            new AircraftSelectScreen({
                selectedAircraftId:
                    this.selectedAircraftId,

                onSelect:
                    (
                        aircraftId
                    ) => {
                        this.handleAircraftSelection(
                            aircraftId
                        );
                    },

                onBack:
                    () => {
                        this.showTitleScreen();
                    }
            });

        this.currentScreen.show();
    }

    showFlightSettingsScreen() {
        this.hideCurrentScreen();

        this.currentScreen =
            new FlightSettingsScreen({
                selectedAircraftId:
                    this.selectedAircraftId,

                flightSettings:
                    this.flightSettings,

                onSettingsChanged:
                    (
                        updatedSettings
                    ) => {
                        this.flightSettings = {
                            ...updatedSettings
                        };
                    },

                onBack:
                    () => {
                        this.showTitleScreen();
                    },

                onStartFlight:
                    (
                        updatedSettings
                    ) => {
                        this.flightSettings = {
                            ...updatedSettings
                        };

                        this.startFlight();
                    }
            });

        this.currentScreen.show();
    }

    handleAircraftSelection(
        aircraftId
    ) {
        const previousAircraftId =
            this.selectedAircraftId;

        this.selectedAircraftId =
            aircraftId;

        if (
            previousAircraftId !==
            aircraftId
        ) {
            this.flightSettings.passengers =
                0;
        }
    }

    startFlight() {
        this.hideCurrentScreen();

        this.onPlay({
            selectedAircraftId:
                this.selectedAircraftId,

            flightSettings: {
                ...this.flightSettings
            }
        });
    }

    hideCurrentScreen() {
        this.currentScreen?.hide();

        this.currentScreen =
            null;
    }
}
