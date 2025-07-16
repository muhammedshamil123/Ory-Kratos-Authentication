import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import COLORS from '../constants/Colors';
import { FiUser, FiMail, FiShield, FiLoader, FiAlertCircle } from 'react-icons/fi';

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
      background: COLORS.white,
      color: COLORS.text,
      confirmButtonColor: COLORS.danger,
      customClass: {
        popup: 'rounded-xl shadow-lg'
      } 
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
        background: COLORS.white,
        color: COLORS.text,
        confirmButtonColor: COLORS.primary,
        customClass: {
          popup: 'rounded-xl shadow-lg'
        }
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
        if (currentUser) { await fetchIdentities(); }
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <div className="flex flex-col items-center">
          <div 
            className="w-12 h-12 border-4 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"
            style={{ 
              borderTopColor: COLORS.primary,
              borderRightColor: COLORS.primary 
            }}
          ></div>
          <span className="text-lg font-medium" style={{ color: COLORS.text }}>
            Loading Admin Dashboard...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <div 
          className="max-w-md p-6 rounded-xl text-center"
          style={{ 
            backgroundColor: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}
        >
          <FiAlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.danger }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.danger }}>
            {error}
          </h3>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg font-medium mt-4"
            style={{ 
              backgroundColor: COLORS.primary,
              color: COLORS.white
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
      className="min-h-screen" 
      style={{ 
        backgroundColor: COLORS.background,
        color: COLORS.text
      }}
    >
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            User Management
          </h2>
          <p style={{ color: COLORS.textSecondary }}>
            Manage user roles and access privileges
          </p>
        </div>

        <section className="space-y-4">
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
      className="p-6 rounded-xl transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: colors.white,
        border: `1px solid ${colors.border}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-full"
              style={{
                backgroundColor: colors.primary,
                color: colors.white,
                fontWeight: 500
              }}
            >
              {identity.traits?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h4 className="text-lg font-semibold">
                {identity.traits?.name || 'Unnamed User'}
              </h4>
              <div className="flex items-center text-sm" style={{ color: colors.textSecondary }}>
                <FiMail className="mr-1" size={14} />
                <span>{identity.traits?.email || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center mr-2">
            <span 
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: 
                  identity.role === 'admin' 
                    ? `${colors.primary}10` 
                    : identity.role === 'writer' 
                      ? `${colors.accent}10` 
                      : `${colors.muted}10`,
                color: 
                  identity.role === 'admin' 
                    ? colors.primary 
                    : identity.role === 'writer' 
                      ? colors.accent 
                      : colors.muted
              }}
            >
              {identity.role || 'undefined'}
            </span>
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
                      ? colors.primary 
                      : `${colors.primary}05`,
                    color: isActive 
                      ? colors.white
                      : colors.primary,
                    border: isActive 
                      ? 'none'
                      : `1px solid ${colors.primary}20`
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
    </div>
  );
};

export default Protected;