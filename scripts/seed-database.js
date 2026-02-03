/**
 * Database Seed Script for Member Profile Processor
 * Seeds data for marathon match rating calculation testing
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Main seeding function for marathon match test data
 */
async function seedDatabase() {
  try {
    console.log('Starting database seeding for marathon match testing...\n');

    // Clear existing data in correct order (respecting foreign keys)
    console.log('Clearing existing data...');
    await prisma.algoRatingHistory.deleteMany();
    await prisma.algoRating.deleteMany();
    await prisma.longCompResult.deleteMany();
    await prisma.round.deleteMany();
    await prisma.contest.deleteMany();
    await prisma.coder.deleteMany();
    await prisma.user.deleteMany();
    await prisma.algoRatingType.deleteMany();

    console.log('Database cleared\n');

    // Insert algo rating types
    console.log('Inserting algo rating types...');
    await prisma.algoRatingType.createMany({
      data: [
        { id: 1, algoRatingTypeDesc: 'SRM' },
        { id: 2, algoRatingTypeDesc: 'High School SRM' },
        { id: 3, algoRatingTypeDesc: 'Marathon Match' }
      ]
    });
    console.log('Inserted 3 algo rating types\n');

    // Create contest for marathon match
    console.log('Creating contest...');
    const contest = await prisma.contest.create({
      data: {
        name: 'Test Marathon Match Contest',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        status: 'A'
      }
    });
    console.log(`Created contest: ${contest.name}\n`);

    // Create round for marathon match (ratedInd=0 means not yet rated)
    console.log('Creating round...');
    const round = await prisma.round.create({
      data: {
        contestId: contest.id,
        name: 'Test Marathon Match Round',
        status: 'A',
        ratedInd: 0, // Not rated yet - this is what we'll calculate
        tcDirectProjectId: 30054200 // Links to legacy challenge ID
      }
    });
    console.log(`Created round: ${round.name} (ID: ${round.id}, ratedInd: ${round.ratedInd})\n`);

    // Create test users with different rating histories
    console.log('Creating users and coders...');
    const usersData = [
      { handle: 'mm_veteran1', firstName: 'Veteran', lastName: 'One' },
      { handle: 'mm_veteran2', firstName: 'Veteran', lastName: 'Two' },
      { handle: 'mm_newbie1', firstName: 'Newbie', lastName: 'One' },
      { handle: 'mm_newbie2', firstName: 'Newbie', lastName: 'Two' },
      { handle: 'mm_elite', firstName: 'Elite', lastName: 'Player' }
    ];

    const createdUsers = [];
    for (const userData of usersData) {
      const user = await prisma.user.create({ data: userData });
      createdUsers.push(user);

      // Create coder profile for each user
      await prisma.coder.create({
        data: {
          userId: user.id
        }
      });
    }
    console.log(`Created ${createdUsers.length} users with coder profiles\n`);

    // Create algo ratings for veterans and elite (newbies won't have prior ratings)
    // MM_RATING_TYPE_ID = 3
    console.log('Creating algo ratings for existing players...');
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
          numCompetitions: arData.numRatings
        }
      });
    }
    console.log(`Created ${algoRatingsData.length} algo rating records\n`);

    // Create LongCompResult entries for the round (these will be rated)
    console.log('Creating LongCompResult entries...');
    const longCompResultsData = [
      { coderId: createdUsers[0].id, systemPointTotal: 95.5, attended: 'Y' },  // veteran1 - 1st
      { coderId: createdUsers[1].id, systemPointTotal: 88.2, attended: 'Y' },  // veteran2 - 3rd
      { coderId: createdUsers[2].id, systemPointTotal: 75.0, attended: 'Y' },  // newbie1 - tied 4th
      { coderId: createdUsers[3].id, systemPointTotal: 75.0, attended: 'Y' },  // newbie2 - tied 4th
      { coderId: createdUsers[4].id, systemPointTotal: 92.1, attended: 'Y' }   // elite - 2nd
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
          numSubmissions: 1
        }
      });
    }
    console.log(`Created ${longCompResultsData.length} LongCompResult entries\n`);

    // Summary
    console.log('Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`   - Contest: ${contest.name}`);
    console.log(`   - Round ID: ${round.id} (ratedInd: ${round.ratedInd})`);
    console.log(`   - Legacy ID (tcDirectProjectId): ${round.tcDirectProjectId}`);
    console.log(`   - Users: ${createdUsers.length} (2 veterans, 2 newbies, 1 elite)`);
    console.log(`   - AlgoRating entries: ${algoRatingsData.length}`);
    console.log(`   - LongCompResult entries: ${longCompResultsData.length}`);

    console.log('\nTo test rating calculation:');
    console.log('   1. Verify round.ratedInd = 0 (unrated)');
    console.log('   2. Run Kafka message or call processMarathonRatings(roundId)');
    console.log('   3. Verify:');
    console.log('      - long_comp_result.new_rating populated');
    console.log('      - algo_rating records updated/created');
    console.log('      - algo_rating_history new entries');
    console.log('      - round.rated_ind = 1');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
