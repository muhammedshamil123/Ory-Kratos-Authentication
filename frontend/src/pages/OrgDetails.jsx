import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import COLORS from '../constants/Colors';
import { FiArrowLeft, FiUser, FiMail, FiShield, FiPlus, FiX, FiSend } from 'react-icons/fi';

const OrgDetails = () => {
  const { orgId } = useParams();
  const [org, setOrg] = useState(null);
  const [role, setRole] = useState("");
  const [user, setUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

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

  useEffect(() => {
    const fetchOrgDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8080/orgs/get/${orgId}`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch organization details');

        const data = await response.json();
        setOrg(data.org);
        setRole(data.role);
        setUser(data.user);
      } catch (error) {
        console.error('Error:', error);
        await showErrorAlert(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgDetails();
  }, [orgId]);

  const handleInvite = async () => {
    if (!inviteEmail) {
      await showErrorAlert('Please enter an email address');
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8080/orgs/invite/${orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          org_id: orgId,
          org_name: org.name, 
          email: inviteEmail,
          description: org.description 
        }), 
      });

      const reposData = await res.json();
      if (!res.ok) throw new Error(reposData.error || 'Failed to send invite');

      await Swal.fire({
        title: 'Invite Sent',
        text: `User invited to ${org.name}`,
        icon: 'success',
        background: COLORS.white,
        color: COLORS.text,
        confirmButtonColor: COLORS.primary,
        customClass: {
          popup: 'rounded-xl shadow-lg'
        }
      });
      setInviteEmail('');
      setShowInvite(false);
    } catch (err) {
      await showErrorAlert(err.message);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`http://localhost:8080/orgs/update-role/${orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');

      setOrg(prev => ({
        ...prev,
        Users: prev.Users.map(u =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      }));

      await Swal.fire({
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: COLORS.background }}>
        <div className="flex flex-col items-center">
          <div 
            className="w-12 h-12 border-4 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"
            style={{ 
              borderTopColor: COLORS.primary,
              borderRightColor: COLORS.primary 
            }}
          ></div>
          <span className="text-lg" style={{ color: COLORS.text }}>
            Loading organization details...
          </span>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: COLORS.background }}>
        <div 
          className="max-w-md p-6 rounded-xl text-center"
          style={{ 
            backgroundColor: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}
        >
          <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.danger }}>
            Organization not found
          </h3>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 rounded-lg font-medium mt-4"
            style={{ 
              backgroundColor: COLORS.primary,
              color: COLORS.white
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6" 
      style={{ 
        backgroundColor: COLORS.background,
        color: COLORS.text
      }}
    >
      <div 
        className="max-w-4xl mx-auto p-6 rounded-xl shadow-sm"
        style={{ 
          backgroundColor: COLORS.white,
          border: `1px solid ${COLORS.border}`
        }}
      >
        <div className='flex justify-between items-start mb-6'>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              style={{ color: COLORS.text }}
              aria-label="Go back"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold" style={{ color: COLORS.text }}>
              {org.name}
            </h2>
          </div>
          
          {!showInvite && role !== "reader" && (
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:opacity-90"
              style={{ 
                backgroundColor: COLORS.primary,
                color: COLORS.white
              }}
            >
              <FiPlus className="w-5 h-5" />
              <span>Invite Member</span>
            </button>
          )}
        </div>

        <p className="text-gray-600 mb-8" style={{ color: COLORS.textSecondary }}>
          {org.description || 'No description provided.'}
        </p>

        {showInvite && (
          <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: COLORS.backgroundSecondary }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: COLORS.text }}>
              Invite Member
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter user email"
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: COLORS.border,
                  focusRingColor: COLORS.primary
                }}
              />
              <button
                onClick={() => setShowInvite(false)}
                className="flex items-center px-4 py-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: COLORS.dangerLight,
                  color: COLORS.danger,
                  hoverBackground: `${COLORS.danger}20`
                }}
              >
                <FiX className="mr-1" />
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="flex items-center px-4 py-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                  hoverBackground: COLORS.primaryDark
                }}
              >
                <FiSend className="mr-1" />
                Send
              </button>
            </div>
          </div>
        )}

        <section className="space-y-4">
          {!Array.isArray(org.Users) || org.Users?.length === 0 ? (
            <div 
              className="text-center py-10 border-t rounded-lg"
              style={{ 
                borderColor: COLORS.border,
                color: COLORS.textSecondary
              }}
            >
              <FiUser className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.muted }} />
              <p className="text-lg">No members found in this organization</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {org.Users?.map((identity) => (
                <UserCard
                  key={identity.id}
                  identity={identity}
                  currentUserId={user?.id}
                  onRoleUpdate={updateUserRole}
                  colors={COLORS}
                  role={role}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const UserCard = ({ identity, currentUserId, onRoleUpdate, colors, role }) => {
  const isCurrentUser = identity.id === currentUserId;
  const roleOptions = ['reader', 'writer', 'admin'];

  return (
    <div 
      className="p-6 rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{ 
        backgroundColor: colors.white,
        border: `1px solid ${colors.border}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div 
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{
              backgroundColor: colors.primary,
              color: colors.white,
              fontWeight: 500
            }}
          >
            {identity?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h4 className="text-lg font-semibold" style={{ color: colors.text }}>
              {identity?.name || 'Unnamed User'}
            </h4>
            <div className="flex items-center text-sm" style={{ color: colors.textSecondary }}>
              <FiMail className="mr-1" size={14} />
              <span>{identity?.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FiShield className="mr-1" style={{ color: colors.textSecondary }} />
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

          {role === "admin" && (
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((option) => {
                const isActive = identity.role === option;
                return (
                  <button
                    key={option}
                    onClick={() => onRoleUpdate(identity.id, option)}
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
                    aria-label={`Set role to ${option}`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgDetails;