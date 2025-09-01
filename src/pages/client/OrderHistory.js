import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const OrderHistory = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null); // Track expanded order

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setError('Please log in to view your order history.');
        setLoading(false);
        return;
      }

      try {
        const ordersResponse = await axios.get(`http://localhost:5000/orders?userId=${user.id}`);
        const ordersData = ordersResponse.data;

        const ordersWithDetails = await Promise.all(
          ordersData.map(async (order) => {
            const productPromises = order.products.map((item) =>
              axios.get(`http://localhost:5000/products/${item.productId}`)
            );
            const productResponses = await Promise.all(productPromises);
            const products = productResponses.map((res, index) => ({
              ...res.data,
              quantity: order.products[index].quantity || 1,
              perBoxPrice: res.data.perBoxPrice || 0,
            }));

            return { ...order, productDetails: products };
          })
        );

        setOrders(ordersWithDetails);
        setLoading(false);
      } catch (err) {
        setError('Failed to load order history.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getProductTitles = (productDetails) => {
    if (!productDetails || productDetails.length === 0) return 'N/A';
    const titles = productDetails.map((product) => product.title);
    return titles.join(', ').slice(0, 50) + (titles.join(', ').length > 50 ? '...' : '');
  };

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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
        Your Order History
      </h1>

      {orders.length === 0 ? (
        <div className="text-center p-8 animate-fadeInUp">
          <p className="text-gray-600 text-lg">You have no orders yet.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Accordion Header */}
              <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                  <p className="text-gray-800"><strong>Order ID:</strong> {order.id}</p>
                  <p className="text-gray-600 line-clamp-1"><strong>Products:</strong> {getProductTitles(order.productDetails)}</p>
                  <p className="text-gray-600"><strong>Phone:</strong> {order.shippingDetails?.phonenumber || 'N/A'}</p>
                </div>
                <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-300 ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Accordion Content */}
              {expandedOrder === order.id && (
                <div className="p-6 bg-white animate-slideDown">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipping Details */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">Shipping Details</h4>
                      {[
                        { label: 'Username', value: order.shippingDetails?.username },
                        { label: 'First Name', value: order.shippingDetails?.firstname },
                        { label: 'Last Name', value: order.shippingDetails?.lastname },
                        { label: 'Company', value: order.shippingDetails?.companyname },
                        { label: 'Address', value: order.shippingDetails?.address },
                        { label: 'State', value: order.shippingDetails?.state },
                        { label: 'Postal Code', value: order.shippingDetails?.postalCode },
                        { label: 'Country', value: order.shippingDetails?.country },
                        { label: 'Email', value: order.shippingDetails?.email },
                        { label: 'Phone', value: order.shippingDetails?.phonenumber },
                      ].map((item) => (
                        <p key={item.label} className="text-gray-600">
                          <strong>{item.label}:</strong> {item.value || 'N/A'}
                        </p>
                      ))}
                    </div>

                    {/* Products */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">Products</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {order.productDetails.map((product) => (
                          <li key={product.id} className="text-gray-600 flex items-center">
                            <img
                              src={product.image || 'https://via.placeholder.com/40'}
                              alt={product.title}
                              className="h-8 w-8 object-cover rounded mr-2"
                            />
                            <span>
                              {product.title} (x{product.quantity}) - ₹{(product.perBoxPrice * product.quantity).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Total and Date */}
                    <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-gray-800">
                        Total: ₹{order.total.toFixed(2)}
                      </p>
                      <p className="text-gray-600">
                        <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
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

  @keyframes slideDown {
    from { opacity: 0; max-height: 0; }
    to { opacity: 1; max-height: 1000px; } /* Adjust max-height as needed */
  }

  .animate-fadeIn {
    animation: fadeIn 1s ease-in-out;
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.8s ease-out;
  }

  .animate-slideDown {
    animation: slideDown 0.5s ease-out;
  }
`;

export default OrderHistory;