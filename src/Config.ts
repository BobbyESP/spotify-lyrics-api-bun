interface APIConfiguration {
    userAgent: string;
    appPlatform: string;
    webPlayerUrl: string;
    spotifyApiUrl: string;
}

export const ApiGlobalConfiguration: APIConfiguration = {
    userAgent: process.env.USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    appPlatform: process.env.APP_PLATFORM ||"WebPlayer",
    webPlayerUrl: "https://open.spotify.com",
    spotifyApiUrl: "https://api.spotify.com/v1"
};