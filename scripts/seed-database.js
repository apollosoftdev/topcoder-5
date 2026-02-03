/**
 * Database Seed Script for Member Profile Processor
 * 
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Static test data
const STATIC_DATA = {
  challenges: [
    { legacyId: 30000001, componentId: 1001, ratedInd: 1 },
    { legacyId: 30000002, componentId: 1002, ratedInd: 1 }
  ],
  
  users: [
    { handle: 'alice_coder', rating: 1500, vol: 250 },
    { handle: 'bob_hacker', rating: 1800, vol: 300 }
  ],
  
  reviewTypes: [
    { id: 'Screening', name: 'Screening', isActive: true },
    { id: 'Review', name: 'Review', isActive: true },
    { id: 'Appeal', name: 'Appeal', isActive: true },
    { id: 'Iterative Review', name: 'Iterative Review', isActive: true }
  ]
};

/**
 * Generate static submissions for challenges (2 rows only)
 */
function generateStaticSubmissions(challengeIds, userIds) {
  const submissions = [];
  const openTime = new Date('2024-01-01T10:00:00Z');
  
  // Create exactly 2 submissions
  for (let i = 0; i < 2; i++) {
    const challengeId = challengeIds[i % challengeIds.length];
    const userId = userIds[i % userIds.length];
    
    submissions.push({
      challengeId,
      userId,
      score: 75.0 + (i * 2.5),
      initialScore: 70.0 + (i * 2.5),
      submissionNumber: 1,
      example: 0,
      openTime,
      languageId: 1
    });
  }
  
  return submissions;
}

/**
 * Generate static user challenge registrations (2 rows only)
 */
function generateStaticUserChallenges(challengeIds, userIds) {
  const userChallenges = [];
  
  // Create exactly 2 user challenge entries
  for (let i = 0; i < 2; i++) {
    const challengeId = challengeIds[i % challengeIds.length];
    const userId = userIds[i % userIds.length];
    
    userChallenges.push({
      userId,
      challengeId,
      attended: i === 0 ? 'N' : 'Y', // First user starts with 'N' to test update
      placed: i < 10 ? i + 1 : null,
      old_rating: 1400 + (i * 50),
      old_vol: 200 + (i * 20),
      system_point_total: 80.0 + (i * 2.0),
      point_total: 80.0 + (i * 2.0),
      rated_ind: 1
    });
  }
  
  return userChallenges;
}

/**
 * Generate static rating history entries (2 rows only)
 */
function generateStaticRatingHistory(challengeIds, userIds) {
  const ratingHistory = [];
  const baseDate = new Date('2024-01-01T10:00:00Z');
  
  // Create exactly 2 rating history entries
  for (let i = 0; i < 2; i++) {
    const challengeId = challengeIds[i % challengeIds.length];
    const userId = userIds[i % userIds.length];
    
    ratingHistory.push({
      userId,
      challengeId,
      rating: 1400 + (i * 50),
      vol: 200 + (i * 20),
      createdAt: new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000))
    });
  }
  
  return ratingHistory;
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding with static data...\n');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.ratingHistory.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.userChallenge.deleteMany();
    await prisma.user.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.reviewType.deleteMany();
    
    console.log('✅ Database cleared\n');
    
    // Insert challenges
    console.log('🏆 Inserting challenges...');
    const createdChallenges = await Promise.all(
      STATIC_DATA.challenges.map(challenge => 
        prisma.challenge.create({ data: challenge })
      )
    );
    console.log(`✅ Inserted ${createdChallenges.length} challenges\n`);
    
    // Insert users
    console.log('👥 Inserting users...');
    const createdUsers = await Promise.all(
      STATIC_DATA.users.map(user => 
        prisma.user.create({ data: user })
      )
    );
    console.log(`✅ Inserted ${createdUsers.length} users\n`);
    
    // Insert review types
    console.log('📋 Inserting review types...');
    await Promise.all(
      STATIC_DATA.reviewTypes.map(reviewType => 
        prisma.reviewType.create({ data: reviewType })
      )
    );
    console.log(`✅ Inserted ${STATIC_DATA.reviewTypes.length} review types\n`);
    
    // Insert user challenges
    console.log('🏅 Inserting user challenges...');
    const challengeIds = createdChallenges.map(c => c.id);
    const userIds = createdUsers.map(u => u.id);
    const userChallenges = generateStaticUserChallenges(challengeIds, userIds);
    
    await Promise.all(
      userChallenges.map(uc => 
        prisma.userChallenge.create({ data: uc })
      )
    );
    console.log(`✅ Inserted ${userChallenges.length} user challenges\n`);
    
    // Insert submissions
    console.log('📝 Inserting submissions...');
    const allSubmissions = generateStaticSubmissions(challengeIds, userIds);
    
    await Promise.all(
      allSubmissions.map(submission => 
        prisma.submission.create({ data: submission })
      )
    );
    console.log(`✅ Inserted ${allSubmissions.length} submissions\n`);
    
    // Insert rating history
    console.log('📈 Inserting rating history...');
    const ratingHistory = generateStaticRatingHistory(challengeIds, userIds);
    
    await Promise.all(
      ratingHistory.map(rh => 
        prisma.ratingHistory.create({ data: rh })
      )
    );
    console.log(`✅ Inserted ${ratingHistory.length} rating history entries\n`);
    
    // Summary
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Challenges: ${createdChallenges.length}`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - User Challenges: ${userChallenges.length}`);
    console.log(`   - Submissions: ${allSubmissions.length}`);
    console.log(`   - Rating History: ${ratingHistory.length}`);
    console.log(`   - Review Types: ${STATIC_DATA.reviewTypes.length}`);
    
    // Sample data for testing
    console.log('\n🎯 Sample Data for Testing:');
    console.log('============================');
    console.log(`Sample Challenge Legacy ID: ${createdChallenges[0].legacyId}`);
    console.log(`Sample User Handle: ${createdUsers[0].handle}`);
    console.log(`Sample User ID: ${createdUsers[0].id}`);
    
    console.log('\n💡 You can now run your Kafka tests with this data!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Add specific test data for known test scenarios
 */
async function addTestScenarioData() {
  try {
    console.log('\n🧪 Adding specific test scenario data...');
    
    // Add the specific challenge used in testing (legacyId: 30054163)
    const testChallenge = await prisma.challenge.create({
      data: {
        legacyId: 30054163,
        componentId: 12345,
        ratedInd: 1
      }
    });
    
    // Add a test user
    const testUser = await prisma.user.create({
      data: {
        handle: 'test_user_marathon',
        rating: 1500,
        vol: 250
      }
    });
    
    // Add user challenge entry
    await prisma.userChallenge.create({
      data: {
        userId: testUser.id,
        challengeId: testChallenge.id,
        attended: 'N', // This will be updated to 'Y' during testing
        placed: null,
        old_rating: 1400,
        old_vol: 200,
        system_point_total: 85.5,
        point_total: 85.5,
        rated_ind: 1
      }
    });
    
    // Add test submission
    await prisma.submission.create({
      data: {
        challengeId: testChallenge.id,
        userId: testUser.id,
        score: 92.5,
        initialScore: 90.0,
        submissionNumber: 1,
        example: 0,
        openTime: new Date('2024-01-01'),
        languageId: 1
      }
    });
    
    console.log('✅ Test scenario data added');
    console.log(`   - Test Challenge: ${testChallenge.legacyId}`);
    console.log(`   - Test User: ${testUser.handle}`);
    
  } catch (error) {
    console.error('❌ Error adding test scenario data:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => addTestScenarioData())
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, addTestScenarioData }; 