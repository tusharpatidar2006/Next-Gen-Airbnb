# NWXT-GEN Starter Scaffold

This repository was initialized to match the roadmap structure extracted from `Project Development Roadmap.pdf`.

## Initial scaffold
- `apps/web` — Next.js 14 web frontend
- `apps/mobile` — React Native Expo mobile app
- `services/auth-service` — Node.js Fastify auth service
- `services/gateway` — Apollo GraphQL gateway
- `services/core-service` — Go backend service
- `services/business-service` — Java Spring Boot backend
- `services/ai-service` — Python FastAPI AI service
- `proto` — shared protobuf definitions
- `infra` — docker, k8s, terraform, monitoring

## Next steps
1. Install dependencies in `apps/web` and `apps/mobile`.
2. Build and run the web frontend.
3. Add backend services one sprint at a time.

## Local tooling inside `nwxt-gen`

If you want everything removable by deleting this folder, use the PowerShell scripts in [scripts/setup-node.ps1](/d:/nwxt-gen/scripts/setup-node.ps1) and [scripts/run-web.ps1](/d:/nwxt-gen/scripts/run-web.ps1).

- `scripts/setup-node.ps1` downloads a portable Node.js copy into `D:\nwxt-gen\.tools\node`
- `scripts/run-web.ps1` keeps the npm cache in `D:\nwxt-gen\.cache\npm`, creates `apps/web/.env.local`, installs dependencies, and starts the web app
- By default the web app now works in Sprint 1 mode with local Next.js API stubs, so `NEXT_PUBLIC_API_BASE_URL` can stay empty unless you later run the auth service separately
# Next-Gen-Airbnb
