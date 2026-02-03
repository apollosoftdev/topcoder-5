/**
 * Test script for marathon rating calculation
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRatingCalculation() {
  console.log('=== Testing Marathon Rating Calculation ===\n');

  // Check pre-state
  console.log('1. Pre-state check:');
  const roundBefore = await prisma.round.findUnique({ where: { id: 1 } });
  console.log(`   - Round 1 ratedInd: ${roundBefore?.ratedInd}`);

  const lcrBefore = await prisma.longCompResult.findMany({ where: { roundId: 1 } });
  console.log(`   - LongCompResult entries: ${lcrBefore.length}`);
  console.log(`   - Any with newRating: ${lcrBefore.some(r => r.newRating !== null)}`);

  // Import and run rating calculation
  console.log('\n2. Running processMarathonRatings(1)...');

  // We need to use dynamic import for ES modules
  const { processMarathonRatings } = require('../dist/libs/process/MarathonRatingProcess');
  const result = await processMarathonRatings(1);
  console.log(`   Result: ${result.status} - ${result.message}`);

  // Check post-state
  console.log('\n3. Post-state check:');
  const roundAfter = await prisma.round.findUnique({ where: { id: 1 } });
  console.log(`   - Round 1 ratedInd: ${roundAfter?.ratedInd}`);

  const lcrAfter = await prisma.longCompResult.findMany({ where: { roundId: 1 } });
  console.log('   - LongCompResult results:');
  for (const r of lcrAfter) {
    console.log(`     coderId: ${r.coderId}, score: ${r.systemPointTotal}, oldRating: ${r.oldRating}, newRating: ${r.newRating}`);
  }

  const algoRatings = await prisma.algoRating.findMany({ where: { algoRatingTypeId: 3 } });
  console.log(`   - AlgoRating records: ${algoRatings.length}`);

  const history = await prisma.algoRatingHistory.findMany({ where: { roundId: 1 } });
  console.log(`   - AlgoRatingHistory entries: ${history.length}`);

  // Test idempotency
  console.log('\n4. Testing idempotency (running again)...');
  const result2 = await processMarathonRatings(1);
  console.log(`   Result: ${result2.status} - ${result2.message}`);

  await prisma.$disconnect();
  console.log('\n=== Test Complete ===');
}

testRatingCalculation().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
