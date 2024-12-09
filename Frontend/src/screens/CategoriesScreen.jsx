import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backIcon from '../assets/back.png';
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
import beansIcon from '../assets/Beans.png';
import breadIcon from '../assets/Bread.png';
import cannedGoodsIcon from '../assets/canned-goods.png';
import beveragesIcon from '../assets/beverages.png';

const CategoriesScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

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
    { title: 'Baby Food', icon: babyFoodIcon },
    { title: 'Beans', icon: beansIcon },
    { title: 'Bread', icon: breadIcon },
    { title: 'Canned Goods', icon: cannedGoodsIcon },
    { title: 'Beverages', icon: beveragesIcon }
  ];

  const handleCategoryClick = (index) => {
    setSelectedCategory(index);
  };

  return (
    <div className="min-h-screen bg-white font-roboto">
      {/* Header with red background */}
      <div className="bg-[#D62929] w-full">
        <div className="px-4 py-4 flex items-center justify-center relative">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 absolute left-4"
          >
            <img src={backIcon} alt="Back" className="w-7 h-7 brightness-0 invert" />
          </button>
          <h1 className="text-[28px] font-bold text-white">Categories</h1>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="px-4 pt-6 flex-1">
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 justify-items-center max-w-[400px] mx-auto">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleCategoryClick(index)}
            >
              <div className={`w-[100px] h-[100px] rounded-full bg-white shadow-md mb-2 flex items-center justify-center transition-all duration-200 border-2 ${
                selectedCategory === index ? 'bg-red-100 border-[#D62929]' : 'border-gray-300'
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
  );
};

export default CategoriesScreen; 