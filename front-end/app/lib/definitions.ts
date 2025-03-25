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