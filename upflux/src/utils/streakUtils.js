/**
 * Streak calculation from quiz attempt dates.
 * "Active day" = a calendar day on which the user completed at least one quiz.
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Normalize a timestamp to start of day (midnight) in local time.
 */
function toDateKey(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Get sorted unique activity days (epoch ms at midnight) from attempts.
 * @param {Array<{ createdAt?: unknown }>} attempts - Quiz attempts with createdAt
 * @returns {number[]} Sorted ascending array of date keys
 */
export function getActivityDays(attempts) {
  const keys = new Set();
  (attempts || []).forEach((a) => {
    let created = a.createdAt;
    if (created && typeof created.toDate === "function") created = created.toDate();
    const key = toDateKey(created);
    if (key != null) keys.add(key);
  });
  return Array.from(keys).sort((a, b) => a - b);
}

/**
 * Compute current streak: consecutive active days ending on or the day before today.
 * @param {number[]} activityDays - Sorted ascending date keys (midnight epoch ms)
 * @param {number} [now] - Optional "now" as epoch ms (default Date.now())
 * @returns {{ currentStreak: number, lastActivityDateKey: number | null }}
 */
export function computeStreak(activityDays, now = Date.now()) {
  if (!activityDays || activityDays.length === 0) {
    return { currentStreak: 0, lastActivityDateKey: null };
  }

  const todayKey = toDateKey(now);
  const yesterdayKey = todayKey - ONE_DAY_MS;

  let lastActivityDateKey = activityDays[activityDays.length - 1];

  // Streak counts only if last activity is today or yesterday
  if (lastActivityDateKey !== todayKey && lastActivityDateKey !== yesterdayKey) {
    return { currentStreak: 0, lastActivityDateKey };
  }

  let count = 0;
  let expectedKey = lastActivityDateKey;

  for (let i = activityDays.length - 1; i >= 0; i -= 1) {
    if (activityDays[i] !== expectedKey) break;
    count += 1;
    expectedKey -= ONE_DAY_MS;
  }

  return { currentStreak: count, lastActivityDateKey };
}

/**
 * True if streak is "about to break": last activity was yesterday (not today).
 */
export function isStreakAboutToExpire(activityDays, now = Date.now()) {
  const { currentStreak, lastActivityDateKey } = computeStreak(activityDays, now);
  if (currentStreak === 0) return false;
  const todayKey = toDateKey(now);
  return lastActivityDateKey !== null && lastActivityDateKey < todayKey;
}
