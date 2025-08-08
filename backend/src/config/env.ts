import { configDotenv } from "dotenv";

configDotenv();

const env = {
  app: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
  },
  db: {
    url: process.env.DATABASE_URL,
    testUrl: process.env.TEST_DATABASE_URL,
  },
};

export default env;
