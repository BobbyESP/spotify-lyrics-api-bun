import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { lyricsController } from "./controllers/LyricsController";
import { ServerMessage } from "./types/ServerMessage";

const app = new Elysia()
  .use(swagger({
    documentation: {
        info: {
            title: 'Spotify Synced Lyrics API',
            description: 'A simple API that retrieves the synced lyrics from the Spotify servers.',
            version: "1.0.0",
        },
        tags: [
          { name: "General", description: "General endpoints" },
          { name : "Lyrics", description: "The lyrics fetching endpoints" }
        ]
    }
}))
  .get("/", () => {
    return {
        error: false,
        message: "This is the root of the API, no content here. " + 
        "Try other endpoints explained in the documentation or check the Swagger page at " +
        app.server?.hostname + ((app.server?.port ? `:${app.server?.port}` : "") + "/swagger"),
    };
  }, {
    detail: {
        tags: ["General"]
    }
  })
  .onError((context) => {
    return {
      error: true,
      message: context.error.message,
  }; 
  })
  .use(lyricsController)
  .listen(process.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
