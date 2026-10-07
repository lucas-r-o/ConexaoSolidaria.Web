# Conexão Solidaria

## Project
Angular front-end that consumes the ConexaoSolidaria API. It has no backend logic.
Project file: `ConexaoSolidaria.Web/ConexaoSolidaria.Web.esproj`
Stack: Angular <version> + TypeScript

## API
- The API lives in a separate repository and owns the contract.
- Base URL is configured in `<src/environments/environment.ts>`. Never hardcode URLs in code.
- All HTTP calls go through services in `src/app/core/` or `src/app/features/<feature>/services/`. No `HttpClient` in components.
- Auth: <e.g. JWT stored in ..., attached by an HTTP interceptor>
- Do not invent endpoints or change DTO shapes. Ask if the contract is unclear.

## Related services
- The Worker is a separate microservice maintained in another repository. It consumes events published by this API.
- This API publishes events to RabbitMQ (via MassTransit). Do not change event contracts (message classes) without verifying Worker compatibility.

## Running locally
- Start RabbitMQ (example path; verify `docker-compose` location): `docker compose -f src/docker-compose.yml up -d`
- Run the API: `dotnet run --project src/ConexaoSolidaria.API`
- Stop RabbitMQ: `docker compose -f src/docker-compose.yml down`
- Wait for RabbitMQ to be ready before starting the application.

## Commands
- Restore: `dotnet restore ConexaoSolidaria.Web.slnx`
- Build: `dotnet build ConexaoSolidaria.Web.slnx`
- Test all: `dotnet test`
- Run locally with compose: `docker compose -f src/docker-compose.yml up --build`

## Structure
- `src/ConexaoSolidaria.API`: controllers, thin, no business logic
- `src/ApplicationServices`: use cases and business flow
- `src/Infrastructure`: database, messaging, external integrations
- `src/Models`: entities, enums, DTOs — must not reference other layers
- `src/ConexaoSolidaria.Tests`: automated tests
- `src/Docker`: application Dockerfile
- `src/docker-compose.yml`: container setup (verify actual location in this repo)

## Frontend / JS/TS notes
- The workspace may include JavaScript/TypeScript projects (frontend). Keep frontend assets and tooling (npm/Yarn, ESLint, Prettier) isolated from backend projects and follow the repo's frontend configs.

## Conventions
- Standalone components; no NgModules in new code
- File names: kebab-case with Angular suffixes (`donation-list.component.ts`)
- Classes: PascalCase; variables and methods: camelCase
- Strict TypeScript; no `any`
- Define an interface for every API request and response
- Use `inject()` or constructor DI; keep components thin, logic in services
- Handle loading, error, and empty states on every API call
- Unsubscribe from observables (`async` pipe, `takeUntilDestroyed`)
- Prefer small, single-purpose components

## Rules
- Do not commit secrets or `.env` files; the front-end bundle is public
- Do not edit CI workflows, Dockerfiles, or migrations without coordinating with maintainers.
- Commits only need to be called can when explicitly requested.
- Run lint, tests, and build before finishing a change
- Add or update tests for new behavior
- Follow existing patterns and naming before introducing new ones
- Keep changes small and focused; no broad refactors without review

## Commits
- Conventional Commits (feat, fix, refactor, test, docs, chore), English, imperative mood, max 72 chars in the subject.
- If the changes cover more than one concern, split them into multiple commits, one logical change per commit.
- Order commits so each one builds on its own: refactors first, then features or fixes, then tests, then docs.