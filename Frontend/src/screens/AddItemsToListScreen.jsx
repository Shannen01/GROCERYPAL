import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Toast from '../components/Toast';

// Make sure these image files exist in your assets folder
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
import backIcon from '../assets/back.png';
import deleteIcon from '../assets/delete.png';  // Make sure this file exists
import shareIcon from '../assets/share.png';    // Make sure this file exists

console.log('Category Images:', {
  fruitsIcon,
  vegetableIcon,
  snacksIcon,
  meatIcon,
  iceCreamIcon,
  frozenIcon,
  eggIcon,
  dairyIcon,
  chickenIcon,
  seafoodIcon,
  condimentsIcon,
  personalCareIcon,
  petFoodIcon,
  babyFoodIcon
});

const PREDEFINED_CATEGORIES = [
  { id: 'fruits', name: 'Fruits', image: fruitsIcon },
  { id: 'vegetables', name: 'Vegetables', image: vegetableIcon },
  { id: 'snacks', name: 'Snacks', image: snacksIcon },
  { id: 'meat', name: 'Meat', image: meatIcon },
  { id: 'iceCream', name: 'Ice Cream', image: iceCreamIcon },
  { id: 'frozen', name: 'Frozen', image: frozenIcon },
  { id: 'eggs', name: 'Eggs', image: eggIcon },
  { id: 'dairy', name: 'Dairy', image: dairyIcon },
  { id: 'chicken', name: 'Chicken', image: chickenIcon },
  { id: 'seafood', name: 'Seafood', image: seafoodIcon },
  { id: 'condiments', name: 'Condiments', image: condimentsIcon },
  { id: 'personalCare', name: 'Personal Care', image: personalCareIcon },
  { id: 'petFood', name: 'Pet Food', image: petFoodIcon },
  { id: 'babyFood', name: 'Baby Food', image: babyFoodIcon }
];

const AddItemsToListScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [list, setList] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [items, setItems] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Check if list came from create list screen
    if (location.state?.fromCreateList) {
      // Create a custom toast using the Toast component
      toast(<Toast 
        message="Welcome to Your New List!" 
        subMessage="Start adding items to make your list awesome"
        type="info"
        onClose={() => toast.dismiss()}
      />, {
        position: "center",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
      });
    }

    // Existing list fetch logic
    const fetchListById = async () => {
      try {
        let listId;
        
        // First try to get listId from location state
        if (location.state?.listId) {
          listId = location.state.listId;
        } else if (location.state?.list) {
          // Fallback to old state format
          setList(location.state.list);
          listId = location.state.list._id;
        } else {
          // If not in state, get from URL params
          const searchParams = new URLSearchParams(location.search);
          listId = searchParams.get('listId');
        }

        // If not in search params, try getting from URL path
        if (!listId) {
          const pathParts = location.pathname.split('/');
          listId = pathParts[pathParts.length - 1];
        }

        if (!listId) {
          console.error('No list ID found');
          navigate('/list');
          return;
        }

        // Fetch the latest list data
        const token = localStorage.getItem('userToken');
        const response = await axios.get(
          `http://localhost:3000/api/lists/${listId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setList(response.data);
        if (response.data.items) {
          // Add category icons to items
          const itemsWithIcons = response.data.items.map(item => {
            if (item.category) {
              const catDetails = PREDEFINED_CATEGORIES.find(cat => cat.id === item.category);
              return {
                ...item,
                categoryIcon: catDetails?.icon
              };
            }
            return item;
          });
          setItems(itemsWithIcons);
        }

      } catch (error) {
        console.error('Error fetching list:', error);
        toast.error('Failed to load list');
        navigate('/list');
      }
    };

    fetchListById();
  }, [location, navigate]);

  const handleAddItem = async () => {
    if (!itemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      
      // Get the selected category details
      const categoryDetails = PREDEFINED_CATEGORIES.find(cat => cat.id === selectedCategory);
      console.log('Selected category details:', categoryDetails); // Debug log
      
      const newItem = {
        name: itemName.trim(),
        quantity: quantity || '',
        category: selectedCategory,
        categoryIcon: categoryDetails?.icon // Include the category icon
      };

      const response = await axios.post(
        `http://localhost:3000/api/lists/${list._id}/items`,
        newItem,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update items with category icons
      if (response.data.items) {
        const updatedItems = response.data.items.map(item => {
          const catDetails = PREDEFINED_CATEGORIES.find(cat => cat.id === item.category);
          return {
            ...item,
            categoryIcon: catDetails?.icon
          };
        });
        setItems(updatedItems);
      }

      setItemName('');
      setQuantity('');
      setSelectedCategory('');
      setShowModal(false);

      toast.success('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const handleToggleItem = async (itemId, isCompleted) => {
    try {
      const token = localStorage.getItem('userToken');
      
      // Add debugging logs
      console.log('Toggle request details:', {
        listId: list._id,
        itemId: itemId,
        currentStatus: isCompleted,
        newStatus: !isCompleted
      });

      // Update the items state optimistically
      setItems(items.map(item => 
        item._id === itemId ? { ...item, isCompleted: !isCompleted } : item
      ));

      // Make the API call with the correct endpoint format
      const response = await axios.patch(
        `http://localhost:3000/api/lists/${list._id}/items/${itemId}`,
        { isCompleted: !isCompleted },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log successful response
      console.log('Toggle response:', response.data);

    } catch (error) {
      console.error('Error updating item:', error);
      console.error('Full error details:', {
        listId: list._id,
        itemId: itemId,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Revert the optimistic update if the API call fails
      setItems(items.map(item => 
        item._id === itemId ? { ...item, isCompleted: isCompleted } : item
      ));
      
      toast.error('Failed to update item status');
    }
  };

  const handleFinish = () => {
    navigate('/list');
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`http://localhost:3000/api/lists/${list._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('List deleted successfully');
      navigate('/list');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
    }
  };

  const handleShare = () => {
    // Implement share functionality
    toast.info('Share functionality coming soon!');
  };

  // Add this function to calculate progress
  const calculateProgress = () => {
    if (!items || items.length === 0) return 0;
    const completedItems = items.filter(item => item.isCompleted).length;
    return (completedItems / items.length) * 100;
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(
        `http://localhost:3000/api/lists/${list._id}/items/${itemId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update local state by removing the deleted item
      setItems(items.filter(item => item._id !== itemId));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleDeleteCheckedItems = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const checkedItems = items.filter(item => item.isCompleted);
      
      if (checkedItems.length === 0) {
        toast.info('No items selected for deletion');
        return;
      }

      // Debug logs
      console.log('Attempting to delete items:', {
        listId: list._id,
        itemIds: checkedItems.map(item => item._id)
      });

      // Change to use query parameters instead of request body
      const response = await axios({
        method: 'delete',
        url: `http://localhost:3000/api/lists/${list._id}/items`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: {
          itemIds: checkedItems.map(item => item._id)
        }
      });

      console.log('Delete response:', response.data);
      setItems(items.filter(item => !item.isCompleted));
      toast.success('Selected items deleted successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete request error:', error);
      toast.error('Failed to delete items');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-[#D62929] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/list')}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 mr-3"
            >
              <img 
                src={backIcon} 
                alt="Back" 
                className="w-5 h-5 brightness-0 invert"
              />
            </button>
            <h1 className="text-[24px] font-bold text-white">{list?.title}</h1>
          </div>
          
            <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"
            >
              <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            </div>

        </div>

        {/* Add Progress Bar Section */}
        {items.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-white mb-2">
              <span className="text-sm">Progress</span>
              <span className="text-sm">
                {items.filter(item => item.isCompleted).length}/{items.length} items
              </span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300 rounded-full"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
        )}
      </div>

        {/* Items List */}
        <div className="flex-1 bg-white px-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {items.length > 0 ? (
          <div className="space-y-4 py-4">
          {items.map((item, index) => (
            <div 
            key={item._id || index} 
            className="flex items-center justify-between bg-white rounded-[20px] p-4 shadow-md"
            >
            {/* Checkbox and Item Details */}
            <div className="flex items-center flex-1">
              <input 
              type="checkbox"
              checked={!!item.isCompleted}
              onChange={() => handleToggleItem(item._id, item.isCompleted)}
              className="form-checkbox h-6 w-6 text-[#D62929] rounded mr-4"
              />
              
              <div className="flex flex-col">
              <span className={`text-xl font-semibold ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {item.name}
                {item.quantity && (
                <span className="ml-2 text-base text-gray-500">
                  ({item.quantity})
                </span>
                )}
              </span>
              </div>
            </div>

            {/* Category Image and Delete Button */}
            <div className="flex items-center gap-2">
              {item.category && (
              <img 
                src={PREDEFINED_CATEGORIES.find(cat => cat.id === item.category)?.image}
                alt={item.category}
                className="w-7 h-7 object-contain"
                onError={(e) => e.target.style.display = 'none'}
              />
              )}
              <button
              onClick={() => handleDeleteItem(item._id)}
              className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center"
              >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-4 h-4 text-[#D62929]"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              </button>
            </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <p className="text-gray-500">No items added yet</p>
          </div>
        )}
        </div>

      {/* Add Button */}
      <div className="fixed bottom-6 left-4 right-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-[#D62929] text-white py-4 rounded-[15px] text-lg font-medium"
        >
          ADD ITEM
        </button>
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-[30px] p-6 z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add Item</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"
              >
                <span className="text-[#D62929]">X</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Item name</label>
                <input
                  type="text"
                  value={itemName || ''}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Quantity</label>
                <input
                  type="text"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  placeholder="Enter quantity"
                />
              </div>

              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Select Category
                </label>
                {/* Add a container with fixed height and scrolling */}
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="grid grid-cols-4 gap-2 p-1">
                    {PREDEFINED_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category.id);
                        }}
                        className={`flex flex-col items-center p-2 rounded-lg ${
                          selectedCategory === category.id 
                            ? 'bg-[#D62929] text-white' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="w-8 h-8 mb-1 object-contain"
                        />
                        <span className="text-xs text-center">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Category Input */}
              {selectedCategory === 'custom' && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Custom Category Name
                  </label>
                  <input
                    type="text"
                    value={customCategory || ''}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category"
                    className="w-full p-3 border border-gray-200 rounded-lg"
                  />
                </div>
              )}

              <button
                onClick={handleAddItem}
                className="w-full bg-[#D62929] text-white py-3 rounded-lg mt-4"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-[20px] p-6 z-50 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Delete Selected Items</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the selected items? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCheckedItems}
                className="px-4 py-2 bg-[#D62929] text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddItemsToListScreen;
