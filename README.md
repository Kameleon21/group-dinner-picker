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
- **Framework**: Angular
- **TypeScript**: Latest
- **Styling**: Angular Material / Bootstrap
- **Build Tool**: Angular CLI

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: TBD

## Quickstart

### Prerequisites
- Docker & Docker Compose
- Git

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Kameleon21/group-dinner-picker.git
cd group-dinner-picker

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Access the application
# Frontend: http://localhost:4200
# Backend API: http://localhost:8080
# API Docs: http://localhost:8080/swagger-ui.html
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

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **Backend Build**: Automated testing and building of Spring Boot application
- **Frontend Build**: Angular build and testing
- **Docker Images**: Automated building and pushing to container registry
- **Deployment**: Automated deployment to staging/production environments

See `.github/workflows/` for detailed CI/CD configuration.

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