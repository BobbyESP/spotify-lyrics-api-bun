import { Token } from "@models/Token";
import { SpLyricsResponse } from "@models/spotify/lyrics/SpLyricsResponse";
import { unlinkSync } from "node:fs";

const cacheFilePath = "./tmp/spotify_token.json";

export class SpotifyService {
  private spDc: string;
  private token: Token | null = null;

  constructor(spDc: string | undefined) {
    this.spDc = spDc || process.env.SP_DC || "";
    if (!this.spDc) {
      throw new Error("SP_DC is required.");
    }
  }

  // Obtener el token de acceso desde el servidor de Spotify
  private async fetchToken(): Promise<Token> {
    if (!this.spDc) throw new Error("SP_DC is required.");

    try {
      const response = await fetch(
        "https://open.spotify.com/get_access_token?reason=transport&productType=web_player",
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "App-platform": "WebPlayer",
            "Content-Type": "text/html; charset=utf-8",
            Cookie: `sp_dc=${this.spDc}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.statusText}`);
      } else {
        console.debug("The token has been successfully retrieved.");
      }

      const data = await response.json();
      if (!data.accessToken) throw new Error("Invalid SP_DC value.");

      const token: Token = {
        accessToken: data.accessToken,
        accessTokenExpirationTimestampMs: data.accessTokenExpirationTimestampMs,
      };

      try {
        await Bun.write(cacheFilePath, JSON.stringify(token));
      } catch (writeError) {
        console.error("Failed to write token to cache file.", writeError);
      }

      return token;
    } catch (error) {
      console.error("Failed to fetch token.", error);
      throw error;
    }
  }

  private async ensureToken(): Promise<string> {
    if (
      this.token != null &&
      Date.now() < this.token.accessTokenExpirationTimestampMs
    ) {
      return this.token.accessToken;
    }

    console.debug(
      "The token is expired didnt exist or it has expired, fetching new token."
    );

    try {
      const cachedFile = Bun.file(cacheFilePath);
      if (await cachedFile.exists()) {
        const cachedToken: Token = JSON.parse(await cachedFile.text());
        if (Date.now() < cachedToken.accessTokenExpirationTimestampMs) { //If the token hasnt expired...
          this.token = cachedToken;
          return this.token.accessToken;
        }
      }
    } catch (error) {
      console.error("Failed to parse cached token or token is expired.", error);
      console.debug("Deleting old token file.");
      await unlinkSync(cacheFilePath);
    }

    console.log("Fetching new token.");
    const newToken = await this.fetchToken();
    this.token = newToken;
    return newToken.accessToken;
  }

  public async fetchLyrics(trackId: string): Promise<SpLyricsResponse> {
    const token = await this.ensureToken();

    const response = await fetch(
      `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}?format=json&market=from_token`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36",
          "App-platform": "WebPlayer",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok)
      throw new Error(`Failed to fetch lyrics for track ${trackId}. ${response.statusText}.`);
    return await response.json();
  }
}
