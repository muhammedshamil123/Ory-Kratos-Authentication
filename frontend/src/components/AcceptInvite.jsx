import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import COLORS from '../constants/Colors';

function AcceptInvite() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const inviteAccepted = useRef(false);

  useEffect(() => {
    if (inviteAccepted.current) return;
    inviteAccepted.current = true;

    const handleAccept = async () => {
      try {
        const res = await fetch(`http://localhost:8080/orgs/accept/${orgId}`, {
          method: 'GET', 
          credentials: 'include',
        });

        if (!res.ok) {
          let errorMessage = `Failed to accept invite (${res.status})`;
          try {
            const data = await res.json();
            errorMessage = data?.error || data?.message || errorMessage;
          } catch {
            errorMessage = `Failed to accept invite (${res.status}) - Unable to parse error response`;
          }
          throw new Error(errorMessage);
        }

        const data =await res.json();
        const successMessage = data?.message || 'Successfully joined the organization';

        Swal.fire({
          title: 'Welcome aboard! 🎉',
          text: successMessage,
          icon: 'success',
          background: COLORS.primary,
          color: COLORS.text,
        });

        navigate(`/orgs/${orgId}`);
      } catch (err) {
        Swal.fire({
          title: 'Invite Failed 😓',
          text: err?.message || 'An unexpected error occurred.',
          icon: 'error',
          background: COLORS.primary,
          color: COLORS.text,
        });
        navigate("/");
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
