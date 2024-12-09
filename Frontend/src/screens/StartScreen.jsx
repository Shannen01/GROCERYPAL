import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import startBg from '../assets/Start_bg.png';
import startLogo from '../assets/logo.png';

const StartScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/welcome');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div 
      className="fixed inset-0 flex flex-col justify-center items-center font-roboto bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${startBg})` }}
    >
      <style>
        {`
          @keyframes logoAnimation {
            0% {
              opacity: 0;
              transform: scale(0.5);
            }
            50% {
              opacity: 1;
              transform: scale(1.1);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-logo {
            animation: logoAnimation 2s ease-out forwards;
          }
        `}
      </style>
      
      <img 
        src={startLogo} 
        alt="PantryPal Logo" 
        className="w-[250px] animate-logo"
      />
    </div>
  );
};

export default StartScreen; 