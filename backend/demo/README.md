# Group Dinner Picker - Backend API

## Overview

This Spring Boot application provides the backend API for the Group Dinner Picker, a collaborative voting system that helps groups decide on dinner options. The application follows clean architecture principles with a clear separation between web, service, and data layers.

## Architecture

### Project Structure
```
src/main/java/com/example/demo/
├── config/          # Configuration classes (CORS, etc.)
├── domain/          # Core business entities
├── dto/             # Data Transfer Objects for API communication
├── repo/            # Data access layer (repositories)
├── service/         # Business logic layer
│   └── exception/   # Custom business exceptions
├── util/            # Utility classes
└── web/             # REST controllers and exception handlers
```

### Design Philosophy

I've built this API following **Domain-Driven Design** principles with a focus on:
- **Clean separation of concerns** - each layer has a single responsibility
- **Thread-safe in-memory storage** - suitable for demo/prototype purposes
- **Comprehensive error handling** - meaningful HTTP status codes and error messages
- **Input validation** - both at the controller and business logic levels
- **Immutable responses** - defensive copying to prevent external mutation

## Core Domain Models

### Option Entity
The `Option` class represents a dinner choice that users can vote on:

```java
public class Option {
    private UUID id;           // Auto-generated unique identifier
    private String name;       // Restaurant name
    private String link;       // Website URL (validated)
    private int votes;         // Current vote count
    private Instant createdAt; // Creation timestamp
}
```

**Key Design Decisions:**
- UUID for guaranteed uniqueness across distributed systems
- Immutable creation timestamp for audit trail
- Vote count clamped at 0 minimum to prevent negative values
- Helper methods `upvote()` and `downvote()` for business operations

### LockState Entity
The `LockState` manages voting permissions:

```java
public class LockState {
    private boolean locked;    // Whether voting is currently allowed
    private Instant lockedAt;  // Timestamp when locked (null if unlocked)
}
```

**Smart State Management:**
- Automatically sets `lockedAt` timestamp when locking
- Clears `lockedAt` when unlocking
- Thread-safe operations through repository layer

## API Design

### RESTful Endpoints

#### Option Management
- `GET /api/v1/options` - List all options (sorted by votes desc, then creation time)
- `GET /api/v1/options/{id}` - Get specific option by UUID
- `POST /api/v1/options` - Create new dinner option

#### Voting System
- `POST /api/v1/vote` - Cast vote (+1 or -1) for an option

#### Access Control
- `GET /api/v1/lock` - Get current lock state
- `POST /api/v1/lock` - Set lock state (enable/disable voting)

### Request/Response Design

**Input Validation:**
- `CreateOptionRequest`: Name required, link must be valid URL
- `VoteRequest`: Option ID required, delta must be ±1
- `SetLockRequest`: Boolean locked state required

**Consistent Response Format:**
All responses include full object state to minimize client-side state management.

## Business Logic Implementation

### OptionService
The core service handling all dinner option operations:

```java
@Service
public class OptionService {
    // Dependencies injected via constructor
    private final OptionRepository optionRepo;
    private final LockService lockService;
}
```

**Key Business Rules:**
1. **Voting Lock Enforcement** - All mutations check lock state first
2. **Vote Delta Validation** - Only ±1 votes allowed (prevents gaming)
3. **Negative Vote Prevention** - Vote count cannot go below 0
4. **Sorting Strategy** - Results sorted by popularity, then chronologically

**Error Scenarios Handled:**
- Option not found → `OptionNotFoundException` (404)
- Invalid vote delta → `InvalidVoteDeltaException` (409)
- Voting while locked → `VotingLockedException` (409)

### LockService
Simple but crucial service for access control:

```java
@Service
public class LockService {
    public boolean isLocked() {
        return lockRepo.get().isLocked();
    }
}
```

**Integration Pattern:**
Other services call `lockService.isLocked()` before performing mutations, ensuring consistent enforcement across all operations.

## Data Storage Strategy

### In-Memory Repositories

I chose in-memory storage for this prototype because:
- **Fast development iteration** - no database setup required
- **Thread-safe operations** - using `ConcurrentHashMap` and `AtomicReference`
- **Stateless restarts** - perfect for demo scenarios
- **Zero configuration** - works out of the box

#### InMemoryOptionRepository
```java
@Repository
public class InMemoryOptionRepository implements OptionRepository {
    private final ConcurrentMap<UUID, Option> store = new ConcurrentHashMap<>();
}
```

**Thread Safety Features:**
- `ConcurrentHashMap` for multi-user concurrent access
- Defensive copying on all read/write operations
- Immutable collections returned to prevent external mutation

#### InMemoryLockStateRepository
```java
@Repository
public class InMemoryLockStateRepository implements LockStateRepository {
    private final AtomicReference<LockState> ref = new AtomicReference<>(new LockState());
}
```

**Atomic Operations:**
- Single `AtomicReference` ensures consistent lock state
- Copy-on-read prevents external state modification

### Migration Path
The repository interfaces (`OptionRepository`, `LockStateRepository`) abstract the storage implementation, making it easy to swap in JPA/database repositories later without changing business logic.

## Error Handling Strategy

### Global Exception Handler
I've implemented a comprehensive `@ControllerAdvice` that maps business exceptions to appropriate HTTP responses:

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    // 400 - Validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    
    // 404 - Resource not found
    @ExceptionHandler(OptionNotFoundException.class)
    
    // 409 - Business rule violations
    @ExceptionHandler({VotingLockedException.class, InvalidVoteDeltaException.class})
    
    // 500 - Unexpected errors
    @ExceptionHandler(Exception.class)
}
```

### Structured Error Responses
All errors return consistent JSON with:
- HTTP status and reason phrase
- Request path for debugging
- Descriptive error message
- Field-level validation violations (when applicable)

## Configuration

### CORS Setup
Configured to allow frontend development on different ports:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    // Allows localhost:4200 (Angular dev server)
}
```

### Application Properties
```properties
server.port=8080
spring.mvc.problemdetails.enabled=false  # Using custom error responses
```

## Development Workflow

### Running the Application
```bash
# Development mode with hot reload
./mvnw spring-boot:run

# Run tests
./mvnw test

# Package for deployment
./mvnw clean package
```

### Testing Strategy
- **Unit tests** for service layer business logic
- **Integration tests** for controller endpoints
- **Manual testing** with curl commands (as demonstrated in testing)

### API Testing Examples
```bash
# Create an option
curl -X POST "http://localhost:8080/api/v1/options" \
  -H "Content-Type: application/json" \
  -d '{"name": "Pizza Palace", "link": "https://pizzapalace.com"}'

# Vote for an option
curl -X POST "http://localhost:8080/api/v1/vote" \
  -H "Content-Type: application/json" \
  -d '{"optionId": "uuid-here", "delta": 1}'

# Lock voting
curl -X POST "http://localhost:8080/api/v1/lock" \
  -H "Content-Type: application/json" \
  -d '{"locked": true}'
```

## Future Enhancements

### Database Integration
- Replace in-memory repositories with JPA entities
- Add database migrations with Flyway
- Implement connection pooling and transaction management

### Security
- Add user authentication and authorization
- Implement rate limiting for voting
- Add CSRF protection

### Advanced Features
- Real-time updates with WebSocket
- Vote history and audit logging
- Duplicate restaurant detection
- Geographic restaurant search integration

### Monitoring
- Add actuator endpoints for health checks
- Implement metrics collection
- Add structured logging

## Dependencies

Key Spring Boot starters used:
- `spring-boot-starter-web` - REST API framework
- `spring-boot-starter-validation` - Bean validation
- `spring-boot-starter-actuator` - Production monitoring
- `spring-boot-starter-test` - Testing framework

## Notes

This backend API is designed to be **stateless** and **horizontally scalable**. The in-memory storage is the only limitation for scaling - replacing it with a proper database would make this production-ready.

The API follows **REST principles** and returns **consistent JSON responses**, making it easy to integrate with any frontend framework.
