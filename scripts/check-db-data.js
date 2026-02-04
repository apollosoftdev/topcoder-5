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

    // Check contests
    const contests = await prisma.contest.findMany({
      take: 5,
      orderBy: { id: 'desc' }
    });

    console.log('📊 Contests found:', contests.length);
    if (contests.length > 0) {
      console.log('   Sample contests:');
      contests.forEach(contest => {
        console.log(`   - ID: ${contest.id}, Name: ${contest.name || 'N/A'}, Status: ${contest.status || 'N/A'}`);
      });
    }

    // Check rounds
    const rounds = await prisma.round.findMany({
      take: 5,
      include: {
        contest: true
      },
      orderBy: { id: 'desc' }
    });

    console.log('\n🔄 Rounds found:', rounds.length);
    if (rounds.length > 0) {
      console.log('   Sample rounds:');
      rounds.forEach(round => {
        console.log(`   - ID: ${round.id}, Name: ${round.name || 'N/A'}, Contest: ${round.contest?.name || 'N/A'}, TC Direct Project: ${round.tcDirectProjectId || 'N/A'}`);
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
        console.log(`   - ID: ${user.id}, Handle: ${user.handle}, Status: ${user.status || 'N/A'}`);
      });
    }

    // Check coders
    const coders = await prisma.coder.findMany({
      take: 5,
      include: {
        user: true
      },
      orderBy: { id: 'desc' }
    });

    console.log('\n💻 Coders found:', coders.length);
    if (coders.length > 0) {
      console.log('   Sample coders:');
      coders.forEach(coder => {
        console.log(`   - ID: ${coder.id}, User: ${coder.user.handle} (${coder.userId}), Country: ${coder.countryCode || 'N/A'}`);
      });
    }

    // Check algo ratings
    const algoRatings = await prisma.algoRating.findMany({
      take: 5,
      include: {
        coder: {
          include: {
            user: true
          }
        },
        ratingType: true
      },
      orderBy: { rating: 'desc' }
    });

    console.log('\n📈 Algo Ratings found:', algoRatings.length);
    if (algoRatings.length > 0) {
      console.log('   Sample ratings:');
      algoRatings.forEach(ar => {
        console.log(`   - User: ${ar.coder.user.handle} | Type: ${ar.ratingType.algoRatingTypeDesc} | Rating: ${ar.rating} | Vol: ${ar.vol}`);
      });
    }

    // Check long comp results (marathon match results)
    const longCompResults = await prisma.longCompResult.findMany({
      take: 5,
      include: {
        user: true,
        round: true
      },
      orderBy: { id: 'desc' }
    });

    console.log('\n🏆 Long Comp Results (Marathon) found:', longCompResults.length);
    if (longCompResults.length > 0) {
      console.log('   Sample results:');
      longCompResults.forEach(lcr => {
        console.log(`   - User: ${lcr.user.handle} | Round: ${lcr.round.name || lcr.roundId} | Placed: ${lcr.placed || 'N/A'} | Old Rating: ${lcr.oldRating || 'N/A'} | New Rating: ${lcr.newRating || 'N/A'}`);
      });
    }

    // Check algo rating history
    const ratingHistory = await prisma.algoRatingHistory.findMany({
      take: 5,
      include: {
        coder: {
          include: {
            user: true
          }
        },
        round: true,
        ratingType: true
      },
      orderBy: { id: 'desc' }
    });

    console.log('\n📊 Algo Rating History found:', ratingHistory.length);
    if (ratingHistory.length > 0) {
      console.log('   Sample rating history:');
      ratingHistory.forEach(rh => {
        console.log(`   - User: ${rh.coder.user.handle} | Round: ${rh.round.name || rh.roundId} | Rating: ${rh.rating} | Vol: ${rh.vol}`);
      });
    }

    // Check algo rating types
    const algoRatingTypes = await prisma.algoRatingType.findMany();
    console.log('\n📋 Algo Rating Types found:', algoRatingTypes.length);
    if (algoRatingTypes.length > 0) {
      console.log('   Rating types:');
      algoRatingTypes.forEach(art => {
        console.log(`   - ID: ${art.id}, Description: ${art.algoRatingTypeDesc}`);
      });
    }

    // Extract sample data for Kafka messages
    console.log('\n🎯 Sample Data for Kafka Messages:');
    console.log('=====================================');

    if (rounds.length > 0) {
      const sampleRound = rounds[0];
      console.log(`Round ID: ${sampleRound.id}`);
      console.log(`Round Name: ${sampleRound.name}`);
      console.log(`TC Direct Project ID: ${sampleRound.tcDirectProjectId || 'N/A'}`);
    }

    if (users.length > 0) {
      const sampleUser = users[0];
      console.log(`User Handle: ${sampleUser.handle}`);
      console.log(`User ID: ${sampleUser.id}`);
    }

    if (longCompResults.length > 0) {
      const sampleLCR = longCompResults[0];
      console.log(`Sample Long Comp Result: User ${sampleLCR.user.handle} in Round ${sampleLCR.round.name || sampleLCR.roundId}`);
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
