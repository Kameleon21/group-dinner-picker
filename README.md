# Group Dinner Picker


https://github.com/user-attachments/assets/48644438-eee2-40f5-b9e1-1b6b7ebfc573

A collaborative application for groups to decide on dinner options together.

## Project Introduction

Group Dinner Picker helps teams, families, and friends make dining decisions collaboratively. Users can suggest restaurants, vote on options, and find the perfect place for their group meal.

## Tech Stack

### Backend
- **Framework**: Spring Boot
- **Build Tool**: Maven
- **Java Version**: 17+

### Frontend
- **Framework**: React 19
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: TBD

## Quickstart

### Prerequisites
- Docker & Docker Compose (optional, for container workflows)
- Java 17+
- Node.js 18+ and npm
- Git

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Kameleon21/group-dinner-picker.git
cd group-dinner-picker

# Start backend (Spring Boot with Maven wrapper)
cd backend/demo
./mvnw spring-boot:run

# (open a new terminal, then run from the repository root)
# Start the terminal-style frontend shell
cd group-dinner-picker/frontend
npm install
npm run start

# Access the application shell at http://localhost:4200
# Backend API root: http://localhost:8080/api/v1
# API Docs: http://localhost:8080/swagger-ui.html

# Commands available within the frontend shell
#   help               List commands
#   list               List dinner options
#   random             Pick a random dinner option
#   add "Name" <link>  Add a new option
#   vote <id> <delta>  Adjust votes (+1/-1/up/down, use numeric id)
#   delete <id>        Remove an option by numeric id
#   stats              View aggregate stats
#   lock status|on|off Inspect or toggle voting lock
#   reset              Clear options and unlock voting
#   health             Check backend status
#   man <command>      Show command manual entry
#   clear              Reset terminal output
#   options            Legacy alias for list
# Keyboard: Ctrl+L or Ctrl+C clears the terminal output
```

## Frontend Architecture

- `frontend/src/features/terminal/useTerminalSession.ts` owns terminal session state (history, input, keyboard navigation) and delegates execution to command handlers.
- `frontend/src/features/terminal/commands/` groups each shell command implementation and shared formatting logic so API orchestration stays out of React components.
- `frontend/src/features/terminal/components/` contains the presentational building blocks (`TerminalView`, `TerminalHistory`, `TerminalPromptForm`, `TerminalHeader`) used by `App.tsx` to render the terminal UI.
- `frontend/src/features/terminal/types.ts` defines the shared terminal entry shapes consumed across hooks and components.
- `frontend/src/App.tsx` now composes the session hook with the presentational layer, keeping layout concerns separate from behavior.

## Development (Docker)

The repository ships with `docker-compose.dev.yml`, which builds both the Spring Boot API and the Vite dev server. This path lets you run everything in containers without installing Java or Node locally.

```bash
# 1. From the repository root, build the images and start the stack
docker compose -f docker-compose.dev.yml up --build

# 2. On subsequent runs you can reuse the cached images
docker compose -f docker-compose.dev.yml up

# 3. Tail logs for either service
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend

# 4. Stop and clean up containers
docker compose -f docker-compose.dev.yml down
```

**What you get**
- Frontend at [http://localhost:4200](http://localhost:4200). Calls to `/api/v1/*` are proxied to the backend container, so browsers never need to talk directly to Docker hostnames.
- Backend API at [http://localhost:8080/api/v1](http://localhost:8080/api/v1) with the `dev` Spring profile active.

**Rebuilding after changes**
- Backend: Rebuild with `docker compose -f docker-compose.dev.yml up --build backend` (or `docker compose ... build backend`) whenever Java sources change. The container runs from the packaged jar, so hot reload is not available yet.
- Frontend: Thanks to the bind mount declared in `docker-compose.dev.yml`, Vite hot reload picks up TypeScript/React file edits automatically. Run `docker compose -f docker-compose.dev.yml build frontend` only if dependencies change.

## Production (Docker)

Production containerization will reuse these Dockerfiles, but the deployment stack is not scripted yet. Contributions welcome!

## API Documentation

- **Development**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Staging**: TBD
- **Production**: TBD

Interactive API documentation is available via Swagger UI with sample requests and responses.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
