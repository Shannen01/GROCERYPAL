import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Toast from '../components/Toast';

const CreateListScreen = () => {
  const [listTitle, setListTitle] = useState('');
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
        console.log('Fetching lists with token:', token);
        const response = await axios.get('http://localhost:3000/api/lists', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Fetched lists:', response.data);
        setExistingLists(response.data);
      } catch (error) {
        console.error('Error fetching lists:', error);
        console.error('Error details:', error.response?.data);
      }
    };

    fetchLists();
  }, []);

  const handleCreate = async () => {
    const trimmedTitle = listTitle.trim();
    if (!trimmedTitle) {
      toast.error('Please enter a list name');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');

      // First, check for existing lists with similar names
      const existingListsWithSameName = existingLists.filter(list => 
        list.title.toLowerCase().startsWith(trimmedTitle.toLowerCase())
      );

      // Generate a unique name if necessary
      let finalTitle = trimmedTitle;
      if (existingListsWithSameName.length > 0) {
        const suffixes = existingListsWithSameName
          .map(list => {
            const match = list.title.match(new RegExp(`^${trimmedTitle}\\s*(\\d*)$`, 'i'));
            return match && match[1] ? parseInt(match[1]) : 1;
          })
          .filter(num => !isNaN(num));

        const highestSuffix = Math.max(0, ...suffixes);
        finalTitle = `${trimmedTitle} ${highestSuffix + 1}`;
      }

      // Create the list with the final title
      console.log('Token:', token);
      console.log('Final Title:', finalTitle);
      
      const response = await axios.post(
        'http://localhost:3000/api/lists',
        { 
          title: finalTitle,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Create a custom toast using the Toast component
        const handleAddItems = () => {
          toast.dismiss();
          navigate('/add-items-to-list', { 
            state: { 
              list: response.data,
              fromCreateList: true 
            } 
          });
        };

        toast(<Toast 
          message="List Created Successfully" 
          subMessage={existingListsWithSameName.length > 0 
            ? `"${finalTitle}" is ready to use` 
            : 'Your new list is ready to go'}
          type="success"
          actionLabel="Add Items"
          onAction={handleAddItems}
          onClose={() => toast.dismiss()}
        />, {
          position: "center",
          autoClose: false,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
        });

        // Fallback navigation after a delay
        setTimeout(() => {
          toast.dismiss();
          navigate('/add-items-to-list', { 
            state: { 
              list: response.data,
              fromCreateList: true 
            } 
          });
        }, 5000);
      }
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error(error.response?.data?.message || 'Failed to create list');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer />
      
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