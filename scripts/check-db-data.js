/**
 * Check Database Data Script
 * 
 * This script connects to the database and extracts real values
 * to use in Kafka test messages.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseData() {
  try {
    console.log('🔍 Checking database for existing data...\n');

    // Check challenges
    const challenges = await prisma.challenge.findMany({
      take: 5,
      orderBy: { id: 'desc' }
    });

    console.log('📊 Challenges found:', challenges.length);
    if (challenges.length > 0) {
      console.log('   Sample challenges:');
      challenges.forEach(challenge => {
        console.log(`   - ID: ${challenge.id}, Legacy ID: ${challenge.legacyId}, Component ID: ${challenge.componentId || 'N/A'}`);
      });
    }

    // Check users
    const users = await prisma.user.findMany({
      take: 5,
      orderBy: { id: 'desc' }
    });

    console.log('\n👥 Users found:', users.length);
    if (users.length > 0) {
      console.log('   Sample users:');
      users.forEach(user => {
        console.log(`   - ID: ${user.id}, Handle: ${user.handle}, Rating: ${user.rating || 'N/A'}, Vol: ${user.vol || 'N/A'}`);
      });
    }

    // Check user challenges
    const userChallenges = await prisma.userChallenge.findMany({
      take: 5,
      include: {
        user: true,
        challenge: true
      },
      orderBy: { userId: 'desc' }
    });

    console.log('\n🏆 User Challenges found:', userChallenges.length);
    if (userChallenges.length > 0) {
      console.log('   Sample user challenges:');
      userChallenges.forEach(uc => {
        console.log(`   - User: ${uc.user.handle} (${uc.userId}) | Challenge: ${uc.challenge.legacyId} | Placed: ${uc.placed || 'N/A'}`);
      });
    }

    // Check submissions
    const submissions = await prisma.submission.findMany({
      take: 5,
      include: {
        user: true,
        challenge: true
      },
      orderBy: { submissionTime: 'desc' }
    });

    console.log('\n📝 Submissions found:', submissions.length);
    if (submissions.length > 0) {
      console.log('   Sample submissions:');
      submissions.forEach(sub => {
        console.log(`   - User: ${sub.user.handle} | Challenge: ${sub.challenge.legacyId} | Score: ${sub.score || 'N/A'}`);
      });
    }

    // Check rating history
    const ratingHistory = await prisma.ratingHistory.findMany({
      take: 5,
      include: {
        user: true,
        challenge: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n📈 Rating History found:', ratingHistory.length);
    if (ratingHistory.length > 0) {
      console.log('   Sample rating history:');
      ratingHistory.forEach(rh => {
        console.log(`   - User: ${rh.user.handle} | Challenge: ${rh.challenge.legacyId} | Rating: ${rh.rating} | Vol: ${rh.vol}`);
      });
    }

    // Extract sample data for Kafka messages
    console.log('\n🎯 Sample Data for Kafka Messages:');
    console.log('=====================================');
    
    if (challenges.length > 0) {
      const sampleChallenge = challenges[0];
      console.log(`Challenge Legacy ID: ${sampleChallenge.legacyId}`);
      console.log(`Challenge ID: ${sampleChallenge.id}`);
    }

    if (users.length > 0) {
      const sampleUser = users[0];
      console.log(`User Handle: ${sampleUser.handle}`);
      console.log(`User ID: ${sampleUser.id}`);
    }

    if (userChallenges.length > 0) {
      const sampleUC = userChallenges[0];
      console.log(`Sample User-Challenge: User ${sampleUC.user.handle} in Challenge ${sampleUC.challenge.legacyId}`);
    }

    console.log('\n💡 Use these values in your Kafka test messages!');

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  checkDatabaseData();
}

module.exports = { checkDatabaseData }; 