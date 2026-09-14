# CargoShield AI

## Project Goal
CargoShield AI is a supply-chain disruption and fleet-utilisation assistant.

## Core Features
1. Detect shipments affected by disruptions.
2. Recommend alternative routes and carriers.
3. Identify idle fleet assets for redeployment.
4. Detect and classify cold-chain temperature excursions.
5. Provide AI-generated explanations and operational recommendations.

## Technology
Frontend:
- React
- Vite
- Recharts

Backend:
- Python
- FastAPI
- Pandas

Data:
- CSV files for MVP

## Architecture
frontend -> FastAPI -> service layer -> CSV data

## Development Rules
- Keep implementation simple and readable.
- Prefer existing dependencies.
- Do not introduce unnecessary infrastructure.
- Do not rewrite working modules.
- Do not create microservices.
- Do not add authentication unless required.
- Use deterministic algorithms for calculations.
- AI should explain/prioritize results rather than replace deterministic business rules.
- Add focused tests for important backend services.
- Keep features modular.
- Preserve existing API contracts unless the team agrees otherwise.

## Core Services
disruption_service
route_service
fleet_service
cold_chain_service
recommendation_service
