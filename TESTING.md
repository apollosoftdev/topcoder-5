# 🧪 Testing Guide - Member Profile Processor

## Quick Start Testing

### 1. Start Services
```bash
# Start dependencies
docker-compose up

# Start your application  
npm run dev
```

### 2. Test Kafka Messages
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

## Full Test Flow

### Step 1: Setup Test Data
```bash
# Option 1: Full setup (migrations + seed data)
npm run db:setup

# Option 2: Just seed data (if migrations already run)
npm run db:seed
```

### Step 2: Start Mock API (optional)
```bash
# In separate terminal
npm run mock:api
```

### Step 3: Send Test Messages
```bash
# 1. Send autopilot review end message
npm run kafka:autopilot
# ✅ Should trigger: MarathonRatingsService.calculate()

# 2. Send rating calculation success  
npm run kafka:rating
# ✅ Should trigger: MarathonRatingsService.loadCoders()

# 3. Send load coders success
npm run kafka:coders  
# ✅ Should trigger: MarathonRatingsService.loadRatings()
```

### Step 4: Check Results
```bash
npm run db:check
```

## Message Flow

```
1. autopilot   →  calculate()    →  calls rating service
2. rating      →  loadCoders()   →  calls rating service  
3. coders      →  loadRatings()  →  completes flow
```

## Troubleshooting

### Kafka Issues
```bash
# Check if Kafka is running
docker-compose ps kafka

# Check topics exist
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092

# Create topics manually if needed
docker-compose exec kafka kafka-topics --create --topic notifications.autopilot.events --bootstrap-server localhost:9092
docker-compose exec kafka kafka-topics --create --topic notification.rating.calculation --bootstrap-server localhost:9092
```

### Application Issues
```bash
# Check application logs
npm run dev

# Check database connection
npm run prisma:studio

# Verify test data exists
npm run db:check
```

### Common Problems

1. **"Kafka connection failed"**
   - Run: `docker-compose up kafka -d`
   - Wait 30 seconds for Kafka to start

2. **"Database connection failed"**
   - Check DATABASE_URL in .env

## Test Commands Reference

| Command | Purpose | Triggers |
|---------|---------|----------|
| `npm run kafka:autopilot` | Send autopilot review end | `calculate()` |
| `npm run kafka:rating` | Send rating calculation success | `loadCoders()` |
| `npm run kafka:coders` | Send load coders success | `loadRatings()` |
| `npm run db:seed` | Seed database with test data | - |
| `npm run db:check` | Verify database state | - |
| `npm run mock:api` | Start mock V5 API | - |

