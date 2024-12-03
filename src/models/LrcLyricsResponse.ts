import { SongLine } from './SongLine';

export interface LrcLyricsResponse {
    error: boolean;
    syncType: string;
    lines: SongLine[];
}