import { Aerodrome, getAerodromes } from "./aerodromes";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";

export const ScoreLevel = {
    minimum: 1,
    maximum: 3,
};

export interface AnnotatedValue<T> {
    value: T;
    when?: string;
    notes?: string;
}

export interface ScoreLevel1 {
    used: AnnotatedValue<boolean>;
}

export interface ScoreLevel2 {
    departed: AnnotatedValue<boolean>;
    arrived: AnnotatedValue<boolean>;
}

export interface ScoreLevel3 {
    departedPerRunway: Record<string, AnnotatedValue<boolean>>;
    arrivedPerRunway: Record<string, AnnotatedValue<boolean>>;
}

export interface ScoreVariants {
    includeAllAirports?: boolean;
}

export type Score = ScoreLevel1 | ScoreLevel2 | ScoreLevel3;

export interface ScoreSerializableObject {
    level: number;
    scores: Record<string, Score>;
    variants: {
        includeAllAirports: boolean;
    };
}

export const useScore = defineStore("score", () => {
    const level = ref(ScoreLevel.maximum);
    const score = reactive<Record<string, Score>>({});
    const aerodromes = ref<Aerodrome[]>([]);
    const variants = ref<ScoreVariants>({});
    const initialized = ref(false);

    function setScore(scoreLevel: number, data: Record<string, Score>, variantsInput?: ScoreVariants) {
        level.value = scoreLevel;
        for (const k of Object.keys(score)) {
            delete score[k];
        }
        for (const k of Object.keys(data)) {
            score[k] = data[k];
        }
        if (variantsInput != null) {
            variants.value = variantsInput;
        } else {
            variants.value = { includeAllAirports: false };
        }

        const aerodromes = getAerodromes();
        populateAerodromes(aerodromes);

        initialized.value = true;
    }

    function getScore(scoreLevel: number) {
        if (scoreLevel > level.value) {
            throw new Error("requested score level is higher than the object");
        }
        if (scoreLevel === level.value) {
            return score;
        }
        if (scoreLevel === 1) {
            // Requested score level
            const requestedData: Record<string, ScoreLevel1> = {};
            for (const index in score) {
                if (level.value === 2) {
                    const d = score[index] as ScoreLevel2;

                    requestedData[index] = {
                        used: {
                            value: false,
                        },
                    };

                    if (d.arrived.value || d.departed.value) {
                        requestedData[index].used.value = true;
                    }
                } else {
                    const d = score[index] as ScoreLevel3;

                    requestedData[index] = {
                        used: {
                            value: false,
                        },
                    };

                    for (const rw in d.arrivedPerRunway) {
                        if (d.arrivedPerRunway[rw].value) {
                            requestedData[index].used.value = true;
                            break;
                        }
                    }
                    for (const rw in d.departedPerRunway) {
                        if (d.departedPerRunway[rw].value) {
                            requestedData[index].used.value = true;
                            break;
                        }
                    }
                }
            }

            return requestedData;
        } else {
            // Level 2
            const requestedData: Record<string, ScoreLevel2> = {};

            for (const index in score) {
                const d = score[index] as ScoreLevel3;

                requestedData[index] = {
                    arrived: {
                        value: false,
                    },
                    departed: {
                        value: false,
                    },
                };

                let arrived = false;
                for (const rw in d.arrivedPerRunway) {
                    if (d.arrivedPerRunway[rw].value) {
                        requestedData[index].arrived.value = true;
                        break;
                    }
                }
                let departed = false;
                for (const rw in d.departedPerRunway) {
                    if (d.departedPerRunway[rw].value) {
                        requestedData[index].departed.value = true;
                        break;
                    }
                }
            }

            return requestedData;
        }
    }

    function populateAerodromes(aerodromesData: Aerodrome[]) {
        aerodromes.value = [];

        for (const a of aerodromesData) {
            if (variants.value.includeAllAirports == null || variants.value.includeAllAirports === false) {
                if (!a.hasScheduledFlights) {
                    continue;
                }
            }
            if (score[a.code] != null) {
                if (level.value === 3) {
                    const s3 = score[a.code] as ScoreLevel3;
                    for (const rw of a.runways) {
                        if (s3.arrivedPerRunway[rw] == null) {
                            s3.arrivedPerRunway[rw] = { value: false };
                        }
                        if (s3.departedPerRunway[rw] == null) {
                            s3.arrivedPerRunway[rw] = { value: false };
                        }
                    }
                }
            } else {
                if (level.value === 1) {
                    score[a.code] = {
                        used: { value: false },
                    };
                } else if (level.value === 2) {
                    score[a.code] = {
                        arrived: { value: false },
                        departed: { value: false },
                    };
                } else {
                    const s3: ScoreLevel3 = {
                        arrivedPerRunway: {},
                        departedPerRunway: {},
                    };

                    for (const rw of a.runways) {
                        if (s3.arrivedPerRunway[rw] == null) {
                            s3.arrivedPerRunway[rw] = { value: false };
                        }
                        if (s3.departedPerRunway[rw] == null) {
                            s3.departedPerRunway[rw] = { value: false };
                        }
                    }

                    score[a.code] = s3;
                }
            }
            aerodromes.value.push(a);
        }
    }

    const point = computed(() => {
        return calcPointInternal(level.value, score);
    });

    function calcPointInternal(level: number, data: Record<string, Score>, filter?: (a: Aerodrome) => boolean) {
        let point = 0;

        const filtered = filter == null ? aerodromes.value : aerodromes.value.filter(filter);

        if (level === 1) {
            for (const a of filtered) {
                if (data[a.code] != null && (data[a.code] as ScoreLevel1).used.value === true) {
                    point++;
                }
            }
        } else if (level === 2) {
            for (const a of filtered) {
                if (data[a.code] != null) {
                    const s = data[a.code] as ScoreLevel2;

                    if (s.arrived.value) {
                        point++;
                    }
                    if (s.departed.value) {
                        point++;
                    }
                }
            }
        } else {
            for (const a of filtered) {
                if (data[a.code] != null) {
                    const s = data[a.code] as ScoreLevel3;

                    for (const rw of a.runways) {
                        if (s.arrivedPerRunway[rw] != null && s.arrivedPerRunway[rw].value === true) {
                            point++;
                        }
                        if (s.departedPerRunway[rw] != null && s.departedPerRunway[rw].value === true) {
                            point++;
                        }
                    }
                }
            }
        }

        return point;
    }

    const total = computed(() => {
        return totalInternal(level.value);
    });

    function totalInternal(level: number, filter?: (a: Aerodrome) => boolean) {
        const filtered = filter == null ? aerodromes.value : aerodromes.value.filter(filter);

        if (level === 1) {
            return filtered.length;
        } else if (level === 2) {
            return filtered.length * 2;
        } else {
            return filtered.reduce<number>((sum, a) => sum + a.runways.length * 2, 0);
        }
    }

    function calcPoint(requestedLevel: number, filter?: (a: Aerodrome) => boolean): { point: number; total: number } {
        if (requestedLevel <= 0 || requestedLevel > level.value) {
            throw new Error("Requested level is invalid (out of range or higher than the level of the data");
        }
        const data = getScore(requestedLevel);

        return { point: calcPointInternal(requestedLevel, data, filter), total: totalInternal(requestedLevel, filter) };
    }

    const json = computed(() => {
        const data = {
            level: level.value,
            scores: getScore(level.value),
            variants: variants.value,
        };

        return JSON.stringify(data);
    });

    function initialize(level: number) {
        setScore(level, {}, {});
    }

    function initializeFromJSON(jsonString: string) {
        try {
            const obj: ScoreSerializableObject = JSON.parse(jsonString);

            if (obj.level == null || obj.scores == null) {
                return false;
            }

            setScore(obj.level, obj.scores, obj.variants);

            return true;
        } catch {
            return false;
        }
    }

    return {
        aerodromes,
        initialize,
        initializeFromJSON,
        initialized,
        level,
        score,
        setScore,
        getScore,
        total,
        point,
        populateAerodromes,
        variants,
        json,
        calcPoint,
    };
});
