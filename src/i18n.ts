import type { Aerodrome } from "./data/aerodromes";
import enUSResources from "./lang/en_US.yaml?raw";
import frFRResources from "./lang/fr_FR.yaml?raw";
import jaJPResources from "./lang/ja_JP.yaml?raw";
import { usePreference } from "./pref";
import yaml from "yaml";

type LangResource = {
    types: Record<string, string>;
    region: Record<string, string>;
    messages: Record<string, string>;
};

export interface LanguageOption {
    value: string;
    name: string;
}

const resources: Record<string, LangResource> = {
    en_US: yaml.parse(enUSResources),
    ja_JP: yaml.parse(jaJPResources),
    fr_FR: yaml.parse(frFRResources),
};

export const LanguageOptions: LanguageOption[] = [
    {
        name: "日本語",
        value: "ja_JP",
    },
    {
        name: "English (US)",
        value: "en_US",
    },
    {
        name: "Français",
        value: "fr_FR",
    },
];
export const LANGUAGES = LanguageOptions.map((o) => o.value);

const LANG = "ja_JP";
const FALLBACK_LANG = "en_US";

const ERROR_STRING = "???";

function getString(
    dict: Record<string, string>,
    fallbackDict: Record<string, string>,
    key: string,
    name: string,
    errorValue = ERROR_STRING,
) {
    if (dict[key] != null) {
        return dict[key];
    } else if (fallbackDict[key] != null) {
        return fallbackDict[key];
    } else {
        console.error("No text resources for %s.%s", key, name);
        return errorValue;
    }
}

export function region(region: string) {
    const pref = usePreference();

    return getString(resources[pref.lang].region, resources[FALLBACK_LANG].region, region, "region");
}

export function types(type: string) {
    const pref = usePreference();

    return getString(resources[pref.lang].types, resources[FALLBACK_LANG].types, type, "types");
}

export function messages(msg: string) {
    const pref = usePreference();

    return getString(resources[pref.lang].messages, resources[FALLBACK_LANG].messages, msg, "messages");
}

export function aerodrome(aerodrome: Aerodrome) {
    const pref = usePreference();

    if (pref.lang === "ja_JP") {
        return aerodrome.nativeName;
    } else {
        return aerodrome.name;
    }
}
