import { useState, useEffect, useContext } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { buildLearningBehaviorProfileForUser } from "../services/learningProfileEngine";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function Profile() {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: ""
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setFormData({
              username: data.username || ""
            });
          }

          // Build or refresh learning behavior profile (logic only, no UI coupling)
          await buildLearningBehaviorProfileForUser(user.uid);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const trimmedUsername = (formData.username || "").trim();
      if (!trimmedUsername) {
        alert("Username cannot be empty.");
        return;
      }

      await updateDoc(doc(db, "users", user.uid), {
        username: trimmedUsername
      });
      
      setUserData({
        ...userData,
        username: trimmedUsername
      });
      
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div style={{ padding: "40px" }}>
          <h2>Loading profile...</h2>
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
    maxWidth: "800px",
    margin: "0 auto"
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    fontSize: '16px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    marginRight: '10px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6366f1',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6b7280',
    color: 'white'
  };

  return (
    <div style={containerStyle}>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div style={contentStyle}>
        <h1 style={{ marginBottom: '30px', color: '#1f2937' }}>Profile</h1>
        
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '20px', color: '#374151' }}>User Information</h2>
          
          {editMode ? (
            <div>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                style={inputStyle}
              />
              
              <div>
                <button onClick={handleUpdateProfile} style={primaryButtonStyle}>
                  Save Changes
                </button>
                <button onClick={() => setEditMode(false)} style={secondaryButtonStyle}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: '10px', fontSize: '16px' }}>
                <strong>Email:</strong> {user?.email}
              </p>
              <p style={{ marginBottom: '10px', fontSize: '16px' }}>
                <strong>Username:</strong> {userData?.username || 'Not set'}
              </p>
              <p style={{ marginBottom: '20px', fontSize: '16px' }}>
                <strong>Member Since:</strong> {userData?.createdAt?.toDate()?.toLocaleDateString() || 'Unknown'}
              </p>
              
              <button onClick={() => setEditMode(true)} style={primaryButtonStyle}>
                Edit Profile
              </button>
            </div>
          )}
        </div>
        
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '20px', color: '#374151' }}>Account Settings</h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Additional account settings and preferences will be available here in future updates.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
