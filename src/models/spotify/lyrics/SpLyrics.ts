import { SpLyricsLine } from './SpLyricsLine';

export interface SpLyrics {
    alternatives: string[];
    capStatus: string;
    isDenseTypeface: boolean;
    isRtlLanguage: boolean;
    isSnippet: boolean;
    language: string;
    lines: SpLyricsLine[];
    provider: string;
    providerDisplayName: string;
    providerLyricsId: string;
    showUpsell: boolean;
    syncLyricsUri: string;
    syncType: string;
}