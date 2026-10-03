import { defineConfig } from "vite";

export default defineConfig({
    base: "/plane-simulator/",

    server: {
        host: true,
        port: 5173
    },

    build: {
        outDir: "dist",
        assetsDir: "assets",
        sourcemap: true
    }
});
