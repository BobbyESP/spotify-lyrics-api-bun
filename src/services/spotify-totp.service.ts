import { httpGet } from "@/libs/httpClient";
import {
  SecretData,
  WebPlayerTokenResponse,
  ServerTimeResponse,
} from "@/types/spotify.types";
import { TOTPService } from "./totp.service";
import { SyncedLyrics } from "@/models/SyncedLyrics";
import { SpLyricsLine } from "@/models/spotify/lyrics/SpLyricsLine";
import { toSyncedLyrics } from "@/libs/LyricsUtils";
import { SpLyricsResponse } from "@/models/spotify/lyrics/SpLyricsResponse";
import { ApiGlobalConfiguration } from "@/Config";

const reqHeaders = {
  "User-Agent": ApiGlobalConfiguration.userAgent,
  Origin: ApiGlobalConfiguration.webPlayerUrl,
  Referer: ApiGlobalConfiguration.webPlayerUrl,
};

export class SpotifyTOTPService {
  private totp?: TOTPService;
  private token = "";
  private tokenTime = 0;

  private async initializeTOTP() {
    if (this.totp) return;

    const res = await httpGet(
      "https://github.com/Thereallo1026/spotify-secrets/blob/main/secrets/secretBytes.json?raw=true"
    );
    const secrets: SecretData[] = await res.json();
    const last = secrets.at(-1)!;

    this.totp = new TOTPService(last.secret, last.version);
  }

  private async getServerTime(): Promise<number> {
    const res = await httpGet(ApiGlobalConfiguration.webPlayerUrl + "/api/server-time", reqHeaders);
    const body: ServerTimeResponse = await res.json();
    return body.serverTime * 1000;
  }

  private async getTsAndTOTP(): Promise<[number, string]> {
    await this.initializeTOTP();
    const ts = await this.getServerTime();
    return [ts, this.totp!.generate(ts)];
  }

  async refreshToken(force = false) {
    if (force || !this.token) {
      const [ts, totp] = await this.getTsAndTOTP();
      const url = new URL(ApiGlobalConfiguration.webPlayerUrl + "/api/token");
      url.searchParams.set("reason", "init");
      url.searchParams.set("productType", "mobile-web-player");
      url.searchParams.set("ts", ts.toString());
      url.searchParams.set("totp", totp);
      url.searchParams.set("totpVer", this.totp!.getVersion().toString());

      const res = await httpGet(url.toString(), reqHeaders);
      const data: WebPlayerTokenResponse = await res.json();

      this.token = data.accessToken;
      this.tokenTime = Date.now();
    }
  }

    private async ensureToken(): Promise<string> {
    if (Date.now() - this.tokenTime > 30 * 60 * 1000) {
      await this.refreshToken();
    }
    return this.token;
  }

  private async fetchLyrics(trackId: string): Promise<SpLyricsResponse> {
    const token = await this.ensureToken();

    const response = await httpGet(
      `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}?format=json&vocalRemoval=false&market=from_token`,
      {
        ...reqHeaders,
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.ok)
      throw new Error(
        `Failed to fetch lyrics for track ${trackId}. ${response.statusText}`
      );

    return await response.json();
  }

  // 👇 mismos métodos públicos que el servicio con SP_DC
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