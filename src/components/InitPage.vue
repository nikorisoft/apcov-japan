<template lang="pug">
.initialize
    h1 {{ i18n.messages("init-message") }}

    .uk-text-bold {{ i18n.messages("init-message-ask-level") }}
    .uk-text-warning {{ i18n.messages("init-message-note") }}

    select.uk-select.uk-margin(v-model="level")
        option(v-for="o in levelOptions", :value="o.value") {{o.description}}

    button(@click="confirm").uk-button.uk-button-primary {{ i18n.messages("init-confirm")}}
</template>

<script setup lang="ts">
import { useScore } from "../data/scores";
import * as i18n from "../i18n";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

interface Option {
    value: number;
    description: string;
}

const level = ref(3);

const score = useScore();

const router = useRouter();

const levelOptions = computed<Option[]>(() => [
    { value: 1, description: i18n.messages("init-message-level-1") },
    { value: 2, description: i18n.messages("init-message-level-2") },
    { value: 3, description: i18n.messages("init-message-level-3") },
]);

function confirm() {
    score.initialize(level.value);

    router.push("/map");
}
</script>
