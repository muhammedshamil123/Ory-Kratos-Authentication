import React from 'react';
import COLORS from '../constants/Colors';
import { Inbox } from '@novu/react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar, user, role, sidebarOpen }) => {
  const navigate = useNavigate();
  
  return (
    <nav 
      className="sticky top-0 z-50 shadow-sm"
      style={{ 
        backgroundColor: COLORS.white,
        borderBottom: `1px solid ${COLORS.border}`,
        height: '64px'
      }}
    >
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left side - Menu button and title */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              style={{
                color: COLORS.text,
                hoverBackground: COLORS.backgroundSecondary
              }}
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
                  d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
            
            <h1 
              className="text-xl font-semibold hidden sm:block"
              style={{ color: COLORS.text }}
            >
              Dashboard
            </h1>
          </div>

          {/* Right side - User info and notifications */}
          <div className="flex items-center space-x-4">
            {/* Role indicator */}
            <div 
              className="hidden md:flex items-center px-3 py-1 rounded-full text-sm"
              style={{
                backgroundColor: COLORS.backgroundSecondary,
                color: COLORS.textSecondary
              }}
            >
              <span className="font-medium" style={{ color: COLORS.primary }}>
                {role}
              </span>
            </div>

            {/* Notification center */}
            <div className="relative">
              <Inbox
                applicationIdentifier="5-KcoTvnfMGp"
                subscriberId={user?.email}
                styles={{
                  root: { 
                    zIndex: 9999,
                    button: {
                      backgroundColor: 'transparent',
                      color: COLORS.text,
                      hoverColor: COLORS.primary,
                      padding: '0.5rem'
                    }
                  },
                  popover: { 
                    zIndex: 9999,
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                  } 
                }}
                routerPush={(path) => navigate(path)}
                appearance={{
                  variables: {
                    colorPrimary: COLORS.primary,
                    colorForeground: COLORS.text,
                    colorBackground: COLORS.white,
                    sidebarBackground: COLORS.backgroundSecondary,
                    fontFamily: 'inherit'
                  },
                }}
              />
            </div>

            {/* User avatar/initials */}
            {user?.name && (
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                  fontWeight: 500
                }}
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;