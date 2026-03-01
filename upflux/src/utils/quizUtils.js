// Utility helpers for quiz selection and shuffling

/**
 * Fisher–Yates shuffle.
 * Returns a new shuffled copy; does not mutate the original array.
 */
export function shuffleArray(array) {
  const copy = Array.isArray(array) ? [...array] : [];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Deterministic ID for a static question.
 * Uses topic + difficulty + question text so it stays stable across sessions.
 */
export function getStaticQuestionId(question) {
  const topic = question.topic || "UnknownTopic";
  const difficulty = question.difficulty || "UnknownDifficulty";
  const text = question.question || "";
  return `${topic}::${difficulty}::${text}`;
}

/**
 * Shuffles the answer options for each question.
 * Returns a new array of questions with shuffled options.
 */
export function withShuffledOptions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.map((q) => ({
    ...q,
    options: shuffleArray(q.options || []),
  }));
}

