import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  musicBrainzUserAgent: requireEnv(
    "MUSICBRAINZ_USER_AGENT",
    "Crate/0.1.0 ( no-contact-set@example.com )"
  ),
} as const;
