import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Protected() {
  const [user, setUser] = useState(null);
  const [identities, setIdentities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
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
            confirmButtonColor: '#ff4b5c',
          });
          navigate('/');
          return;
        }

        const userData = await userRes.json();
        setUser(userData.user.traits);

        const identitiesRes = await fetch('http://localhost:8080/api/admin/identities', {
          method: 'GET',
          credentials: 'include',
        });

        if (!identitiesRes.ok) throw new Error('Failed to fetch identities');
        const identitiesData = await identitiesRes.json();
        setIdentities(identitiesData.data);
      } catch (err) {
        console.error('Fetch error:', err);
        navigate('/');
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1e1e2f] text-gray-100 font-sans">
      <nav className="px-8 py-5 shadow-md border-b border-[#2c2c3c]">
        <h1 className="text-3xl font-bold text-[#f0f0f5] tracking-tight">Admin Dashboard</h1>
      </nav>

      <main className="max-w-5xl mx-auto mt-12 p-10 bg-[#2b2b3c] rounded-xl shadow-lg">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#cdd9e5] mb-2">
            Welcome, <span className="text-[#50fa7b]">{user?.name || 'User'}</span>
          </h2>
          <p className="text-gray-400">You have administrator access. Manage users below:</p>
        </div>

        <section>
          <h3 className="text-2xl font-bold text-gray-200 mb-10 text-center border-b border-gray-600 pb-4">All Users</h3>
          <ul className="space-y-6">
            {identities.map((identity) => (
              <li
                key={identity.id}
                className="p-8 bg-[#3c3c4d] rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="space-y-2 leading-relaxed">
                  <p>
                    <span className="font-medium text-gray-300">Name:</span>{' '}
                    {identity.traits?.name || 'N/A'}
                  </p>
                  <p>
                    <span className="font-medium text-gray-300">Email:</span>{' '}
                    {identity.traits?.email || 'N/A'}
                  </p>
                  <p>
                    <span className="font-medium text-gray-300">Role:</span>{' '}
                    {identity.role || 'N/A'}
                  </p>
                </div>

                <div className="w-full md:w-auto">
                    <label htmlFor={`role-${identity.id}`} className="sr-only">
                        Select Role
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {['reader', 'writer', 'admin'].map((roleOption) => {
                            const isActive = identity.role?.[0] === roleOption;
                            return (
                            <button
                                key={roleOption}
                                onClick={async () => {
                                try {
                                    const res = await fetch('http://localhost:8080/api/admin/update-role', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    credentials: 'include',
                                    body: JSON.stringify({ user_id: identity.id, role: roleOption }),
                                    });

                                    if (!res.ok) throw new Error('Failed to update role');

                                    setIdentities((prev) =>
                                    prev.map((i) =>
                                        i.id === identity.id ? { ...i, role: [roleOption] } : i
                                    )
                                    );

                                    Swal.fire({
                                    icon: 'success',
                                    title: 'Role Updated',
                                    text: `Role set to ${roleOption}`,
                                    background: '#1e1e2f',
                                    color: '#ffffff',
                                    confirmButtonColor: '#50fa7b',
                                    });
                                } catch (err) {
                                    console.error(err);
                                    Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'Could not update role',
                                    background: '#1e1e2f',
                                    color: '#ffffff',
                                    confirmButtonColor: '#ff4b5c',
                                    });
                                }
                                }}
                                disabled={isActive}
                                className={`px-5 py-2 rounded-md text-base font-bold tracking-wide transition duration-150 ${
                                isActive
                                    ? 'bg-[#50fa7b] text-black'
                                    : 'bg-[#2b2b3c] text-gray-300 border border-gray-600 hover:bg-[#444455]'
                                }`}

                            >
                                {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                            </button>
                            );
                        })}
                    </div>

                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default Protected;
