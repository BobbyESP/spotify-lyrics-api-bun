import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { lyricsController } from "@controllers/LyricsController";

const app = new Elysia()
  .use(
    openapi({
      documentation: {
        info: {
          title: "Spotify Synced Lyrics API",
          description:
            "A simple API that retrieves the synced lyrics from the Spotify servers.",
          version: "1.0.0",
        },
        tags: [
          { name: "General", description: "General endpoints" },
          { name: "Lyrics", description: "The lyrics fetching endpoints" },
        ],
      },
    })
  )
  .get(
    "/",
    () => {
      return {
        error: false,
        message:
          "This is the root of the API, no content here. " +
          "Try other endpoints explained in the documentation or check the OpenAPI page at " +
          app.server?.hostname +
          ((app.server?.port ? `:${app.server?.port}` : "") + "/openapi"),
      };
    },
    {
      detail: {
        tags: ["General"],
      },
    }
  )
  .onError(({ error }) => {
    return {
      error: true,
      message: (error as Error).message,
    };
  })
  .use(lyricsController)
  .onAfterResponse(() => {
    
  })
  .listen(process.env.PORT ?? 3000, ({ hostname, port }) => {
		console.log(
			`🦊 Elysia is running at ${hostname}:${port}`
		)
	})
  .compile();
