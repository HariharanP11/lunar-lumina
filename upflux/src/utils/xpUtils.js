/**
 * XP calculation for quiz attempts.
 *
 * Rules:
 * - Base XP per correct answer by difficulty: Easy 10, Medium 20, Hard 30.
 * - Bonus: +5 XP per mastered topic (100% correct in this quiz for that topic).
 * - Bonus: +5 XP for improvement (current quiz accuracy > previous attempt accuracy).
 */

const XP_PER_CORRECT = { easy: 10, medium: 20, hard: 30 };
const BONUS_MASTERED_TOPIC = 5;
const BONUS_IMPROVEMENT = 5;

/**
 * Normalize difficulty string to key used in XP_PER_CORRECT.
 */
function normalizeDifficulty(difficulty) {
  if (!difficulty || typeof difficulty !== "string") return "medium";
  const d = difficulty.toLowerCase().trim();
  if (d === "easy" || d === "medium" || d === "hard") return d;
  return "medium";
}

/**
 * Calculate XP for a single quiz attempt.
 *
 * @param {number} score - Number of correct answers
 * @param {number} total - Total questions
 * @param {string} difficulty - "easy" | "medium" | "hard"
 * @param {Record<string, { correct: number, total: number }>} topicStats - Per-topic stats for this quiz
 * @param {number | null} previousAccuracy - Previous attempt accuracy (0–100), or null if first attempt
 * @returns {{ xp: number, breakdown: { base: number, masteredBonus: number, improvementBonus: number } }}
 */
export function calculateXpForAttempt(score, total, difficulty, topicStats = {}, previousAccuracy = null) {
  const diff = normalizeDifficulty(difficulty);
  const perCorrect = XP_PER_CORRECT[diff] ?? 20;

  const base = score * perCorrect;

  let masteredBonus = 0;
  if (topicStats && typeof topicStats === "object") {
    for (const key of Object.keys(topicStats)) {
      const t = topicStats[key];
      if (t && typeof t.correct === "number" && typeof t.total === "number" && t.total > 0 && t.correct === t.total) {
        masteredBonus += BONUS_MASTERED_TOPIC;
      }
    }
  }

  const currentAccuracy = total > 0 ? (score / total) * 100 : 0;
  const improvementBonus =
    previousAccuracy != null && currentAccuracy > previousAccuracy ? BONUS_IMPROVEMENT : 0;

  const xp = base + masteredBonus + improvementBonus;

  return {
    xp: Math.max(0, xp),
    breakdown: { base, masteredBonus, improvementBonus },
  };
}
