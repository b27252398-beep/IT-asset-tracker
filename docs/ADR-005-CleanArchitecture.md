# Architecture Decision Record (ADR-005): Clean Architecture

## Status
Accepted

## Context
The legacy implementation heavily coupled HTTP Controllers directly to Repositories and returned Database Entities directly to the API, creating a fragile system where database changes break API contracts and business logic is scattered.

## Decision
We will adopt **Clean Architecture / Hexagonal Architecture** layered patterns:
Controller -> DTO -> Service -> Repository -> Entity.

## Consequences
- Requires more initial boilerplate (DTOs, Mappers).
- Decouples API layer from persistence layer.
- Makes business logic strictly unit-testable without database mocks.
