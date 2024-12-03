import { Elysia, t } from "elysia";
import { SpotifyService } from "@services/SpotifyService";
import { getSpotifyTrackId } from "@/libs/spotify/SpotifyURLs";

const spotifyService = new SpotifyService(undefined);

export const lyricsController = new Elysia()
  .get(
    "/lyrics/:spotifyUrl",
    async (context) => {
      const { spotifyUrl } = context.params; // this url comes utf-8 encoded
      const trackId = getSpotifyTrackId(spotifyUrl);
      if (trackId) {
        return await spotifyService.fetchLyrics(trackId);
      }

      throw new Error(
        "A valid URL is required. Please, check it and try again."
      );
    },
    {
      params: t.Object({
        spotifyUrl: t.String(),
      }),
    }
  )
  .get(
    "/lyrics",
    async (context) => {
      const trackId = getSpotifyTrackId(context.query.spotifyUrl);
      if (trackId) {
        return await spotifyService.fetchLyrics(trackId);
      }

      throw new Error(
        "A valid URL is required. Please, check it and try again."
      );
    },
    {
      query: t.Object({
        spotifyUrl: t.String(),
      }),
    }
  );
