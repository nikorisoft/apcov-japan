import type { Score, ScoreLevel3, ScoreSerializableObject } from "./scores";

const MaxRevisionSupported = 1;

function renameRunway(obj: ScoreSerializableObject, code: string, from: string, to: string) {
    if (obj.level === 3) {
        const score = obj.scores[code] as ScoreLevel3;
        if (score == null) {
            return;
        }
        if (score.departedPerRunway[from] != null) {
            score.departedPerRunway[to] = Object.assign({}, score.departedPerRunway[from]);
            delete score.departedPerRunway[from];
        }
        if (score.arrivedPerRunway[from] != null) {
            score.arrivedPerRunway[to] = Object.assign({}, score.arrivedPerRunway[from]);
            delete score.arrivedPerRunway[from];
        }
    }
}

function migrateRev0To1(obj: ScoreSerializableObject) {
    obj.revision = 1;

    // On March 2025, new runway (16R/34L) is added to RJFF (FUK). The original runway (16/34) is renamed to 16L/34R.
    renameRunway(obj, "RJFF", "16", "16L");
    renameRunway(obj, "RJFF", "34", "34R");

    return obj;
}

const migrateFunctions: ((obj: ScoreSerializableObject) => ScoreSerializableObject)[] = [migrateRev0To1];

export function migrateData(obj: ScoreSerializableObject, targetRevision: number) {
    const sourceRevision = obj.revision == null ? 0 : obj.revision;

    console.debug("migration", sourceRevision, targetRevision);

    if (sourceRevision > targetRevision) {
        throw new Error("Cannot migrate to older revisions");
    }

    for (let r = sourceRevision; r < targetRevision; r++) {
        if (migrateFunctions[r] != null) {
            obj = migrateFunctions[r](obj);
        }
    }

    return obj;
}
