<template lang="pug">
.uk-container.uk-container-expand.uk-flex.uk-flex-column(style="min-height: 100vh; max-height: 100vh")
  nav.uk-nav-container(uk-navbar)
    .uk-navbar-left
      .uk-navbar-item {{ i18n.messages("airport-coverage") }}

      ul.uk-navbar-nav(v-if="score.initialized")
        li
          router-link(to="/map") {{ i18n.messages("nav-map") }}
        li
          router-link(to="/table") {{ i18n.messages("nav-table") }}
        li
          router-link(to="/score") {{ i18n.messages("nav-score") }}
        li
          router-link(to="/data") {{ i18n.messages("nav-data") }}

    .uk-navbar-right
      .i18n
        select.uk-select.uk-form-small.uk-form-width-small(v-model="pref.lang")
          option(v-for="l in i18n.LanguageOptions", :value="l.value") {{ l.name }}
      .score(v-if="score.initialized")
        span.point {{ point }}
        | {{ i18n.messages("point-unit") }} / 
        span.point {{ totalPoint }}
        | {{ i18n.messages("point-unit") }}

  .uk-flex-1
    router-view

  .footer
    p.uk-text-small.uk-text-muted.uk-text-right Airport Coverage Manager (Release {{ releaseName }}{{ additionalVersion != null ? ` (${additionalVersion})` : "" }}) &copy; nikorisoft 2024.
</template>

<script setup lang="ts">
import { downloadJSON } from "./browser";
import { getAerodromes } from "./data/aerodromes";
import { useScore } from "./data/scores";
import * as i18n from "./i18n";
import { usePreference } from "./pref";
import { computed } from "vue";

const releaseName = "Amposta";
const additionalVersion = "RC";

const score = useScore();
const pref = usePreference();

const point = computed(() => score.point);
const totalPoint = computed(() => score.total);
</script>

<style lang="css">
span.point {
    font-size: 1.2rem;
}
</style>
