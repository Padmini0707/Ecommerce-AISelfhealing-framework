
const fs = require('fs');
const path = require('path');

// File paths
const healingLogFile = path.join(
    process.cwd(),
    'reports',
    'healing',
    'healing-events.json'
);

const summaryFile = path.join(
    process.cwd(),
    'reports',
    'healing',
    'healing-summary.json'
);

// Read existing healing events
function readHealingEvents() {
    if (!fs.existsSync(healingLogFile)) {
        throw new Error('Healing events file not found: ' + healingLogFile);
    }

    const fileContent = fs.readFileSync(healingLogFile, 'utf-8');

    const events = [];
    let invalidLines = 0;

    fileContent.split(/\r?\n/).forEach((line) => {
        if (!line.trim()) return;

        try {
            events.push(JSON.parse(line));
        } catch (error) {
            invalidLines++;
        }
    });

    return { events, invalidLines };
}

// Support both old and new event formats
function getRecoveryMethod(event) {
    return (
        event.recoveryMethod ||
        event.healingSource ||
        'CONFIGURED_FALLBACK'
    );
}

function getMatchScore(event) {
    return event.score ?? event.matchScore ?? null;
}

// Generate report
function generateHealingReport() {
    const { events, invalidLines } = readHealingEvents();

    const summary = {
        generatedAt: new Date().toISOString(),

        totalEvents: events.length,

        configuredFallbackCount: 0,
        domDiscoveryCount: 0,

        healedCount: 0,
        failedCount: 0,
        unknownStatusCount: 0,

        healingSuccessRate: 0,
        averageDOMMatchScore: 0,

        invalidLines,

        testSummary: {}
    };

    const domScores = [];

    events.forEach((event) => {
        const recoveryMethod = getRecoveryMethod(event);
        const status = (event.status || 'UNKNOWN').toUpperCase();
        const testName = event.test || 'Unknown test';

        // Count recovery methods
        if (recoveryMethod === 'CONFIGURED_FALLBACK') {
            summary.configuredFallbackCount++;
        }

        if (recoveryMethod === 'DOM_DISCOVERY') {
            summary.domDiscoveryCount++;

            const score = getMatchScore(event);

            if (
                score !== null &&
                score !== undefined &&
                score !== '' &&
                Number.isFinite(Number(score))
            ) {
                domScores.push(Number(score));
            }
        }

        // Count recovery statuses
        if (status === 'HEALED') {
            summary.healedCount++;
        } else if (status === 'FAILED') {
            summary.failedCount++;
        } else {
            summary.unknownStatusCount++;
        }

        // Group events by test
        if (!summary.testSummary[testName]) {
            summary.testSummary[testName] = {
                totalEvents: 0,
                healed: 0,
                failed: 0,
                configuredFallback: 0,
                domDiscovery: 0
            };
        }

        const test = summary.testSummary[testName];

        test.totalEvents++;

        if (status === 'HEALED') {
            test.healed++;
        } else if (status === 'FAILED') {
            test.failed++;
        }

        if (recoveryMethod === 'CONFIGURED_FALLBACK') {
            test.configuredFallback++;
        }

        if (recoveryMethod === 'DOM_DISCOVERY') {
            test.domDiscovery++;
        }
    });

    // Calculate healing success rate
    const knownStatusCount =
        summary.healedCount + summary.failedCount;

    if (knownStatusCount > 0) {
        summary.healingSuccessRate = Number(
            (
                (summary.healedCount / knownStatusCount) * 100
            ).toFixed(2)
        );
    }

    // Calculate average DOM match score
    if (domScores.length > 0) {
        const totalScore = domScores.reduce(
            (total, score) => total + score,
            0
        );

        summary.averageDOMMatchScore = Number(
            (totalScore / domScores.length).toFixed(2)
        );
    }

    // Save summary report
    fs.writeFileSync(
        summaryFile,
        JSON.stringify(summary, null, 2),
        'utf-8'
    );

    console.log('\n========== HEALING REPORT ==========');
    console.log('Total events:', summary.totalEvents);
    console.log('Configured fallback:', summary.configuredFallbackCount);
    console.log('DOM discovery:', summary.domDiscoveryCount);
    console.log('Healed:', summary.healedCount);
    console.log('Failed:', summary.failedCount);
    console.log('Success rate:', summary.healingSuccessRate + '%');
    console.log('Average DOM score:', summary.averageDOMMatchScore);
    console.log('Invalid lines:', summary.invalidLines);
    console.log('====================================');

    console.log('\nReport generated:', summaryFile);

    return summary;
}

module.exports = { generateHealingReport };

// Allow direct execution
if (require.main === module) {
    generateHealingReport();
}
