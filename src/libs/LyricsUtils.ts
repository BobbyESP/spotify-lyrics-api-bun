import { SyncedLyrics } from '@models/SyncedLyrics';
import { SpLyricsResponse } from '@models/spotify/lyrics/SpLyricsResponse';
import { formatLineTimestamp } from '@libs/Timestamps';

export function toSyncedLyrics(response: SpLyricsResponse): SyncedLyrics {
    return {
        syncType: response.lyrics.syncType,
        lines: response.lyrics.lines.map(line => ({
            timestamp: formatLineTimestamp(Number(line.startTimeMs)),
            text: line.words,
        })),
    };
}