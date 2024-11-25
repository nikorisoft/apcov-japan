<template lang="pug">
.data-page
    h2 {{ i18n.messages("data-management") }}

    .uk-flex.uk-uk-width-1-1.uk-flex-center
        .uk-width-large.uk-flex.uk-flex-column(style="gap: 1.5em")
            button.uk-button.uk-button-default(@click="download") {{ i18n.messages("download-json") }}
            .uk-flex.uk-flex-column
                button.uk-button.uk-button-default(@click="upload") {{ i18n.messages("upload-json") }}
                .uk-text-warning {{ i18n.messages("warning-overwrites-data") }}
            .uk-flex.uk-flex-column
                button.uk-button.uk-button-default(uk-toggle="target: #dialog-initialization") {{ i18n.messages("initialize-data") }}
                .uk-text-warning {{ i18n.messages("warning-overwrites-data") }}

    .dialog(uk-modal, id="dialog-initialization")
        .uk-modal-dialog.uk-modal-body.uk-margin-auto-vertical
            button.uk-modal-close-default(uk-close)
            h2.uk-modal-title {{ i18n.messages("dialog-title-initialize-data") }}

            .body {{ i18n.messages("dialog-message-confirm-initialization") }}
            .uk-text-danger {{ i18n.messages("warning-overwrites-data") }}
            .uk-text-right
                button.uk-button.uk-button-default.uk-modal-close {{ i18n.messages("dialog-cancel") }}
                button.uk-button.uk-button-primary(@click="initialize") {{ i18n.messages("dialog-initialize-data-confirm") }}

    .upload
        input(type="file", style="display: none", :id="UPLOAD_INPUT_ID", accept="application/json")
</template>

<script lang="ts" setup>
import { downloadJSON, uploadJSON } from "../browser";
import { ScoreLevel, useScore } from "../data/scores";
import * as i18n from "../i18n";
import UIkit from "uikit";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const UPLOAD_INPUT_ID = "airport-coverage-upload-file";

const score = useScore();
const router = useRouter();

function download() {
    downloadJSON(score.json, "airport-score.json");
}

onMounted(async () => {
    const input = document.getElementById(UPLOAD_INPUT_ID) as HTMLInputElement;
    if (input != null) {
        input.addEventListener("change", async function () {
            if (this.files != null) {
                const dataString = await uploadJSON(this.files);

                if (dataString != null) {
                    score.initializeFromJSON(dataString);
                }
            }
        });
    }
});

function upload() {
    const input = document.getElementById(UPLOAD_INPUT_ID) as HTMLInputElement;
    if (input != null) {
        input.click();
    }
}

function initialize() {
    UIkit.modal("#dialog-initialization").hide();

    score.initialize(ScoreLevel.maximum);
    score.initialized = false;

    router.push("/");
}
</script>
