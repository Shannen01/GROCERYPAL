import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#D62929] rounded-[20px]" 
         style={{ 
           width: '378px', 
           height: '90px'
         }}>
      <div className="flex justify-between items-center h-full px-16">
        {/* Home Button */}
        <button 
          onClick={() => navigate('/home')}
          className="flex flex-col items-center w-16"
        >
          <div className={`p-2 rounded-full ${location.pathname === '/home' ? 'bg-white/20 scale-125' : ''} transition-all duration-200`}>
            <svg className="w-8 h-8" 
                 fill="white" 
                 viewBox="0 0 24 24">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className={`text-xs mt-1 text-white ${location.pathname === '/home' ? 'font-semibold' : ''}`}>
            Home
          </span>
        </button>

        {/* Add Button */}
        <button 
          onClick={() => navigate('/list/create')}
          className="flex flex-col items-center w-16"
        >
          <div className={`p-2 rounded-full ${location.pathname === '/list/create' ? 'bg-white/20 scale-125' : ''} transition-all duration-200`}>
            <svg className="w-8 h-8" 
                 fill="none" 
                 stroke="white" 
                 viewBox="0 0 24 24">
              <path strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs mt-1 text-white">
            Add
          </span>
        </button>

        {/* Notifications Button */}
        <button 
          onClick={() => navigate('/notifications')}
          className="flex flex-col items-center w-16"
        >
          <div className={`p-2 rounded-full ${location.pathname === '/notifications' ? 'bg-white/20 scale-125' : ''} transition-all duration-200`}>
            <svg className="w-8 h-8" 
                 fill="white" 
                 viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <span className={`text-xs mt-1 text-white ${location.pathname === '/notifications' ? 'font-semibold' : ''}`}>
            Notifications
          </span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavBar; 