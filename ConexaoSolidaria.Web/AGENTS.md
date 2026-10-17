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

## Progressive Documentation Loading

**CRITICAL**: Only load documents relevant to your current task. Do NOT load all documentation at once.

## Quick Reference by Task Type

| Task Type | Primary doc | Notes |
|-|-|-|
| New Angular template | angular-template skill | Auto-triggered |

## Commands
- Restore: `dotnet restore ConexaoSolidaria.Web.slnx`
- Build: `dotnet build ConexaoSolidaria.Web.slnx`
- Test all: `dotnet test`
- Run locally with compose: `docker compose -f src/docker-compose.yml up --build`

## Running locally
- Start RabbitMQ (example path; verify `docker-compose` location): `docker compose -f src/docker-compose.yml up -d`
- Run the API: `dotnet run --project src/ConexaoSolidaria.API`
- Stop RabbitMQ: `docker compose -f src/docker-compose.yml down`
- Wait for RabbitMQ to be ready before starting the application.

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

## General Rules

- Context7 MCP
Always use context7 when I need code generation, setup or configuration steps, or library/API documentation. This
means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me
having to explicitly ask.

- Writing implementation plans
Remember that you are writing high quality and maintainable code while avoiding overengineering. You must be
pragmatic and follow the guidelines in the docs first before blindly following industry standards.
Implementation plans should always include build and lint and e2e tests when necessary. Run lint, tests, and build before finishing a change. To run build add nx build
<packageName> and nx lint:check <packageName>.

- Implementation and Testing
IMPORTANT: always include e2e tests to cover important paths. You should always make sure that the plans include a test suite that covers the happy paths and edge cases. Your tests should be high quality and give confidence while covering most of the implementalion. You must ALWAYS write or update e2e tests when touching controllers, routes, dtos or methods that impact apis indirectly.
You must ALWAYS prove your work using unit tests when working on the domain layer, domain layer includes, services and ....

- Do not edit CI workflows, Dockerfiles, or migrations without coordinating with maintainers.

## Commits
- Conventional Commits (feat, fix, refactor, test, docs, chore), English, imperative mood, max 72 chars in the subject.
- If the changes cover more than one concern, split them into multiple commits, one logical change per commit.
- Order commits so each one builds on its own: refactors first, then features or fixes, then tests, then docs.
- Commits only need to be called can when explicitly requested.
- Do not commit secrets or `.env` files; the front-end bundle is public