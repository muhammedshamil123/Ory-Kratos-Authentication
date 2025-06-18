import React, { useEffect,useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Protected() {
    const [user, setUser] = useState(null);
    const [identities, setIdentities] = useState([]);
    const navigate = useNavigate();
    useEffect(()=>{
        const fetchData = async () => {
            try {
                const userRes = await fetch('http://localhost:8080/protected', {
                method: 'GET',
                credentials: 'include',
                });

                if (!userRes.ok) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Oops!',
                        text: 'Unauthorized or forbidden access.',
                        confirmButtonText: 'Okay',
                        background: '#1e1e2f',  
                        color: '#ffffff',        
                        confirmButtonColor: '#ff4b5c' 
                    });
                    navigate('/');
                }

                const userData = await userRes.json();
                setUser(userData.user.traits);
                const identitiesRes = await fetch('http://localhost:8080/api/admin/identities', {
                    method: 'GET',
                    credentials: 'include', 
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!identitiesRes.ok) {
                    throw new Error('Failed to fetch identities');
                }

                const identitiesData = await identitiesRes.json();
                setIdentities(identitiesData);
            } catch (err) {
                console.error('Fetch error:', err);
                navigate('/');
            }
        }
        fetchData();
    },[navigate]);
  return (
    <div className="min-h-screen bg-[#1e1e2f] text-gray-100">
         <nav className=" px-6 py-4 flex justify-between items-center shadow-lg">
            <h1 className="text-2xl font-semibold text-[#f0f0f5]">Admin Dashboard</h1>
        </nav>
        <main className="max-w-4xl mx-auto mt-12 p-8 bg-[#2b2b3c] rounded-lg shadow-md  ">
            <h2 className="text-3xl font-bold text-[#cdd9e5] mb-4">
            Welcome, {user?.name}
          </h2>
            <h2 className="text-xl font-bold mb-4">All Users</h2>
            <ul className="space-y-4">
                {identities.map(identity => (
                <li key={identity.id} className="p-4 bg-[#3c3c4d] rounded shadow">
                    <p><strong>Name:</strong> {identity.traits?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {identity.traits?.email || 'N/A'}</p>
                    <p><strong>Role:</strong> {identity.traits?.role || 'N/A'}</p>
                </li>
                ))}
            </ul>
        </main>
    </div>
  )
}

export default Protected