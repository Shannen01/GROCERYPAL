import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';

const NotificationScreen = () => {
  const navigate = useNavigate();
  
  console.log('Rendering NotificationScreen');

  return (
    <div className="min-h-screen bg-white">
      {/* Header with red background */}
      <div className="bg-[#D62929] p-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 mr-3"
          >
            <img src="/src/assets/back.png" alt="Back" className="w-5 h-5 brightness-0 invert" />
          </button>
          <h1 className="text-[24px] font-bold text-white">Notifications</h1>
        </div>
      </div>

      {/* Empty State - Add padding bottom for navbar */}
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px-64px)]">
        <h2 className="text-xl font-medium mb-2">No notifications yet</h2>
        <p className="text-gray-500 text-center px-8">
          You don't have any notification. When you get notifications about your shared lists, you'll see them here.
        </p>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default NotificationScreen; 