
function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

// Calculate how similar two strings are.
// Returns a value between 0 and 1.
function calculateSimilarity(value1, value2) {
  const a = normalize(value1);
  const b = normalize(value2);

  if (!a || !b) return 0;
  if (a === b) return 1;

  const matrix = Array.from(
    { length: a.length + 1 },
    () => Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[a.length][b.length];
  return 1 - distance / Math.max(a.length, b.length);
}

// Calculate weighted similarity across available attributes.
function calculateMatchScore(expected, candidate) {
  const signals = [
    { key: 'id', weight: 30 },
    { key: 'testId', weight: 30 },
    { key: 'placeholder', weight: 30 },
    { key: 'nameAttribute', weight: 20 },
    { key: 'accessibleName', weight: 20 },
    { key: 'text', weight: 20 },
    { key: 'name', weight: 20 },
    { key: 'role', weight: 15 },
  ];

  let totalWeight = 0;
  let earnedScore = 0;
  let matchingSignals = 0;

  for (const signal of signals) {
    const expectedValue = expected[signal.key];
    const actualValue = candidate[signal.key];

    if (!expectedValue || !actualValue) continue;

    const similarity = calculateSimilarity(
      expectedValue,
      actualValue
    );

    totalWeight += signal.weight;
    earnedScore += similarity * signal.weight;

    if (similarity >= 0.65) {
      matchingSignals++;
    }
  }

  if (totalWeight === 0) {
    return {
      score: 0,
      matchingSignals: 0,
    };
  }

  return {
    score: (earnedScore / totalWeight) * 100,
    matchingSignals,
  };
}

function findBestCandidate(expected, candidates) {
  const MINIMUM_SCORE = 70;
  const MINIMUM_SCORE_GAP = 10;
  const MINIMUM_MATCHING_SIGNALS = 2;

  const rankedCandidates = candidates
    .map(candidate => {
      const result = calculateMatchScore(expected, candidate);

      return {
        candidate,
        score: result.score,
        matchingSignals: result.matchingSignals,
      };
    })
    .sort((a, b) => b.score - a.score);

  console.log(
    '[DOM MATCHER] Candidate scores:',
    rankedCandidates.map(item => ({
      id: item.candidate.id,
      testId: item.candidate.testId,
      placeholder: item.candidate.placeholder,
      score: Number(item.score.toFixed(2)),
      matchingSignals: item.matchingSignals,
    }))
  );

  if (rankedCandidates.length === 0) return null;

  const bestMatch = rankedCandidates[0];

  if (
    bestMatch.score < MINIMUM_SCORE ||
    bestMatch.matchingSignals < MINIMUM_MATCHING_SIGNALS
  ) {
    console.log('[DOM MATCHER] Best candidate did not meet confidence requirements');
    return null;
  }

  const secondBest = rankedCandidates[1];

  if (secondBest) {
    const scoreDifference = bestMatch.score - secondBest.score;

    if (scoreDifference < MINIMUM_SCORE_GAP) {
      console.log('[DOM MATCHER] Ambiguous candidates found. Recovery rejected.');
      return null;
    }
  }

  console.log(
    '[DOM MATCHER] Best candidate selected with score:',
    Number(bestMatch.score.toFixed(2))
  );

  return {
    locator: bestMatch.candidate,
    score: bestMatch.score,
  };
}

module.exports = {
  calculateSimilarity,
  calculateMatchScore,
  findBestCandidate,
};
