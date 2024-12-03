import { SpLyricsColors } from './SpLyricsColors';
import { SpLyrics } from './SpLyrics';

export interface SpLyricsResponse {
    colors: SpLyricsColors;
    hasVocalRemoval: boolean;
    lyrics: SpLyrics;
}