import { Token } from "@models/Token";
import { SpLyricsResponse } from "@models/spotify/lyrics/SpLyricsResponse";
import {
  unlinkSync,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from "fs";
import { ApiGlobalConfiguration } from "@/Config";
import { toSyncedLyrics } from "@/libs/LyricsUtils";
import { SyncedLyrics } from "@/models/SyncedLyrics";
import { SpLyricsLine } from "@/models/spotify/lyrics/SpLyricsLine";

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

  private async ensureTempDir() {
    if (!existsSync("./tmp")) {
      await mkdirSync("./tmp");
    }
  }

  private async fetchToken(): Promise<Token> {
    if (!this.spDc) throw new Error("SP_DC is required.");

    const response = await fetch(
      "https://open.spotify.com/get_access_token?reason=transport&productType=web_player",
      {
        headers: {
          "User-Agent": ApiGlobalConfiguration.userAgent,
          "App-Platform": ApiGlobalConfiguration.appPlatform,
          "Content-Type": "text/html; charset=utf-8",
          Cookies: `sp_dc=${this.spDc}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch token: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    if (!data.accessToken)
      throw new Error("Invalid SP_DC value or missing token.");

    const token: Token = {
      accessToken: data.accessToken,
      accessTokenExpirationTimestampMs: data.accessTokenExpirationTimestampMs,
    };

    // Write to cache
    try {
      await this.ensureTempDir();
      writeFileSync(cacheFilePath, JSON.stringify(token));
    } catch (error) {
      console.warn("Failed to write token to cache file:", error);
    }
    return token;
  }

  private async ensureToken(): Promise<string> {
    if (
      this.token != null &&
      Date.now() < this.token.accessTokenExpirationTimestampMs
    ) {
      return this.token.accessToken;
    }

    console.debug(
      "The token is expired or didn't exist, fetching a new token..."
    );

    try {
      if (existsSync(cacheFilePath)) {
        const cachedToken: Token = JSON.parse(
          readFileSync(cacheFilePath, "utf8")
        );
        if (Date.now() < cachedToken.accessTokenExpirationTimestampMs) {
          this.token = cachedToken;
          return this.token.accessToken;
        }
      }
    } catch (error) {
      console.error("Failed to parse cached token or token is expired.", error);
      unlinkSync(cacheFilePath);
    }

    const newToken = await this.fetchToken();
    this.token = newToken;
    return newToken.accessToken;
  }

  private async fetchLyrics(trackId: string): Promise<SpLyricsResponse> {
    const token = await this.ensureToken();

    const response = await fetch(
      `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}?format=json&vocalRemoval=false&market=from_token`,
      {
        headers: {
          "User-Agent": ApiGlobalConfiguration.userAgent,
          "App-Platform": ApiGlobalConfiguration.appPlatform,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok || response.status !== 200)
      throw new Error(
        `Failed to fetch lyrics for track ${trackId}. ${response.statusText}.`
      );
    return await response.json();
  }

  public async getSyncedLyrics(trackId: string): Promise<SyncedLyrics> {
    const spotifyLyrics = await this.fetchLyrics(trackId);
    return toSyncedLyrics(spotifyLyrics);
  }

  public async getLyrics(trackId: string): Promise<SpLyricsLine[]> {
    return (await this.fetchLyrics(trackId)).lyrics.lines;
  }

  public async getLyricsResponse(trackId: string): Promise<SpLyricsResponse> {
    return await this.fetchLyrics(trackId);
  }
}
