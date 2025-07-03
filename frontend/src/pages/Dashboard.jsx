import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import COLORS from '../constants/Colors';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch("http://localhost:8080/home", {
          method: "GET",
          credentials: "include"
        });

        if (!res.ok) {
          throw new Error(res.status === 401 ? "Unauthorized" : "Failed to fetch user data");
        }

        const data = await res.json();
        setUser(data.user?.traits || null);
        setRole(data.role || "");
      } catch (err) {
        console.error("User fetch error:", err);
        setError(err.message);
        navigate('/login', { state: { from: 'dashboard' } });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div 
        className="flex justify-center items-center min-h-screen" 
        style={{ backgroundColor: COLORS.backgroundSecondary }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4" 
            style={{ borderColor: COLORS.primary }}></div>
          <p 
            className="text-xl font-semibold" 
            style={{ color: COLORS.text }}
          >
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex justify-center items-center min-h-screen" 
        style={{ backgroundColor: COLORS.backgroundSecondary }}
      >
        <div 
          className="p-6 rounded-lg text-center max-w-md" 
          style={{ 
            backgroundColor: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}
        >
          <h3 
            className="text-xl font-semibold mb-2" 
            style={{ color: COLORS.danger }}
          >
            Error Loading Dashboard
          </h3>
          <p 
            className="mb-4" 
            style={{ color: COLORS.textSecondary }}
          >
            {error}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ 
              backgroundColor: COLORS.primary,
              color: COLORS.white
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col min-h-screen" 
      style={{ backgroundColor: COLORS.backgroundSecondary }}
    >
      <Navbar 
        toggleSidebar={toggleSidebar} 
        user={user} 
        role={role} 
        sidebarOpen={sidebarOpen}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar} 
          user={user}
          role={role}
        />
        
        <main 
          className={`flex-1 p-4 md:p-6 transition-all duration-300 ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}
          style={{ 
            backgroundColor: COLORS.background,
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <Outlet context={{ user, role }} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;