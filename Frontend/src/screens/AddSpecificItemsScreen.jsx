import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddSpecificItemsScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [list, setList] = useState(null);
  const [itemName, setItemName] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Suggestions for quick item addition
  const suggestions = [
    'Milk', 'Bread', 'Eggs', 'Cheese', 
    'Chicken', 'Rice', 'Pasta', 'Tomatoes'
  ];

  useEffect(() => {
    // Check if list was passed from previous screen
    if (location.state && location.state.list) {
      setList(location.state.list);
    } else {
      // If no list is passed, redirect back
      navigate('/list');
    }
  }, [location.state, navigate]);

  const handleAddItem = async () => {
    const trimmedItemName = itemName.trim();
    if (!trimmedItemName) return;

    // Check if item already exists
    const itemExists = items.some(item => 
      item.name.toLowerCase() === trimmedItemName.toLowerCase()
    );

    if (itemExists) {
      toast.error('Item already exists in the list');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('userToken');
      const response = await axios.post(
        `http://localhost:3000/api/lists/${list._id}/items`,
        { name: trimmedItemName },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Add new item to local state
      setItems([...items, response.data]);
      setItemName(''); // Clear input
      toast.success('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    // Navigate back to list screen
    navigate('/list');
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`http://localhost:3000/api/lists/${list._id}/items/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Remove item from local state
      setItems(items.filter(item => item._id !== itemId));
      toast.success('Item removed');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to remove item');
    }
  };

  if (!list) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#D62929] p-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 mr-3"
          >
            <img 
              src="/src/assets/back.png" 
              alt="Back" 
              className="w-5 h-5 brightness-0 invert"
            />
          </button>
          <h1 className="text-[24px] font-bold text-white">{list.title}</h1>
        </div>
      </div>

      {/* Add Item Input */}
      <div className="p-4">
        <div className="relative mb-4">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Add an item"
            className="w-full p-4 bg-gray-100 rounded-xl text-lg pr-12"
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          />
          <button 
            onClick={handleAddItem}
            disabled={isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#D62929] text-white w-10 h-10 rounded-full flex items-center justify-center"
          >
            +
          </button>
        </div>

        {/* Suggestions */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Quick Add</h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setItemName(suggestion)}
                className="px-4 py-2 bg-gray-100 rounded-full text-gray-600"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3 mb-24">
          {items.map((item) => (
            <div 
              key={item._id}
              className="flex items-center bg-gray-100 rounded-xl p-3"
            >
              <span className="flex-1">{item.name}</span>
              <button 
                onClick={() => handleDeleteItem(item._id)}
                className="text-red-500"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Finish Button */}
      {items.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4">
          <button
            onClick={handleFinish}
            className="w-full bg-[#D62929] text-white py-4 rounded-[15px] text-lg font-medium"
          >
            FINISH
          </button>
        </div>
      )}
    </div>
  );
};

export default AddSpecificItemsScreen;
