<template lang="pug">
.table-page.uk-flex-1.uk-overflow-auto
    table.uk-table.uk-table-divider.uk-table-small.uk-table-hover.uk-table-middle.table-page
        thead
            tr
                th {{ i18n.messages("table-airport-name") }}
                th {{ i18n.messages("IATA") }}
                th {{ i18n.messages("ICAO") }}
                th(v-if="score.level >= 3") {{ i18n.messages("runway") }}
                th {{ i18n.messages("record") }}
        tbody
            tr(v-for="r in rows")
                th(v-if="r.header", colspan="5") {{ r.name }}
                td(v-if="!r.header && r.firstLine", :rowspan="r.rowSpan") {{ i18n.aerodrome(r.a) }}
                td(v-if="!r.header && r.firstLine", :rowspan="r.rowSpan") {{ iata(r.a) }}
                td(v-if="!r.header && r.firstLine", :rowspan="r.rowSpan") {{ r.a.code }}
                td(v-if="!r.header && score.level >= 3") {{ i18n.messages("runway") }} {{ r.runway }}
                td(v-if="!r.header && score.level == 3", uk-grid)
                    label
                        input(type="checkbox", v-model="score.score[r.a.code].departedPerRunway[r.runway].value").uk-checkbox
                        | &nbsp;{{ i18n.messages("taken-off") }}
                    label
                        input(type="checkbox", v-model="score.score[r.a.code].arrivedPerRunway[r.runway].value").uk-checkbox
                        | &nbsp;{{ i18n.messages("landed") }}
                td(v-if="!r.header && score.level == 2", uk-grid)
                    label
                        input(type="checkbox", v-model="score.score[r.a.code].departed.value").uk-checkbox
                        | &nbsp;{{ i18n.messages("departed") }}
                    label
                        input(type="checkbox", v-model="score.score[r.a.code].arrived.value").uk-checkbox
                        | &nbsp;{{ i18n.messages("arrived") }}
                td(v-if="!r.header && score.level == 1", uk-grid)
                    label
                        input(type="checkbox", v-model="score.score[r.a.code].used.value").uk-checkbox
                        | &nbsp;{{ i18n.messages("used") }}
</template>

<script lang="ts" setup>
import { RegionOrder, type Aerodrome } from "../data/aerodromes";
import { useScore } from "../data/scores";
import * as i18n from "../i18n";
import { onMounted, ref } from "vue";

interface AerodromesByCategory {
    value: string;
    name: string;
    rows: AerodromeRow[];
}

type AerodromeRow =
    | {
          header: true;
          value: string;
          name: string;
      }
    | {
          header: false;
          firstLine: boolean;
          rowSpan: number;
          a: Aerodrome;
          runway: string;
      };

const score = useScore();
const aerodromesSorted = ref<Aerodrome[]>([...score.aerodromes]);
const rows = ref<AerodromeRow[]>([]);

function iata(a: Aerodrome) {
    return a.IATA == null ? "---" : a.IATA;
}

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

    const categories: AerodromesByCategory[] = [];
    for (const r of RegionOrder) {
        const category: AerodromesByCategory = {
            name: i18n.region(r),
            value: r,
            rows: [],
        };

        categories.push(category);
    }

    for (const a of aerodromesSorted.value) {
        const c = categories.find((r) => a.region === r.value);
        if (c == null) {
            continue;
        }

        if (score.level >= 3) {
            for (let i = 0; i < a.runways.length; i++) {
                c.rows.push({
                    header: false,
                    firstLine: i === 0,
                    rowSpan: i === 0 ? a.runways.length : 1,
                    a,
                    runway: a.runways[i],
                });
            }
        } else {
            c.rows.push({
                header: false,
                firstLine: true,
                rowSpan: 1,
                a,
                runway: "",
            });
        }
    }

    for (const c of categories) {
        rows.value.push({
            header: true,
            value: c.value,
            name: c.name,
        });
        rows.value.push(...c.rows);
    }

    console.log(rows.value);
});
</script>

<style lang="css">
table.table-page tbody th {
    background-color: #f0f0f0;
}
</style>
