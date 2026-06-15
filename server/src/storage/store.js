const fs = require('fs');
const path = require('path');
const config = require('../config');

function ensureDir() {
  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }
}

function sessionFile(sessionId) {
  return path.join(config.dataDir, `${sessionId}.json`);
}

function readSession(sessionId) {
  const file = sessionFile(sessionId);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function saveMessage(sessionId, role, text, metadata = {}) {
  ensureDir();
  const file = sessionFile(sessionId);
  let session = readSession(sessionId);

  if (!session) {
    session = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
  }

  session.updatedAt = new Date().toISOString();
  session.messages.push({
    role,
    text,
    timestamp: new Date().toISOString(),
    ...metadata,
  });

  fs.writeFileSync(file, JSON.stringify(session, null, 2), 'utf8');
  return session;
}

function getSession(sessionId) {
  return readSession(sessionId);
}

function getAllSessions() {
  ensureDir();
  const files = fs.readdirSync(config.dataDir).filter((f) => f.endsWith('.json'));
  return files
    .map((f) => {
      try {
        const session = JSON.parse(fs.readFileSync(path.join(config.dataDir, f), 'utf8'));
        const botMessages = session.messages.filter((m) => m.role === 'bot');
        const confidenceScores = botMessages
          .map((m) => m.confidence)
          .filter((c) => typeof c === 'number');
        const avgConfidence =
          confidenceScores.length > 0
            ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
            : null;
        const intents = botMessages.map((m) => m.intentName).filter(Boolean);
        return {
          id: session.id,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messageCount: session.messages.length,
          avgConfidence: avgConfidence !== null ? parseFloat(avgConfidence.toFixed(3)) : null,
          topIntent: intents.length > 0 ? mostCommon(intents) : null,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function getAnalytics() {
  ensureDir();
  const files = fs.readdirSync(config.dataDir).filter((f) => f.endsWith('.json'));
  const intentCounts = {};
  const confidenceByDay = {};
  let totalMessages = 0;
  let totalConfidenceSum = 0;
  let totalConfidenceCount = 0;
  let totalSessions = 0;
  const today = new Date().toISOString().slice(0, 10);
  let activeTodaySessions = 0;

  for (const f of files) {
    try {
      const session = JSON.parse(fs.readFileSync(path.join(config.dataDir, f), 'utf8'));
      totalSessions++;
      totalMessages += session.messages.length;

      if (session.updatedAt && session.updatedAt.slice(0, 10) === today) {
        activeTodaySessions++;
      }

      for (const msg of session.messages) {
        if (msg.role === 'bot') {
          if (typeof msg.confidence === 'number') {
            totalConfidenceSum += msg.confidence;
            totalConfidenceCount++;
            const day = msg.timestamp.slice(0, 10);
            if (!confidenceByDay[day]) confidenceByDay[day] = { sum: 0, count: 0 };
            confidenceByDay[day].sum += msg.confidence;
            confidenceByDay[day].count++;
          }
          if (msg.intentName) {
            intentCounts[msg.intentName] = (intentCounts[msg.intentName] || 0) + 1;
          }
        }
      }
    } catch {
      // skip
    }
  }

  const avgConfidence =
    totalConfidenceCount > 0
      ? parseFloat((totalConfidenceSum / totalConfidenceCount).toFixed(3))
      : null;

  const confidenceTrend = Object.entries(confidenceByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([day, { sum, count }]) => ({
      date: day,
      avgConfidence: parseFloat((sum / count).toFixed(3)),
      messageCount: count,
    }));

  const intentDistribution = Object.entries(intentCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([intent, count]) => ({ intent, count }));

  return {
    totalSessions,
    totalMessages,
    avgConfidence,
    activeTodaySessions,
    confidenceTrend,
    intentDistribution,
  };
}

function mostCommon(arr) {
  const map = {};
  let maxVal = arr[0];
  let maxCount = 1;
  for (const v of arr) {
    map[v] = (map[v] || 0) + 1;
    if (map[v] > maxCount) {
      maxVal = v;
      maxCount = map[v];
    }
  }
  return maxVal;
}

module.exports = { saveMessage, getSession, getAllSessions, getAnalytics };
