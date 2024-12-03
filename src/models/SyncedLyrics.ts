import { SongLine } from './SongLine';

export interface SyncedLyrics {
    syncType: string;
    lines: SongLine[];
}
