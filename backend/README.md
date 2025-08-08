# Express Boilerplate

A robust and scalable Express.js boilerplate written in TypeScript, designed for rapid API development with modern best practices, security, and maintainability in mind.

## Features

- **TypeScript-first**: Fully typed codebase for safety and maintainability.
- **Express 4.x**: Stable and popular HTTP framework.
- **Prisma ORM**: Type-safe database access.
- **Modern Middleware**:
  - `helmet` for security headers
  - `xss-clean` for XSS protection
  - `cors` with customizable configuration
  - `morgan` for HTTP logging
- **API Versioning**: All API routes are namespaced under `/api/v1`.
- **Centralized Error Handling**: Unified error responses and handling.
- **Environment Variable Management**: Uses `dotenv` for configuration.
- **Scripted Workflows**: `dev`, `build`, `start`, and `test` scripts included.
- **Linting & Formatting**: ESLint and Prettier setups for consistent code style.
- **Testing**: Integrated with Jest and Supertest.

## Getting Started

### Prerequisites

- Node.js v18 or above
- npm or yarn
- (Optional) Docker and a supported database for Prisma

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/Labib2003/express-boilerplate.git
   cd express-boilerplate
   ```

2. **Install dependencies**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` and configure as needed.

4. **Set up the database (if using Prisma)**
   ```sh
   npx prisma generate
   npx prisma db push
   ```

### Scripts

- **Development**: Hot-reloads with file changes
  ```sh
  npm run dev
  ```
- **Build**: Generates production build and Prisma client
  ```sh
  npm run build
  ```
- **Start**: Runs built code in production mode
  ```sh
  npm start
  ```
- **Test**: Runs tests with Jest
  ```sh
  npm test
  ```

## Project Structure

```
src
├── index.ts      # Main entry file
├── app.ts        # Express app configuration with middleware
├── config/       # Configuration files for different packages (e.g. cors, prisma etc.)
├── middleware/   # Custom middleware (e.g. global error handler, validate request etc.)
├── modules/      # API modules
├── routes/       # Versioned routes of the app (e.g. v1, v2 etc.)
├── tests/        # Unit and integration tests
├── types/        # Type definitions for modules and packages
└── utils/        # Utility functions
```

## API Overview

- **Base URL**: `/api/v1`
- **Example Endpoint**: `GET /api/v1/`
- **Health Check**: `GET /` returns "Hello World"

## Error Handling

- All unhandled routes return a `404 Not Found` error with a descriptive message.
- Centralized global error handler for consistent error responses.

## Security

- Uses `helmet` for setting secure HTTP headers.
- `xss-clean` to prevent cross-site scripting attacks.
- CORS configuration for controlled API access.

## Linting & Formatting

- Pre-configured ESLint with Airbnb base and Prettier for code style.
- Run linting:
  ```sh
  npm run lint
  ```

## Testing

- Jest for unit and integration tests.
- Supertest for HTTP assertions.

---

**Author:** [Labib2003](https://github.com/Labib2003)
