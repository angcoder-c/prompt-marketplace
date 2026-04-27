import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Kysely } from "kysely";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

const databaseUrl = process.env.TURSO_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("TURSO_DATABASE_URL is required");
}

const authDb = new Kysely({
  dialect: new LibsqlDialect({
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  }),
});

const googleClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const githubClientId = process.env.GITHUB_OAUTH_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

const socialProviders = {
  ...(googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : {}),
  ...(githubClientId && githubClientSecret
    ? {
        github: {
          clientId: githubClientId,
          clientSecret: githubClientSecret,
        },
      }
    : {}),
};

const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  process.env.BETTER_AUTH_TRUSTED_ORIGINS,
]
  .filter(Boolean)
  .flatMap((value) => (value as string).split(","))
  .map((value) => value.trim())
  .filter(Boolean);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: {
    db: authDb,
    type: "sqlite",
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders,
  user: {
    modelName: "auth_user",
  },
  session: {
    modelName: "auth_session",
  },
  account: {
    modelName: "auth_account",
  },
  verification: {
    modelName: "auth_verification",
  },
  plugins: [tanstackStartCookies()],
});
