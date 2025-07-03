import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import COLORS from '../constants/Colors';
import Swal from 'sweetalert2';

const Sidebar = ({ isOpen, toggleSidebar, user, role }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { isConfirmed } = await Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      background: COLORS.white,
      color: COLORS.text,
      showCancelButton: true,
      confirmButtonColor: COLORS.primary,
      cancelButtonColor: COLORS.danger,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'shadow-lg rounded-xl'
      }
    });

    if (isConfirmed) {
      try {
        const res = await fetch('http://localhost:8080/logout', {
          method: 'POST',
          credentials: 'include',
        });
        const data = await res.json();
        if (data.logout_url) {
          window.location.href = data.logout_url;
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Logout failed:', err);
        Swal.fire({
          title: 'Logout Error',
          text: 'Failed to logout. Please try again.',
          icon: 'error',
          confirmButtonColor: COLORS.primary
        });
      }
    }
  };

  // Define menu items based on user role
  const menuItems = [
    { path: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/iam', label: 'IAM', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { path: '/organization', label: 'Organization', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ];

  // Add admin-only routes if user has admin role
  if (role === 'admin') {
    menuItems.push(
      { path: '/protected', label: 'Admin Dashboard', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' }
    );
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        style={{ 
          backgroundColor: COLORS.white,
          borderRight: `1px solid ${COLORS.border}`
        }}
        className={`fixed top-0 left-0 z-50 w-64 h-full flex flex-col transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: COLORS.text }}>
              Menu
            </h2>
            <button
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              style={{ color: COLORS.text }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-4 flex items-center space-x-3 border-b" style={{ borderColor: COLORS.border }}>
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-full"
              style={{
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                fontWeight: 500
              }}
            >
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium" style={{ color: COLORS.text }}>
                {user.name || 'User'}
              </p>
              <p className="text-xs" style={{ color: COLORS.muted }}>
                {role}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={toggleSidebar}
                  className="flex items-center p-3 rounded-md transition-colors hover:bg-gray-50"
                  style={{ 
                    color: COLORS.text,
                    hoverBackground: COLORS.backgroundSecondary
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t" style={{ borderColor: COLORS.border }}>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-2 rounded-md transition-colors"
            style={{
              backgroundColor: COLORS.dangerLight,
              color: COLORS.danger,
              hoverBackground: `${COLORS.danger}20`
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;