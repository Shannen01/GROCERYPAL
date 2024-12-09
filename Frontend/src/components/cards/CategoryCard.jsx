import React from 'react';
import PropTypes from 'prop-types';

const CategoryCard = ({ 
  icon, 
  title, 
  onClick, 
  isEditing = false, 
  isSelected = false, 
  onCheckboxChange = () => {}, 
  isDefault = false 
}) => {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-md p-4 flex flex-col items-center justify-center relative 
        ${!isEditing && !isDefault ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
        ${isDefault ? 'bg-gray-50' : ''}`}
      onClick={() => !isEditing && !isDefault && onClick()}
    >
      {isEditing && !isDefault && (
        <div className="absolute top-2 left-2">
          <input 
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onCheckboxChange(e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
      )}
      <div className="w-16 h-16 mb-2 flex items-center justify-center">
        <img 
          src={icon}
          alt={title}
          className={`w-full h-full object-contain ${isDefault ? 'opacity-75' : ''}`}
        />
      </div>
      <p className={`text-sm text-center font-medium ${isDefault ? 'text-gray-600' : ''}`}>
        {title}
        {isDefault && (
          <span className="text-xs text-gray-500 block bg-gray-100 px-2 py-0.5 mt-1 rounded">
            Default
          </span>
        )}
      </p>
    </div>
  );
};

CategoryCard.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isSelected: PropTypes.bool,
  onCheckboxChange: PropTypes.func,
  isDefault: PropTypes.bool,
};

export default CategoryCard;
