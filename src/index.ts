import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { lyricsController } from "./controllers/Lyrics";
import { ServerMessage } from "./types/ServerMessage";

const app = new Elysia()
  .use(swagger())
  .get("/", () => {
    const response: ServerMessage = {
        error: false,
        message: "This is the root of the API, no content here. " + 
        "Try other endpoints explained in the documentation or check the Swagger page at " +
        app.server?.hostname + ((app.server?.port ? `:${app.server?.port}` : "") + "/swagger"),
    };
    return response;
  })
  .onError(({ code, error }) => {
    const response: ServerMessage = {
        error: true,
        message: error.message,
    };
    return response; 
  })
  .use(lyricsController)
  .listen(process.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
