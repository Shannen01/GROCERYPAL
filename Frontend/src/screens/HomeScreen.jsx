import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userIcon from '../assets/user.png';
import searchIcon from '../assets/search.png';
import fruitsIcon from '../assets/Fruits.png';
import vegetableIcon from '../assets/vegetable.png';
import snacksIcon from '../assets/Snacks.png';
import meatIcon from '../assets/Meat.png';
import iceCreamIcon from '../assets/ice cream.png';
import frozenIcon from '../assets/frozen.png';
import eggIcon from '../assets/Egg.png';
import dairyIcon from '../assets/dairy.png';
import chickenIcon from '../assets/Chicken.png';
import seafoodIcon from '../assets/Seafood.png';
import condimentsIcon from '../assets/condiments.png';
import personalCareIcon from '../assets/PersonalCare.png';
import petFoodIcon from '../assets/pet-food.png';
import babyFoodIcon from '../assets/Baby food.png';
import powerIcon from '../assets/power.png';
import BottomNavBar from '../components/BottomNavBar';

const HomeScreen = () => {
  const [userName] = useState('Shannen');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    
    // Close sidebar
    setIsSidebarOpen(false);
    
    // Navigate to login
    navigate('/login', { replace: true });
  };

  const categories = [
    { title: 'Fruits', icon: fruitsIcon },
    { title: 'Vegetables', icon: vegetableIcon },
    { title: 'Snacks', icon: snacksIcon },
    { title: 'Meat', icon: meatIcon },
    { title: 'Ice Cream', icon: iceCreamIcon },
    { title: 'Frozen', icon: frozenIcon },
    { title: 'Eggs', icon: eggIcon },
    { title: 'Dairy', icon: dairyIcon },
    { title: 'Chicken', icon: chickenIcon },
    { title: 'Seafood', icon: seafoodIcon },
    { title: 'Condiments', icon: condimentsIcon },
    { title: 'Personal Care', icon: personalCareIcon },
    { title: 'Pet Food', icon: petFoodIcon },
    { title: 'Baby Food', icon: babyFoodIcon }
  ];

  const handleCategoryClick = (index) => {
    setSelectedCategory(index);
  };

  const handleViewAllCategories = () => {
    navigate('/categories');
  };

  return (
    <div className="min-h-screen bg-white font-roboto relative">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-[280px] bg-[#D62929] z-50 flex flex-col">
            {/* Profile Header */}
            <div className="bg-white p-4">
              <h2 className="text-xl font-bold">Profile</h2>
            </div>

            {/* User Info */}
            <div className="p-4">
              <div 
                className="bg-white rounded-xl p-3 cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      <img 
                        src={userIcon} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-black">Shannen</h3>
                      <p className="text-xs text-gray-600">shannenmendoza@gmail.com</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent's onClick
                      // Add edit functionality here
                    }}
                  >
                    <img 
                      src="/src/assets/edit.png" 
                      alt="Edit"
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 text-white">
              <button className="w-full px-6 py-4 text-left hover:bg-white/10">LANGUAGE</button>
              <button className="w-full px-6 py-4 text-left hover:bg-white/10">FAQ</button>
              <button className="w-full px-6 py-4 text-left hover:bg-white/10">HELP</button>
              <button className="w-full px-6 py-4 text-left hover:bg-white/10">PRIVACY POLICY</button>
              <button className="w-full px-6 py-4 text-left hover:bg-white/10">TERMS OF SERVICES</button>
              <button className="w-full px-6 py-4 text-left hover:bg-white/10">CONTACT US</button>
            </div>

            {/* Logout Button */}
            <div className="p-6">
              <button 
                onClick={handleLogout}
                className="w-full bg-white rounded-lg py-3 text-[#D62929] font-semibold flex items-center justify-center gap-2"
              >
                <img 
                  src={powerIcon}
                  alt="Logout"
                  className="w-8 h-8"
                />
                LOG OUT
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modified Header and Search Section */}
      <div className="bg-[#D62929] rounded-b-[30px] px-4 pt-6 pb-8 mb-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-[24px] font-bold mb-1 text-white">Hi {userName} 👋</h1>
            <p className="text-[20px] font-semibold text-[#FFE5E5]" style={{ width: '302px' }}>
              Time to shelf your worries—start your list!
            </p>
          </div>
          <div 
            className="w-12 h-12 rounded-full overflow-hidden cursor-pointer bg-white flex items-center justify-center"
            onClick={() => setIsSidebarOpen(true)}
          >
            <img 
              src={userIcon} 
              alt="Profile" 
              className="w-8 h-8 object-contain"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div>
          <div className="relative">
            <input 
              type="text"
              placeholder="Search"
              className="w-full h-12 rounded-lg border border-gray-200 pl-12 pr-4 bg-white"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <img 
                src={searchIcon} 
                alt="Search"
                className="w-5 h-5" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the content now starts with proper padding */}
      <div className="px-4">
        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-black text-[20px] font-bold mb-4" style={{ letterSpacing: '-0.3px' }}>Categories</h2>
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 pb-4" style={{ paddingRight: '1rem' }}>
                {categories.slice(0, 6).map((category, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center cursor-pointer flex-shrink-0"
                    onClick={() => handleCategoryClick(index)}
                  >
                    <div className={`w-[100px] h-[100px] rounded-full bg-white shadow-md mb-2 flex items-center justify-center transition-all duration-200 border ${
                      selectedCategory === index ? 'bg-red-100 border-2 border-[#D62929]' : 'border-gray-200'
                    }`}>
                      <img 
                        src={category.icon} 
                        alt={category.title}
                        className={`w-16 h-16 object-contain transition-transform duration-200 ${
                          selectedCategory === index ? 'scale-110' : ''
                        }`}
                      />
                    </div>
                    <span className={`text-sm text-center ${
                      selectedCategory === index ? 'text-[#D62929] font-semibold' : ''
                    }`}>
                      {category.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button 
            className="w-full py-3 rounded-lg text-white mt-4"
            style={{ backgroundColor: '#D62929' }}
            onClick={handleViewAllCategories}
          >
            View All Categories
          </button>
        </div>

        {/* Recent List Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-black text-[20px] font-bold" style={{ letterSpacing: '-0.3px' }}>Recent List</h2>
            <button 
              onClick={() => navigate('/list')}
              className="text-[#D62929] text-sm font-medium"
            >
              See all
            </button>
          </div>
          
          <div className="space-y-3">
            {/* List Item */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="w-16 h-16 rounded-lg bg-[#D62929]/10 flex items-center justify-center mr-4">
                <img 
                  src="/src/assets/store.png" 
                  alt="Store"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold">Groceries</h3>
              </div>
            </div>

            {/* List Item */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="w-16 h-16 rounded-lg bg-[#D62929]/10 flex items-center justify-center mr-4">
                <img 
                  src="/src/assets/store.png" 
                  alt="Store"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold">Adobo Recipe</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add padding bottom for navbar space */}
      <div className="pb-16">
        {/* ... your existing content ... */}
      </div>

      <BottomNavBar />
    </div>
  );
};

export default HomeScreen;