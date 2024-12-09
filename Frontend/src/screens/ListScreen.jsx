import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import searchIcon from '../assets/search-interface.png';
import BottomNavBar from '../components/BottomNavBar';
import mascotImage from '../assets/mascot.jpg';

const calculateProgress = (list) => {
  if (!list.items || list.items.length === 0) return 0;
  const completedItems = list.items.filter(item => item.checked).length;
  return (completedItems / list.items.length) * 100;
};

const EmptyListView = ({ listTitle }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <button className="mr-4 text-gray-600">←</button>
        <h1 className="text-xl font-medium">{listTitle}</h1>
        <div className="flex-1"></div>
        <button className="mr-2">👤</button>
        <button>⋮</button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
        <img 
          src={mascotImage} 
          alt="Mascot"
          className="w-32 h-32 mb-6"
        />
        <h2 className="text-xl font-medium mb-2">What do you need to buy?</h2>
        <p className="text-gray-500 text-center">
          Tap the plus button to start adding products
        </p>
      </div>

      {/* Add Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-500 text-white px-6 py-3 rounded-full flex items-center shadow-lg">
          <span className="text-2xl mr-2">+</span>
          ADD
        </button>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onCancel} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 z-50 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

const ShareModal = ({ onClose }) => {
  const [email, setEmail] = useState('');

  const handleSend = () => {
    // Add your share logic here
    console.log('Sharing with:', email);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 z-50 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Share this list</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          When the list is shared, any changes are instantly visible to everyone 🚀
        </p>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter name or email"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg"
          />
        </div>

        <button
          onClick={handleSend}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium"
        >
          Send
        </button>
      </div>
    </>
  );
};

const ManageListModal = ({ onClose, list, onDelete }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState(null);

  if (!list) return null;

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`http://localhost:3000/api/lists/${list._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Show success toast
      toast.success('List deleted successfully');
      
      // Wait for toast to show before closing modal
      setTimeout(() => {
        if (onDelete) {
          onDelete(list._id);
        }
        onClose();
      }, 2000); // Wait for 2 seconds for toast to be visible
      
    } catch (error) {
      console.error('Error deleting list:', error);
      setError('Failed to delete list. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <>
      {/* First Modal - Manage List */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 z-40 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage list</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button 
            className="w-full flex items-center gap-3 py-2 hover:bg-gray-50"
            onClick={() => {/* Add rename handler */}}
          >
            <span className="text-gray-400">✎</span>
            <span>Rename</span>
          </button>
          <button 
            className="w-full flex items-center gap-3 py-2 hover:bg-gray-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowShareModal(true);
            }}
          >
            <span className="text-gray-400">👥</span>
            <span>Share</span>
          </button>
          <button 
            className="w-full flex items-center gap-3 py-2 hover:bg-gray-50 text-red-500"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <span>🗑️</span>
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="relative z-50">
          <ShareModal 
            onClose={() => {
              setShowShareModal(false);
              onClose();
            }} 
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete List"
          message={`Are you sure you want to delete "${list.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
};

const AddListModal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post('http://localhost:3000/api/lists', 
        { name: title },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      onSave(response.data);
      onClose();
    } catch (err) {
      setError('Failed to create list. Please try again.');
      console.error('Error creating list:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[32px] p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#2D2D2D] text-2xl font-semibold">Add New List</h2>
          <button onClick={onClose} className="text-[#7F3DFF] text-xl">
            ✕
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-[#2D2D2D] mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl"
            placeholder="-"
          />
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-[#E4B5A3] text-white py-4 rounded-xl font-medium"
        >
          Save
        </button>
      </div>
    </div>
  );
};

const ListScreen = () => {
  const [lists, setLists] = useState([]);
  const [error, setError] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await axios.get('http://localhost:3000/api/lists', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setLists(response.data);
      } catch (error) {
        console.error('Error fetching lists:', error);
        setError('Failed to load lists');
      }
    };

    fetchLists();
  }, []);

  const filteredLists = useMemo(() => {
    return lists.filter(list => 
      list.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [lists, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#D62929] p-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 mr-3"
          >
            <img src="/src/assets/back.png" alt="Back" className="w-5 h-5 brightness-0 invert" />
          </button>
          <h1 className="text-[24px] font-bold text-white">My List</h1>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-12 rounded-lg border border-white pl-12 pr-4"
            />
            <img 
              src={searchIcon}
              alt="Search"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
            />
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="px-4 pt-4 pb-24">
        <div className="space-y-3">
          {filteredLists.length > 0 ? (
            filteredLists.map((list) => (
              <div 
                key={list._id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm"
                onClick={() => navigate('/editlist', { state: { list } })}
              >
                <div className="w-12 h-12 rounded-lg bg-[#D62929]/10 flex items-center justify-center">
                  <img 
                    src="/src/assets/store.png" 
                    alt="Store"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{list.name}</h3>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No lists found matching your search' : 'No lists yet'}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddListModal
          onClose={() => setShowAddModal(false)}
          onSave={(newList) => {
            setLists([...lists, newList]);
          }}
        />
      )}

      {showManageModal && selectedList && (
        <ManageListModal
          list={selectedList}
          onClose={() => {
            setShowManageModal(false);
            setSelectedList(null);
          }}
          onDelete={(listId) => {
            setLists(lists.filter(l => l._id !== listId));
            setShowManageModal(false);
            setSelectedList(null);
          }}
        />
      )}

      <BottomNavBar />
    </div>
  );
};

export default ListScreen;