import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: "./",
    resolve: {
        alias: {
            "../../images/backgrounds": "uikit/src/images/backgrounds",
            "../../images/icons": "uikit/src/images/icons",
        },
    },
});
