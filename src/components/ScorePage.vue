<template lang="pug">
.score
    h1 {{ i18n.messages("score-title") }}

    h2 {{ i18n.messages("score-overall") }}
    .uk-width-large
        table.uk-table.uk-table-divider.uk-table-small.uk-table-hover
            thead
                tr
                    th {{ i18n.messages("table-level") }}
                    th {{ i18n.messages("table-score") }}
            tbody
                tr(v-for="l in scoresByLevel")
                    td {{ i18n.messages("level") }} {{l.level}}
                    td
                        span.point {{l.point}}
                        | {{ i18n.messages("point-unit") }} / 
                        span.point {{l.max}}
                        | {{ i18n.messages("point-unit") }}

    h2 {{ i18n.messages("score-by-region") }}
    .uk-width-xlarge
        table.uk-table.uk-table-divider.uk-table-small.uk-table-hover
            thead
                tr
                    th {{ i18n.messages("table-region") }}
                    th {{ i18n.messages("table-score-level-1") }}
                    th(v-if="score.level >= 2") {{ i18n.messages("table-score-level-2") }}
                    th(v-if="score.level >= 3") {{ i18n.messages("table-score-level-3") }}
            tbody
                tr(v-for="r in scoresByRegion")
                    td {{ i18n.region(r.region) }}
                    td(v-for="l in r.score")
                        span.point {{l.point}}
                        | {{ i18n.messages("point-unit") }} / 
                        span.point {{l.max}}
                        | {{ i18n.messages("point-unit") }}


    h2 {{ i18n.messages("score-by-type") }}
    .uk-width-xlarge
        table.uk-table.uk-table-divider.uk-table-small.uk-table-hover
            thead
                tr
                    th {{ i18n.messages("table-type") }}
                    th {{ i18n.messages("table-score-level-1") }}
                    th(v-if="score.level >= 2") {{ i18n.messages("table-score-level-2") }}
                    th(v-if="score.level >= 3") {{ i18n.messages("table-score-level-3") }}
            tbody
                tr(v-for="t in scoresByType")
                    td {{ i18n.types(t.typeName) }}
                    td(v-for="l in t.score")
                        span.point {{l.point}}
                        | {{ i18n.messages("point-unit") }} / 
                        span.point {{l.max}}
                        | {{ i18n.messages("point-unit") }}
</template>

<script setup lang="ts">
import { RegionOrder, TypeOrder } from "../data/aerodromes";
import { useScore } from "../data/scores";
import * as i18n from "../i18n";
import { computed } from "vue";

interface ScoreByLevel {
    level: number;
    point: number;
    max: number;
}

interface ScoreByRegion {
    region: string;
    score: ScoreByLevel[];
}

interface ScoreByType {
    typeName: string;
    score: ScoreByLevel[];
}

const score = useScore();

const scoresByLevel = computed<ScoreByLevel[]>(() => {
    const ret: ScoreByLevel[] = [];

    for (let i = 1; i <= score.level; i++) {
        const p = score.calcPoint(i);
        ret.push({
            level: i,
            point: p.point,
            max: p.total,
        });
    }

    return ret;
});

const scoresByRegion = computed<ScoreByRegion[]>(() => {
    const ret: ScoreByRegion[] = [];

    for (const r of RegionOrder) {
        const regionScores = [];

        for (let i = 1; i <= score.level; i++) {
            const p = score.calcPoint(i, (a) => a.region === r);
            regionScores.push({
                level: i,
                point: p.point,
                max: p.total,
            });
        }

        ret.push({
            region: r,
            score: regionScores,
        });
    }

    return ret;
});

const scoresByType = computed<ScoreByType[]>(() => {
    const ret: ScoreByType[] = [];

    for (const t of TypeOrder) {
        const typeScores = [];

        for (let i = 1; i <= score.level; i++) {
            const p = score.calcPoint(i, (a) => a.types === t);
            typeScores.push({
                level: i,
                point: p.point,
                max: p.total,
            });
        }

        ret.push({
            typeName: t,
            score: typeScores,
        });
    }

    return ret;
});
</script>
