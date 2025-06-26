import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateOrgModal from '../components/CreateOrgModal';
import COLORS from '../constants/Colors';
import Swal from 'sweetalert2';

function Organization() {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("http://localhost:8080/orgs/get-all", {
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

  
  const handleViewOrg = (orgId) => {
    navigate(`/orgs/${orgId}`);
  };

  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-full h-full bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Organizations</h2>
          
        </div>

        {isLoading ? (
          <div className="text-gray-500 text-sm text-center py-10 border-t border-gray-100">
            Loading organizations...
          </div>
        ) : !Array.isArray(organizations) ||organizations?.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-10 border-t border-gray-100">
            No organizations found yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {organizations?.map((org) => (
            <div
              key={org.id}
              className="bg-white shadow-md rounded-lg p-5 border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{org.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{org.description || "No description provided."}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => handleViewOrg(org.id)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      
    </div>
  );
}

export default Organization;
