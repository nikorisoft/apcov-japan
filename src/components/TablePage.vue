<template lang="pug">
.table-page.uk-flex-1.uk-overflow-auto
    .uk-flex.uk-flex-middle
        .title.uk-margin-right {{ i18n.messages("table-category-sorted-by") }}
        select.uk-select.uk-form-small.uk-form-width-medium(v-model="currentSort")
            option(v-for="c in sortCategories", :value="c.value") {{ c.name }}

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
                th(v-if="r.header", colspan="5") {{ categoryName(r.value) }}
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
import { RegionOrder, TypeOrder, type Aerodrome } from "../data/aerodromes";
import { useScore } from "../data/scores";
import * as i18n from "../i18n";
import { computed, onMounted, ref } from "vue";

interface AerodromesByCategory {
    value: string;
    rows: AerodromeRow[];
}

type AerodromeRow =
    | {
          header: true;
          value: string;
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
//const rows = ref<AerodromeRow[]>([]);

function iata(a: Aerodrome) {
    return a.IATA == null ? "---" : a.IATA;
}

type TableSortCategory = "region" | "type" | "IATA" | "ICAO";
const currentSort = ref<TableSortCategory>("region");

const sortCategories = computed<{ value: string; name: string }[]>(() => {
    return [
        { value: "region", name: i18n.messages("table-category-region") },
        { value: "type", name: i18n.messages("table-category-type") },
        { value: "IATA", name: i18n.messages("table-category-iata") },
        { value: "ICAO", name: i18n.messages("table-category-icao") },
    ];
});

function categoryName(v: string) {
    switch (currentSort.value) {
        case "region":
            return i18n.region(v);
        case "type":
            return i18n.types(v);
        case "IATA":
            return v;
        case "ICAO":
            return v;
    }
}

function matchCategory(r: AerodromesByCategory, a: Aerodrome, sortBy: TableSortCategory) {
    switch (sortBy) {
        case "region":
            return a.region === r.value;
        case "type":
            return a.types === r.value;
        case "IATA":
            return (a.IATA == null && r.value === "-") || (a.IATA != null && a.IATA[0] === r.value);
        case "ICAO":
            return a.code.startsWith(r.value);
    }
}

const AlphabeticalOrder = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "-",
];

const ICAOOrder = [...AlphabeticalOrder.map((a) => "RJ" + a), ...AlphabeticalOrder.map((a) => "RO" + a)];

const rows = computed<AerodromeRow[]>(() => {
    if (currentSort.value === "region" || currentSort.value === "type") {
        aerodromesSorted.value.sort((a, b) => {
            if (a.region === b.region) {
                return b.latitude - a.latitude;
            } else {
                const regionIndexA = RegionOrder.indexOf(a.region);
                const regionIndexB = RegionOrder.indexOf(b.region);

                return regionIndexA - regionIndexB;
            }
        });
    } else if (currentSort.value === "ICAO") {
        aerodromesSorted.value.sort((a, b) => a.code.localeCompare(b.code));
    } else {
        aerodromesSorted.value.sort((a, b) => {
            if (a.IATA == null && b.IATA == null) {
                return a.code.localeCompare(b.code);
            } else if (a.IATA != null && b.IATA != null) {
                return a.IATA.localeCompare(b.IATA);
            } else if (a.IATA != null) {
                return -1;
            } else {
                return 1;
            }
        });
    }

    const categories: AerodromesByCategory[] = [];

    switch (currentSort.value) {
        case "region":
            categories.push(...RegionOrder.map((r) => ({ value: r, rows: [] })));
            break;
        case "type":
            categories.push(...TypeOrder.map((r) => ({ value: r, rows: [] })));
            break;
        case "IATA":
            categories.push(...AlphabeticalOrder.map((r) => ({ value: r, rows: [] })));
            break;
        case "ICAO":
            categories.push(...ICAOOrder.map((r) => ({ value: r, rows: [] })));
            break;
    }

    for (const a of aerodromesSorted.value) {
        const c = categories.find((r) => matchCategory(r, a, currentSort.value));
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

    const rows: AerodromeRow[] = [];
    for (const c of categories) {
        if (c.rows.length === 0) {
            continue;
        }
        rows.push({
            header: true,
            value: c.value,
        });
        rows.push(...c.rows);
    }

    return rows;
});

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
</script>

<style lang="css">
table.table-page tbody th {
    background-color: #707070;
    color: #e0e0e0;
}
</style>
