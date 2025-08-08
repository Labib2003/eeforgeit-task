import { configDotenv } from "dotenv";

configDotenv();

const env = {
  app: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  },
  db: {
    url: process.env.DATABASE_URL,
    testUrl: process.env.TEST_DATABASE_URL,
  },
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET ?? "access_token_secret",
    refreshTokenSecret:
      process.env.REFRESH_TOKEN_SECRET ?? "refresh_token_secret",
  },
};

export default env;
