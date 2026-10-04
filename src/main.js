import "./style.css";
import { Game } from "./core/game.js";

function showFatalError(error) {
    console.error(error);

    const previousDisplay =
        document.querySelector(
            "#fatal-error-display"
        );

    if (previousDisplay) {
        previousDisplay.remove();
    }

    const display =
        document.createElement("div");

    display.id = "fatal-error-display";

    Object.assign(display.style, {
        position: "fixed",
        inset: "0",
        zIndex: "99999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#07111f",
        color: "#ffffff",
        fontFamily: "Consolas, monospace"
    });

    const panel =
        document.createElement("div");

    Object.assign(panel.style, {
        width: "min(900px, 100%)",
        maxHeight: "80vh",
        overflow: "auto",
        padding: "24px",
        border: "1px solid #ff6262",
        borderRadius: "12px",
        background: "rgba(45, 10, 16, 0.96)",
        boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.5)"
    });

    const title =
        document.createElement("h1");

    title.textContent =
        "Simulator Startup Error";

    Object.assign(title.style, {
        margin: "0 0 16px",
        color: "#ff7373",
        fontSize: "22px"
    });

    const message =
        document.createElement("pre");

    message.textContent =
        error?.stack ||
        error?.message ||
        String(error);

    Object.assign(message.style, {
        margin: "0",
        color: "#ffe1e1",
        fontSize: "14px",
        lineHeight: "1.5",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere"
    });

    panel.appendChild(title);
    panel.appendChild(message);
    display.appendChild(panel);
    document.body.appendChild(display);
}

function startApplication() {
    const app =
        document.querySelector("#app");

    if (!app) {
        throw new Error(
            "The application container was not found."
        );
    }

    const game = new Game(app);

    game.start();

    window.novaFlightSimulator = game;
}

window.addEventListener(
    "error",
    (event) => {
        const error =
            event.error ||
            new Error(
                event.message ||
                "An unknown runtime error occurred."
            );

        showFatalError(error);
    }
);

window.addEventListener(
    "unhandledrejection",
    (event) => {
        const error =
            event.reason instanceof Error
                ? event.reason
                : new Error(
                    String(event.reason)
                );

        showFatalError(error);
    }
);

try {
    startApplication();
} catch (error) {
    showFatalError(error);
}
