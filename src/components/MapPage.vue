<template lang="pug">
.map-page
    .uk-grid-column-small.uk-child-width-expand(uk-grid)
        .map-column(style="width:100%; height:80vh")
            MapLibre.uk-width-1-1.uk-height-1-1(@click="onAerodromeClicked", :selected="selected != null ? selected.code : null")
        .map-column(style="height:80vh; overflow-y: auto", id="aerodromes-list")
            .aerodrome.uk-margin-small-top.uk-margin-small-right(v-for="a in aerodromesSorted", @click="onAerodromeClickedOnList(a)")
                .uk-card.uk-card-default.uk-card-body.uk-card-small(:id="a.code", :class="{ selected: selected != null && selected.code === a.code }")
                    h3.uk-card-title.uk-margin-remove-bottom {{ i18n.aerodrome(a) }} ({{ a.IATA != null ? `${a.IATA} / ` : "" }}{{ a.code }})
                    div.uk-margin-small-bottom
                        span.uk-badge {{ i18n.types(a.types) }}
                        span.uk-badge {{ i18n.region(a.region) }}
                        span.uk-badge(v-if="!a.hasScheduledFlights") {{ i18n.messages("no-scheduled-flights") }}

                    div(v-if="currentLevel === 1")
                        label
                            input(type="checkbox", v-model="score.score[a.code].used.value").uk-checkbox
                            | &nbsp;{{ i18n.messages("used") }}
                    div(v-if="currentLevel === 2")
                        .uk-grid-small.uk-child-width-auto.uk-grid
                            label
                                input(type="checkbox", v-model="score.score[a.code].departed.value").uk-checkbox
                                | &nbsp;{{ i18n.messages("departed") }}
                            label
                                input(type="checkbox", v-model="score.score[a.code].arrived.value").uk-checkbox
                                | &nbsp;{{ i18n.messages("arrived") }}
                    div(v-if="currentLevel === 3")
                        .runway(v-for="rw in a.runways")
                            .uk-form-label.uk-text-bold {{ i18n.messages("runway") }} {{ rw }}
                            .uk-grid-small.uk-child-width-auto.uk-grid
                                label
                                    input(type="checkbox", v-model="score.score[a.code].departedPerRunway[rw].value").uk-checkbox
                                    | &nbsp;{{ i18n.messages("taken-off") }}
                                label
                                    input(type="checkbox", v-model="score.score[a.code].arrivedPerRunway[rw].value").uk-checkbox
                                    | &nbsp;{{ i18n.messages("landed") }}
</template>

<script setup lang="ts">
import { Aerodrome, getAerodromes, RegionOrder } from "../data/aerodromes";
import { ScoreLevel, useScore } from "../data/scores";
import * as i18n from "../i18n";
import MapLibre from "./MapLibre.vue";
import UIkit from "uikit";
import { onMounted, ref } from "vue";

const selected = ref<Aerodrome | null>(null);

const score = useScore();
const aerodromesSorted = ref<Aerodrome[]>([...score.aerodromes]);

const currentLevel = ref<number>(score.level);

onMounted(() => {
    // Sort by the region, then from the north to south
    aerodromesSorted.value.sort((a, b) => {
        if (a.region === b.region) {
            return b.latitude - a.latitude;
        } else {
            const regionIndexA = RegionOrder.indexOf(a.region);
            const regionIndexB = RegionOrder.indexOf(b.region);

            return regionIndexA - regionIndexB;
        }
    });
});

function onAerodromeClicked(a: Aerodrome) {
    selected.value = a;
    UIkit.scroll("#aerodromes-list").scrollTo(`#${a.code}`);
}
function onAerodromeClickedOnList(a: Aerodrome) {
    selected.value = a;
}
</script>

<style>
.selected {
    background-color: bisque !important;
}
</style>
