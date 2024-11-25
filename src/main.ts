import App from "./App.vue";
import DataPage from "./components/DataPage.vue";
import InitPage from "./components/InitPage.vue";
import MapPage from "./components/MapPage.vue";
import ScorePage from "./components/ScorePage.vue";
import TablePage from "./components/TablePage.vue";
import aerodromesDataString from "./data/aerodromes-jp.yaml?raw";
import { initAerodromes, getAerodromes } from "./data/aerodromes.ts";
import { type Score, ScoreLevel, useScore } from "./data/scores.ts";
import { usePreference } from "./pref.ts";
import "./style.css";
import { createPinia } from "pinia";
import "uikit/dist/js/uikit-icons.min.js";
import { createApp } from "vue";
import { type RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import { parse } from "yaml";

const LocalStorageName = "airport-coverage/data/v0";
const LocalStoragePreferenceName = "airport-coverage/pref/v0";

interface ScoreLocalStorage {
    level: number;
    scores: Record<string, Score>;
    variants: {
        includeAllAirports: boolean;
    };
}

async function main() {
    const routes: RouteRecordRaw[] = [
        { path: "/map", component: MapPage, name: "map" },
        { path: "/table", component: TablePage, name: "table" },
        { path: "/data", component: DataPage, name: "data" },
        { path: "/score", component: ScorePage, name: "score" },
        { path: "/", component: InitPage, name: "init" },
    ];

    const router = createRouter({
        routes,
        history: createWebHashHistory(),
    });

    const aerodromesData = parse(aerodromesDataString);
    initAerodromes(aerodromesData);

    const pinia = createPinia();

    const app = createApp(App);
    app.use(pinia);
    app.use(router);

    initPreference();
    const score = initScore();

    router.beforeEach((to) => {
        if (score.initialized) {
            if (to.name === "init") {
                router.push("/map");
            }
        } else {
            if (to.name !== "init") {
                router.push("/");
            }
        }
    });

    app.mount("#app");
}

function initPreference() {
    const data = localStorage.getItem(LocalStoragePreferenceName);

    const pref = usePreference();

    if (data != null && data !== "") {
        pref.load(data);
    }

    pref.$subscribe((mutation, state) => {
        localStorage.setItem(LocalStoragePreferenceName, pref.json);
    });

    return pref;
}

function initScore() {
    const data = localStorage.getItem(LocalStorageName);

    const score = useScore();

    if (data != null && data !== "") {
        score.initializeFromJSON(data);
    }

    score.$subscribe((mutation, state) => {
        localStorage.setItem(LocalStorageName, score.json);
    });

    return score;
}

main();
