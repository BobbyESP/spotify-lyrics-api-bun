import * as OTPAuth from "otpauth";

export class TOTPService {
  private totp: OTPAuth.TOTP;
  private version: number;

  constructor(secretBytes: number[], version: number) {
    const mapped = secretBytes.map((v, i) => v ^ ((i % 33) + 9));
    const dataString = mapped.join("");
    const hexData = Buffer.from(dataString, "utf8").toString("hex");

    this.totp = new OTPAuth.TOTP({
      issuer: "Spotify",
      label: "spotify-client",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromHex(hexData),
    });

    this.version = version;
  }

  generate(ts: number): string {
    return this.totp.generate({ timestamp: ts });
  }

  getVersion() {
    return this.version;
  }
}
