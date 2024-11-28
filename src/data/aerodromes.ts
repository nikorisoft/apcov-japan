type AerodromeYaml = {
    name: string;
    native?: string;
    aliases?: string[];
    IATA?: string;
    coordinates: string[];
    runways: string[];
    categories: {
        types: string;
        scheduled: string;
        region: string;
    };
};

type MasterYaml = {
    revision: number;
    aerodromes: { [code: string]: AerodromeYaml };
    categories: {
        types: string[];
        scheduled: string[];
        region: string[];
    };
};

export const RegionOrder: string[] = [];
export const TypeOrder: string[] = [];

export class Aerodrome {
    public code: string; // ICAO code (e.g. RJAA)
    public IATA?: string; // ICAO code. (e.g. NRT)
    public name: string; // Name in Alphabets (Narita International Airport)
    public nativeName: string; // Name in Native Name (成田国際空港)
    public aliases: string[];

    public runways: string[];

    public latitude: number;
    public longitude: number;

    public types: string;
    public region: string;
    public hasScheduledFlights: boolean;

    public static ToCoordinates(coordinates: string[]): { latitude: number; longitude: number } {
        const [lat, long] = coordinates;

        let latitude = 0;
        if (lat.endsWith("S")) {
            latitude = -Aerodrome.dmsToDegree(lat.slice(0, -1));
        } else {
            latitude = Aerodrome.dmsToDegree(lat.slice(0, -1));
        }
        let longitude = 0;
        if (long.endsWith("W")) {
            longitude = -Aerodrome.dmsToDegree(long.slice(0, -1));
        } else {
            longitude = Aerodrome.dmsToDegree(long.slice(0, -1));
        }

        return { latitude, longitude };
    }

    public static dmsToDegree(dms: string) {
        const second = dms.slice(-2);
        const minute = dms.slice(-4, -2);
        const degree = dms.slice(0, -4);

        return parseFloat(degree) + parseFloat(minute) / 60.0 + parseFloat(second) / 3600.0;
    }

    public constructor(code: string, obj: AerodromeYaml) {
        this.code = code;
        if (obj.IATA != null) {
            this.IATA = obj.IATA;
        }
        this.name = obj.name;
        if (obj.native != null) {
            this.nativeName = obj.native;
        } else {
            this.nativeName = obj.name;
        }
        this.aliases = [];
        if (obj.aliases != null && Array.isArray(obj.aliases)) {
            this.aliases.push(...obj.aliases);
        }

        ({ latitude: this.latitude, longitude: this.longitude } = Aerodrome.ToCoordinates(obj.coordinates));

        this.runways = obj.runways;

        this.types = obj.categories.types;
        this.region = obj.categories.region;
        this.hasScheduledFlights = obj.categories.scheduled === "yes" ? true : false;
    }
}

let revision: number;
const masterData: Aerodrome[] = [];

export function getAerodromes() {
    return masterData;
}

export function getRevision() {
    if (revision == null) {
        return 0;
    }
    return revision;
}

export function initAerodromes(data: MasterYaml) {
    for (const [code, aerodromeYaml] of Object.entries(data.aerodromes)) {
        const aerodrome = new Aerodrome(code, aerodromeYaml);

        masterData.push(aerodrome);
    }

    masterData.sort((a, b) => a.code.localeCompare(b.code));

    for (const region of data.categories.region) {
        RegionOrder.push(region);
    }
    for (const typeName of data.categories.types) {
        TypeOrder.push(typeName);
    }

    revision = data.revision;
}
