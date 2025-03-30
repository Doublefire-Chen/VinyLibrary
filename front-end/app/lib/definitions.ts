import moment from "moment-timezone";

export type Track = {
    side: string;
    order: number;
    title: string;
    length: string;
}

export type Vinyl = {
    id: number;
    title: string;
    artist: string;
    year: number;
    vinyl_type: string;
    vinyl_number: number;
    tracklist: Track[];
    album_picture_url: string;
    play_num: number;
    timebought: string;
    price: number;
    currency: string;
    description: string;
}

export const majorCities = [
    'Asia/Shanghai',       // UTC+8
    'Asia/Bangkok',        // UTC+7
    'Asia/Dhaka',          // UTC+6
    'Asia/Karachi',        // UTC+5
    'Asia/Dubai',          // UTC+4
    'Europe/Moscow',       // UTC+3
    'Europe/Istanbul',     // UTC+3
    'Europe/Stockholm',    // UTC+2
    'Europe/London',       // UTC+1/0
    'Atlantic/Azores',     // UTC-1
    'America/Sao_Paulo',   // UTC-3
    'America/New_York',    // UTC-5
    'America/Chicago',     // UTC-6
    'America/Denver',      // UTC-7
    'America/Los_Angeles', // UTC-8
];


export const timezones = majorCities.map((tz) => {
    const offset = moment.tz(tz).format('Z');
    const formattedOffset = `UTC${offset}`;
    const cityName = tz.split('/').pop()?.replace(/_/g, ' ') || tz;

    return {
        tzCode: tz,
        label: `${cityName} (${formattedOffset})`,
        value: `${formattedOffset}`.replace('UTC', ''),
    };
});