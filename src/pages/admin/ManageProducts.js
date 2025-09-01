import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    image: '',
    category: '',
    stock: '',
    material: '',
    application: '',
    size: '',
    color: '',
    qtyPerBox: '',
    coverageArea: '',
    noOfBoxes: '',
    perBoxPrice: '',
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get('http://localhost:5000/products'),
          axios.get('http://localhost:5000/categories'),
        ]);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data.');
        setLoading(false);
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      alert('Please select a category.');
      return;
    }
    try {
      const productData = {
        ...form,
        price: parseFloat(form.price || 0),
        stock: parseInt(form.stock || 0),
        qtyPerBox: parseInt(form.qtyPerBox || 0),
        noOfBoxes: parseInt(form.noOfBoxes || 0),
        perBoxPrice: parseFloat(form.perBoxPrice || 0),
      };
      if (editId) {
        await axios.put(`http://localhost:5000/products/${editId}`, productData);
        setProducts(products.map((p) => (p.id === editId ? { id: editId, ...productData } : p)));
        setEditId(null);
      } else {
        const response = await axios.post('http://localhost:5000/products', productData);
        setProducts([...products, response.data]);
      }
      setForm({
        title: '',
        price: '',
        description: '',
        image: '',
        category: '',
        stock: '',
        material: '',
        application: '',
        size: '',
        color: '',
        qtyPerBox: '',
        coverageArea: '',
        noOfBoxes: '',
        perBoxPrice: '',
      });
      setIsFormOpen(false);
    } catch (err) {
      console.error('Save product error:', err);
      alert('Failed to save product.');
    }
  };

  const handleEdit = (product) => {
    setForm(product);
    setEditId(product.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete product.');
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = search.toLowerCase();
    return (
      (product.title?.toLowerCase() || '').includes(searchLower) ||
      (product.description?.toLowerCase() || '').includes(searchLower) ||
      (product.category?.toLowerCase() || '').includes(searchLower) ||
      (product.material?.toLowerCase() || '').includes(searchLower) ||
      (product.application?.toLowerCase() || '').includes(searchLower) ||
      (product.size?.toLowerCase() || '').includes(searchLower) ||
      (product.color?.toLowerCase() || '').includes(searchLower) ||
      (product.coverageArea?.toLowerCase() || '').includes(searchLower)
    );
  });

  if (loading) return <div className="text-center p-4 text-gray-600">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Manage Products
        </h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 p-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors shadow-md"
          >
            {isFormOpen ? 'Close Form' : 'Add Product'}
          </button>
        </div>
      </div>

      {/* Form Section */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 transform transition-all duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                placeholder="Enter title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                placeholder="Enter description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border border-gray-300 rounded-lg file:bg-indigo-50 file:border-0 file:rounded file:p-2 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                placeholder="Enter stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Material</label>
              <input
                type="text"
                placeholder="Enter material"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Application</label>
              <input
                type="text"
                placeholder="Enter application"
                value={form.application}
                onChange={(e) => setForm({ ...form, application: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Size</label>
              <input
                type="text"
                placeholder="Enter size"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="text"
                placeholder="Enter color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Qty. Per Box</label>
              <input
                type="number"
                placeholder="Enter qty per box"
                value={form.qtyPerBox}
                onChange={(e) => setForm({ ...form, qtyPerBox: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Coverage Area</label>
              <input
                type="text"
                placeholder="Enter coverage area"
                value={form.coverageArea}
                onChange={(e) => setForm({ ...form, coverageArea: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">No. of Boxes</label>
              <input
                type="number"
                placeholder="Enter no. of boxes"
                value={form.noOfBoxes}
                onChange={(e) => setForm({ ...form, noOfBoxes: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Per Box Price (₹)</label>
              <input
                type="number"
                placeholder="Enter price per box"
                value={form.perBoxPrice}
                onChange={(e) => setForm({ ...form, perBoxPrice: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              >
                {editId ? 'Update Product' : 'Add Product'}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setForm({
                      title: '',
                      price: '',
                      description: '',
                      image: '',
                      category: '',
                      stock: '',
                      material: '',
                      application: '',
                      size: '',
                      color: '',
                      qtyPerBox: '',
                      coverageArea: '',
                      noOfBoxes: '',
                      perBoxPrice: '',
                    });
                    setIsFormOpen(false);
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <p className="text-gray-600 text-center col-span-full">
            No products found matching your search.
          </p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={product.image || 'https://via.placeholder.com/400x300'}
                alt={product.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{product.title}</h2>
              <div className="space-y-1 text-gray-600 text-sm">
                <p><span className="font-medium">Category:</span> {product.category}</p>
                <p><span className="font-medium">Material:</span> {product.material}</p>
                <p><span className="font-medium">Size:</span> {product.size}</p>
                <p><span className="font-medium">Color:</span> {product.color}</p>
                <p><span className="font-medium">Stock:</span> {product.stock}</p>
                <p><span className="font-medium">Price:</span> ₹{product.perBoxPrice}</p>
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageProducts;