/**
 * Simple Kafka Testing Script for Member Profile Processor
 *
 * Aligns with seed-database.js and mock-v5-api-server.js:
 * - tcDirectProjectId / legacyId: 30054200
 * - challengeId UUID: 30054200-uuid-1234-5678-9abc-def123456789
 *
 * Usage:
 *   node kafka-test.js autopilot    - Send autopilot review end message
 *   node kafka-test.js rating       - Send rating calculation success message
 *   node kafka-test.js coders       - Send load coders success message
 *   node kafka-test.js help         - Show this help
 */

const { Kafka } = require('kafkajs');

// Kafka configuration
const kafka = new Kafka({
  clientId: 'test-producer',
  brokers: ['localhost:9092']
});

// Test data - aligned with seed-database.js and mock-v5-api-server.js
const TEST_LEGACY_ID = 30054200;  // Round.tcDirectProjectId from seed-database.js
const TEST_CHALLENGE_UUID = '30054200-uuid-1234-5678-9abc-def123456789';  // From mock-v5-api-server.js

// Test message templates
const messages = {
  // 1. Autopilot review end message (triggers calculate)
  autopilot: {
    topic: 'notifications.autopilot.events',
    message: {
      value: JSON.stringify({
        topic: 'notifications.autopilot.events',
        originator: 'Ghostar',
        timestamp: new Date().toISOString(),
        payload: {
          date: new Date().toISOString(),
          projectId: TEST_LEGACY_ID,   // Legacy challenge ID (tcDirectProjectId)
          phaseId: 1018098,
          phaseTypeName: 'Review',     // Must be 'Review'
          state: 'END',                // Must be 'END'
          operator: '151743'
        }
      })
    }
  },

  // 2. Rating calculation success (triggers loadCoders)
  rating: {
    topic: 'notification.rating.calculation',
    message: {
      value: JSON.stringify({
        topic: 'notification.rating.calculation',
        originator: 'rating.calculation.service',
        timestamp: new Date().toISOString(),
        payload: {
          event: 'RATINGS_CALCULATION',  // Must be 'RATINGS_CALCULATION'
          status: 'SUCCESS',             // Must be 'SUCCESS'
          challengeId: TEST_CHALLENGE_UUID
        }
      })
    }
  },

  // 3. Load coders success (triggers loadRatings)
  coders: {
    topic: 'notification.rating.calculation',
    message: {
      value: JSON.stringify({
        topic: 'notification.rating.calculation',
        originator: 'rating.calculation.service',
        timestamp: new Date().toISOString(),
        payload: {
          event: 'LOAD_CODERS',          // Must be 'LOAD_CODERS'
          status: 'SUCCESS',             // Must be 'SUCCESS'
          challengeId: TEST_CHALLENGE_UUID
        }
      })
    }
  }
};

/**
 * Send a test message to Kafka
 */
async function sendMessage(messageType) {
  const producer = kafka.producer();

  try {
    console.log(`🚀 Connecting to Kafka...`);
    await producer.connect();

    const messageData = messages[messageType];
    if (!messageData) {
      throw new Error(`Unknown message type: ${messageType}`);
    }

    console.log(`📤 Sending ${messageType} message to topic: ${messageData.topic}`);
    console.log(`📋 Message:`, JSON.stringify(JSON.parse(messageData.message.value), null, 2));

    await producer.send({
      topic: messageData.topic,
      messages: [messageData.message]
    });

    console.log(`✅ Message sent successfully!`);
    console.log(`👀 Check your application logs to see if it processes the message.`);

  } catch (error) {
    console.error('❌ Error sending message:', error.message);
  } finally {
    await producer.disconnect();
    console.log(`🔌 Disconnected from Kafka`);
  }
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🧪 Member Profile Processor - Kafka Test Tool
==============================================

Usage: node kafka-test.js <command>

Commands:
  autopilot   Send autopilot review end message
              └─ Triggers: MarathonRatingsService.calculate()

  rating      Send rating calculation success message
              └─ Triggers: MarathonRatingsService.loadCoders()

  coders      Send load coders success message
              └─ Triggers: MarathonRatingsService.loadRatings()

  help        Show this help

Test Data (aligned with seed-database.js):
  - Legacy ID (tcDirectProjectId): ${TEST_LEGACY_ID}
  - Challenge UUID: ${TEST_CHALLENGE_UUID}
  - Users: mm_veteran1, mm_veteran2, mm_newbie1, mm_newbie2, mm_elite

Examples:
  node kafka-test.js autopilot
  node kafka-test.js rating
  node kafka-test.js coders

Prerequisites:
  1. Kafka running on localhost:9092
  2. Your application running (npm run dev)
  3. Database seeded (node scripts/seed-database.js)
  4. Mock V5 API running (node scripts/mock-v5-api-server.js)

Expected Flow:
  1. autopilot → calculate() → calls rating service
  2. rating    → loadCoders() → calls rating service
  3. coders    → loadRatings() → completes flow

Troubleshooting:
  - Make sure Kafka is running: docker-compose up kafka -d
  - Make sure your app is running: npm run dev
  - Check app logs for processing messages
  - Verify topics exist: kafka-topics --list --bootstrap-server localhost:9092
  - Ensure database has test data: node scripts/seed-database.js
`);
}

/**
 * Main function
 */
async function main() {
  const command = process.argv[2];

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  if (!messages[command]) {
    console.error(`❌ Unknown command: ${command}`);
    console.log(`💡 Run 'node kafka-test.js help' for available commands`);
    return;
  }

  try {
    await sendMessage(command);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
