const corsConfig = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://test-school-labib2003.netlify.app",
  ],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

export default corsConfig;
