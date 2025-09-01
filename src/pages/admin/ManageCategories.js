import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/categories');
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load categories.');
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      alert('Category name cannot be empty.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/categories', {
        name: newCategory.trim(),
      });
      setCategories([...categories, response.data]);
      setNewCategory('');
      alert('Category added successfully!');
    } catch (err) {
      alert('Failed to add category.');
    }
  };

  const updateCategory = async (categoryId) => {
    if (!editCategory.name.trim()) {
      alert('Category name cannot be empty.');
      return;
    }
    try {
      const updatedCategory = { ...editCategory, name: editCategory.name.trim() };
      await axios.put(`http://localhost:5000/categories/${categoryId}`, updatedCategory);
      setCategories(
        categories.map((cat) => (cat.id === categoryId ? updatedCategory : cat))
      );
      setEditCategory(null);
      alert('Category updated successfully!');
    } catch (err) {
      alert('Failed to update category.');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`http://localhost:5000/categories/${categoryId}`);
      setCategories(categories.filter((cat) => cat.id !== categoryId));
      alert('Category deleted!');
    } catch (err) {
      alert('Failed to delete category.');
    }
  };

  const handleEditChange = (e) => {
    setEditCategory((prev) => ({ ...prev, name: e.target.value }));
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );
  if (error) return (
    <div className="text-center p-4 text-red-500 text-lg animate-pulse">{error}</div>
  );

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-8 text-center animate-fadeIn">
        Manage Categories
      </h1>

      {/* Add Category Form */}
      <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 max-w-2xl mx-auto animate-fadeInUp">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Category</h2>
        <form onSubmit={addCategory} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-grow p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            Add Category
          </button>
        </form>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center p-8 animate-fadeInUp">
          <p className="text-gray-600 text-lg">No categories found.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {editCategory && editCategory.id === category.id ? (
                // Edit Form
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Edit Category #{category.id}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Category Name"
                      value={editCategory.name}
                      onChange={handleEditChange}
                      className="flex-grow p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                    <div className="flex space-x-4">
                      <button
                        onClick={() => updateCategory(category.id)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditCategory(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Category Card
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {category.name}
                    </h2>
                    <span className="text-gray-500 text-sm">ID: {category.id}</span>
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <button
                      onClick={() => setEditCategory(category)}
                      className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add these custom animations to your CSS (e.g., in index.css)
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fadeIn {
    animation: fadeIn 1s ease-in-out;
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.8s ease-out;
  }
`;

export default ManageCategories;