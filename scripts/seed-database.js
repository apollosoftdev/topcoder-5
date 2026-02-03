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
  ],

  // Marathon match rating types
  algoRatingTypes: [
    { id: 1, algoRatingTypeDesc: 'SRM' },
    { id: 2, algoRatingTypeDesc: 'High School SRM' },
    { id: 3, algoRatingTypeDesc: 'Marathon Match' }
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
    await prisma.algoRatingHistory.deleteMany();
    await prisma.algoRating.deleteMany();
    await prisma.longCompResult.deleteMany();
    await prisma.round.deleteMany();
    await prisma.contest.deleteMany();
    await prisma.coder.deleteMany();
    await prisma.user.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.reviewType.deleteMany();
    await prisma.algoRatingType.deleteMany();

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

    // Insert algo rating types
    console.log('📊 Inserting algo rating types...');
    await Promise.all(
      STATIC_DATA.algoRatingTypes.map(type =>
        prisma.algoRatingType.create({ data: type })
      )
    );
    console.log(`✅ Inserted ${STATIC_DATA.algoRatingTypes.length} algo rating types\n`);
    
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
    console.log(`   - Algo Rating Types: ${STATIC_DATA.algoRatingTypes.length}`);
    
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

/**
 * Add marathon match test data for rating calculation testing
 */
async function addMarathonMatchTestData() {
  try {
    console.log('\n🏃 Adding marathon match test data...');

    // Create contest for marathon match
    const contest = await prisma.contest.create({
      data: {
        name: 'Test Marathon Match Contest',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        status: 'A'
      }
    });

    // Create round for marathon match (ratedInd=0 means not yet rated)
    const round = await prisma.round.create({
      data: {
        contestId: contest.id,
        name: 'Test Marathon Match Round',
        status: 'A',
        roundTypeId: null,
        ratedInd: 0, // Not rated yet - this is what we'll calculate
        tcDirectProjectId: 30054200 // Links to challenge legacyId
      }
    });

    // Create test users with different rating histories
    const marathonUsers = [
      { handle: 'mm_veteran1', firstName: 'Veteran', lastName: 'One' },
      { handle: 'mm_veteran2', firstName: 'Veteran', lastName: 'Two' },
      { handle: 'mm_newbie1', firstName: 'Newbie', lastName: 'One' },
      { handle: 'mm_newbie2', firstName: 'Newbie', lastName: 'Two' },
      { handle: 'mm_elite', firstName: 'Elite', lastName: 'Player' }
    ];

    const createdUsers = [];
    for (const userData of marathonUsers) {
      const user = await prisma.user.create({ data: userData });
      createdUsers.push(user);

      // Create coder profile for each user
      await prisma.coder.create({
        data: {
          userId: user.id,
          countryCode: null,
          stateCode: null
        }
      });
    }

    // Create algo ratings for veterans and elite (newbies won't have prior ratings)
    // MM_RATING_TYPE_ID = 3
    const algoRatingsData = [
      { coderId: createdUsers[0].id, rating: 1650, vol: 280, numRatings: 5 },  // veteran1
      { coderId: createdUsers[1].id, rating: 1480, vol: 320, numRatings: 3 },  // veteran2
      // newbie1 and newbie2 have no prior ratings (provisional)
      { coderId: createdUsers[4].id, rating: 2100, vol: 200, numRatings: 15 }  // elite
    ];

    for (const arData of algoRatingsData) {
      await prisma.algoRating.create({
        data: {
          coderId: arData.coderId,
          algoRatingTypeId: 3, // Marathon Match
          rating: arData.rating,
          vol: arData.vol,
          numRatings: arData.numRatings,
          highestRating: arData.rating + 50,
          lowestRating: arData.rating - 100,
          firstRatedRoundId: null,
          lastRatedRoundId: null,
          numCompetitions: arData.numRatings
        }
      });
    }

    // Create LongCompResult entries for the round (these will be rated)
    const longCompResultsData = [
      { coderId: createdUsers[0].id, systemPointTotal: 95.5, attended: 'Y' },  // veteran1 - 1st
      { coderId: createdUsers[1].id, systemPointTotal: 88.2, attended: 'Y' },  // veteran2 - 2nd
      { coderId: createdUsers[2].id, systemPointTotal: 75.0, attended: 'Y' },  // newbie1 - 3rd
      { coderId: createdUsers[3].id, systemPointTotal: 75.0, attended: 'Y' },  // newbie2 - tied 3rd
      { coderId: createdUsers[4].id, systemPointTotal: 92.1, attended: 'Y' }   // elite - between 1st and 2nd
    ];

    for (const lcrData of longCompResultsData) {
      await prisma.longCompResult.create({
        data: {
          roundId: round.id,
          coderId: lcrData.coderId,
          systemPointTotal: lcrData.systemPointTotal,
          pointTotal: lcrData.systemPointTotal,
          attended: lcrData.attended,
          rated: 0,
          oldRating: null,
          newRating: null,
          oldVol: null,
          newVol: null,
          placed: null,
          numSubmissions: 1
        }
      });
    }

    // Create a challenge that links to this round
    await prisma.challenge.create({
      data: {
        legacyId: 30054200, // Same as round.tcDirectProjectId
        componentId: 99999,
        ratedInd: 0
      }
    });

    console.log('✅ Marathon match test data added');
    console.log(`   - Contest: ${contest.name}`);
    console.log(`   - Round ID: ${round.id} (ratedInd: ${round.ratedInd})`);
    console.log(`   - Users: ${createdUsers.length} (2 veterans, 2 newbies, 1 elite)`);
    console.log(`   - LongCompResult entries: ${longCompResultsData.length}`);
    console.log(`   - Challenge legacyId: 30054200`);
    console.log('\n💡 To test rating calculation:');
    console.log('   1. Verify round.ratedInd = 0 (unrated)');
    console.log('   2. Run Kafka message or call processMarathonRatings(roundId)');
    console.log('   3. Verify:');
    console.log('      - long_comp_result.new_rating populated');
    console.log('      - algo_rating records updated/created');
    console.log('      - algo_rating_history new entries');
    console.log('      - round.rated_ind = 1');

  } catch (error) {
    console.error('❌ Error adding marathon match test data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => addTestScenarioData())
    .then(() => addMarathonMatchTestData())
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, addTestScenarioData, addMarathonMatchTestData }; 