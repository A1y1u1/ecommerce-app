import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product.');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (value > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(value);
    }
  };

  const addToCart = async () => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      return;
    }
    try {
      const cartResponse = await axios.get(`http://localhost:5000/carts?userId=${user.id}`);
      const cart = cartResponse.data[0] || { userId: user.id, products: [] };

      const existingProduct = cart.products.find((p) => p.productId === product.id);
      const updatedProducts = existingProduct
        ? cart.products.map((p) =>
            p.productId === product.id
              ? { ...p, quantity: p.quantity + quantity }
              : p
          )
        : [...cart.products, { productId: product.id, quantity }];

      if (cart.id) {
        await axios.put(`http://localhost:5000/carts/${cart.id}`, {
          ...cart,
          products: updatedProducts,
        });
      } else {
        await axios.post('http://localhost:5000/carts', {
          userId: user.id,
          products: updatedProducts,
        });
      }
      alert(`${quantity} box${quantity > 1 ? 'es' : ''} added to cart!`);
    } catch (err) {
      alert('Failed to add to cart.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );
  if (error) return (
    <div className="text-center p-4 text-red-500 text-lg animate-pulse">{error}</div>
  );
  if (!product) return (
    <div className="text-center p-4 text-gray-600 text-lg animate-fadeIn">Product not found.</div>
  );

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl mx-auto animate-fadeInUp">
        <div className="flex flex-col lg:flex-row gap-8 p-8">
          {/* Product Image Section */}
          <div className="w-full lg:w-1/2">
            <div className="relative overflow-hidden rounded-xl shadow-lg">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-72 md:h-96 object-cover transform transition-transform duration-500 hover:scale-105"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-6 animate-fadeIn">
              {product.title}
            </h1>
          </div>

          {/* Product Details Section */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between">
            <div className="space-y-4">
              {[
                { label: 'Material', value: product.material },
                { label: 'Application', value: product.application },
                { label: 'Size', value: product.size },
                { label: 'Color', value: product.color },
                { label: 'Qty. Per Box', value: product.qtyPerBox },
                { label: 'Coverage Area', value: product.coverageArea },
              ].map((item, index) => (
                <p
                  key={item.label}
                  className="text-gray-700 animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <strong className="text-gray-900">{item.label}:</strong> {item.value}
                </p>
              ))}
            </div>

            {/* Quantity and Price Section */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="font-semibold text-gray-800">
                  Quantity (Boxes):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={product.stock}
                    className="w-24 p-2 pl-4 pr-8 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 disabled:bg-gray-100"
                    disabled={product.stock === 0}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    / {product.stock}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-gray-700">
                  <strong>Per Box:</strong> ₹{product.perBoxPrice}
                </p>
                <p className="text-xl font-semibold text-gray-800">
                  <strong>Total:</strong> ₹{(product.perBoxPrice * quantity).toFixed(2)}
                </p>
              </div>

              <button
                onClick={addToCart}
                className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  product.stock > 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
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

export default ProductDetails;