[README.md](https://github.com/user-attachments/files/29698271/README.md)
# Enterprise VPS Management Panel — Scaffold

This is a **thin, wired-together skeleton** of the full platform described in the master prompt.
It is NOT the full production system (that's months of work) — it's a working foundation:

- `backend/` — NestJS API: auth (JWT), RBAC roles, Prisma + PostgreSQL, Redis, WebSocket gateway, Nodes module
- `agent/` — Node.js agent: registers with panel, sends heartbeat (CPU/RAM/Disk), stub for LXC commands
- `frontend/` — Next.js + Tailwind: login page, dashboard shell, live node list via WebSocket
- `docker/` — docker-compose.yml wiring Postgres, Redis, backend, frontend

## What works right now
- Register/login (JWT, bcrypt password hashing)
- Roles: SUPER_ADMIN, ADMIN, RESELLER, USER, SUPPORT (enforced via guard + decorator)
- Default admin seeded (`admin` / `admin`, `mustChangePassword: true` enforced on first login)
- Node agent installer script that registers a node and streams heartbeat over WebSocket
- Dashboard shows live nodes + basic resource stats
- Everything runs via `docker compose up`

## What's stubbed / next steps
- LXC/Docker/KVM actual container lifecycle (agent has the command interface, not real virtualization calls)
- File manager, terminal (xterm.js), Git integration, backups, Pterodactyl/Wings, notifications, Cloudflare Tunnel config
- These are all designed to slot into the existing module structure — see `backend/src/modules/` for where each belongs

## Run it
```bash
cd docker
cp .env.example .env
docker compose up --build
```
Frontend: http://localhost:3000
Backend: http://localhost:8006
