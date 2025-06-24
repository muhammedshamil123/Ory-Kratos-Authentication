import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateRepoModal from './CreateRepoModal';
import COLORS from '../constants/Colors';

const Home = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [repos, setRepos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const reposPerPage = 6;
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [userRes, reposRes] = await Promise.all([
          fetch('http://localhost:8080/home', {
            method: 'GET',
            credentials: 'include',
          }),
          fetch('http://localhost:8080/github/repos', {
            credentials: 'include',
          })
        ]);

        if (!userRes.ok) throw new Error('Unauthorized');

        const userData = await userRes.json();
        setUser(userData.user.traits);
        setRole(userData.role);

        if (reposRes.ok) {
          const reposData = await reposRes.json();
          setRepos(reposData);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  
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
          await Swal.fire({
            title: "Success!",
            text: `Repository ${name} created successfully.`,
            icon: "success",
            background: COLORS.primary,
            color: COLORS.text,
            confirmButtonColor: COLORS.success
          });
          setRepos(prev => [data, ...prev]);
        } else {
          throw new Error(data.message || "Failed to create repository.");
        }
      } catch (err) {
        await Swal.fire({
          title: "Error",
          text: err.message,
          icon: "error",
          background: COLORS.primary,
          color: COLORS.text,
          confirmButtonColor: COLORS.danger
        });
      }
    };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-lg font-medium" style={{ color: COLORS.text }}>Loading your dashboard...</span>
        </div>
      </div>
    );
  }
  


  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = repos.slice(indexOfFirstRepo, indexOfLastRepo);
  const totalPages = Math.ceil(repos.length / reposPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.primary }}>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
         <section className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: COLORS.text }}>
            Welcome, <span style={{ color: COLORS.accent }}>{user?.name}</span>
          </h2>
          <p className="text-lg" style={{ color: COLORS.muted }}>
            {repos.length > 0 ?  `You have ${repos.length} repositories` :'Connect your GitHub account to get started'}
          </p>
         </section>
         <div className="flex flex-wrap justify-center gap-4 mb-12">
            {repos.length === 0 && (
              <button
                onClick={() => window.location.href = "http://localhost:8080/login/github"}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl transition-all hover:opacity-90"
                style={{ 
                  backgroundColor: '#24292e',
                  color: 'white'
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.26.82-.577v-2.234c-3.338.725-4.033-1.61-4.033-1.61-.546-1.385-1.333-1.754-1.333-1.754-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.238 1.84 1.238 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.303-5.467-1.334-5.467-5.93 0-1.31.47-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.404 1.02.004 2.04.137 3 .404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.12 3.176.77.84 1.236 1.91 1.236 3.22 0 4.61-2.807 5.624-5.48 5.92.43.37.823 1.103.823 2.222v3.293c0 .32.216.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.373-12-12-12z" />
                </svg>
                <span>Connect GitHub</span>
              </button>
            )}

            {repos.length > 0 && role !== "reader" && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl transition-all hover:opacity-90"
                style={{ 
                  backgroundColor: COLORS.success,
                  color: 'white'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Repository</span>
              </button>
            )}
          </div>
          {repos.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: COLORS.text }}>
                Your GitHub Repositories
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {currentRepos.map((repo) => (
                    <div
                  key={repo.id}
                  className="group p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ 
                    backgroundColor: COLORS.secondary,
                    border: `1px solid ${COLORS.border}`
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-2 group-hover:text-cyan-400 transition-colors"
                      style={{ color: COLORS.accent }}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.26.82-.577v-2.234c-3.338.725-4.033-1.61-4.033-1.61-.546-1.385-1.333-1.754-1.333-1.754-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.238 1.84 1.238 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.303-5.467-1.334-5.467-5.93 0-1.31.47-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.404 1.02.004 2.04.137 3 .404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.12 3.176.77.84 1.236 1.91 1.236 3.22 0 4.61-2.807 5.624-5.48 5.92.43.37.823 1.103.823 2.222v3.293c0 .32.216.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.373-12-12-12z" />
                      </svg>
                      <span className="font-semibold truncate max-w-[160px]">{repo.name}</span>
                    </a>
                    {repo.private ? (
                      <span className="text-xs px-2 py-1 rounded-full" style={{ 
                        backgroundColor: COLORS.highlight, 
                        color: COLORS.accent 
                      }}>
                        Private
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full" style={{ 
                        backgroundColor: '#10b98120', 
                        color: COLORS.success 
                      }}>
                        Public
                      </span>
                    )}
                  </div>
                  
                  {repo.description && (
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: COLORS.muted }}>
                      {repo.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center text-xs" style={{ color: COLORS.muted }}>
                    <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                    <span>{repo.language || 'Code'}</span>
                  </div>
                </div>
                  ))}
              </div>
              {repos.length > reposPerPage && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md disabled:opacity-50"
                    style={{ 
                      color: currentPage === 1 ? COLORS.muted : COLORS.text,
                      backgroundColor: currentPage === 1 ? 'transparent' : COLORS.highlight
                    }}
                  >
                    «
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md disabled:opacity-50"
                    style={{ 
                      color: currentPage === 1 ? COLORS.muted : COLORS.text,
                      backgroundColor: currentPage === 1 ? 'transparent' : COLORS.highlight
                    }}
                  >
                    ‹
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`w-8 h-8 rounded-full text-sm font-medium ${currentPage === pageNum ? 'bg-cyan-400 text-gray-900' : 'hover:bg-gray-700'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md disabled:opacity-50"
                    style={{ 
                      color: currentPage === totalPages ? COLORS.muted : COLORS.text,
                      backgroundColor: currentPage === totalPages ? 'transparent' : COLORS.highlight
                    }}
                  >
                    ›
                  </button>
                  
                  <button
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md disabled:opacity-50"
                    style={{ 
                      color: currentPage === totalPages ? COLORS.muted : COLORS.text,
                      backgroundColor: currentPage === totalPages ? 'transparent' : COLORS.highlight
                    }}
                  >
                    »
                  </button>
                </nav>
              </div>
            )}
            </section>
          )}
      </main>
      <CreateRepoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleRepoCreate}
        colors={COLORS}
      />
    </div>
  );
};

export default Home;
