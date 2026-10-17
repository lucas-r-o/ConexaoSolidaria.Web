# Frontend Project Guidance

## Project

- This project is the Angular frontend for the ConexaoSolidaria API.
- Angular and TypeScript versions are defined in `package.json`.
- The API is maintained in a separate repository and owns the HTTP contract.

## API and security

- Configure the API base URL in `src/environments/`; never hardcode service URLs.
- Make HTTP requests from services under `src/services/`, not from components.
- Do not invent endpoints or change request/response shapes without confirming the API contract.
- Keep API wire-format keys, claim values, and endpoint paths unchanged, even when their names are Portuguese. Use English for frontend identifiers and map at the service boundary if internal models need different names.
- The authentication service stores the JWT in local storage under `token`. Do not treat client-side guards as a substitute for API authorization.
- Do not edit CI workflows or backend infrastructure from this frontend project.

## TypeScript and Angular conventions

- Use kebab-case filenames with Angular suffixes: `.component.ts`, `.service.ts`, `.guard.ts`, `.dto.ts`, `.enum.ts`, and `.spec.ts`.
- Use English for classes, interfaces, enums, variables, methods, selectors, and comments. Keep external API keys/claims unchanged as required by the contract.
- Use PascalCase for classes, interfaces, and enums; use camelCase for variables, methods, and properties.
- Keep TypeScript strict and avoid `any`.
- Type every API request and response.
- Prefer standalone components and `inject()`; keep components focused and put HTTP/business orchestration in services.
- Handle loading, success, empty, and error states explicitly. Do not turn failed requests into success-shaped empty results.
- Unsubscribe from long-lived observables with `async` pipes or `takeUntilDestroyed`.
- Keep accessible labels and semantic controls in templates; use Angular built-in control flow.
- All user-facing frontend copy is English. Keep Brazilian contract-specific values such as BRL currency, CPF validation, and API-supplied messages intact where translating them would change their meaning or contract.

## Commands

Run commands from this directory:

- Install dependencies: `npm ci`
- Start the frontend: `npm start`
- Production build: `npm run build`
- Unit tests (Angular CLI with Vitest): `npm test -- --watch=false`

This project currently has no configured lint script or end-to-end test framework. Do not use Nx, .NET, or RabbitMQ commands for frontend validation. Add lint or E2E tooling only as a separately scoped project change.

## Tests and changes

- Add or update unit tests for changed behavior, especially services, guards, routes, and validation.
- Keep tests focused on both successful and rejected/invalid cases.
- Run the production build and relevant unit tests before finishing implementation changes.
- Do not commit secrets or `.env` files; frontend bundles are public.

## Commits

- Use Conventional Commits in English, imperative mood, with a subject no longer than 72 characters.
- Split unrelated concerns into separate commits. Order commits so each commit remains buildable.
