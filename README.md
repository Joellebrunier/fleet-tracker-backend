# Fleet Tracker GPS Fleet Management Backend

A complete, production-ready NestJS backend for GPS fleet tracking and management platform.

## Overview

Fleet Tracker is a comprehensive GPS fleet management solution featuring:

- Real-time vehicle tracking across multiple GPS providers (Flespi, Echoes, Ubiwan, Keeptrace)
- Multi-tenant architecture with organization isolation
- Advanced geofencing with PostGIS support
- Alert system with customizable rules
- Historical GPS data tracking with TimescaleDB optimization
- Report generation (daily, weekly, monthly, custom)
- BullMQ queue processing for scalability
- Role-based access control (SUPER_ADMIN, ADMIN, MANAGER, OPERATOR, DRIVER)
- JWT authentication with Passport.js
- Comprehensive API documentation with Swagger

## Technology Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL with TypeORM
- **Cache/Queue**: Redis with BullMQ
- **Real-time GPS**: MQTT (Flespi), HTTP polling (Echoes, Ubiwan)
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator, zod
- **API Documentation**: Swagger/OpenAPI
- **Language**: TypeScript with strict mode

## Project Structure

```
src/
├── main.ts                          # Application bootstrap
├── app.module.ts                    # Root module
├── config/                          # Configuration management
│   ├── configuration.ts
│   └── validation.schema.ts
├── common/                          # Shared utilities
│   ├── decorators/                  # Custom decorators (@Roles, @CurrentUser, @ApiPaginated)
│   ├── guards/                      # Auth guards (JWT, Roles, Tenant)
│   ├── filters/                     # Exception filters
│   ├── interceptors/                # Request/response interceptors
│   ├── pipes/                       # Validation pipes
│   ├── dto/                         # Common DTOs
│   ├── interfaces/                  # Common interfaces
│   └── enums/                       # Common enums
└── modules/
    ├── auth/                        # Authentication (login, register, JWT validation)
    ├── users/                       # User management with role-based access
    ├── organizations/               # Multi-tenant organization management
    ├── vehicles/                    # Vehicle CRUD operations
    ├── gps-history/                 # GPS tracking history and playback
    ├── geofences/                   # Geofence management with PostGIS queries
    ├── alerts/                      # Alert management and rules engine
    ├── reports/                     # Report generation
    ├── gps-providers/               # GPS provider integrations
    │   ├── adapters/                # Provider-specific adapters
    │   └── normalizer/              # GPS data normalization
    ├── queue/                       # BullMQ job processing
    │   ├── producers/
    │   └── consumers/
    └── super-admin/                 # System administration
```

## Getting Started

### Prerequisites

- Node.js 18+ with npm
- PostgreSQL 14+
- Redis/Upstash instance
- (Optional) GPS provider accounts (Flespi, Echoes, Ubiwan, Keeptrace)

### Installation

```bash
# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Configure your environment variables
# - Database connection
# - Redis connection
# - JWT secrets
# - GPS provider credentials
```

### Configuration

Edit `.env` with your configuration:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fleet-tracker
DIRECT_URL=postgresql://user:password@localhost:5432/fleet-tracker

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRATION=3600

# GPS Providers
FLESPI_TOKEN=your-token
FLESPI_MQTT_HOST=mqtt.flespi.io
ECHOES_API_URL=https://api.echoes.com
ECHOES_API_KEY=your-key
UBIWAN_API_URL=https://api.ubiwan.com
UBIWAN_API_KEY=your-key
```

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# Debug
npm run start:debug
```

The API will be available at `http://localhost:3001`
Swagger documentation at `http://localhost:3001/api/docs`

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user/organization
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Users
- `GET /organizations/:organizationId/users` - List users
- `POST /organizations/:organizationId/users` - Create user
- `GET /organizations/:organizationId/users/:id` - Get user
- `PATCH /organizations/:organizationId/users/:id` - Update user
- `DELETE /organizations/:organizationId/users/:id` - Delete user

### Vehicles
- `GET /organizations/:organizationId/vehicles` - List vehicles
- `POST /organizations/:organizationId/vehicles` - Create vehicle
- `GET /organizations/:organizationId/vehicles/:id` - Get vehicle
- `GET /organizations/:organizationId/vehicles/:id/position` - Get current position
- `PATCH /organizations/:organizationId/vehicles/:id` - Update vehicle
- `DELETE /organizations/:organizationId/vehicles/:id` - Delete vehicle

### GPS History
- `GET /organizations/:organizationId/gps-history` - Query history by vehicle & date range
- `GET /organizations/:organizationId/gps-history/:vehicleId/playback` - Get playback data

### Geofences
- `GET /organizations/:organizationId/geofences` - List geofences
- `POST /organizations/:organizationId/geofences` - Create geofence
- `GET /organizations/:organizationId/geofences/:id` - Get geofence
- `PATCH /organizations/:organizationId/geofences/:id` - Update geofence
- `DELETE /organizations/:organizationId/geofences/:id` - Delete geofence
- `POST /organizations/:organizationId/geofences/:id/assign-vehicle/:vehicleId` - Assign to vehicle

### Alerts
- `GET /organizations/:organizationId/alerts` - List alerts
- `PATCH /organizations/:organizationId/alerts/:id/acknowledge` - Acknowledge alert
- `POST /organizations/:organizationId/alerts/acknowledge-multiple` - Batch acknowledge
- `POST /organizations/:organizationId/alerts/rules` - Create alert rule
- `GET /organizations/:organizationId/alerts/rules` - List alert rules
- `PATCH /organizations/:organizationId/alerts/rules/:ruleId` - Update rule
- `DELETE /organizations/:organizationId/alerts/rules/:ruleId` - Delete rule

### Reports
- `POST /organizations/:organizationId/reports/generate` - Generate report

### Super Admin
- `GET /super-admin/health` - System health status
- `GET /super-admin/stats` - System statistics
- `GET /super-admin/audit-logs` - Audit logs
- `PATCH /super-admin/config` - Update system config

## GPS Providers

### Flespi
- MQTT-based real-time updates
- Requires MQTT client connection to `mqtt.flespi.io:8883`
- Subscribes to `flespi/gps/+/data` topics

### Echoes
- HTTP polling every 2 minutes
- Fetches device positions from API
- No real-time guarantee but reliable

### Ubiwan
- HTTP polling every 2 minutes
- Requires API key authentication
- Supports bulk position queries

### Keeptrace
- Similar to Ubiwan
- Alternative provider for redundancy

## Architecture

### Multi-Tenancy
- Organization-based isolation via `organizationId`
- TenantGuard enforces cross-tenant access restrictions
- All queries filtered by user's organization

### Role-Based Access Control (RBAC)
- SUPER_ADMIN: Full system access
- ADMIN: Organization-wide management
- MANAGER: Fleet and alert management
- OPERATOR: Real-time monitoring
- DRIVER: Limited to own vehicle data

### Queue Processing
- GPS events → `gps-events` queue
- Alert checks → `alert-checks` queue
- Report generation → `report-generation` queue
- 3 retry attempts with exponential backoff

### Data Flow
```
GPS Provider → Data Normalizer → GPS Event Producer
                                        ↓
                                GPS Processor Consumer → DB
                                        ↓
                                Alert Checker Consumer → Alerts
```

## Type Safety

- TypeScript strict mode enabled
- Zod schemas for environment validation
- class-validator for DTO validation
- Full type coverage for entities and interfaces

## Error Handling

- Global HttpExceptionFilter
- Structured error responses
- Comprehensive logging
- Proper HTTP status codes

## Response Format

All endpoints return standardized responses:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2026-03-31T07:48:00.000Z"
}
```

## Development

### Scripts
```bash
npm run start:dev      # Watch mode
npm run start:debug    # Debug mode
npm run build          # Build for production
npm run test           # Run tests
npm run test:watch     # Watch mode tests
npm run test:cov       # Coverage report
npm run lint           # Lint code
npm run format         # Format code
```

### Database

Uses TypeORM with auto-synchronization in development:

```bash
# Run migrations
npm run migration:run

# Generate migration
npm run migration:generate -- src/migrations/AddNewColumn
```

### Adding New Features

1. Create module structure
2. Define entity with TypeORM
3. Create DTO for validation
4. Implement service logic
5. Add controller routes
6. Register in app.module.ts
7. Add Swagger decorators

## Testing

```bash
npm run test
npm run test:watch
npm run test:cov
```

## Production Deployment

```bash
# Build optimized version
npm run build:prod

# Set production environment
export NODE_ENV=production

# Start with process manager (PM2)
pm2 start dist/main.js --name "fleet-tracker-api"
```

### Performance Optimizations
- Connection pooling for database
- Redis caching for frequently accessed data
- Message queue for heavy operations
- Geographic indexing for geofences
- GPS data aggregation with intervals

### Monitoring
- Request logging with timestamps
- Error tracking and alerting
- System health checks
- Queue processing metrics
- Database query profiling

## License

ISC

## Support

For issues and feature requests, please create an issue in the repository.
