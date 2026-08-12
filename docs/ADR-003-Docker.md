# Architecture Decision Record (ADR-003): Docker

## Status
Accepted

## Context
Developer environments vary wildly. Missing Java versions, different Node.js environments, and unconfigured databases lead to "it works on my machine" syndromes and delays in onboarding.

## Decision
We will orchestrate all local development using **Docker Compose**.

## Consequences
- Requires Docker installed on developer machines.
- Ensures identical parity between dev, test, and production environments.
- Automates backend, frontend, and database initialization via a single `docker-compose up` command.
