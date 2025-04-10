import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CategoryPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        const categoryResponse = await axios.get(`http://localhost:5000/categories/${id}`);
        setCategory(categoryResponse.data);

        const productsResponse = await axios.get('http://localhost:5000/products');
        const filteredProducts = productsResponse.data.filter(
          (product) => product.category.toLowerCase() === categoryResponse.data.name.toLowerCase()
        );
        setProducts(filteredProducts);
        setLoading(false);
      } catch (err) {
        setError('Failed to load category or products.');
        setLoading(false);
      }
    };
    fetchCategoryAndProducts();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );
  if (error) return (
    <div className="text-center p-4 text-red-500 text-lg animate-pulse">{error}</div>
  );
  if (!category) return (
    <div className="text-center p-8 text-gray-600 text-lg animate-fadeInUp">Category not found.</div>
  );

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-8 text-center animate-fadeIn">
        {category.name} Products
      </h1>

      {products.length === 0 ? (
        <div className="text-center p-8 animate-fadeInUp">
          <p className="text-gray-600 text-lg">No products found in this category.</p>
          <Link
            to="/"
            className="mt-4 inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {products.map((product, index) => (
            <Link
              to={`/product/${product.id}`}
              key={product.id}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                <img
                  src={product.image || 'https://via.placeholder.com/300'}
                  alt={product.title}
                  className="h-48 w-full object-cover rounded-lg mb-4 transition-transform duration-300 transform hover:scale-105"
                />
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {category.name}
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">{product.title}</h2>
              <p className="text-gray-600 mt-2 line-clamp-2">{product.description}</p>
              <p className="text-gray-900 font-bold mt-3 text-lg">₹{product.perBoxPrice.toFixed(2)}</p>
              <button className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md">
                View Details
              </button>
            </Link>
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

  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

export default CategoryPage;