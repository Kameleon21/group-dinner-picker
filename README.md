# Group Dinner Picker

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

## Development (Docker)

```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up

# Start specific service
docker-compose -f docker-compose.dev.yml up frontend
docker-compose -f docker-compose.dev.yml up backend

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Production (Docker)

```bash
# Build and start production environment
docker-compose up -d

# View production logs
docker-compose logs -f

# Stop production environment
docker-compose down
```

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
