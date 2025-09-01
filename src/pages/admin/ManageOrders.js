import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersResponse = await axios.get('http://localhost:5000/orders');
        const ordersData = ordersResponse.data;

        const ordersWithDetails = await Promise.all(
          ordersData.map(async (order) => {
            const productPromises = order.products.map((item) =>
              axios.get(`http://localhost:5000/products/${item.productId}`)
            );
            const productResponses = await Promise.all(productPromises);
            const products = productResponses.map((res, index) => ({
              ...res.data,
              quantity: order.products[index].quantity,
            }));

            let user = { email: 'N/A', role: 'N/A' };
            try {
              const userResponse = await axios.get(`http://localhost:5000/users/${order.userId}`);
              user = userResponse.data || user;
            } catch (userErr) {
              console.error(`Failed to fetch user ${order.userId}:`, userErr);
            }

            return { ...order, productDetails: products, userDetails: user };
          })
        );

        setOrders(ordersWithDetails);
        setLoading(false);
      } catch (err) {
        setError('Failed to load orders.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const orderToUpdate = orders.find((order) => order.id === orderId);
      const updatedOrder = {
        ...orderToUpdate,
        status: newStatus,
        paymentMethod: orderToUpdate.paymentMethod, // Preserve paymentMethod
      };
      delete updatedOrder.productDetails; // Remove temporary fields
      delete updatedOrder.userDetails;

      await axios.put(`http://localhost:5000/orders/${orderId}`, updatedOrder);
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      alert('Order status updated!');
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await axios.delete(`http://localhost:5000/orders/${orderId}`);
      setOrders(orders.filter((order) => order.id !== orderId));
      alert('Order deleted!');
    } catch (err) {
      alert('Failed to delete order.');
    }
  };

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

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const orderIdMatch = order.id.toString().includes(searchLower);
    const userEmailMatch = order.userDetails?.email?.toLowerCase().includes(searchLower) || false;
    const userRoleMatch = order.userDetails?.role?.toLowerCase().includes(searchLower) || false;
    const shippingDetails = order.shippingDetails || {};
    const shippingMatch = Object.values(shippingDetails).join(' ').toLowerCase().includes(searchLower) || false;
    const productTitles = order.productDetails.map((product) => product.title.toLowerCase()).join(' ');
    const productMatch = productTitles.includes(searchLower);
    const totalMatch = order.total.toString().includes(searchLower);
    const statusMatch = order.status.toLowerCase().includes(searchLower);
    const paymentMethodMatch = order.paymentMethod?.toLowerCase().includes(searchLower) || false; // Add payment method to search

    return (
      orderIdMatch ||
      userEmailMatch ||
      userRoleMatch ||
      shippingMatch ||
      productMatch ||
      totalMatch ||
      statusMatch ||
      paymentMethodMatch
    );
  });

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
        Manage Orders
      </h1>

      {/* Search Bar */}
      <div className="mb-8 max-w-lg mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search orders by ID, email, payment method, etc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 border-2 border-gray-200 rounded-full shadow-md focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center p-8 animate-fadeInUp">
          <p className="text-gray-600 text-lg">
            {searchTerm ? 'No orders found matching your search.' : 'No orders found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          {filteredOrders.map((order, index) => (
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
                  <p className="text-gray-600"><strong>Email:</strong> {order.userDetails?.email || 'N/A'}</p>
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
                    {/* User Details */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">User Details</h4>
                      <p><strong>Email:</strong> {order.userDetails?.email || 'N/A'}</p>
                      <p><strong>Role:</strong> {order.userDetails?.role || 'N/A'}</p>
                    </div>

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
                    <div className="col-span-1 md:col-span-2 space-y-2">
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

                    {/* Payment Method and Total */}
                    <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-gray-50 rounded-lg flex flex-col space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700">Payment Details</h4>
                        <p className="text-gray-600">
                          <strong>Payment Method:</strong>{' '}
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'online' ? 'Online Payment' : 'N/A'}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-center">
                        <p className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">
                          Total: ₹{order.total.toFixed(2)}
                        </p>
                        <div className="flex space-x-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className="p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300 bg-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-md"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
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

export default ManageOrders;