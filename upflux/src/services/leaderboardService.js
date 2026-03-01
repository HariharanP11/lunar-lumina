import {
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * Real-time subscription that aggregates quiz performance into
 * leaderboard-ready user objects.
 *
 * Data source:
 * - quizAttempts: { userId, score, total, accuracy, createdAt }
 * - users: { username, profileImage, ... }
 *
 * The callback receives an array of:
 * {
 *   id,
 *   username,
 *   totalScore,
 *   quizzesAttempted,
 *   averageScore,
 *   lastQuizDate,
 *   previousAverageScore,
 *   profileImage
 * }
 */
export function subscribeToLeaderboardUsers(callback, errorCallback) {
  const attemptsRef = collection(db, "quizAttempts");
  const usersRef = collection(db, "users");

  let attempts = [];
  let profiles = [];

  const notifyError = (err) => {
    if (errorCallback) {
      errorCallback(err);
    } else {
      console.error("Leaderboard subscription error:", err);
    }
  };

  const recompute = () => {
    if (!attempts.length) {
      callback([]);
      return;
    }

    const now = new Date();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    const statsByUser = new Map();

    attempts.forEach((a) => {
      const userId = a.userId;
      if (!userId) return;

      let createdAt = a.createdAt;
      if (createdAt?.toDate) createdAt = createdAt.toDate();
      if (!(createdAt instanceof Date)) {
        createdAt = null;
      }

      let accuracy = typeof a.accuracy === "number" ? a.accuracy : null;
      if (accuracy == null && typeof a.score === "number" && typeof a.total === "number" && a.total > 0) {
        accuracy = (a.score / a.total) * 100;
      }
      if (accuracy == null) return;

      const xp = typeof a.xp === "number" ? a.xp : 0;

      let stats = statsByUser.get(userId);
      if (!stats) {
        stats = {
          quizzesAttempted: 0,
          totalScore: 0,
          sumScores: 0,
          totalXP: 0,
          lastQuizDate: null,
          recentWeekSum: 0,
          recentWeekCount: 0,
          previousWeekSum: 0,
          previousWeekCount: 0,
          accuracies: [],
        };
        statsByUser.set(userId, stats);
      }

      stats.quizzesAttempted += 1;
      stats.totalScore += accuracy;
      stats.sumScores += accuracy;
      stats.totalXP += xp;
      stats.accuracies.push(accuracy);

      if (createdAt) {
        if (!stats.lastQuizDate || createdAt > stats.lastQuizDate) {
          stats.lastQuizDate = createdAt;
        }

        const ageMs = now - createdAt;
        if (ageMs <= oneWeekMs) {
          stats.recentWeekSum += accuracy;
          stats.recentWeekCount += 1;
        } else {
          stats.previousWeekSum += accuracy;
          stats.previousWeekCount += 1;
        }
      }
    });

    const results = [];

    statsByUser.forEach((stats, userId) => {
      const profile = profiles.find((p) => p.id === userId);
      const profileData = profile ? profile.data : {};
      const learningProfile = profileData?.learningProfile || {};
      const learningVelocity = typeof learningProfile.learningVelocity === "number"
        ? learningProfile.learningVelocity
        : 0;

      const quizzesAttempted = stats.quizzesAttempted || 0;
      if (quizzesAttempted === 0) return;

      const averageScore = stats.sumScores / quizzesAttempted;

      let previousAverageScore = null;
      if (stats.previousWeekCount > 0) {
        previousAverageScore = stats.previousWeekSum / stats.previousWeekCount;
      }

      results.push({
        id: userId,
        username: (profileData?.username || "").trim(),
        email: (profileData?.email || "").trim(),
        profileImage: profileData?.profileImage || null,
        totalScore: stats.totalScore,
        totalXP: stats.totalXP || 0,
        learningVelocity,
        quizzesAttempted,
        averageScore,
        lastQuizDate: stats.lastQuizDate,
        previousAverageScore,
      });
    });

    callback(results);
  };

  const unsubscribeAttempts = onSnapshot(
    attemptsRef,
    (snapshot) => {
      attempts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      recompute();
    },
    notifyError
  );

  const unsubscribeProfiles = onSnapshot(
    usersRef,
    (snapshot) => {
      profiles = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      recompute();
    },
    notifyError
  );

  return () => {
    unsubscribeAttempts();
    unsubscribeProfiles();
  };
}

