import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import COLORS from '../constants/Colors';

const API_BASE_URL = 'http://localhost:8080';

const Protected = () => {
  const [user, setUser] = useState(null);
  const [identities, setIdentities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const showErrorAlert = (message = 'An unexpected error occurred') => {
    return Swal.fire({
      icon: 'error',
      title: 'Oops!',
      text: message,
      confirmButtonText: 'Okay',
      background: COLORS.primary,
      color: COLORS.text,
      confirmButtonColor: COLORS.danger,
    });
  };

  const fetchWithAuth = async (endpoint, options = {}) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include',
        ...options,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      console.error('Fetch error:', err);
      throw err;
    }
  };

  const fetchUserData = async () => {
    try {
      const userData = await fetchWithAuth('/protected', { method: 'GET' });
      setUser(userData.user);
      return userData.user;
    } catch (err) {
      await showErrorAlert('Unauthorized or forbidden access');
      navigate('/');
      return null;
    }
  };

  const fetchIdentities = async () => {
    try {
      const { data } = await fetchWithAuth('/api/admin/identities', { method: 'GET' });
      setIdentities(data);
    } catch (err) {
      setError('Failed to load user data');
      throw err;
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await fetchWithAuth('/api/admin/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });

      setIdentities(prev =>
        prev.map(i => (i.id === userId ? { ...i, role: newRole } : i))
      );

      Swal.fire({
        icon: 'success',
        title: 'Role Updated',
        text: `Role set to ${newRole}`,
        background: COLORS.primary,
        color: COLORS.text,
        confirmButtonColor: COLORS.success,
      });
    } catch (err) {
      console.error('Update role error:', err);
      await showErrorAlert('Could not update role');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const currentUser = await fetchUserData();
        if (currentUser) {await fetchIdentities();}
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error('Initialization error:', err);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-lg font-medium" style={{ color: COLORS.text }}>Loading your dashboard...</span>
      </div>
    </div>
  );
}


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
        <div className="text-center">
          <div className="text-2xl mb-2" style={{ color: COLORS.danger }}>{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md"
            style={{ 
              backgroundColor: COLORS.accent,
              color: 'white'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen font-sans" 
      style={{ 
        backgroundColor: COLORS.secondary,
        color: COLORS.text
      }}
    >
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            User Management
          </h2>
          <p style={{ color: COLORS.muted }}>
            Manage user roles and access privileges
          </p>
        </div>

        <section className="space-y-6">
          <div className="grid gap-4">
            {identities.map((identity) => (
              <UserCard
                key={identity.id}
                identity={identity}
                currentUserId={user?.id}
                onRoleUpdate={updateUserRole}
                colors={COLORS}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const UserCard = ({ identity, currentUserId, onRoleUpdate, colors }) => {
  const isCurrentUser = identity.id === currentUserId;
  const roleOptions = ['reader', 'writer', 'admin'];

  return (
    <div 
      className="p-6 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: colors.primary,
        border: `1px solid ${colors.border}`
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h4 className="text-lg font-semibold">
            {identity.traits?.name || 'Unnamed User'}
          </h4>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center">
              <span style={{ color: colors.muted }} className="mr-2">Email:</span>
              <span>{identity.traits?.email || 'N/A'}</span>
            </div>
            
            <div className="flex items-center">
              <span style={{ color: colors.muted }} className="mr-2">Status:</span>
              <span 
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: 
                    identity.role === 'admin' 
                      ? `${colors.accent}10` 
                      : identity.role === 'writer' 
                        ? '#3b82f610' 
                        : '#64748b10',
                  color: 
                    identity.role === 'admin' 
                      ? colors.accent 
                      : identity.role === 'writer' 
                        ? '#3b82f6' 
                        : colors.muted
                }}
              >
                {identity.role || 'undefined'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {roleOptions.map((role) => {
            const isActive = identity.role === role;
            
            return (
              <button
                key={role}
                onClick={() => onRoleUpdate(identity.id, role)}
                disabled={isActive || isCurrentUser}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'cursor-default'
                    : isCurrentUser 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:opacity-90'
                }`}
                style={{
                  backgroundColor: isActive 
                    ? colors.accent 
                    : `${colors.accent}05`,
                  color: isActive 
                    ? 'white'
                    : colors.accent,
                  border: isActive 
                    ? 'none'
                    : `1px solid ${colors.accent}30`
                }}
                aria-label={`Set role to ${role}`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Protected;