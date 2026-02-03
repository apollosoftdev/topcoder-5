/**
 * Simple Kafka Testing Script for Member Profile Processor
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
          projectId: 30000001,     // Use static challenge legacy ID from seed data
          phaseId: 1018098,
          phaseTypeName: 'Review',    // Must be 'Review'
          state: 'END',               // Must be 'END'
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
          challengeId: '30000001-1234-5678-9abc-def123456789'  // Use static challenge ID
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
          event: 'LOAD_CODERS',         // Must be 'LOAD_CODERS'
          status: 'SUCCESS',            // Must be 'SUCCESS'
          challengeId: '30000001-1234-5678-9abc-def123456789'  // Use static challenge ID
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

Examples:
  node kafka-test.js autopilot
  node kafka-test.js rating
  node kafka-test.js coders

Prerequisites:
  1. Kafka running on localhost:9092
  2. Your application running (npm run dev)
  3. Database setup with test data (npm run db:seed)

Available Challenge IDs for Testing:
  - Static challenges: 30000001, 30000002, 30000003, 30000004, 30000005
  - Test scenario challenge: 30054163 (added by addTestScenarioData)

Expected Flow:
  1. autopilot → calculate() → calls rating service
  2. rating    → loadCoders() → calls rating service  
  3. coders    → loadRatings() → completes flow

Troubleshooting:
  - Make sure Kafka is running: docker-compose up kafka -d
  - Make sure your app is running: npm run dev
  - Check app logs for processing messages
  - Verify topics exist: kafka-topics --list --bootstrap-server localhost:9092
  - Ensure database has test data: npm run db:seed
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