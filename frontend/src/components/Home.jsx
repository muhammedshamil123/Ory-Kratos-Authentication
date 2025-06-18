  import React, { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import Swal from 'sweetalert2';
  import CreateRepoModal from './CreateRepoModal';


  const KRATOS_PUBLIC_URL = 'http://localhost:4433';

  function Home() {
    const [user, setUser] = useState(null);

    const [repos, setRepos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const reposPerPage = 6;

    const navigate = useNavigate();
    useEffect(() => {
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

          const reposRes = await fetch('http://localhost:8080/github/repos', {
            credentials: 'include',
          });

          if (reposRes.ok) {
            const reposData = await reposRes.json();
            setRepos(reposData);
          }
        } catch (err) {
          console.error('Fetch error:', err);
          navigate('/login');
        }
      };

      fetchData();
    }, [navigate]);

    const handleLogout = async () => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out of your account.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Yes, logout',
        cancelButtonText: 'Cancel',
        background: '#1f2937',
        color: '#f3f4f6',
      });
      if (result.isConfirmed) {
        try {
          // const res = await fetch(`${KRATOS_PUBLIC_URL}/self-service/logout/browser`, {
          //   credentials: 'include',
          // });
          const res = await fetch("http://localhost:8080/logout", {
            method: "POST",
            credentials: "include",
          });
          const data = await res.json();
          if (data.logout_url) {
            window.location.href = data.logout_url;
          } else {
            console.error('URL not found!');
          }
        } catch (err) {
          console.error('Logout failed:', err);
        }
      }
      
    };
    const handleLogin = () => window.location.href = "http://localhost:8080/login/github";
    const handleProtected = () => navigate("/protected");

    const handleRepoCreate = async ({ name, description, private: isPrivate }) => {
      try {
        const res = await fetch("http://localhost:8080/github/repos", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, description, private: isPrivate })
        });

        const data = await res.json();

        if (res.ok) {
          Swal.fire("Success!", `Repository '${name}' created.`, "success");
          setRepos((prev) => [data, ...prev]);
        } else {
          throw new Error(data.message || "Failed to create repository.");
        }
      } catch (err) {
        console.error("Repo creation failed:", err);
        Swal.fire("Error", err.message, "error");
      }
    };



    if (!user) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-[#1e1e2f] text-gray-300">
          <span className="text-xl font-medium">Loading...</span>
        </div>
      );
    }
    const indexOfLastRepo = currentPage * reposPerPage;
    const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
    const currentRepos = repos.slice(indexOfFirstRepo, indexOfLastRepo);

    const totalPages = Math.ceil(repos.length / reposPerPage);
    const handleNext = () => {
      if (currentPage < totalPages) {
        setCurrentPage((prev) => prev + 1);
      }
    };

    const handlePrev = () => {
      if (currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    };
    return (
      <div className="min-h-screen bg-[#1e1e2f] text-gray-100">
        <nav className=" px-6 py-4 flex justify-between items-center shadow-lg">
          <h1 className="text-2xl font-semibold text-[#f0f0f5]">Ory Auth</h1>
          <button
            onClick={handleLogout}
            className="bg-[#ff4b5c] hover:bg-[#e03e4f] text-white px-4 py-2 rounded transition duration-300"
          >
            Logout
          </button>
        </nav>

        <main className="max-w-4xl mx-auto mt-12 p-8 bg-[#2b2b3c] rounded-lg shadow-md  ">
          <h2 className="text-3xl font-bold text-[#cdd9e5] mb-4">
            Welcome, {user.name}
          </h2>
          <p className="text-lg text-[#a0aec0]">You are successfully logged in.</p>
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={handleProtected}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-sm font-medium transition"
            >
              Admin Dashboard
            </button>
            {repos.length === 0 && (
              <button
                onClick={handleLogin}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-medium transition"
              >
                GitHub Login
              </button>
            )}
            {repos.length > 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm font-medium transition"
              >
                Create GitHub Repo
              </button>
            )}
          </div>
          {repos.length > 0 && (
            <div className="w-full max-w-screen-xl px-4 mt-12">
              <h2 className="text-2xl font-semibold mb-6 text-yellow-400 text-center">
                Your GitHub Repositories
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-700"
                  >
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-medium text-lg flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.26.82-.577v-2.234c-3.338.725-4.033-1.61-4.033-1.61-.546-1.385-1.333-1.754-1.333-1.754-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.238 1.84 1.238 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.303-5.467-1.334-5.467-5.93 0-1.31.47-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.404 1.02.004 2.04.137 3 .404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.12 3.176.77.84 1.236 1.91 1.236 3.22 0 4.61-2.807 5.624-5.48 5.92.43.37.823 1.103.823 2.222v3.293c0 .32.216.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.373-12-12-12z" />
                      </svg>
                      {repo.name}
                    </a>
                    {repo.description && (
                      <p className="text-sm text-gray-400 mt-1">{repo.description}</p>
                    )}
                  </div>
                ))}
              </div>
              {repos.length > reposPerPage && (
                <div className="flex justify-center mt-6 gap-4">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
          <CreateRepoModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreate={handleRepoCreate}
          />
        </main>
      </div>
    );
  }

  export default Home;
