# Member Profile Processor

A service that processes Marathon Match competition events to update member profiles and calculate ratings. The rating calculation algorithm has been migrated from the external Java `ratings-calculation-service` to run locally.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start infrastructure (PostgreSQL + Kafka)**
   ```bash
   docker compose up -d
   ```

3. **Setup database**
   ```bash
   npm run prisma:migrate
   npm run db:seed
   ```

4. **Start the service**
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/member_profile_processor
KAFKA_URL=localhost:9092
KAFKA_GROUP_ID=member-profile-processor-group-consumer
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
V5_API_URL=http://localhost:3001
```

## Architecture

The service is event-driven via Kafka:

```
Kafka Event (review phase end for marathon_match)
    ↓
KafkaHandlerService.handle()
    ↓
MarathonRatingsService.calculate()
    ↓
processMarathonRatings(roundId)
    ↓
Algorithm executes locally → PostgreSQL
```

## Development

```bash
# Start with hot reload
npm run dev

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
npm run lint:fix

# Database operations
npm run prisma:studio    # Visual database browser
npm run db:seed          # Seed test data
npm run db:check         # Check database state

# Prisma commands
npm run prisma:generate
npm run prisma:migrate
```

## Testing

### Unit Tests
```bash
npm test
```

### Test Rating Calculation
```bash
# 1. Seed the database with test data
npm run db:seed

# 2. Run the rating calculation test
node scripts/test-rating-calculation.js
```

### Test Kafka Messages
```bash
# Test autopilot message (triggers calculate)
npm run kafka:autopilot

# Test rating success message (triggers loadCoders)
npm run kafka:rating

# Test load coders message (triggers loadRatings)
npm run kafka:coders

# Show help
npm run kafka:test help
```

## Mock API Server

For development testing, start the mock V5 API server:

```bash
# Start mock server
npm run mock:api

# Or run directly
node scripts/mock-v5-api-server.js
```

The mock server runs on port 3001 and provides fake responses for:
- Challenge lookups
- Submission data
- Rating calculation API calls

Set `V5_API_URL=http://localhost:3001` in your `.env` file to use the mock server.

## Project Structure

```
src/
├── app.ts                    # Main application entry point (Kafka consumer)
├── config/
│   └── default.ts            # Configuration
├── common/
│   ├── database.ts           # Prisma database client
│   ├── helper.ts             # Utility functions
│   ├── logger.ts             # Winston logger
│   └── errors.ts             # Error classes
├── services/
│   ├── KafkaHandlerService.ts    # Kafka message handler
│   └── MarathonRatingsService.ts # Rating service orchestration
└── libs/
    ├── algorithm/
    │   ├── AlgorithmQubits.ts    # Rating calculation algorithm
    │   ├── constants.ts          # Algorithm constants
    │   └── index.ts
    ├── loader/
    │   ├── MarathonDataLoader.ts # Load data from database
    │   └── index.ts
    ├── persistor/
    │   ├── MarathonDataPersistor.ts # Persist ratings to database
    │   └── index.ts
    ├── process/
    │   ├── MarathonRatingProcess.ts # Process orchestration
    │   └── index.ts
    └── models/
        ├── RatingData.ts         # TypeScript interfaces
        └── index.ts

prisma/
├── schema.prisma             # Database schema
└── migrations/               # Database migrations

scripts/
├── seed-database.js          # Seed test data
├── check-db-data.js          # Check database state
├── kafka-test.js             # Kafka message testing
├── mock-v5-api-server.js     # Mock API for testing
└── test-rating-calculation.js # Test rating calculation

__tests__/
└── libs/algorithm/
    └── AlgorithmQubits.test.ts  # Algorithm unit tests
```

## Rating Algorithm

The marathon match rating algorithm (ported from Java `AlgorithmQubits`):

- **Initial Rating**: New players start at 1200 with volatility 515
- **Rating Cap**: `cap = 150 + 1500 / (2 + numRatings)`
- **Elite Weight Penalty**: 2000-2500 rating: ×0.9, 2500+: ×0.8
- **Post-First Rating Volatility**: 385
- **Two-Phase Processing**: Provisional (new) coders first, then non-provisional

## Key Business Rules

1. Ratings are only calculated once per round (idempotent)
2. Tied scores result in averaged ranks
3. Rating never goes below 1
4. Volatility stays within bounds (75-500)
