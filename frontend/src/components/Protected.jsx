import React, { useEffect,useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Protected() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    useEffect(()=>{
        const fetchData = async () => {
            try {
                const userRes = await fetch('http://localhost:8080/home', {
                method: 'GET',
                credentials: 'include',
                });

                if (!userRes.ok) {
                throw new Error('Unauthorized');
                }

                const userData = await userRes.json();
                setUser(userData.user.traits);
                if (user?.role !=='admin') {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Oops!',
                        text: 'Unauthorized or forbidden access.',
                        confirmButtonText: 'Okay',
                        background: '#1e1e2f',  // Dark background
                        color: '#ffffff',        // White text for better contrast
                        confirmButtonColor: '#ff4b5c' // Customize button color
                    });
                    navigate('/');
                }
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
            <h1 className="text-2xl font-semibold text-[#f0f0f5]">Ory Auth Protected</h1>
        </nav>
        <main className="max-w-4xl mx-auto mt-12 p-8 bg-[#2b2b3c] rounded-lg shadow-md  ">
            <h2 className="text-3xl font-bold text-[#cdd9e5] mb-4">
                Welcome {user?.role}, {user?.name}
            </h2>
        </main>
    </div>
  )
}

export default Protected