import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import slide0 from '../assets/slides.png';
import slide1 from '../assets/slides-1.png';
import slide2 from '../assets/slides-2.png';

const OnboardingScreen = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance for gesture detection
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const slides = [
    {
      image: slide0,
      title: ['Never forget', 'what to buy'],
      subtitle: 'Create lists to organize and always find what you actually need'
    },
    {
      image: slide1,
      title: ['Share your lists', 'with anyone'],
      subtitle: 'Collaborate with friends and family on shared shopping lists'
    },
    {
      image: slide2,
      title: ['Stay organized', 'everywhere'],
      subtitle: 'Access your lists anytime, anywhere, on any device'
    }
  ];

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center px-6 font-roboto">
      {/* Image Section */}
      <div 
        className="flex-1 w-full flex items-center justify-center -mt-64"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-full flex justify-center items-center">
          <img 
            src={slides[currentSlide].image}
            alt={`Slide ${currentSlide + 1}`}
            className="w-full max-w-4xl object-contain h-[700px] mx-auto"
            draggable="false"
          />
        </div>
      </div>

      {/* Slider Indicators */}
      <div className="flex gap-2 mb-4 -mt-[150px]">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === index ? 'bg-black w-6' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="w-full flex flex-col gap-3 mb-12 mt-8">
        <button 
          onClick={() => {
            if (currentSlide < slides.length - 1) {
              setCurrentSlide(currentSlide + 1);
            } else {
              navigate('/welcome');
            }
          }}
          className="w-full py-4 bg-white text-black font-bold rounded-[14px] border-2 border-black font-roboto text-lg"
        >
          {currentSlide < slides.length - 1 ? 'Next' : 'Go Back'}
        </button>
        <button 
          onClick={() => navigate('/signup')}
          className="w-full py-4 bg-[#D62929] text-white font-bold rounded-[14px] font-roboto text-lg"
        >
          {currentSlide === slides.length - 1 ? 'Create an Account' : 'Skip'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen; 