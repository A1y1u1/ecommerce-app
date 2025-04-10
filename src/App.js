import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/client/Home';
import ProductDetails from './pages/client/ProductDetails';
import CategoryPage from './pages/client/CategoryPage';
import Cart from './pages/client/Cart';
import Checkout from './pages/client/Checkout';
import OrderHistory from './pages/client/OrderHistory';
import ProfileDetails from './pages/client/ProfileDetails';
import Login from './pages/client/Login';
import Signup from './pages/client/Signup';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers'; // Add this imp
import ManageCategories from './pages/admin/ManageCategories';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/profile" element={<ProfileDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {user && user.role === 'admin' && (
            <>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ManageProducts />} />
              <Route path="/admin/orders" element={<ManageOrders />} />
              <Route path="/admin/users" element={<ManageUsers />} /> 
              <Route path="/admin/categories" element={<ManageCategories />} />
            </>
          )}
          <Route path="*" element={<div className="text-center p-4">404 - Page Not Found</div>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;