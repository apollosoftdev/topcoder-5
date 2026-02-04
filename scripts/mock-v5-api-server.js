/**
 * Mock V5 API Server for Topcoder Member Profile Processor
 * This server mocks all the V5 API endpoints used in the helper functions
 *
 * Aligns with seed-database.js test data:
 * - Round tcDirectProjectId: 30054200 (used as legacyId for V5 challenge lookup)
 * - Users: mm_veteran1, mm_veteran2, mm_newbie1, mm_newbie2, mm_elite
 *
 * Security Note: This mock server is for LOCAL DEVELOPMENT/TESTING ONLY.
 * It intentionally uses HTTP on localhost for simplicity.
 * Do NOT deploy this server in production.
 */

const http = require('http');
const url = require('url');

// Mock data for challenges - matches seed-database.js tcDirectProjectId
const challenges = [
  {
    id: '30054200-uuid-1234-5678-9abc-def123456789',
    legacyId: 30054200,
    name: 'Test Marathon Match Round',
    type: 'Code',
    status: 'Completed',
    legacy: {
      subTrack: 'MARATHON_MATCH'
    }
  },
  {
    id: '30054201-uuid-1234-5678-9abc-def123456789',
    legacyId: 30054201,
    name: 'Marathon Match Challenge 2',
    type: 'Code',
    status: 'Active',
    legacy: {
      subTrack: 'MARATHON_MATCH'
    }
  },
  {
    id: '30054202-uuid-1234-5678-9abc-def123456789',
    legacyId: 30054202,
    name: 'Marathon Match Challenge 3',
    type: 'Code',
    status: 'Active',
    legacy: {
      subTrack: 'MARATHON_MATCH'
    }
  }
];

// Mock data for submissions - matches seed-database.js users
// User IDs align with database (auto-incremented starting from 1)
const submissions = [
  // Submissions for challenge 30054200 (Test Marathon Match Round)
  {
    id: 'sub-001-uuid-1234-5678-9abc-def123456789',
    challengeId: '30054200-uuid-1234-5678-9abc-def123456789',
    memberId: '1', // mm_veteran1 (User ID 1)
    legacySubmissionId: 1001,
    resource: 'submission',
    url: 'http://content.topcoder.com/submissions/1001',
    type: 'Contest Submission',
    submissionPhaseId: 95245,
    created: '2024-01-10T10:00:00.000Z',
    updated: '2024-01-10T10:00:00.000Z',
    reviewSummation: {
      id: 'review-summation-1',
      score: 95.5, // Matches LongCompResult.systemPointTotal
      status: 'completed'
    }
  },
  {
    id: 'sub-002-uuid-1234-5678-9abc-def123456789',
    challengeId: '30054200-uuid-1234-5678-9abc-def123456789',
    memberId: '2', // mm_veteran2 (User ID 2)
    legacySubmissionId: 1002,
    resource: 'submission',
    url: 'http://content.topcoder.com/submissions/1002',
    type: 'Contest Submission',
    submissionPhaseId: 95245,
    created: '2024-01-10T11:00:00.000Z',
    updated: '2024-01-10T11:00:00.000Z',
    reviewSummation: {
      id: 'review-summation-2',
      score: 88.2, // Matches LongCompResult.systemPointTotal
      status: 'completed'
    }
  },
  {
    id: 'sub-003-uuid-1234-5678-9abc-def123456789',
    challengeId: '30054200-uuid-1234-5678-9abc-def123456789',
    memberId: '3', // mm_newbie1 (User ID 3)
    legacySubmissionId: 1003,
    resource: 'submission',
    url: 'http://content.topcoder.com/submissions/1003',
    type: 'Contest Submission',
    submissionPhaseId: 95245,
    created: '2024-01-10T12:00:00.000Z',
    updated: '2024-01-10T12:00:00.000Z',
    reviewSummation: {
      id: 'review-summation-3',
      score: 75.0, // Matches LongCompResult.systemPointTotal
      status: 'completed'
    }
  },
  {
    id: 'sub-004-uuid-1234-5678-9abc-def123456789',
    challengeId: '30054200-uuid-1234-5678-9abc-def123456789',
    memberId: '4', // mm_newbie2 (User ID 4)
    legacySubmissionId: 1004,
    resource: 'submission',
    url: 'http://content.topcoder.com/submissions/1004',
    type: 'Contest Submission',
    submissionPhaseId: 95245,
    created: '2024-01-10T13:00:00.000Z',
    updated: '2024-01-10T13:00:00.000Z',
    reviewSummation: {
      id: 'review-summation-4',
      score: 75.0, // Matches LongCompResult.systemPointTotal (tied with newbie1)
      status: 'completed'
    }
  },
  {
    id: 'sub-005-uuid-1234-5678-9abc-def123456789',
    challengeId: '30054200-uuid-1234-5678-9abc-def123456789',
    memberId: '5', // mm_elite (User ID 5)
    legacySubmissionId: 1005,
    resource: 'submission',
    url: 'http://content.topcoder.com/submissions/1005',
    type: 'Contest Submission',
    submissionPhaseId: 95245,
    created: '2024-01-10T14:00:00.000Z',
    updated: '2024-01-10T14:00:00.000Z',
    reviewSummation: {
      id: 'review-summation-5',
      score: 92.1, // Matches LongCompResult.systemPointTotal
      status: 'completed'
    }
  }
];

// Helper function to send JSON response
function sendJsonResponse(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(data));
}

// Helper function to parse request body
function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        resolve({});
      }
    });
  });
}

// Create the mock server (HTTP is intentional for localhost-only development/testing)
// nosemgrep: problem-based-packs.insecure-transport.js-node.using-http-server.using-http-server
const mockApi = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Use safe logging with explicit format to prevent format string injection
  const logData = {
    prefix: '[Mock V5 API]',
    method: String(req.method),
    path: String(path),
    query: Object.keys(query).length > 0 ? query : undefined
  };
  console.log('%s %s %s', logData.prefix, logData.method, logData.path, logData.query || '');

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // GET /challenges - Get challenge details by legacyId
    if (req.method === 'GET' && path === '/challenges') {
      if (query.legacyId) {
        const challenge = challenges.find(c => c.legacyId === parseInt(query.legacyId));
        if (challenge) {
          console.log(`  -> Found challenge: ${challenge.name}`);
          return sendJsonResponse(res, 200, [challenge]);
        } else {
          console.log(`  -> No challenge found for legacyId: ${query.legacyId}`);
          return sendJsonResponse(res, 200, []);
        }
      }
      return sendJsonResponse(res, 200, challenges);
    }

    // GET /submissions - Get submissions for a challenge
    if (req.method === 'GET' && path === '/submissions') {
      if (query.challengeId) {
        const challengeSubmissions = submissions.filter(s => s.challengeId === query.challengeId);

        // Handle pagination
        const perPage = parseInt(query.perPage) || 500;
        const page = parseInt(query.page) || 1;
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedSubmissions = challengeSubmissions.slice(startIndex, endIndex);

        // Set pagination headers
        const totalPages = Math.ceil(challengeSubmissions.length / perPage) || 1;
        const paginationHeaders = {
          'x-total-pages': totalPages.toString(),
          'x-page': page.toString(),
          'x-per-page': perPage.toString(),
          'x-total': challengeSubmissions.length.toString()
        };

        console.log(`  -> Found ${challengeSubmissions.length} submissions, returning page ${page}/${totalPages}`);
        return sendJsonResponse(res, 200, paginatedSubmissions, paginationHeaders);
      }
      return sendJsonResponse(res, 200, submissions);
    }

    // POST /ratings/mm/calculate - Initiate marathon match rating calculation
    if (req.method === 'POST' && path === '/ratings/mm/calculate') {
      const body = await parseRequestBody(req);
      console.log('  -> Rating calculation request:', body);

      if (body.challengeId) {
        return sendJsonResponse(res, 200, [{
          id: `rating-calc-${Date.now()}`,
          challengeId: body.challengeId,
          status: 'initiated',
          message: 'Marathon match rating calculation initiated successfully'
        }]);
      } else {
        return sendJsonResponse(res, 400, { error: 'challengeId is required' });
      }
    }

    // POST /ratings/mm/load - Load ratings
    if (req.method === 'POST' && path === '/ratings/mm/load') {
      const body = await parseRequestBody(req);
      console.log('  -> Load ratings request:', body);

      if (body.challengeId) {
        return sendJsonResponse(res, 200, [{
          id: `load-ratings-${Date.now()}`,
          challengeId: body.challengeId,
          status: 'completed',
          message: 'Ratings loaded successfully'
        }]);
      } else {
        return sendJsonResponse(res, 400, { error: 'challengeId is required' });
      }
    }

    // POST /ratings/coders/load - Load coders
    if (req.method === 'POST' && path === '/ratings/coders/load') {
      const body = await parseRequestBody(req);
      console.log('  -> Load coders request:', body);

      if (body.challengeId) {
        return sendJsonResponse(res, 200, [{
          id: `load-coders-${Date.now()}`,
          challengeId: body.challengeId,
          status: 'completed',
          message: 'Coders loaded successfully'
        }]);
      } else {
        return sendJsonResponse(res, 400, { error: 'challengeId is required' });
      }
    }

    // 404 for other routes
    console.log(`  -> 404 Not Found: ${req.method} ${path}`);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found', path, method: req.method }));

  } catch (error) {
    console.error('[Mock V5 API] Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});

// Start the server if run directly
if (require.main === module) {
  const port = process.env.MOCK_V5_API_PORT || 3001;
  mockApi.listen(port, () => {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           Mock V5 API Server Started                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\nListening on port ${port}`);
    console.log(`Set V5_API_URL=http://localhost:${port} to use this mock server\n`);
    console.log('Available endpoints:');
    console.log('  GET  /challenges              - List all challenges');
    console.log('  GET  /challenges?legacyId=<id> - Get challenge by legacy ID');
    console.log('  GET  /submissions?challengeId=<id> - Get submissions for challenge');
    console.log('  POST /ratings/mm/calculate    - Initiate MM rating calculation');
    console.log('  POST /ratings/mm/load         - Load ratings');
    console.log('  POST /ratings/coders/load     - Load coders');
    console.log('\nMock data (aligned with seed-database.js):');
    console.log('  Challenges:');
    challenges.forEach(c => {
      console.log(`    - legacyId: ${c.legacyId} (${c.name})`);
    });
    console.log('  Submissions: 5 submissions for challenge 30054200');
    console.log('    - mm_veteran1: 95.5 pts');
    console.log('    - mm_veteran2: 88.2 pts');
    console.log('    - mm_newbie1:  75.0 pts');
    console.log('    - mm_newbie2:  75.0 pts');
    console.log('    - mm_elite:    92.1 pts');
    console.log('\n');
  });
}

// Export for use in other files
module.exports = {
  mockApi,
  challenges,
  submissions
};
