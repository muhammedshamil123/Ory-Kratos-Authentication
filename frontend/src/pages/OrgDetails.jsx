import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import COLORS from '../constants/Colors';

const OrgDetails = () => {
  const { orgId } = useParams();
  const [org, setOrg] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    const fetchOrgDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/orgs/get/${orgId}`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch organization details');

        const data = await response.json();
        setOrg(data);
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
      const res = await fetch(`http://localhost:8080/orgs/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orgId, email: inviteEmail }) 
      });

      if (!res.ok) throw new Error('Failed to send invite');

      await Swal.fire('Invite Sent', `User invited to ${org.name}`, 'success');
      setInviteEmail('');
    } catch (err) {
      await Swal.fire('Error', err.message, 'error');
    }
  };

  if (isLoading) return <div className="text-center py-10">Loading organization details...</div>;
  if (!org) return <div className="text-center py-10 text-red-600">Organization not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{org.name}</h2>
      <p className="text-gray-600 mb-4">{org.description || 'No description provided.'}</p>

      <div className="mt-6">
        

        {showInvite?  (
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
                onClick={handleInvite}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Send Invite
              </button>
            </div>
          </div>
        ):(
            <button
            onClick={() => setShowInvite(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm mb-4"
            >
           ➕ Invite Member
            </button>
        )}
      </div>
    </div>
  );
};

export default OrgDetails;
