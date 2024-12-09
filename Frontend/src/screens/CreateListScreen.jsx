import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';

const CreateListScreen = () => {
  const [listTitle, setListTitle] = useState('');
  const [toast, setToast] = useState(null);
  const [existingLists, setExistingLists] = useState([]);
  const navigate = useNavigate();

  const suggestions = [
    'Shopping',
    'Groceries',
    'Birthday',
    'Anniversary',
    'Christmas',
    'New Year',
    'Party',
    'Adobo Recipe',
    'Cake Recipe',
    'Mama Recipe',
    'Turkey Night',
    'Monthsarry',
    'Cravings',
    'Junks'
  ];

  // Fetch existing lists when component mounts
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await axios.get('http://localhost:3000/api/lists', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setExistingLists(response.data);
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    };

    fetchLists();
  }, []);

  const handleCreate = async () => {
    const trimmedTitle = listTitle.trim();
    if (!trimmedTitle) return;

    // Check if list name already exists
    const listExists = existingLists.some(list => 
      list.name.toLowerCase() === trimmedTitle.toLowerCase()
    );

    if (listExists) {
      setToast({
        type: 'error',
        message: 'List name already exists',
        subMessage: 'Please choose a different name',
        actionLabel: 'Okay'
      });
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post(
        'http://localhost:3000/api/lists',
        { name: trimmedTitle },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        navigate('/list', { state: { newList: response.data } });
      }
    } catch (error) {
      console.error('Error creating list:', error);
      setToast({
        type: 'error',
        message: 'Error creating list',
        subMessage: 'Please try again',
        actionLabel: 'Dismiss'
      });
    }
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          subMessage={toast.subMessage}
          actionLabel={toast.actionLabel}
          onClose={handleCloseToast}
        />
      )}
      
      {/* Header */}
      <div className="bg-[#D62929] p-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/list')}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 mr-3"
          >
            <img 
              src="/src/assets/back.png" 
              alt="Back" 
              className="w-5 h-5 brightness-0 invert"
            />
          </button>
          <h1 className="text-[24px] font-bold text-white">Create New List</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Input */}
        <input
          type="text"
          placeholder="New list"
          value={listTitle}
          onChange={(e) => setListTitle(e.target.value)}
          className="w-full p-4 bg-gray-100 rounded-xl text-lg mb-6"
        />

        {/* Suggestions */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Suggestions</h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setListTitle(suggestion)}
                className="px-4 py-2 bg-gray-100 rounded-full text-gray-600"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Create Button */}
        <div className="fixed bottom-6 left-4 right-4">
          <button
            onClick={handleCreate}
            className="w-full bg-[#D62929] text-white py-4 rounded-[15px] text-lg font-medium"
          >
            CREATE
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateListScreen;