export interface ServerTimeResponse {
    serverTime: number;
}

export interface WebPlayerTokenResponse {
    clientId: string;
    accessToken: string;
    accessTokenExpirationTimestampMs: number;
    isAnonymous: boolean;
}

export interface SecretData {
    secret: number[];
    version: number;
}