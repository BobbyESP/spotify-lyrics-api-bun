import { Elysia, t } from "elysia";
import { SpotifyService } from "@services/SpotifyService";
import { getSpotifyTrackId } from "@/libs/spotify/SpotifyURLs";

export const lyricsController = new Elysia()
  .decorate("spotifyService", new SpotifyService(undefined))
  .group("/lyrics", (app) =>
    app
      .get(
        "/:spotifyUrl",
        async (context) => {
          const { spotifyUrl } = context.params; // this url comes utf-8 encoded
          const trackId = getSpotifyTrackId(spotifyUrl);
          if (trackId) {
            return await context.spotifyService.fetchLyrics(trackId);
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
            tags: ["Lyrics"]
          }
        }
      )
      .get(
        "/",
        async (context) => {
          const trackId = getSpotifyTrackId(context.query.spotifyUrl);
          if (trackId) {
            return await context.spotifyService.fetchLyrics(trackId);
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
            tags: ["Lyrics"]
          }
        }
      )
  );
