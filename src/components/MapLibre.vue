<template lang="pug">
.map(id="main-map")
</template>

<script setup lang="ts">
import { Aerodrome } from "../data/aerodromes";
import { useScore, type Score, type ScoreLevel1, type ScoreLevel2, type ScoreLevel3 } from "../data/scores";
import maplibreGl from "maplibre-gl";
import { onMounted, watch } from "vue";

const props = defineProps<{
    selected: string | null;
}>();

const emit = defineEmits<{
    (e: "click", element: Aerodrome): void;
}>();

watch(props, (newProps) => {
    updateSelected(newProps.selected);
});

onMounted(async () => {
    const map = new maplibreGl.Map({
        container: "main-map",
        style: "https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json",
        center: [140, 36],
        zoom: 4,
        trackResize: true,
    });

    const div = document.getElementById("main-map")!;
    const observer: ResizeObserver = new ResizeObserver((entries) => {
        for (const e of entries) {
            if (e.target === div && div.clientHeight > 0) {
                map.resize();
                map.fitBounds(bounds, { padding: 20 });
                observer.unobserve(div);
            }
        }
    });
    observer.observe(div);

    initMapData(map);
});

const bounds = new maplibreGl.LngLatBounds();
const score = useScore();

function initMapData(map: maplibreGl.Map) {
    const aerodromes = score.aerodromes;
    for (const a of aerodromes) {
        bounds.extend([a.longitude, a.latitude]);

        addAirportMarker(map, a);
    }
    map.fitBounds(bounds, { padding: 20 });
}

const elements: Record<string, HTMLDivElement> = {};

function addAirportMarker(map: maplibreGl.Map, aerodrome: Aerodrome) {
    const element = document.createElement("div");
    element.classList.add("airport-marker");
    const airportLevel = getAerodromeScore(aerodrome, score.level, score.score[aerodrome.code]);
    element.classList.add(`airport-level-${airportLevel}`);

    element.addEventListener("click", () => {
        emit("click", aerodrome);
    });

    const marker = new maplibreGl.Marker({ element });
    marker.setLngLat([aerodrome.longitude, aerodrome.latitude]);
    marker.addTo(map);

    elements[aerodrome.code] = element;
}

function updateSelected(selected: string | null) {
    for (const e of Object.values(elements)) {
        e.classList.remove("selected-airport");
    }

    if (selected != null && elements[selected] != null) {
        elements[selected].classList.add("selected-airport");
    }
}

function getAerodromeScore(aerodrome: Aerodrome, level: number, score: Score) {
    if (level === 1) {
        const l1 = score as ScoreLevel1;
        if (l1.used.value) {
            return 1;
        }
    } else if (level === 2) {
        const l2 = score as ScoreLevel2;

        if (l2.arrived.value && l2.departed.value) {
            return 2;
        } else if (l2.arrived.value || l2.departed.value) {
            return 1;
        }
    } else if (level === 3) {
        const l3 = score as ScoreLevel3;

        let anyDeparted = false,
            anyArrived = false;
        let completed = true;
        for (const rw of aerodrome.runways) {
            if (l3.arrivedPerRunway[rw] != null && l3.arrivedPerRunway[rw].value === true) {
                anyArrived = true;
            } else {
                completed = false;
            }
            if (l3.departedPerRunway[rw] != null && l3.departedPerRunway[rw].value === true) {
                anyDeparted = true;
            } else {
                completed = false;
            }
        }
        if (completed) {
            return 3;
        } else if (anyDeparted && anyArrived) {
            return 2;
        } else if (anyDeparted || anyArrived) {
            return 1;
        }
    }
    return 0;
}

function setMapSymbolClass(e: HTMLDivElement, level: number) {
    for (let i = 0; i <= 3; i++) {
        const className = `airport-level-${i.toString()}`;

        if (i === level) {
            e.classList.add(className);
        } else {
            e.classList.remove(className);
        }
    }
}

watch(
    score.score,
    (newScore) => {
        const aerodromes = score.aerodromes;
        for (const aerodrome of aerodromes) {
            const aerodromeScore = newScore[aerodrome.code];
            const e = elements[aerodrome.code];
            if (aerodromeScore == null || e == null) {
                continue;
            }

            const satisfied = getAerodromeScore(aerodrome, score.level, aerodromeScore);
            setMapSymbolClass(e, satisfied);
        }
    },
    { deep: true },
);
</script>

<style>
.selected-airport {
    /*    filter: invert(86%) sepia(14%) saturate(7340%) hue-rotate(0deg) brightness(104%) contrast(104%); */
    border: solid 4px orange;
    z-index: 100;
}
.airport-marker {
    width: 32px;
    height: 32px;
    background-repeat: no-repeat;
    background-position: center;
}
.airport-level-0 {
    background-image: url("./images/airport.svg");
}
.airport-level-1 {
    background-image: url("./images/airport-complete-1.svg");
}
.airport-level-2 {
    background-image: url("./images/airport-complete-2.svg");
}
.airport-level-3 {
    background-image: url("./images/airport-complete-3.svg");
}
.airport-level-excluded {
    background-image: url("./images/airport-complete-excluded.svg");
}
</style>
