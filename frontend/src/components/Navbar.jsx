import React from 'react';
import COLORS from '../constants/Colors';
import { Inbox } from '@novu/react';


const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="px-8 py-5 shadow-lg sticky top-0 z-50" style={{ 
        backgroundColor: COLORS.secondary,
        borderBottom: `1px solid ${COLORS.border}`
      }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center"> 
          <div className="flex items-center space-x-5">
            <button 
              onClick={toggleSidebar} 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              style={{ color: COLORS.text }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="font-medium">Menu</span>
            </button>
            <h1 className="text-2xl font-bold tracking-tight">
              <span style={{ color: COLORS.accent }}>GitHub</span> Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <span className="hidden md:inline text-sm" style={{ color: COLORS.muted }}>
              Logged in as <span style={{ color: COLORS.text }}>name</span>
            </span>
            <Inbox
              applicationIdentifier="uNc8_gK2ynUR"
              subscriberId="685a3f4bd80e094dc6b25ead"
              styles={{
                root: { zIndex: 9999 },
                popover: { zIndex: 9999 } 
              }}
              routerPush={(path) => navigate(path)}
              appearance={{
                variables: {
                  colorPrimary: "#7D52F4",
                  colorForeground: "#0E121B",
                },
              }}
            />

          </div>
            
        </div>
      
      
    </nav>
  );
};

export default Navbar;
