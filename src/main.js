import "./style.css";
import { Game } from "./core/Game.js";

// Find the application container
const app = document.querySelector("#app");

if (!app) {
    throw new Error("The application container was not found.");
}

// Create and start the simulator
const game = new Game(app);
game.start();
