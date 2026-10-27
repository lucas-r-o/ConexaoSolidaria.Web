# Solidarity Connection

Angular frontend for the ConexaoSolidaria platform. The UI uses English labels and supports Brazilian values such as CPF validation and BRL currency.

## Architecture

The complete flow depends on three applications and shared infrastructure:

```text
Browser (Angular)
  -> ConexaoSolidaria API (HTTPS, default port 7031)
  -> PostgreSQL/Supabase for persisted application data
  -> RabbitMQ for asynchronous donation events
       -> ConexaoSolidaria Worker
       -> PostgreSQL/Supabase
       -> API consumes the updated value back through the event flow
```

- **Frontend:** this repository.
- **API:** repository `../ConexaoSolidaria`, project `src/ConexaoSolidaria.API`.
- **Worker:** repository `../ConexaoSolidaria.Worker`, project `ConexaoSolidaria.Worker`.
- **Database:** PostgreSQL, normally configured through the Supabase connection strings in each application's development configuration.
- **Message broker:** RabbitMQ on port `5672`; its management interface defaults to `http://localhost:15672`.

Campaign, donation and authentication updates require both the API and Worker to share the same RabbitMQ broker and database.

## Prerequisites

- Node.js and npm (`packageManager` is recorded in `package.json`)
- .NET SDK compatible with the API and Worker projects
- Docker Desktop, to run RabbitMQ locally
- Access to the PostgreSQL/Supabase databases configured in the application settings
- A valid development certificate for ASP.NET Core HTTPS

## Configuration

Development API consumption is configured in `src/environments/environment.ts`:

```ts
apiUrl: 'https://localhost:7031'
```

Production builds use `src/environments/environment.prod.ts`. Update its `apiUrl` to the deployed API address before building; an empty value means that relative endpoints are used by the deployed frontend.

The API must allow this frontend origin in `ConexaoSolidaria.API/appsettings.Development.json`:

```json
"Cors": {
  "AllowedOrigins": [
    "http://localhost:58433",
    "http://127.0.0.1:58433"
  ]
}
```

## Start RabbitMQ

From the API repository, run:

```bash
cd ../ConexaoSolidaria/src
docker compose up -d
```

Verify the management interface at `http://localhost:15672`. The development credentials are configured as `guest` / `guest` in the API and Worker settings.

## Start the API

```bash
cd ../ConexaoSolidaria/src/ConexaoSolidaria.API
dotnet run --launch-profile https
```

The API listens on:

- `https://localhost:7031`
- `http://localhost:5155`

Check it with:

```bash
curl.exe -k https://localhost:7031/campanhas
curl.exe -k https://localhost:7031/health
```

## Start the Worker

Keep RabbitMQ running and start the worker in a separate terminal:

```bash
cd ../ConexaoSolidaria.Worker/ConexaoSolidaria.Worker/ConexaoSolidaria.Worker
dotnet run
```

The worker listens for RabbitMQ events on port `5001` and exposes its health endpoint at `http://localhost:5001/health`.

## Start the frontend

From this repository:

```bash
npm ci
npm start
```

The frontend is available at:

- `http://127.0.0.1:58433/`
- `http://localhost:58433/`

The development server runs through both hostnames, but the browser should use the same one configured in the API CORS allowlist.

## Consumed API endpoints

| Area | Method | Endpoint | Authentication | Frontend usage |
| --- | --- | --- | --- | --- |
| Campaigns | GET | `/campanhas` | Public | List active campaigns and current amounts |
| Campaigns | GET | `/campanhas/{id}` | Public | Load a campaign for editing |
| Campaigns | POST | `/campanhas/criar` | NGO manager bearer token | Create a campaign |
| Campaigns | PUT | `/campanhas/{id}` | NGO manager bearer token | Update a campaign |
| Authentication | POST | `/auth/login` | Public | Authenticate donor and manager accounts |
| Donors | POST | `/doacao` | Public | Register a donor |
| Managers | POST | `/usuarios/gestores` | NGO manager bearer token | Register a manager |
| Donations | POST | `/usuarios/doar` | Donor bearer token | Submit a donation asynchronously |

The API base URL comes from `src/environments/environment.ts` or `environment.prod.ts`. Protected requests must include `Authorization: Bearer <jwt>`.

## Donation data flow

1. A donor submits `POST /usuarios/doar` with campaign ID, donor ID and amount.
2. The API publishes a `DoacaoRecebidaEvent` to RabbitMQ.
3. The Worker processes the donation and publishes the resulting campaign update.
4. The API consumes the update and persists the campaign's new total.
5. The frontend reloads `/campanhas` to display the updated raised amount.

If the API returns success but the campaign amount does not change, verify RabbitMQ, the Worker logs, both application database connection strings and the event queues.

## Build

```bash
npm run build
```

The production output is written to `dist/ConexaoSolidaria.Web`.

## Tests

Run the unit test suite:

```bash
npm test -- --watch=false
```

Tests cover HTTP contracts, campaign field mapping, authentication headers, forms and donation behavior. API and browser integration failures should be reproduced before changing a test expectation.

## Troubleshooting

- **Campaigns do not load:** confirm the API is running and that it answers both the endpoint and preflight requests for the frontend origin.
- **Browser reports CORS or Failed to fetch:** verify the frontend hostname and port in the API CORS configuration, then restart the API.
- **Login or protected actions return 401:** verify that the JWT is stored as `token` and sent with the `Bearer` prefix.
- **Donation remains unprocessed:** confirm RabbitMQ and the Worker are running, and inspect their logs.
- **Frontend shows stale campaign values:** wait for the asynchronous Worker processing and reload campaigns; the frontend polling interval is 15 seconds.
