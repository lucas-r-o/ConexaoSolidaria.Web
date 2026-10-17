# Solidarity Connection

An Angular frontend for the ConexaoSolidaria API. The user interface is in English and continues to support Brazil-specific values such as CPF validation and BRL currency.

## Requirements

- Node.js and npm (the package manager version is recorded in `package.json`)

## Setup

From this directory, install dependencies and start the development server:

```bash
npm ci
npm start
```

The server runs at `http://127.0.0.1:58433/` and reloads when source files change.

## Build

```bash
npm run build
```

Production build output is written to `dist/`.

## Unit tests

Tests run with Vitest through the Angular CLI:

```bash
npm test -- --watch=false
```

## API contract

The API is maintained separately. Its base URL is configured in `src/environments/`. Keep API endpoints and wire-format request/response keys unchanged unless the API contract is updated in coordination with its maintainers. Frontend symbols and user-facing copy should be in English.

## Testing tools

No lint script or end-to-end test framework is currently configured in this frontend project.

For Angular CLI reference, see the [Angular CLI documentation](https://angular.dev/tools/cli).
