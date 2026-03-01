import { collection, query, where, orderBy, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";

// Pure calculation helpers (no UI)
function calculateTopicMastery(attempts) {
  const topicTotals = {};

  attempts.forEach((a) => {
    const topics = a.topics || {};
    Object.entries(topics).forEach(([topic, stats]) => {
      if (!topicTotals[topic]) {
        topicTotals[topic] = { correct: 0, total: 0 };
      }
      topicTotals[topic].correct += stats.correct || 0;
      topicTotals[topic].total += stats.total || 0;
    });
  });

  const mastery = {};
  Object.entries(topicTotals).forEach(([topic, stats]) => {
    if (stats.total > 0) {
      mastery[topic] = (stats.correct / stats.total) * 100;
    }
  });

  return mastery;
}

function calculateLearningVelocity(accuracies) {
  if (accuracies.length < 2) return 0;
  const first = accuracies[0];
  const last = accuracies[accuracies.length - 1];
  const slope = (last - first) / (accuracies.length - 1);
  return slope;
}

function calculateConsistencyIndex(accuracies) {
  if (accuracies.length === 0) return 0;
  const max = Math.max(...accuracies);
  const min = Math.min(...accuracies);
  return max - min;
}

function calculateConfidenceMismatchRate(attempts) {
  let totalAnswered = 0;
  let mismatches = 0;

  attempts.forEach((a) => {
    const answers = a.userAnswers || [];
    answers.forEach((ans) => {
      if (!ans || typeof ans.isCorrect !== "boolean") return;
      const conf = (ans.confidence || "").toString().toLowerCase();
      if (!conf) return;

      totalAnswered += 1;

      const isHigh = conf === "high";
      const isLow = conf === "low";

      if ((isHigh && !ans.isCorrect) || (isLow && ans.isCorrect)) {
        mismatches += 1;
      }
    });
  });

  if (totalAnswered === 0) return 0;
  return (mismatches / totalAnswered) * 100;
}

function calculateAverageResponseTime(attempts) {
  let totalTime = 0;
  let count = 0;

  attempts.forEach((a) => {
    const answers = a.userAnswers || [];
    answers.forEach((ans) => {
      if (typeof ans.responseTimeMs === "number" && ans.responseTimeMs >= 0) {
        totalTime += ans.responseTimeMs;
        count += 1;
      }
    });
  });

  if (count === 0) return 0;
  return totalTime / count;
}

function detectPlateau(accuracies, velocity) {
  if (accuracies.length < 3) return false;
  const lastThree = accuracies.slice(-3);
  const max = Math.max(...lastThree);
  const min = Math.min(...lastThree);
  const withinRange = max - min <= 3;
  const nearZeroVelocity = Math.abs(velocity) < 1;
  return withinRange && nearZeroVelocity;
}

function classifyRiskLevel(accuracies, velocity) {
  if (accuracies.length === 0) return "Unknown";
  const last = accuracies[accuracies.length - 1];

  const declining = velocity < 0;
  if (last < 50 || declining) {
    return "High";
  }

  if (last >= 50 && last <= 70) {
    return "Medium";
  }

  // last > 70
  if (velocity >= 0) {
    return "Low";
  }

  return "Medium";
}

// Public API: compute + store profile summary for a user
export async function buildLearningBehaviorProfileForUser(userId) {
  if (!userId) return;

  const q = query(
    collection(db, "quizAttempts"),
    where("userId", "==", userId),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);
  const attempts = snapshot.docs.map((docSnap) => docSnap.data());

  if (!attempts.length) {
    await setDoc(
      doc(db, "users", userId),
      {
        learningProfile: {
          topicMastery: {},
          learningVelocity: 0,
          consistencyIndex: 0,
          confidenceMismatchRate: 0,
          averageResponseTimeMs: 0,
          plateauDetected: false,
          riskLevel: "Unknown",
          lastUpdated: new Date()
        }
      },
      { merge: true }
    );
    return;
  }

  const accuracies = attempts
    .map((a) => {
      if (typeof a.accuracy === "number") return a.accuracy;
      if (
        typeof a.score === "number" &&
        typeof a.total === "number" &&
        a.total > 0
      ) {
        return (a.score / a.total) * 100;
      }
      return null;
    })
    .filter((v) => v !== null);

  const topicMastery = calculateTopicMastery(attempts);
  const learningVelocity = calculateLearningVelocity(accuracies);
  const consistencyIndex = calculateConsistencyIndex(accuracies);
  const confidenceMismatchRate = calculateConfidenceMismatchRate(attempts);
  const averageResponseTimeMs = calculateAverageResponseTime(attempts);
  const plateauDetected = detectPlateau(accuracies, learningVelocity);
  const riskLevel = classifyRiskLevel(accuracies, learningVelocity);

  await setDoc(
    doc(db, "users", userId),
    {
      learningProfile: {
        topicMastery,
        learningVelocity,
        consistencyIndex,
        confidenceMismatchRate,
        averageResponseTimeMs,
        plateauDetected,
        riskLevel,
        lastUpdated: new Date()
      }
    },
    { merge: true }
  );
}

