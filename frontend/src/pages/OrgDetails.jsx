import React, { useEffect, useState } from 'react';
import { useParams,useOutletContext } from 'react-router-dom';
import Swal from 'sweetalert2';
import COLORS from '../constants/Colors';

const OrgDetails = () => {
  const { orgId } = useParams();
  const [org, setOrg] = useState(null);
  const [role, setRole] = useState("");
  const [user, setUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

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

  useEffect(() => {
    const fetchOrgDetails = async () => {
      try {
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
        await Swal.fire('Error', error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgDetails();
  }, [orgId]);

  const handleInvite = async () => {
    setShowInvite(false);
    if (!inviteEmail) return;
    
    try {
      const res = await fetch(`http://localhost:8080/orgs/invite/${orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ org_id:orgId,org_name:org.name, email: inviteEmail,description: org.description }), 
      });
      console.log(res);
      const reposData = await res.json();
      console.log(reposData);
      if (!res.ok) throw new Error(reposData.error || 'Failed to send invite');

      await Swal.fire('Invite Sent', `User invited to ${org.name}`, 'success');
      setInviteEmail('');
    } catch (err) {
      await Swal.fire('Error', err.message, 'error');
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

  if (isLoading) return <div className="text-center py-10">Loading organization details...</div>;
  if (!org) return <div className="text-center py-10 text-red-600">Organization not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200 ">
      <div className='flex justify-between items-start'>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{org.name}</h2>
        </div>
        

        <div className="mt-6">
          

          {!showInvite && role!=="reader" &&(
              <button
              onClick={() => setShowInvite(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm mb-4"
              >
            ➕ Invite Member
              </button>
          )}
        </div>
      </div>
      <div>
        <p className="text-gray-600 mb-4">{org.description || 'No description provided.'}</p>
        {showInvite &&  (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Invite Member</h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter user email"
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowInvite(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Cancel
              </button><button
                onClick={handleInvite}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Send Invite
              </button>
            </div>
          </div>
        )}
        <section className="space-y-6">
          {!Array.isArray(org.Users)||org.Users?.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-10 border-t border-gray-100">
              No members found in this organization.
            </div>
          ):(
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
const UserCard = ({ identity, currentUserId, onRoleUpdate, colors,role }) => {
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
            {identity?.name || 'Unnamed User'}
          </h4>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center">
              <span style={{ color: colors.muted }} className="mr-2">Email:</span>
              <span>{identity?.email || 'N/A'}</span>
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

        {role=="admin" && <div className="flex flex-wrap gap-2">
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
        </div>}
      </div>
    </div>
  );
};

export default OrgDetails;
