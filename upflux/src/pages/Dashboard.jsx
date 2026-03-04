import { useEffect, useState, useContext, useMemo, useRef } from "react";



import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";



import { db } from "../services/firebase";



import { AuthContext } from "../context/AuthContext";



import { useNavigate } from "react-router-dom";



import Header from "../components/Header";



import Sidebar from "../components/Sidebar";



import SuggestionPopup from "../components/SuggestionPopup";



import StudyPlanWithLinks from "../components/StudyPlanWithLinks";



import { getActivityDays, computeStreak, isStreakAboutToExpire } from "../utils/streakUtils";



import { sendEmailAlert } from "../services/emailAlertService";







import {



  LineChart,



  Line,



  XAxis,



  YAxis,



  CartesianGrid,



  Tooltip,



  ResponsiveContainer,



  Area,



  AreaChart



} from "recharts";







function Dashboard() {



  const { user } = useContext(AuthContext);



  const navigate = useNavigate();







  const [attempts, setAttempts] = useState([]);



  const [availableTopics, setAvailableTopics] = useState([]);



  const [selectedTopic, setSelectedTopic] = useState("All");



  const [sidebarOpen, setSidebarOpen] = useState(false);







  const [loading, setLoading] = useState(true);



  const [totalXP, setTotalXP] = useState(0);



  const [level, setLevel] = useState(1);







  // Local analytics



  const [velocity, setVelocity] = useState(null);



  const [status, setStatus] = useState("");



  const [localInsights, setLocalInsights] = useState([]);







  // AI insights



  const [aiInsights, setAiInsights] = useState(null);



  const [insightsLoading, setInsightsLoading] = useState(false);



  const hasFetchedInsights = useRef(false);



  const hasTriedEmailAlert = useRef(false);







  // Intelligent suggestion popup



  const [suggestion, setSuggestion] = useState(null);



  const [showPopup, setShowPopup] = useState(false);







  // ---------------- FETCH DATA ----------------



  useEffect(() => {



    const fetchAttempts = async () => {



      if (!user?.uid) {



        setLoading(false);



        return;



      }







      try {



        const q = query(



          collection(db, "quizAttempts"),



          where("userId", "==", user.uid),



          orderBy("createdAt", "asc")



        );







        const snapshot = await getDocs(q);







        const data = snapshot.docs.map((doc, index) => ({



          attempt: index + 1,



          accuracy: doc.data().accuracy || 0,



          topics: doc.data().topics || {},



          xp: doc.data().xp || 0,



          ...doc.data()



        }));







        setAttempts(data);







        // XP calculation



        let xpSum = 0;



        data.forEach((a) => (xpSum += a.xp || 0));



        setTotalXP(xpSum);



        setLevel(Math.floor(xpSum / 200) + 1);







        setAvailableTopics([



          "Data Structures",



          "OOPS",



          "Python",



          "Machine Learning",



          "DBMS",



          "Operating Systems",



          "Custom"



        ]);







        setLoading(false);



      } catch (err) {



        console.error("Error fetching attempts:", err);



        setLoading(false);



      }



    };







    fetchAttempts();



  }, [user]);







  // ---------------- EMAIL ALERT ENGINE ----------------



  useEffect(() => {



    if (!user?.uid || hasTriedEmailAlert.current) return;



    hasTriedEmailAlert.current = true;







    sendEmailAlert({



      uid: user.uid,



      email: user.email,



      username: user.displayName || "",



    }).catch((err) => {



      console.error("Email alert error:", err);



    });



  }, [user]);







  // ---------------- LOGIN SUGGESTION POPUP ENGINE ----------------



  useEffect(() => {



    const evaluateSuggestions = async () => {



      if (!user?.uid) return;







      // Only once per login/session



      const key = `learning_popup_shown_${user.uid}`;



      if (sessionStorage.getItem(key)) return;







      try {



        const userDoc = await getDoc(doc(db, "users", user.uid));



        const profile = userDoc.exists() ? userDoc.data().learningProfile || null : null;







        const accuracies = attempts



          .map((a) => {



            if (typeof a.accuracy === "number") return a.accuracy;



            if (typeof a.score === "number" && typeof a.total === "number" && a.total > 0) {



              return (a.score / a.total) * 100;



            }



            return null;



          })



          .filter((v) => v !== null);







        const latestAccuracy = accuracies.length ? accuracies[accuracies.length - 1] : null;



        const velocityValue = typeof profile?.learningVelocity === "number" ? profile.learningVelocity : 0;



        const plateau = Boolean(profile?.plateauDetected);



        const topicMastery = profile?.topicMastery || {};







        // Weak topic detection: lowest mastery below threshold



        let weakestTopic = null;



        let weakestValue = Infinity;



        Object.entries(topicMastery).forEach(([topic, value]) => {



          if (typeof value === "number" && value < weakestValue) {



            weakestValue = value;



            weakestTopic = topic;



          }



        });



        const hasWeakTopic = weakestTopic && weakestValue < 60;







        // Streak detection: use shared streak util



        const activityDays = getActivityDays(attempts);



        const streakAboutToExpire = isStreakAboutToExpire(activityDays);







        // Choose exactly one suggestion by priority



        let chosen = null;







        if (!attempts.length) {



          // First-time or no-activity suggestion



          chosen = {



            type: "first-quiz",



            title: "Welcome back!",



            message:



              "Start your first quiz today to unlock personalized insights, streak tracking, and smarter recommendations."



          };



        } else if (plateau) {



          chosen = {



            type: "plateau",



            title: "You're on a plateau",



            message:



              "Your last few quiz scores are almost flat. Try switching topics or difficulty for a short focused sprint to break the stagnation."



          };



        } else if (velocityValue < 0 && latestAccuracy !== null) {



          chosen = {



            type: "decline",



            title: "Performance is dipping",



            message:



              "Your recent quiz trend is declining. Revisit your weakest topics and do a short revision quiz to recover momentum."



          };



        } else if (hasWeakTopic) {



          chosen = {



            type: "weak-topic",



            title: "Target your weakest topic",



            message: `Your lowest mastery is in ${weakestTopic}. Take a quick quiz focused on this topic to turn it into a strength.`



          };



        } else if (streakAboutToExpire) {



          chosen = {



            type: "streak",



            title: "Keep your streak alive",



            message:



              "You're close to losing your recent quiz streak. Take a short quiz today to lock in another day of progress."



          };



        } else if (latestAccuracy !== null && velocityValue >= 0) {



          // Positive growth suggestion as a fallback when things are going well



          chosen = {



            type: "growth",



            title: "Nice progress so far",



            message:



              "Your scores are trending in a healthy direction. Try a slightly higher difficulty quiz to keep pushing your growth."



          };



        }







        if (chosen) {



          setSuggestion(chosen);



          setShowPopup(true);



          sessionStorage.setItem(key, "1");



        }



      } catch (err) {



        console.error("Error evaluating login suggestions:", err);



      }



    };







    evaluateSuggestions();



  }, [user, attempts]);







  // ---------------- FILTER BY TOPIC ----------------



  const displayAttempts = useMemo(() => {



    if (selectedTopic === "All") return attempts;







    return attempts



      .map((attempt) => {



        const topicStats = attempt.topics?.[selectedTopic];



        if (!topicStats) return null;







        return {



          ...attempt,



          accuracy:



            (topicStats.correct / topicStats.total) * 100



        };



      })



      .filter(Boolean);



  }, [attempts, selectedTopic]);







  // ---------------- LOCAL ANALYTICS ENGINE ----------------



  useEffect(() => {



    if (displayAttempts.length === 0) {



      setVelocity(null);



      setStatus("");



      setLocalInsights([]);



      return;



    }







    const accuracies = displayAttempts.map((a) => a.accuracy);



    const insights = [];







    // Single attempt — show what we can



    if (accuracies.length === 1) {



      const acc = accuracies[0];



      setVelocity("N/A");







      if (acc >= 75) {



        insights.push({ type: "success", text: `Strong first attempt (${acc.toFixed(0)}%). Keep going!` });



        setStatus("Good Start");



      } else if (acc >= 50) {



        insights.push({ type: "info", text: `Decent start (${acc.toFixed(0)}%). Room for improvement.` });



        setStatus("Needs Practice");



      } else {



        insights.push({ type: "warning", text: `Low accuracy (${acc.toFixed(0)}%). Focus on fundamentals.` });



        setStatus("Needs Attention");



      }







      insights.push({ type: "info", text: "Take more quizzes to unlock trend analysis and stagnation detection." });



      setLocalInsights(insights);



      return;



    }







    // Multiple attempts — full analytics



    const first = accuracies[0];



    const last = accuracies[accuracies.length - 1];



    const slope = (last - first) / (displayAttempts.length - 1);







    setVelocity(slope.toFixed(2));







    // Trend detection



    if (slope < -2) {



      insights.push({ type: "danger", text: "Performance is declining sharply. Immediate revision needed." });



    } else if (slope < 0) {



      insights.push({ type: "warning", text: "Slight downward trend detected. Review weak areas." });



    } else if (slope < 1) {



      insights.push({ type: "info", text: "Growth rate is slow. Increase focused practice." });



    } else {



      insights.push({ type: "success", text: "Learning curve is improving steadily." });



    }







    // Stagnation detection (last 3 attempts within 3% range)



    if (accuracies.length >= 3) {



      const recent3 = accuracies.slice(-3);



      const range = Math.max(...recent3) - Math.min(...recent3);



      if (range <= 3) {



        insights.push({ type: "warning", text: "Stagnation detected: last 3 attempts show no meaningful improvement. Change your study approach." });



      }



    }







    // Consistency check



    const variance = Math.max(...accuracies) - Math.min(...accuracies);



    if (variance > 40) {



      insights.push({ type: "warning", text: "Performance is highly inconsistent across attempts." });



    } else if (variance < 10 && accuracies.length >= 3) {



      insights.push({ type: "success", text: "Performance is consistent. Good stability." });



    }







    // Recent momentum (last 2 vs previous 2)



    if (accuracies.length >= 4) {



      const prev2Avg = (accuracies[accuracies.length - 4] + accuracies[accuracies.length - 3]) / 2;



      const last2Avg = (accuracies[accuracies.length - 2] + accuracies[accuracies.length - 1]) / 2;



      if (last2Avg - prev2Avg > 10) {



        insights.push({ type: "success", text: "Strong recent momentum. Keep it up!" });



      } else if (prev2Avg - last2Avg > 10) {



        insights.push({ type: "danger", text: "Recent drop in performance. Revisit fundamentals." });



      }



    }







    // Average accuracy insight



    const avg = accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length;



    if (avg >= 75) {



      insights.push({ type: "success", text: `Average accuracy: ${avg.toFixed(0)}%. Strong overall.` });



    } else if (avg >= 50) {



      insights.push({ type: "info", text: `Average accuracy: ${avg.toFixed(0)}%. Improving but needs work.` });



    } else {



      insights.push({ type: "warning", text: `Average accuracy: ${avg.toFixed(0)}%. Below threshold — prioritize weak topics.` });



    }







    // XP-based insights



    if (totalXP < 200) {



      insights.push({ type: "info", text: "Early learning stage. Complete more quizzes to level up." });



    } else if (level >= 5) {



      insights.push({ type: "success", text: "Advanced learner. Challenge yourself with hard difficulty." });



    } else if (level >= 3) {



      insights.push({ type: "info", text: "Good engagement. Try higher difficulty quizzes." });



    }







    // Stagnation index for status



    const growthDrop = first - last;



    const stagnationIndex = 0.5 * Math.max(0, growthDrop) + 0.3 * (3 - Math.min(3, Math.abs(slope)));







    if (stagnationIndex > 3) {



      setStatus("High Stagnation Risk");



    } else if (stagnationIndex > 1.5) {



      setStatus("Moderate Risk");



    } else {



      setStatus("Stable Learning Growth");



    }







    setLocalInsights(insights);



  }, [displayAttempts, totalXP, level]);







  // ---------------- AI INSIGHTS ENGINE ----------------



  useEffect(() => {



    if (attempts.length < 1 || hasFetchedInsights.current) return;



    hasFetchedInsights.current = true;







    const fetchInsights = async () => {



      setInsightsLoading(true);







      // Aggregate topic stats across all attempts



      const aggregatedTopics = {};



      attempts.forEach((a) => {



        if (!a.topics) return;



        Object.entries(a.topics).forEach(([topic, stats]) => {



          if (!aggregatedTopics[topic]) {



            aggregatedTopics[topic] = { correct: 0, total: 0 };



          }



          aggregatedTopics[topic].correct += stats.correct || 0;



          aggregatedTopics[topic].total += stats.total || 0;



        });



      });







      // Latest quiz as current, rest as previous



      const latest = attempts[attempts.length - 1];



      const previous = attempts.slice(0, -1).slice(-5).map((a) => ({



        overallScore: a.accuracy || 0



      }));







      try {



        const res = await fetch("http://localhost:5000/analyze-performance", {



          method: "POST",



          headers: { "Content-Type": "application/json" },



          body: JSON.stringify({



            currentQuiz: {



              overallScore: latest.accuracy || 0,



              difficulty: "medium",



              topics: aggregatedTopics



            },



            previousQuizzes: previous



          })



        });



        



        if (!res.ok) {



          throw new Error(`Backend server not available (${res.status})`);



        }



        



        const data = await res.json();



        setAiInsights(data);



      } catch (err) {



        // Silently handle backend unavailability - don't log errors for missing backend



        console.log("AI insights unavailable - backend server not running");



        setAiInsights({ error: "Backend unavailable" });



      }



      setInsightsLoading(false);



    };







    fetchInsights();



  }, [attempts]);







  const getRiskBadgeClass = (statusText) => {



    if (!statusText) return "badge badge-green";



    const lower = statusText.toLowerCase();



    if (lower.includes("high")) return "badge badge-red";



    if (lower.includes("moderate")) return "badge badge-yellow";



    return "badge badge-green";



  };







  const xpForNextLevel = (level) * 200;



  const xpProgress = Math.min((totalXP / xpForNextLevel) * 100, 100);







  const velocityPercent = velocity !== null && velocity !== "N/A"



    ? Math.min(Math.max((parseFloat(velocity) + 5) * 10, 0), 100)



    : 0;







  if (loading) {



    return (



      <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>



        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />



        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />



        <div className="layout-container page-transition">



          <div className="dashboard-grid">



            {[1, 2, 3].map((i) => (



              <div key={i} className="skeleton-card">



                <div className="skeleton skeleton-line short" />



                <div className="skeleton skeleton-line medium" />



                <div className="skeleton skeleton-line" />



              </div>



            ))}



          </div>



        </div>



      </div>



    );



  }







  return (



    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>



      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />



      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />







      <div className="layout-container page-transition">



        {/* Top action */}



        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>



          <button className="btn-primary" onClick={() => navigate("/quiz")}>



            Start Quiz



          </button>



          {(() => {



            const days = getActivityDays(attempts);



            const { currentStreak } = computeStreak(days);



            return currentStreak > 0 ? (



              <span className="streak-badge">



                🔥 {currentStreak} day{currentStreak !== 1 ? "s" : ""} streak



              </span>



            ) : null;



          })()}



        </div>







        {/* XP Card */}



        <div className="xp-card fade-in-section">



          <h3>Level {level}</h3>



          <p className="xp-label">{totalXP} / {xpForNextLevel} XP to next level</p>



          <div className="xp-track">



            <div className="xp-fill" style={{ width: `${xpProgress}%` }} />



          </div>



        </div>







        {/* Streak expiry warning */}



        {(() => {



          const days = getActivityDays(attempts);



          if (isStreakAboutToExpire(days) && computeStreak(days).currentStreak > 0) {



            return (



              <div className="card fade-in-section" style={{ borderLeft: '3px solid #f59e0b', marginBottom: '20px' }}>



                <p style={{ color: '#92400e', fontSize: '14px', margin: 0 }}>



                  ⚡ Take a quiz today to keep your streak alive.



                </p>



              </div>



            );



          }



          return null;



        })()}







        {/* Topic Filter */}



        <div className="card fade-in-section" style={{ marginBottom: '24px' }}>



          <h3 style={{ marginBottom: '12px' }}>Filter by Topic</h3>



          <select



            className="input-field"



            style={{ maxWidth: '300px' }}



            value={selectedTopic}



            onChange={(e) => setSelectedTopic(e.target.value)}



          >



            <option value="All">All Topics</option>



            {availableTopics.map((topic, index) => (



              <option key={index} value={topic}>{topic}</option>



            ))}



          </select>



          <p style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>



            Total Attempts: {displayAttempts.length}



          </p>



        </div>







        {displayAttempts.length === 0 && selectedTopic !== "All" && (



          <div className="card fade-in-section" style={{ marginBottom: '24px' }}>



            <p style={{ color: '#6b7280' }}>No attempts found for {selectedTopic}. Take a quiz on this topic to see analytics.</p>



          </div>



        )}







        {/* Local Analytics */}



        {velocity !== null && (



          <div className="fade-in-section" style={{ marginBottom: '24px' }}>



            <div className="dashboard-grid">



              {/* Learning Velocity Card */}



              <div className="stat-card">



                <p className="stat-card-label">Learning Velocity</p>



                <p className="stat-card-value">{velocity}</p>



                {velocity !== "N/A" && (



                  <div className="progress-bar-track" style={{ marginTop: '12px' }}>



                    <div className="progress-bar-fill" style={{ width: `${velocityPercent}%` }} />



                  </div>



                )}



              </div>







              {/* Status Badge Card */}



              <div className="stat-card">



                <p className="stat-card-label">Risk Status</p>



                <span className={getRiskBadgeClass(status)} style={{ marginTop: '4px' }}>



                  {status || "N/A"}



                </span>



              </div>



            </div>







            {/* Insights */}



            {localInsights.length > 0 && (



              <div className="card" style={{ marginBottom: '24px' }}>



                <h4 style={{ marginBottom: '12px' }}>Insights</h4>



                <div className="insight-list">



                  {localInsights.map((ins, i) => (



                    <div key={i} className={`insight-item ${ins.type}`}>



                      {ins.text}



                    </div>



                  ))}



                </div>



              </div>



            )}



          </div>



        )}







        {/* AI Insights */}



        {insightsLoading && (



          <div className="card fade-in-section" style={{ marginBottom: '24px' }}>



            <div className="skeleton skeleton-line" />



            <div className="skeleton skeleton-line medium" />



            <div className="skeleton skeleton-line short" />



          </div>



        )}







        {aiInsights && aiInsights.error && (



          <div className="card fade-in-section" style={{ borderLeft: '3px solid #f59e0b', marginBottom: '24px' }}>



            <h3 style={{ marginBottom: '8px' }}>AI Performance Analysis</h3>



            <p style={{ color: '#92400e', fontSize: '14px' }}>



              AI insights are currently unavailable. The backend server is not running.



              You can still use all other features including local analytics and performance tracking.



            </p>



          </div>



        )}







        {aiInsights && !aiInsights.error && (



          <div className="fade-in-section" style={{ marginBottom: '24px' }}>



            <h3 className="section-title">AI Performance Analysis</h3>







            <div className="card" style={{ marginBottom: '16px' }}>



              <h4 style={{ marginBottom: '8px' }}>Summary</h4>



              <p>{aiInsights.performanceSummary}</p>



            </div>







            <div className="dashboard-grid">



              <div className="stat-card">



                <p className="stat-card-label">AI Learning Velocity</p>



                <p style={{ fontWeight: 600 }}>{aiInsights.learningVelocity}</p>



              </div>



              <div className="stat-card">



                <p className="stat-card-label">Trend</p>



                <p style={{ fontWeight: 600 }}>{aiInsights.trendAnalysis}</p>



              </div>



              <div className="stat-card">



                <p className="stat-card-label">Risk Level</p>



                <span className={getRiskBadgeClass(aiInsights.riskLevel)}>



                  {aiInsights.riskLevel}



                </span>



              </div>



            </div>







            {aiInsights.weakTopics?.length > 0 && (



              <div className="card" style={{ marginBottom: '16px' }}>



                <h4 style={{ marginBottom: '10px' }}>Weak Topics</h4>



                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>



                  {aiInsights.weakTopics.map((t, i) => (



                    <span key={i} className="pill-tag pill-tag-red">{t}</span>



                  ))}



                </div>



              </div>



            )}







            {aiInsights.moderateTopics?.length > 0 && (



              <div className="card" style={{ marginBottom: '16px' }}>



                <h4 style={{ marginBottom: '10px' }}>Moderate Topics</h4>



                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>



                  {aiInsights.moderateTopics.map((t, i) => (



                    <span key={i} className="pill-tag pill-tag-indigo">{t}</span>



                  ))}



                </div>



              </div>



            )}







            {aiInsights.strongTopics?.length > 0 && (



              <div className="card" style={{ marginBottom: '16px' }}>



                <h4 style={{ marginBottom: '10px' }}>Strong Topics</h4>



                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>



                  {aiInsights.strongTopics.map((t, i) => (



                    <span key={i} className="badge badge-green">{t}</span>



                  ))}



                </div>



              </div>



            )}







            <div className="card" style={{ marginBottom: '16px' }}>



              <h4 style={{ marginBottom: '8px' }}>Recommended Difficulty</h4>



              <span className="badge badge-yellow">{aiInsights.recommendedDifficulty}</span>



            </div>







            {aiInsights.studyPlan && (



              <div className="card" style={{ marginBottom: '16px' }}>



                <StudyPlanWithLinks studyPlan={aiInsights.studyPlan} />



              </div>



            )}







            {aiInsights.improvementStrategies?.length > 0 && (



              <div className="card" style={{ marginBottom: '16px' }}>



                <h4 style={{ marginBottom: '10px' }}>Improvement Strategies</h4>



                <ol style={{ paddingLeft: '20px', lineHeight: 1.8, color: '#374151' }}>



                  {aiInsights.improvementStrategies.map((s, i) => <li key={i}>{s}</li>)}



                </ol>



              </div>



            )}







            {aiInsights.motivation && (



              <div className="card" style={{ background: '#EEF2FF', borderColor: '#c7d2fe', marginBottom: '16px' }}>



                <h4 style={{ marginBottom: '8px' }}>💡 Motivation</h4>



                <p style={{ fontStyle: 'italic' }}>{aiInsights.motivation}</p>



              </div>



            )}



          </div>



        )}







        {/* Chart */}



        {displayAttempts.length > 0 && (



          <div className="chart-card fade-in-section">



            <h3 style={{ marginBottom: '16px' }}>Accuracy Trend</h3>



            <div style={{ width: '100%', height: 300 }}>



              <ResponsiveContainer>



                <AreaChart data={displayAttempts}>



                  <defs>



                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">



                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />



                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />



                    </linearGradient>



                  </defs>



                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />



                  <XAxis dataKey="attempt" tick={{ fontSize: 13 }} />



                  <YAxis domain={[0, 100]} tick={{ fontSize: 13 }} />



                  <Tooltip />



                  <Area



                    type="monotone"



                    dataKey="accuracy"



                    stroke="#6366f1"



                    strokeWidth={3}



                    fill="url(#colorAccuracy)"



                    animationDuration={800}



                  />



                </AreaChart>



              </ResponsiveContainer>



            </div>



          </div>



        )}



      </div>







      {showPopup && suggestion && (



        <SuggestionPopup



          title={suggestion.title}



          message={suggestion.message}



          onClose={() => setShowPopup(false)}



        />



      )}



    </div>



  );



}







export default Dashboard;