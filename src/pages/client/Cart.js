import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setError('Please log in to view your cart.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const cartResponse = await axios.get(`http://localhost:5000/carts?userId=${user.id}`);
        const userCart = cartResponse.data[0];

        if (!userCart || !userCart.products || userCart.products.length === 0) {
          setCart({ userId: user.id, products: [] });
          setProducts([]);
          setLoading(false);
          return;
        }

        const productPromises = userCart.products.map((item) =>
          axios.get(`http://localhost:5000/products/${item.productId}`)
        );
        const productResponses = await Promise.all(productPromises);

        const productData = productResponses.map((res, index) => {
          const product = res.data;
          const cartItem = userCart.products[index];
          return {
            ...product,
            quantity: cartItem.quantity || 1,
            perBoxPrice: product.perBoxPrice || 0,
            stock: product.stock || 0,
          };
        });

        setCart(userCart);
        setProducts(productData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load cart.');
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const updateQuantity = async (productId, newQuantity) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    let validatedQuantity = Math.max(1, Math.min(newQuantity, product.stock));
    if (isNaN(newQuantity) || newQuantity < 1) validatedQuantity = 1;
    if (newQuantity > product.stock) validatedQuantity = product.stock;

    try {
      const updatedProducts = cart.products.map((item) =>
        item.productId === productId ? { ...item, quantity: validatedQuantity } : item
      );
      const updatedCart = { ...cart, products: updatedProducts };

      if (cart.id) {
        await axios.put(`http://localhost:5000/carts/${cart.id}`, updatedCart);
      } else {
        const response = await axios.post('http://localhost:5000/carts', updatedCart);
        updatedCart.id = response.data.id;
      }

      setCart(updatedCart);
      setProducts(
        products.map((p) => (p.id === productId ? { ...p, quantity: validatedQuantity } : p))
      );
    } catch (err) {
      alert('Failed to update quantity.');
    }
  };

  const removeItem = async (productId) => {
    try {
      const updatedProducts = cart.products.filter((item) => item.productId !== productId);
      const updatedCart = { ...cart, products: updatedProducts };

      if (updatedProducts.length === 0 && cart.id) {
        await axios.delete(`http://localhost:5000/carts/${cart.id}`);
        setCart(null);
      } else {
        await axios.put(`http://localhost:5000/carts/${cart.id}`, updatedCart);
        setCart(updatedCart);
      }

      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      alert('Failed to remove item.');
    }
  };

  const totalPrice = products.reduce((sum, product) => {
    const price = product.perBoxPrice || 0;
    return sum + price * (product.quantity || 1);
  }, 0);

  const handleCheckout = () => {
    if (products.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/checkout');
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
        Your Shopping Cart
      </h1>

      {products.length === 0 ? (
        <div className="text-center p-8 animate-fadeInUp">
          <p className="text-gray-600 text-lg">Your cart is empty.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
          <div className="space-y-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex flex-col sm:flex-row items-center justify-between border-b py-6 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Product Info */}
                <div className="flex items-center space-x-6 w-full sm:w-1/2 mb-4 sm:mb-0">
                  <img
                    src={product.image || 'https://via.placeholder.com/150'}
                    alt={product.title}
                    className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg shadow-md transform transition-transform duration-300 hover:scale-105"
                  />
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 line-clamp-1">
                      {product.title}
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      ₹{(product.perBoxPrice || 0).toFixed(2)} / box
                    </p>
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-1/2 justify-end">
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      onClick={() => updateQuantity(product.id, product.quantity - 1)}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l-lg hover:bg-gray-300 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={product.quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={product.quantity}
                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
                      className="w-16 sm:w-20 p-2 text-center border-2 border-gray-200 rounded-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                    <button
                      onClick={() => updateQuantity(product.id, product.quantity + 1)}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r-lg hover:bg-gray-300 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={product.quantity >= product.stock}
                    >
                      +
                    </button>
                    <span className="text-gray-400 text-sm ml-2 hidden sm:inline">
                      (Stock: {product.stock})
                    </span>
                  </div>
                  <p className="text-lg font-medium text-gray-800 w-full sm:w-auto text-center sm:text-right">
                    ₹{((product.perBoxPrice || 0) * product.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-md w-full sm:w-auto"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total and Checkout */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 p-4 bg-gray-50 rounded-lg shadow-inner">
            <p className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">
              Total: ₹{totalPrice.toFixed(2)}
            </p>
            <button
              onClick={handleCheckout}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Proceed to Checkout
            </button>
          </div>
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

export default Cart;