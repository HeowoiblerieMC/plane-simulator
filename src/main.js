import "./style.css";
import { Game } from "./core/game.js";
import { UIManager } from "./ui/uimanager.js";

const container = document.querySelector("#app");

if (!container) {
    throw new Error("Application container was not found.");
}

let game = null;

const uiManager = new UIManager({
    onPlay: (selectedAircraftId) => {
        game?.stop();
        game = new Game(container, {
            selectedAircraftId
        });
        game.start();
    }
});

uiManager.showTitleScreen();
