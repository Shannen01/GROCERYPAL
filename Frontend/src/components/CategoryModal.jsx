import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CategoryModal = ({ category, onClose, isAdd = false, onSave }) => {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [previewIcon, setPreviewIcon] = useState('');

  useEffect(() => {
    if (category) {
      setTitle(category.title || '');
      setIcon(category.icon || '');
      setPreviewIcon(category.icon || '');
    }
  }, [category]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setIcon(reader.result);
      setPreviewIcon(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a category title');
      return;
    }

    if (!icon && isAdd) {
      toast.error('Please select an icon');
      return;
    }

    onSave({ title: title.trim(), icon });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-medium mb-4">
          {isAdd ? 'Add Category' : 'Edit Category'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter category name"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Icon
            </label>
            <div className="flex items-center space-x-4">
              {previewIcon && (
                <img
                  src={previewIcon}
                  alt="Category icon"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="icon-upload"
              />
              <label
                htmlFor="icon-upload"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200"
              >
                Choose Icon
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              {isAdd ? 'Add' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
