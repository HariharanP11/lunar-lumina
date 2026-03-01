import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const buttonStyle = {
    backgroundColor: '#4a4a4a',
    color: 'white',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '15px',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 'bold'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
      <div style={{ backgroundColor: '#f0f0f0', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
        <h1>Welcome to Lunar Lumina</h1>
        <p>
          "Learners benefit because they no longer wait for failure to understand their progress.
          Our system detects stagnation early, provides personalized improvement suggestions, and helps them maintain continuous growth.
          This improves confidence, academic performance, and long-term career readiness."
        </p>
      </div>
      <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {user && (
          <Link to="/dashboard" style={buttonStyle}>Go to Dashboard</Link>
        )}
      </div>
    </div>
  );
}

export default Home;