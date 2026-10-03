import "./style.css";
import { Game } from "./core/game.js";

function showStartupError(error) {
    console.error(error);

    const output = document.querySelector("#startup-error");

    if (output) {
        output.textContent = `Startup error: ${error.message}`;
    }
}

function startApplication() {
    const app = document.querySelector("#app");

    if (!app) {
        throw new Error(
            "The application container was not found."
        );
    }

    const game = new Game(app);

    game.start();

    window.novaFlightSimulator = game;
}

try {
    startApplication();
} catch (error) {
    showStartupError(error);
}
