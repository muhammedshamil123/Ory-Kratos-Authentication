import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2';
import COLORS from '../constants/Colors';

function AcceptInvite() {
    const { orgId } = useParams();
    const navigate =useNavigate();
    useEffect(() => {
        const handleAccept = async () => {
            try{
                const res = await fetch(`http://localhost:8080/orgs/accept/${orgId}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Invite not found or already accepted');
                await Swal.fire({
                    title: 'Welcome aboard!',
                    text: `You've successfully joined.`,
                    icon: 'success',
                    background: COLORS.primary,
                    color: COLORS.text,
                });

                navigate('/organization');

            }catch (err) {
                await Swal.fire({
                    title: 'Error',
                    text: err.message || 'An unexpected error occurred',
                    icon: 'error',
                    background: COLORS.primary,
                    color: COLORS.text,
                });
                navigate('/');
            }
        }
        handleAccept();
    },[orgId,navigate]);
  return (
    <div></div>
  )
}

export default AcceptInvite