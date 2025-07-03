import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateOrgModal from '../components/CreateOrgModal';
import COLORS from '../constants/Colors';
import Swal from 'sweetalert2';

function IAM() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("http://localhost:8080/orgs/get", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }

        const data = await response.json();
        setOrganizations(data); 
      } catch (error) {
        console.error("Error fetching orgs:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleCreateOrg = async ({ name, description }) => {
    try {
      const response = await fetch("http://localhost:8080/orgs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create organization");
      }

      const data = await response.json();
      setOrganizations(prev => Array.isArray(prev) ? [data, ...prev] : [data]);
      Swal.fire({
        title: "Success!",
        text: `Organization ${name} created successfully.`,
        icon: "success",
        background: COLORS.white,
        color: COLORS.text,
        confirmButtonColor: COLORS.primary,
        customClass: {
          popup: 'rounded-lg shadow-xl'
        }
      });
    } catch (error) {
      console.error("Error creating org:", error.message);
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        background: COLORS.white,
        color: COLORS.text,
        confirmButtonColor: COLORS.danger,
        customClass: {
          popup: 'rounded-lg shadow-xl'
        }
      });
    }
  };

  const handleViewOrg = (orgId) => {
    navigate(`/orgs/${orgId}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <div 
        className="max-w-7xl mx-auto p-6 rounded-lg shadow-sm"
        style={{ 
          backgroundColor: COLORS.white,
          border: `1px solid ${COLORS.border}`
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 
            className="text-2xl font-bold" 
            style={{ color: COLORS.text }}
          >
            Organizations
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ 
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Organization</span>
          </button>
        </div>

        {isLoading ? (
          <div 
            className="flex justify-center items-center py-16 border-t" 
            style={{ borderColor: COLORS.border }}
          >
            <div className="flex flex-col items-center">
              <div 
                className="w-12 h-12 border-4 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"
                style={{ 
                  borderTopColor: COLORS.primary,
                  borderRightColor: COLORS.primary 
                }}
              ></div>
              <span className="text-lg" style={{ color: COLORS.text }}>
                Loading organizations...
              </span>
            </div>
          </div>
        ) : !Array.isArray(organizations) || organizations?.length === 0 ? (
          <div 
            className="text-center py-16 border-t" 
            style={{ 
              borderColor: COLORS.border,
              color: COLORS.textSecondary
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mx-auto mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              style={{ color: COLORS.muted }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-lg mb-4">No organizations found yet</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-lg"
              style={{ 
                backgroundColor: COLORS.primary,
                color: COLORS.white
              }}
            >
              Create your first organization
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations?.map((org) => (
              <div
                key={org.id}
                className="p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ 
                  backgroundColor: COLORS.white,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
              >
                <h3 
                  className="text-xl font-semibold mb-3" 
                  style={{ color: COLORS.text }}
                >
                  {org.name}
                </h3>
                <p 
                  className="text-sm mb-5 line-clamp-3" 
                  style={{ color: COLORS.textSecondary }}
                >
                  {org.description || "No description provided."}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleViewOrg(org.id)}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: COLORS.backgroundSecondary,
                      color: COLORS.primary,
                      hoverBackground: `${COLORS.primary}10`
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateOrgModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateOrg}
        colors={COLORS}
      />
    </div>
  );
}

export default IAM;