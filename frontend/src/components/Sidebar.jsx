import React from 'react';
import { Link } from 'react-router-dom';
import COLORS from '../constants/Colors';
import Swal from 'sweetalert2';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      background: COLORS.primary,
      color: COLORS.text,
      showCancelButton: true,
      confirmButtonColor: COLORS.accent,
      cancelButtonColor: COLORS.danger,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch('http://localhost:8080/logout', {
          method: 'POST',
          credentials: 'include',
        });
        const data = await res.json();
        if (data.logout_url) {
          window.location.href = data.logout_url;
        }
      } catch (err) {
        console.error('Logout failed:', err);
      }
    }
  };

  return (
    <aside
      style={{ backgroundColor: COLORS.primary }}
      className={`w-64 h-full fixed p-2 top-0 z-60 left-0 transition-transform duration-300 flex flex-col justify-between ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >

      <ul className="p-5 space-y-2">
        <button
          onClick={toggleSidebar}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity mb-6 block"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="font-medium">Menu</span>
        </button>

        <li>
          <Link to="/" className="block p-2 hover:bg-gray-300" onClick={toggleSidebar}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/iam" className="block p-2 hover:bg-gray-300" onClick={toggleSidebar}>
            IAM
          </Link>
        </li>
        <li>
          <Link to="/organization" className="block p-2 hover:bg-gray-300" onClick={toggleSidebar}>
            Organization
          </Link>
        </li>
        <li>
          <Link to="/protected" className="block p-2 hover:bg-gray-300" onClick={toggleSidebar}>
            Admin Dashboard
          </Link>
        </li>
        
      </ul>

      <div className="border-t border-gray-300 p-5">
         <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-2 px-4 py-2 rounded-md hover:bg-opacity-10 hover:bg-red-500 transition-colors"
              style={{  backgroundColor: COLORS.danger,
                color: 'white' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
      </div>
    </aside>
  );
};

export default Sidebar;
