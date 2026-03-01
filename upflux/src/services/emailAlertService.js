import emailjs from "@emailjs/browser";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const EMAILJS_PUBLIC_KEY =
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "xBMraL6peFzfYsbjz";
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_PLATEAU = import.meta.env.VITE_EMAILJS_TEMPLATE_PLATEAU;
const TEMPLATE_DAILY = import.meta.env.VITE_EMAILJS_TEMPLATE_DAILY;
// Streak email deferred (requires premium)

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function deriveTopicBuckets(topics = {}) {
  const weakTopics = [];
  const strongTopics = [];

  Object.entries(topics).forEach(([topic, stats]) => {
    const total = Number(stats?.total || 0);
    const correct = Number(stats?.correct || 0);
    if (total <= 0) return;
    const accuracy = (correct / total) * 100;
    if (accuracy < 50) weakTopics.push(topic);
    if (accuracy > 75) strongTopics.push(topic);
  });

  return { weakTopics, strongTopics };
}

export function generateEmailContent(type, userData) {
  const username = userData.username || "Learner";
  const weakTopics = userData.latestQuizAttempt?.weakTopics || [];
  const weakTopicsText =
    weakTopics.length > 0 ? weakTopics.join(", ") : "No major weak topics detected";
  const streakDays = Number(userData.streakDays || 0);
  const score = Number(userData.latestQuizAttempt?.score || 0);
  const velocity = userData.learningVelocity ?? "N/A";
  const riskLevel = userData.riskLevel || "Unknown";

  if (type === "plateau") {
    return {
      subject: "Action Needed: Break Your Learning Plateau",
      message: `Hi ${username}, your recent progress indicates a plateau.\nFocus on these weak topics: ${weakTopicsText}.\nTake one focused quiz and one revision session today to regain momentum.`,
    };
  }

  if (type === "streak") {
    return {
      subject: "Streak Alert: Keep Your Momentum Alive",
      message: `Hi ${username}, your learning streak is about to break.\nCurrent streak: ${streakDays} day${streakDays === 1 ? "" : "s"}.\nComplete a quick quiz today to keep the streak active.`,
    };
  }

  return {
    subject: "Your Daily Learning Summary",
    message: `Hi ${username}, here is your latest learning summary:\nScore: ${score}\nLearning Velocity: ${velocity}\nRisk Level: ${riskLevel}\nWeak Topics: ${weakTopicsText}\nGreat job staying consistent.`,
  };
}

function determineEmailType(userData, now = new Date()) {
  if (userData.plateauStatus === true) return "plateau";

  const lastActiveDate = toDate(userData.lastActiveDate);
  if (lastActiveDate) {
    const inactivityMs = now.getTime() - lastActiveDate.getTime();
    if (inactivityMs > ONE_DAY_MS) return "streak";
  }

  const latestDate = toDate(userData.latestQuizAttempt?.createdAt);
  if (latestDate && isSameDay(latestDate, now)) return "dailySummary";

  return null;
}

function canSendEmail(lastEmailSent, now = new Date()) {
  const lastSent = toDate(lastEmailSent);
  if (!lastSent) return true;
  return now.getTime() - lastSent.getTime() >= ONE_DAY_MS;
}

async function fetchUserEmailData(user) {
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);
  const profileData = userDocSnap.exists() ? userDocSnap.data() : {};

  const latestQuizQ = query(
    collection(db, "quizAttempts"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc"),
    limit(1)
  );
  const latestQuizSnap = await getDocs(latestQuizQ);
  const latestQuizData = latestQuizSnap.docs.length
    ? latestQuizSnap.docs[0].data()
    : null;

  const latestQuizAttempt = latestQuizData
    ? {
        score: Number(latestQuizData.score || 0),
        createdAt: latestQuizData.createdAt || null,
        ...deriveTopicBuckets(latestQuizData.topics || {}),
      }
    : null;

  return {
    username:
      user.username ||
      profileData.username ||
      user.displayName ||
      "Learner",
    email: user.email || profileData.email || "",
    plateauStatus:
      Boolean(profileData.plateauStatus) ||
      Boolean(profileData.learningProfile?.plateauDetected),
    learningVelocity:
      profileData.learningVelocity ??
      profileData.learningProfile?.learningVelocity ??
      null,
    riskLevel:
      profileData.riskLevel ||
      profileData.learningProfile?.riskLevel ||
      "Unknown",
    streakDays:
      profileData.streakDays ??
      profileData.currentStreak ??
      0,
    lastActiveDate: profileData.lastActiveDate || latestQuizAttempt?.createdAt || null,
    lastEmailSent: profileData.lastEmailSent || null,
    latestQuizAttempt,
  };
}

export async function sendEmailAlert(user) {
  if (!user?.uid) return { sent: false, reason: "missing_user" };

  const userData = await fetchUserEmailData(user);
  if (!userData.email) return { sent: false, reason: "missing_email" };

  const emailType = determineEmailType(userData);
  if (!emailType) return { sent: false, reason: "no_email_type" };

  // Streak email deferred (requires premium)
  if (emailType === "streak") return { sent: false, reason: "streak_deferred" };

  if (!canSendEmail(userData.lastEmailSent)) {
    return { sent: false, reason: "cooldown_active" };
  }

  const templateId =
    emailType === "plateau" ? TEMPLATE_PLATEAU : TEMPLATE_DAILY;
  if (!EMAILJS_SERVICE_ID || !templateId || !EMAILJS_PUBLIC_KEY) {
    console.warn(
      "EmailJS is not fully configured. Set VITE_EMAILJS_SERVICE_ID and template IDs (PLATEAU, DAILY)."
    );
    return { sent: false, reason: "emailjs_not_configured" };
  }

  const content = generateEmailContent(emailType, userData);
  const templateParams = {
    to_name: userData.username,
    to_email: userData.email,
    email: userData.email,
    subject: content.subject,
    message: content.message,
    email_type: emailType,
    weak_topics: (userData.latestQuizAttempt?.weakTopics || []).join(", "),
    streak_days: String(userData.streakDays || 0),
    score: String(userData.latestQuizAttempt?.score || 0),
    learning_velocity:
      userData.learningVelocity == null ? "N/A" : String(userData.learningVelocity),
    risk_level: userData.riskLevel || "Unknown",
  };

  await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, {
    publicKey: EMAILJS_PUBLIC_KEY,
  });

  await setDoc(
    doc(db, "users", user.uid),
    {
      lastEmailSent: serverTimestamp(),
      lastEmailType: emailType,
    },
    { merge: true }
  );

  return { sent: true, type: emailType };
}

