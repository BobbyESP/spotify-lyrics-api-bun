// Expresión regular para extraer el trackId de una URL de Spotify
const SpotifyLinksRegex = /(https:\/\/)?open\.spotify\.com(\/intl-[a-z]{2})?\/track\/([A-Za-z0-9]+)/;

export function getSpotifyTrackId(url: string): string | null {
    const match = decodeURIComponent(url).match(SpotifyLinksRegex);
    return match ? match[3] : null;  // match[3] es el trackId
}
