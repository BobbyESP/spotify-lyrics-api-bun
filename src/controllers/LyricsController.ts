import { Elysia, t } from "elysia";
import { SpotifyService } from "@/services/spotify.service";
import { getSpotifyTrackId } from "@/libs/spotify/SpotifyURLs";
import { SpotifyTOTPService } from "@/services/spotify-totp.service";

export const lyricsController = new Elysia()
  .decorate("spotifyService", new SpotifyTOTPService())
  .group("/lyrics", (app) =>
    app
      .get(
        "/:spotifyUrl",
        async (context) => {
          const { spotifyUrl } = context.params;
          const trackId = getSpotifyTrackId(spotifyUrl);
          if (trackId) {
            return await context.spotifyService.getSyncedLyrics(trackId);
          }

          throw new Error(
            "A valid URL is required. Please, check it and try again."
          );
        },
        {
          params: t.Object({
            spotifyUrl: t.String({
                title: "Spotify URL",
                description: "A encoded Spotify track URL that should be encoded to URI."
            }),
          }),
          detail: {
            name: "Get Lyrics",
            tags: ["Lyrics"]
          }
        }
      )
      .get(
        "/",
        async (context) => {
          const trackId = getSpotifyTrackId(context.query.spotifyUrl);
          if (trackId) {
            return await context.spotifyService.getSyncedLyrics(trackId);
          }

          throw new Error(
            "A valid URL is required. Please, check it and try again."
          );

        },
        {
          query: t.Object({
            spotifyUrl: t.String({
                title: "Spotify URL",
                description: "A Spotify track URL. It doesn't have to be encoded to URI format."
            }),
          }),
          detail: {
            name: "Get Lyrics (as query)",
            tags: ["Lyrics"]
          }
        }
      )
  );
