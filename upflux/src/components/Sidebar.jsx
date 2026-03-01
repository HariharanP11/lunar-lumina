import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    right: isOpen ? 0 : '-300px',
    width: '300px',
    height: '100vh',
    backgroundColor: 'white',
    boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
    transition: 'right 0.3s ease-in-out',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    display: isOpen ? 'block' : 'none'
  };

  const menuItemStyle = {
    padding: '15px 20px',
    borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '16px',
    fontWeight: '500'
  };

  const logoutStyle = {
    ...menuItemStyle,
    color: '#dc2626',
    borderTop: '2px solid #e5e7eb',
    marginTop: 'auto'
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div style={overlayStyle} onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{
          padding: '20px',
          borderBottom: '2px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{ margin: 0, color: '#1f2937' }}>Menu</h3>
        </div>
        
        <div
          style={menuItemStyle}
          onClick={() => handleNavigation('/dashboard')}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          📊 Dashboard
        </div>
        
        <div
          style={menuItemStyle}
          onClick={() => handleNavigation('/profile')}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          👤 Profile
        </div>
        
        <div
          style={menuItemStyle}
          onClick={() => handleNavigation('/quiz')}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          📝 Quiz
        </div>

        <div
          style={menuItemStyle}
          onClick={() => handleNavigation('/history')}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          📜 History
        </div>

        <div
          style={menuItemStyle}
          onClick={() => handleNavigation('/performance')}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          📈 Performance
        </div>

        <div
          style={menuItemStyle}
          onClick={() => handleNavigation('/leaderboard')}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          🏆 Leaderboard
        </div>

        <div
          style={menuItemStyle}
          onClick={() => handleNavigation('/ai-tutor')}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          🤖 AI Tutor
        </div>

        <div
          style={logoutStyle}
          onClick={handleLogout}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          🚪 Logout
        </div>
      </div>
    </>
  );
}

export default Sidebar;
