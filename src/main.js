import "./style.css";

import {
    Game
} from "./core/game.js";

import {
    UIManager
} from "./ui/uimanager.js";

const container =
    document.querySelector(
        "#app"
    );

if (!container) {
    throw new Error(
        "Application container was not found."
    );
}

document
    .querySelector(
        "#startup-status"
    )
    ?.remove();

let game = null;

const uiManager =
    new UIManager({
        onPlay:
            ({
                selectedAircraftId,
                flightSettings
            }) => {
                game?.stop();

                game =
                    new Game(
                        container,
                        {
                            selectedAircraftId,

                            flightSettings: {
                                ...flightSettings
                            }
                        }
                    );

                game.start();
            }
    });

uiManager.showTitleScreen();
