import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import questions from "../data/programmingQuestions";
import { addDoc, collection, serverTimestamp, query, where, orderBy, getDocs, limit, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { AuthContext } from "../context/AuthContext";
import { shuffleArray, getStaticQuestionId, withShuffledOptions } from "../utils/quizUtils";
import { calculateXpForAttempt } from "../utils/xpUtils";
import { getActivityDays, computeStreak } from "../utils/streakUtils";
import StudyPlanWithLinks from "../components/StudyPlanWithLinks";

function TakeQuiz() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ---------- NORMAL QUIZ STATES ----------
  const [selectedTopic, setSelectedTopic] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [topicStats, setTopicStats] = useState({});
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedConfidence, setSelectedConfidence] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // ---------- TIMER AND DATE STATES ----------
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [quizDate, setQuizDate] = useState(null);

  // ---------- AI STATES ----------
  const [uploadedFile, setUploadedFile] = useState(null);
  const [difficulty, setDifficulty] = useState("");

  // ---------- ANALYSIS STATES ----------
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const hasAnalyzed = useRef(false);
  const [explanations, setExplanations] = useState(null);
  const [explainingWrong, setExplainingWrong] = useState(false);
  const [lastEarnedXp, setLastEarnedXp] = useState(null);
  const [currentStreakValue, setCurrentStreakValue] = useState(null);

  // ---------- PER-QUESTION TIMING ----------
  useEffect(() => {
    if (!quizStarted) return;
    setQuestionStartTime(new Date());
  }, [quizStarted, currentQuestion]);

  // ---------- START NORMAL QUIZ ----------
  const startQuiz = async () => {
    if (!selectedTopic) {
      alert("Please select a topic");
      return;
    }

    // Filter by topic and difficulty
    let filteredPool = questions.filter((q) =>
      (selectedTopic === "All" || q.topic === selectedTopic) &&
      (selectedDifficulty === "All" || q.difficulty === selectedDifficulty)
    );

    if (filteredPool.length === 0) {
      alert("No questions available for this topic.");
      return;
    }

    // Attach deterministic IDs
    filteredPool = filteredPool.map((q) => ({
      ...q,
      id: getStaticQuestionId(q)
    }));

    let quizQuestions;

    // If no logged-in user, just shuffle and take first 10
    if (!user?.uid) {
      quizQuestions = shuffleArray(filteredPool).slice(0, 10);
    } else {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      const usedStaticQuestionIds = userData.usedStaticQuestionIds || {};

      const poolKey = `${selectedTopic || "All"}|${selectedDifficulty || "All"}`;
      const usedForKey = new Set(usedStaticQuestionIds[poolKey] || []);

      const unusedPool = filteredPool.filter((q) => !usedForKey.has(q.id));

      quizQuestions = [];

      // First prefer unused questions
      const shuffledUnused = shuffleArray(unusedPool);
      quizQuestions.push(...shuffledUnused.slice(0, 10));

      // If we still need more to reach 10, reuse from the full pool without duplicates
      if (quizQuestions.length < 10) {
        const remaining = 10 - quizQuestions.length;
        const alreadyIds = new Set(quizQuestions.map((q) => q.id));
        const refillCandidates = shuffleArray(filteredPool).filter(
          (q) => !alreadyIds.has(q.id)
        );
        quizQuestions.push(...refillCandidates.slice(0, remaining));
      }

      // Ensure exactly 10, no duplicates
      const uniqueById = [];
      const seen = new Set();
      for (const q of quizQuestions) {
        if (!q || !q.id || seen.has(q.id)) continue;
        uniqueById.push(q);
        seen.add(q.id);
        if (uniqueById.length === 10) break;
      }
      quizQuestions = uniqueById;

      // Persist updated used IDs for this pool
      const updatedIdsForKey = Array.from(
        new Set([
          ...usedForKey,
          ...quizQuestions.map((q) => q.id)
        ])
      );

      await setDoc(
        userRef,
        {
          usedStaticQuestionIds: {
            ...usedStaticQuestionIds,
            [poolKey]: updatedIdsForKey
          }
        },
        { merge: true }
      );
    }

    // Shuffle options per question and ensure exactly 10 questions
    const quizOfTen = withShuffledOptions(quizQuestions).slice(0, 10);
    setFilteredQuestions(quizOfTen);
    setStartTime(new Date());
    setQuizDate(new Date());
    setQuizStarted(true);
  };

  // ---------- GENERATE AI QUIZ ----------
  const generateQuiz = async () => {
    if (!uploadedFile || !difficulty) {
      alert("Upload file and select difficulty");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("difficulty", difficulty);

    const response = await fetch(
      "http://localhost:5000/generate-quiz",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();
    const limited = Array.isArray(data) ? data.slice(0, 10) : [];
    const prepared = withShuffledOptions(limited);

    setFilteredQuestions(prepared);
    setStartTime(new Date());
    setQuizDate(new Date());
    setQuizStarted(true);
  };

  // ---------- HANDLE NEXT ----------
  const handleNext = () => {
    if (!selectedAnswer) return;

    const current = filteredQuestions[currentQuestion];
    const isCorrect = selectedAnswer === current.correctAnswer;
    const now = new Date();
    const responseTimeMs = questionStartTime ? now - questionStartTime : null;
    const confidenceValue = selectedConfidence || "Medium";

    if (isCorrect) setScore((prev) => prev + 1);

    setUserAnswers((prev) => [
      ...prev,
      {
        question: current.question,
        userAnswer: selectedAnswer,
        correctAnswer: current.correctAnswer,
        isCorrect,
        confidence: confidenceValue,
        responseTimeMs
      }
    ]);

    setTopicStats((prev) => {
      const topic = current.topic || "Custom";
      const prevTopic = prev[topic] || { correct: 0, total: 0 };

      return {
        ...prev,
        [topic]: {
          correct: prevTopic.correct + (isCorrect ? 1 : 0),
          total: prevTopic.total + 1
        }
      };
    });

    setSelectedAnswer(null);
    setSelectedConfidence(null);

    if (currentQuestion + 1 < filteredQuestions.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  // ---------- AUTO SAVE + ANALYZE ON FINISH ----------
  useEffect(() => {
    if (!quizFinished || hasAnalyzed.current) return;
    hasAnalyzed.current = true;
    setEndTime(new Date());

    const saveAndAnalyze = async () => {
      if (!user?.uid) return;

      const total = filteredQuestions.length;
      const accuracy = total > 0 ? (score / total) * 100 : 0;
      const quizDifficulty = selectedDifficulty !== "All"
        ? selectedDifficulty
        : difficulty || "medium";

      // Previous attempt accuracy for XP improvement bonus
      let previousAccuracy = null;
      try {
        const prevQ = query(
          collection(db, "quizAttempts"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const prevSnap = await getDocs(prevQ);
        if (prevSnap.docs.length > 0) {
          const d = prevSnap.docs[0].data();
          if (typeof d.accuracy === "number") previousAccuracy = d.accuracy;
          else if (typeof d.score === "number" && typeof d.total === "number" && d.total > 0) {
            previousAccuracy = (d.score / d.total) * 100;
          }
        }
      } catch (_) {}

      const { xp: xpEarned } = calculateXpForAttempt(
        score,
        total,
        quizDifficulty,
        topicStats,
        previousAccuracy
      );

      setLastEarnedXp(xpEarned);

      await addDoc(collection(db, "quizAttempts"), {
        userId: user.uid,
        score,
        total,
        accuracy,
        topics: topicStats,
        xp: xpEarned,
        difficulty: quizDifficulty,
        createdAt: serverTimestamp(),
        userAnswers
      });

      // Update user streak
      try {
        const allQ = query(
          collection(db, "quizAttempts"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "asc")
        );
        const allSnap = await getDocs(allQ);
        const allAttempts = allSnap.docs.map((d) => ({ createdAt: d.data().createdAt }));
        const activityDays = getActivityDays(allAttempts);
        const { currentStreak, lastActivityDateKey } = computeStreak(activityDays);
        setCurrentStreakValue(currentStreak);
        await setDoc(
          doc(db, "users", user.uid),
          {
            currentStreak,
            lastActivityDateKey: lastActivityDateKey ?? null
          },
          { merge: true }
        );
      } catch (e) {
        console.error("Streak update error:", e);
      }

      // Fetch last 3 previous quiz scores (excluding the one we just saved)
      let previousQuizzes = [];
      try {
        const q = query(
          collection(db, "quizAttempts"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(4)
        );
        const snapshot = await getDocs(q);
        previousQuizzes = snapshot.docs.slice(1, 4).map((doc) => ({
          overallScore: doc.data().accuracy || 0
        }));
      } catch (err) {
        console.error("Error fetching previous quizzes:", err);
      }

      // Call analyze endpoint
      setAnalyzing(true);
      try {
        const res = await fetch("http://localhost:5000/analyze-performance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentQuiz: {
              overallScore: accuracy,
              difficulty: quizDifficulty,
              topics: topicStats
            },
            previousQuizzes
          })
        });
        const data = await res.json();
        setAnalysis(data);
      } catch (err) {
        console.error("Analysis error:", err);
      }
      setAnalyzing(false);
    };

    saveAndAnalyze();
  }, [quizFinished]);

  // ---------- EXPLAIN WRONG ANSWERS ----------
  useEffect(() => {
    if (!quizFinished || userAnswers.length === 0) return;

    const wrongOnes = userAnswers.filter((a) => !a.isCorrect);
    if (wrongOnes.length === 0) return;

    const fetchExplanations = async () => {
      setExplainingWrong(true);
      try {
        const res = await fetch("http://localhost:5000/explain-wrong", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wrongAnswers: wrongOnes })
        });
        const data = await res.json();
        setExplanations(data.explanations || []);
      } catch (err) {
        console.error("Explanation error:", err);
      }
      setExplainingWrong(false);
    };

    fetchExplanations();
  }, [quizFinished, userAnswers]);

  // ---------- FINISHED SCREEN ----------
  if (quizFinished) {
    const wrongAnswers = userAnswers.filter((a) => !a.isCorrect);
    const correctAnswers = userAnswers.filter((a) => a.isCorrect);
    const timeTaken = endTime && startTime ? Math.floor((endTime - startTime) / 1000) : 0;
    const formattedTime = `${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}`;

    return (
      <div style={{ padding: "40px" }}>
        <h2>Quiz Completed</h2>
        <p>Score: {score} / {filteredQuestions.length}</p>
        {lastEarnedXp != null && <p>XP earned: {lastEarnedXp}</p>}
        {currentStreakValue != null && (
          <p>
            Streak: {currentStreakValue} day{currentStreakValue !== 1 ? "s" : ""}
          </p>
        )}
        <p>Date: {quizDate ? quizDate.toLocaleDateString() : 'N/A'}</p>
        <p>Time Taken: {formattedTime}</p>

        {/* Answer Review */}
        <h3>Answer Review</h3>

        {correctAnswers.length > 0 && (
          <div>
            <h4>Correct Answers ({correctAnswers.length})</h4>
            {correctAnswers.map((a, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <p><strong>Q: {a.question}</strong></p>
                <p>Your answer: {a.userAnswer} ✓</p>
              </div>
            ))}
          </div>
        )}

        {wrongAnswers.length > 0 && (
          <div>
            <h4>Wrong Answers ({wrongAnswers.length})</h4>
            {wrongAnswers.map((a, i) => (
              <div key={i} style={{ marginBottom: "15px" }}>
                <p><strong>Q: {a.question}</strong></p>
                <p>Your answer: {a.userAnswer} ✗</p>
                <p>Correct answer: {a.correctAnswer}</p>
                {explainingWrong && <p>Loading explanation...</p>}
                {explanations && explanations[i] && (
                  <p><em>Explanation: {explanations[i]}</em></p>
                )}
              </div>
            ))}
          </div>
        )}

        <hr />

        {/* AI Analysis */}
        {analyzing && <p>Analyzing your performance...</p>}

        {analysis && !analysis.error && (
          <div>
            <h3>Performance Summary</h3>
            <p>{analysis.performanceSummary}</p>

            {analysis.weakTopics?.length > 0 && (
              <>
                <h3>Weak Topics</h3>
                <ul>
                  {analysis.weakTopics.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </>
            )}

            {analysis.strongTopics?.length > 0 && (
              <>
                <h3>Strong Topics</h3>
                <ul>
                  {analysis.strongTopics.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </>
            )}

            <h3>Trend</h3>
            <p>{analysis.trendAnalysis}</p>

            <h3>Learning Velocity</h3>
            <p>{analysis.learningVelocity}</p>

            <h3>Risk Level</h3>
            <p>{analysis.riskLevel}</p>

            <h3>Recommended Difficulty</h3>
            <p>{analysis.recommendedDifficulty}</p>

            {analysis.studyPlan && (
              <StudyPlanWithLinks studyPlan={analysis.studyPlan} />
            )}

            {analysis.improvementStrategies?.length > 0 && (
              <>
                <h3>Improvement Strategies</h3>
                <ol>
                  {analysis.improvementStrategies.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </>
            )}

            {analysis.motivation && (
              <>
                <h3>Motivation</h3>
                <p>{analysis.motivation}</p>
              </>
            )}
          </div>
        )}

        {analysis?.error && <p>Analysis failed. Check backend.</p>}

        <div style={{ marginTop: "24px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#6366f1",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // ---------- TOPIC SELECTION SCREEN ----------
  if (!quizStarted) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Select Topic</h2>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">-- Choose Topic --</option>
          <option value="All">All Topics</option>
          <option value="Data Structures">Data Structures</option>
          <option value="OOPS">OOPS</option>
          <option value="Python">Python</option>
          <option value="Machine Learning">Machine Learning</option>
          <option value="DBMS">DBMS</option>
          <option value="Operating Systems">Operating Systems</option>
          <option value="Custom">Custom (Upload File)</option>
        </select>

        <h3>Select Difficulty</h3>
        <select
          value={selectedTopic === "Custom" ? difficulty : selectedDifficulty}
          onChange={(e) => {
            if (selectedTopic === "Custom") {
              setDifficulty(e.target.value);
            } else {
              setSelectedDifficulty(e.target.value);
            }
          }}
        >
          {selectedTopic === "Custom" ? (
            <>
              <option value="">-- Select Difficulty --</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </>
          ) : (
            <>
              <option value="All">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </>
          )}
        </select>

        {selectedTopic === "Custom" && (
          <div style={{ marginTop: "15px" }}>
            <p>Upload your syllabus file:</p>
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={(e) => setUploadedFile(e.target.files[0])}
            />
          </div>
        )}

        <br />
        <button
          onClick={selectedTopic === "Custom" ? generateQuiz : startQuiz}
          style={{ marginTop: "10px" }}
        >
          {selectedTopic === "Custom" ? "Generate AI Quiz" : "Start Quiz"}
        </button>
      </div>
    );
  }

  // ---------- QUIZ SCREEN ----------
  return (
    <div style={{ padding: "40px" }}>
      <h2>Quiz</h2>
      <p>Question {currentQuestion + 1} of {filteredQuestions.length}</p>

      <h3>
        {filteredQuestions[currentQuestion]?.question}
      </h3>

      {filteredQuestions[currentQuestion]?.options.map(
        (option, index) => (
          <div key={index}>
            <label>
              <input
                type="radio"
                value={option}
                checked={selectedAnswer === option}
                onChange={() =>
                  setSelectedAnswer(option)
                }
              />
              {option}
            </label>
          </div>
        )
      )}

      <br />

      <button
        onClick={handleNext}
        disabled={!selectedAnswer}
      >
        Next
      </button>
    </div>
  );
}

export default TakeQuiz;