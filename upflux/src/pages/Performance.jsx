import { useState, useEffect, useContext } from "react";

import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

import { db } from "../services/firebase";

import { AuthContext } from "../context/AuthContext";

import Header from "../components/Header";

import Sidebar from "../components/Sidebar";

import { studyCurriculum, topicToCategory } from "../data/studyCurriculum";

import {

  LineChart,

  Line,

  XAxis,

  YAxis,

  CartesianGrid,

  Tooltip,

  ResponsiveContainer,

  BarChart,

  Bar

} from "recharts";



function Performance() {

  const { user } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [attempts, setAttempts] = useState([]);

  const [loading, setLoading] = useState(true);



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

          score: doc.data().score || 0,

          total: doc.data().total || 0,

          xp: doc.data().xp || 0,

          topics: doc.data().topics || {},

          date: doc.data().createdAt?.toDate()?.toLocaleDateString() || `Attempt ${index + 1}`,

          ...doc.data()

        }));



        setAttempts(data);

        setLoading(false);

      } catch (err) {

        console.error("Error fetching attempts:", err);

        setLoading(false);

      }

    };



    fetchAttempts();

  }, [user]);



  // Calculate topic-wise performance

  const topicPerformance = attempts.reduce((acc, attempt) => {

    if (attempt.topics) {

      Object.entries(attempt.topics).forEach(([topic, stats]) => {

        if (!acc[topic]) {

          acc[topic] = { correct: 0, total: 0, attempts: 0 };

        }

        acc[topic].correct += stats.correct || 0;

        acc[topic].total += stats.total || 0;

        acc[topic].attempts += 1;

      });

    }

    return acc;

  }, {});



  const topicData = Object.entries(topicPerformance).map(([topic, stats]) => ({

    topic,

    accuracy: ((stats.correct / stats.total) * 100).toFixed(1),

    totalQuestions: stats.total,

    attempts: stats.attempts

  })).sort((a, b) => b.accuracy - a.accuracy);



  const weakTopics = topicData.filter((t) => parseFloat(t.accuracy) < 70);

  const weakTopicStudyPlan = weakTopics.flatMap((wt) => {

    const categoryId = topicToCategory[wt.topic];

    if (!categoryId) return [];

    const section = studyCurriculum.find((s) => s.id === categoryId);

    if (!section) return [];

    return section.topics.map((t) => ({ ...t, weakTopic: wt.topic }));

  });



  if (loading) {

    return (

      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>

        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div style={{ padding: "40px" }}>

          <h2>Loading performance data...</h2>

        </div>

      </div>

    );

  }



  const containerStyle = {

    minHeight: '100vh',

    backgroundColor: '#f9fafb'

  };



  const contentStyle = {

    padding: "40px",

    maxWidth: "1200px",

    margin: "0 auto"

  };



  const cardStyle = {

    backgroundColor: 'white',

    padding: '30px',

    borderRadius: '10px',

    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',

    marginBottom: '30px'

  };



  const statsGrid = {

    display: 'grid',

    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',

    gap: '20px',

    marginBottom: '30px'

  };



  const statCardStyle = {

    backgroundColor: '#f8fafc',

    padding: '20px',

    borderRadius: '8px',

    border: '1px solid #e2e8f0',

    textAlign: 'center'

  };



  const totalXP = attempts.reduce((sum, attempt) => sum + (attempt.xp || 0), 0);

  const avgAccuracy = attempts.length > 0 

    ? (attempts.reduce((sum, attempt) => sum + attempt.accuracy, 0) / attempts.length).toFixed(1)

    : 0;



  return (

    <div style={containerStyle}>

      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      

      <div style={contentStyle}>

        <h1 style={{ marginBottom: '30px', color: '#1f2937' }}>Performance Analytics</h1>

        

        {/* Stats Overview */}

        <div style={statsGrid}>

          <div style={statCardStyle}>

            <h3 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Total Attempts</h3>

            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>

              {attempts.length}

            </p>

          </div>

          

          <div style={statCardStyle}>

            <h3 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Average Accuracy</h3>

            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>

              {avgAccuracy}%

            </p>

          </div>

          

          <div style={statCardStyle}>

            <h3 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Total XP</h3>

            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>

              {totalXP}

            </p>

          </div>

          

          <div style={statCardStyle}>

            <h3 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Topics Covered</h3>

            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>

              {topicData.length}

            </p>

          </div>

        </div>



        {/* Performance Over Time */}

        {attempts.length > 0 && (

          <div style={cardStyle}>

            <h2 style={{ marginBottom: '20px', color: '#374151' }}>Performance Over Time</h2>

            <div style={{ width: '100%', height: 300 }}>

              <ResponsiveContainer>

                <LineChart data={attempts}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="attempt" />

                  <YAxis domain={[0, 100]} />

                  <Tooltip />

                  <Line

                    type="monotone"

                    dataKey="accuracy"

                    stroke="#6366f1"

                    strokeWidth={3}

                    name="Accuracy %"

                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

        )}



        {/* Topic-wise Performance */}

        {topicData.length > 0 && (

          <div style={cardStyle}>

            <h2 style={{ marginBottom: '20px', color: '#374151' }}>Topic-wise Performance</h2>

            <div style={{ width: '100%', height: 300 }}>

              <ResponsiveContainer>

                <BarChart data={topicData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="topic" />

                  <YAxis domain={[0, 100]} />

                  <Tooltip />

                  <Bar dataKey="accuracy" fill="#10b981" name="Accuracy %" />

                </BarChart>

              </ResponsiveContainer>

            </div>

            

            {/* Topic Details Table */}

            <div style={{ marginTop: '30px' }}>

              <h3 style={{ marginBottom: '15px', color: '#374151' }}>Topic Details</h3>

              <div style={{ overflowX: 'auto' }}>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>

                  <thead>

                    <tr style={{ backgroundColor: '#f8fafc' }}>

                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Topic</th>

                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>Accuracy</th>

                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>Questions</th>

                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>Attempts</th>

                    </tr>

                  </thead>

                  <tbody>

                    {topicData.map((topic) => (

                      <tr key={topic.topic} style={{ borderBottom: '1px solid #e2e8f0' }}>

                        <td style={{ padding: '12px', fontWeight: '500' }}>{topic.topic}</td>

                        <td style={{ padding: '12px', textAlign: 'center' }}>

                          <span style={{

                            backgroundColor: topic.accuracy >= 75 ? '#dcfce7' : 

                                           topic.accuracy >= 50 ? '#fef3c7' : '#fee2e2',

                            padding: '4px 8px',

                            borderRadius: '4px',

                            fontSize: '14px'

                          }}>

                            {topic.accuracy}%

                          </span>

                        </td>

                        <td style={{ padding: '12px', textAlign: 'center' }}>{topic.totalQuestions}</td>

                        <td style={{ padding: '12px', textAlign: 'center' }}>{topic.attempts}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}



        {weakTopics.length > 0 && weakTopicStudyPlan.length > 0 && (

          <div style={{ ...cardStyle, borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb' }}>

            <h2 style={{ marginBottom: '12px', color: '#92400e' }}>📚 Suggested Study Plan (Weak Topics)</h2>

            <p style={{ color: '#b45309', marginBottom: '20px', fontSize: '14px' }}>

              Focus on these resources for topics where you scored below 70%: {weakTopics.map((t) => t.topic).join(", ")}

            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

              {weakTopicStudyPlan.map((item, idx) => (

                <div

                  key={idx}

                  style={{

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'space-between',

                    padding: '12px 16px',

                    backgroundColor: '#fff',

                    borderRadius: '8px',

                    border: '1px solid #fde68a',

                  }}

                >

                  <div>

                    <span style={{ fontWeight: 600, color: '#1f2937' }}>{item.name}</span>

                    <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>

                      (for {item.weakTopic})

                    </span>

                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{item.description}</div>

                  </div>

                  <a

                    href={item.url}

                    target="_blank"

                    rel="noopener noreferrer"

                    style={{

                      padding: '8px 16px',

                      backgroundColor: '#f59e0b',

                      color: '#fff',

                      borderRadius: '6px',

                      textDecoration: 'none',

                      fontWeight: 600,

                      fontSize: '13px',

                      flexShrink: 0,

                    }}

                  >

                    Study →

                  </a>

                </div>

              ))}

            </div>

          </div>

        )}



        {attempts.length === 0 && (

          <div style={cardStyle}>

            <h2 style={{ marginBottom: '20px', color: '#374151' }}>No Performance Data</h2>

            <p style={{ color: '#6b7280', marginBottom: '20px' }}>

              You haven't taken any quizzes yet. Start taking quizzes to see your performance analytics here.

            </p>

            <button

              onClick={() => window.location.href = '/quiz'}

              style={{

                padding: '10px 20px',

                backgroundColor: '#6366f1',

                color: 'white',

                border: 'none',

                borderRadius: '5px',

                cursor: 'pointer',

                fontSize: '14px',

                fontWeight: 'bold'

              }}

            >

              Take Your First Quiz

            </button>

          </div>

        )}

      </div>

    </div>

  );

}



export default Performance;

