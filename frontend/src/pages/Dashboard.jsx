// pages/Dashboard.js
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
   <div className="flex flex-col min-h-screen">
      <Navbar toggleSidebar={toggleSidebar}/>
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-6 w-full bg-gray-100 relative z-10">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
