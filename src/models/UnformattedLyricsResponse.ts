import { SpLyricsLine } from './spotify/lyrics/SpLyricsLine';

export interface UnformattedLyricsResponse {
    error: boolean;
    syncType: string;
    lines: SpLyricsLine[];
}
