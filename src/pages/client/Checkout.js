import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState([]);
  const [shipping, setShipping] = useState({
    username: '',
    password: '',
    firstname: '',
    lastname: '',
    companyname: '',
    address: '',
    state: '',
    postalCode: '',
    country: '',
    email: '',
    phonenumber: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod'); // Default to Cash on Delivery
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setError('Please log in to proceed with checkout.');
        setLoading(false);
        return;
      }

      try {
        const cartResponse = await axios.get(`http://localhost:5000/carts?userId=${user.id}`);
        const userCart = cartResponse.data[0];

        if (!userCart || userCart.products.length === 0) {
          setError('Your cart is empty.');
          setLoading(false);
          return;
        }

        const productPromises = userCart.products.map((item) =>
          axios.get(`http://localhost:5000/products/${item.productId}`)
        );
        const productResponses = await Promise.all(productPromises);
        const productData = productResponses.map((res) => ({
          ...res.data,
          quantity: userCart.products.find((p) => p.productId === res.data.id).quantity,
          perBoxPrice: res.data.perBoxPrice || 0,
        }));

        setCart(userCart);
        setProducts(productData);
        setLoading(false);

        setShipping((prev) => ({
          ...prev,
          username: user.email.split('@')[0],
          email: user.email,
          phonenumber: user.phoneNumber || '', // Pre-fill from AuthContext if available
        }));
      } catch (err) {
        setError('Failed to load checkout data.');
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const totalPrice = products.reduce((sum, product) => sum + (product.perBoxPrice || 0) * (product.quantity || 1), 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const requiredFields = ['firstname', 'lastname', 'address', 'state', 'postalCode', 'country', 'email', 'phonenumber'];
    const missingFields = requiredFields.filter((field) => !shipping[field]);
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shipping.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(shipping.phonenumber)) {
      alert('Please enter a valid phone number (10-15 digits).');
      return;
    }

    try {
      const order = {
        userId: user.id,
        products: cart.products,
        shippingDetails: shipping,
        paymentMethod: paymentMethod, // Include payment method
        status: paymentMethod === 'cod' ? 'pending' : 'processing', // COD stays pending
        total: totalPrice,
        createdAt: new Date().toISOString(),
      };

      await axios.post('http://localhost:5000/orders', order);

      if (cart.id) {
        await axios.delete(`http://localhost:5000/carts/${cart.id}`);
      }

      alert('Order placed successfully!');
      navigate('/');
    } catch (err) {
      alert('Failed to place order.');
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

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-8 text-center animate-fadeIn">
        Complete Your Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Order Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-xl animate-fadeInUp">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full mb-6 text-sm md:text-base">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-center">Price</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr
                    key={product.id}
                    className="border-b animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <td className="p-3 flex items-center">
                      <img
                        src={product.image || 'https://via.placeholder.com/150'}
                        alt={product.title}
                        className="h-12 w-12 object-cover rounded mr-3 shadow-sm"
                      />
                      <span className="line-clamp-2">{product.title}</span>
                    </td>
                    <td className="p-3 text-center">₹{(product.perBoxPrice || 0).toFixed(2)}</td>
                    <td className="p-3 text-center">{product.quantity}</td>
                    <td className="p-3 text-right">₹{((product.perBoxPrice || 0) * product.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-lg font-semibold text-gray-800">Total:</span>
            <span className="text-2xl font-bold text-gray-900">₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping and Payment Form */}
        <div className="bg-white p-6 rounded-2xl shadow-xl animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Shipping Details</h2>
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'firstname', placeholder: 'First Name', required: true },
                { name: 'lastname', placeholder: 'Last Name', required: true },
                { name: 'companyname', placeholder: 'Company Name (Optional)', required: false },
                { name: 'address', placeholder: 'Address', required: true, colSpan: true },
                { name: 'state', placeholder: 'State', required: true },
                { name: 'postalCode', placeholder: 'Postal Code', required: true },
                { name: 'country', placeholder: 'Country', required: true },
                { name: 'email', placeholder: 'Email', type: 'email', required: true },
                { name: 'phonenumber', placeholder: 'Phone Number', required: true },
              ].map((field) => (
                <div key={field.name} className={field.colSpan ? 'sm:col-span-2' : ''}>
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={shipping[field.name]}
                    onChange={handleShippingChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    required={field.required}
                  />
                </div>
              ))}
            </div>

            {/* Payment Method */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={handlePaymentChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-gray-700">Cash on Delivery (COD)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={handlePaymentChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-gray-700">Online Payment (Coming Soon)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg mt-6"
            >
              Place Order
            </button>
          </form>
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

export default Checkout;