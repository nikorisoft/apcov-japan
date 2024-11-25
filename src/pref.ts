import { LANGUAGES } from "./i18n";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export interface PreferenceObject {
    lang: string;
}

function getLanguagePreference() {
    for (const l of navigator.languages) {
        if (LANGUAGES.includes(l)) {
            return l;
        }
    }
    return LANGUAGES[0];
}

export const usePreference = defineStore("preference", () => {
    const lang = ref(getLanguagePreference());

    const json = computed(() => {
        const pref: PreferenceObject = {
            lang: lang.value,
        };

        return JSON.stringify(pref);
    });

    function load(str: string) {
        try {
            const pref = JSON.parse(str) as PreferenceObject;

            lang.value = pref.lang;
        } catch (e) {}
    }

    return { json, lang, load };
});
