import React from 'react';
import { useNavigate } from 'react-router-dom';
import welcomeImage from '../assets/PantryPal.png';

const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center px-6 font-roboto">
      {/* Image Section */}
      <div className="flex-1 w-full flex items-center justify-center">
        <img 
          src={welcomeImage}
          alt="Welcome Illustration"
          className="w-full max-w-[250px] object-contain"
        />
      </div>

      {/* Buttons Section */}
      <div className="w-full flex flex-col gap-4 mb-12 -mt-20">
        <button 
          onClick={() => navigate('/onboarding')}
          className="w-full py-4 bg-white border border-black rounded-[15px] font-roboto font-bold text-lg"
        >
          Let's Get Started
        </button>

        <button 
          onClick={() => navigate('/login')}
          className="w-full py-4 bg-[#D62929] text-white rounded-[15px] font-roboto font-bold text-lg"
        >
          I Already Have an Account
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
