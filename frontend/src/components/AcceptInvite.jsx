import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRef } from 'react';
import Swal from 'sweetalert2';
import COLORS from '../constants/Colors';
let inviteAccepted = false;
function AcceptInvite() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (inviteAccepted) return;
    inviteAccepted = true;

    const handleAccept = async () => {
      try {
        const res = await fetch(`http://localhost:8080/orgs/accept/${orgId}`, {
          method: 'GET', // or GET if your backend still requires it
          credentials: 'include',
        });

        console.log('Fetch status:', res.status);

        if (!res.ok) {
          let errorMessage = `Failed to accept invite (${res.status})`;
          try {
            const data = await res.json();
            errorMessage = data?.error || data?.message || errorMessage;
          } catch {
            // ignore if parsing fails
          }
          throw new Error(errorMessage);
        }

        const data = await res.json();
        const successMessage = data?.message || 'Successfully joined the organization';

        await Swal.fire({
          title: 'Welcome aboard! 🎉',
          text: successMessage,
          icon: 'success',
          background: COLORS.primary,
          color: COLORS.text,
        });

        navigate('/organization');
      } catch (err) {
        await Swal.fire({
          title: 'Invite Failed 😓',
          text: err?.message || 'An unexpected error occurred.',
          icon: 'error',
          background: COLORS.primary,
          color: COLORS.text,
        });
        navigate(-1);
      }
    };

    if (orgId) {
      handleAccept();
    }
  }, [orgId, navigate]);

  return (
    <div style={{
      color: COLORS.text,
      textAlign: 'center',
      paddingTop: '3rem',
      fontSize: '1.25rem',
    }}>
      Hang tight, we're accepting your invite...
    </div>
  );
}

export default AcceptInvite;
