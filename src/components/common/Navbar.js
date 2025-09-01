import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Categories fetch error:', err);
        setCategories([
          { id: '1', name: 'Electronics' },
          { id: '2', name: 'Clothing' },
          { id: '3', name: 'Tiles' },
        ]);
      }
    };
    fetchCategories();
  }, []);

  const toggleMegaMenu = () => setIsMegaMenuOpen(!isMegaMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const closeMenus = () => {
    setIsMegaMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-900 via-gray-900 to-indigo-900 text-white p-4 sticky top-0 z-50 shadow-2xl">
      <div className="container mx-auto flex justify-between items-center">
        {/* Brand Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500 hover:from-pink-500 hover:to-blue-400 transition-all duration-500 animate-pulseLogo"
        >
          E-Commerce
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-full bg-indigo-800 hover:bg-indigo-700 transition-all duration-300 transform hover:rotate-90 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-10">
          <Link
            to="/"
            className="text-lg font-semibold hover:text-indigo-300 transition-all duration-300 transform hover:scale-110 animate-fadeIn"
            style={{ animationDelay: '0.1s' }}
          >
            Home
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <button className="text-lg font-semibold hover:text-indigo-300 focus:outline-none transition-all duration-300 flex items-center transform hover:scale-110">
              Categories
              <svg
                className={`w-5 h-5 ml-2 transform transition-transform duration-500 ${isMegaMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isMegaMenuOpen && (
              <div className="absolute left-0 mt-4 w-80 bg-gradient-to-br from-white to-gray-100 text-gray-800 rounded-2xl shadow-3xl p-6 grid grid-cols-1 gap-4 animate-dropIn">
                {categories.map((category, index) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={closeMenus}
                  >
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="font-medium">{category.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            to="/cart"
            className="text-lg font-semibold hover:text-indigo-300 transition-all duration-300 transform hover:scale-110 animate-fadeIn"
            style={{ animationDelay: '0.2s' }}
          >
            Cart
          </Link>
          {user ? (
            <>
              <Link
                to="/order-history"
                className="text-lg font-semibold hover:text-indigo-300 transition-all duration-300 transform hover:scale-110 animate-fadeIn"
                style={{ animationDelay: '0.3s' }}
              >
                Order History
              </Link>
              {user.role === 'admin' && (
                <div className="relative group">
                  <button className="text-lg font-semibold hover:text-indigo-300 transition-all duration-300 flex items-center transform hover:scale-110">
                    Admin
                    <svg
                      className="w-5 h-5 ml-2 transform transition-transform duration-500 group-hover:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-4 w-64 bg-gradient-to-br from-white to-gray-100 text-gray-800 rounded-2xl shadow-3xl p-4 hidden group-hover:block animate-dropIn">
                    <Link
                      to="/admin/dashboard"
                      className="block p-3 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-300"
                      onClick={closeMenus}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/products"
                      className="block p-3 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-300"
                      onClick={closeMenus}
                    >
                      Manage Products
                    </Link>
                    <Link
                      to="/admin/orders"
                      className="block p-3 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-300"
                      onClick={closeMenus}
                    >
                      Manage Orders
                    </Link>
                    <Link
                      to="/admin/users"
                      className="block p-3 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-300"
                      onClick={closeMenus}
                    >
                      Manage Users
                    </Link>
                    <Link
                      to="/admin/categories"
                      className="block p-3 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-300"
                      onClick={closeMenus}
                    >
                      Manage Categories
                    </Link>
                  </div>
                </div>
              )}
              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="text-lg font-semibold hover:text-indigo-300 transition-all duration-300 flex items-center transform hover:scale-110 animate-fadeIn"
                  style={{ animationDelay: '0.4s' }}
                >
                  {user.username || 'Profile'}
                  <svg
                    className={`w-5 h-5 ml-2 transform transition-transform duration-500 ${isProfileOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-48 bg-gradient-to-br from-white to-gray-100 text-gray-800 rounded-2xl shadow-3xl p-4 animate-dropIn">
                    <Link
                      to="/profile"
                      className="block p-3 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-300"
                      onClick={closeMenus}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        closeMenus();
                      }}
                      className="w-full text-left bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 rounded-full font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-300"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-lg font-semibold hover:text-indigo-300 transition-all duration-300 transform hover:scale-110 animate-fadeIn"
                style={{ animationDelay: '0.3s' }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md animate-fadeIn"
                style={{ animationDelay: '0.4s' }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 bg-gradient-to-br from-indigo-800 to-gray-900 p-6 rounded-2xl shadow-lg animate-slideInMobile">
          <Link
            to="/"
            className="block text-lg font-semibold hover:text-indigo-300 transition-all duration-300 py-2 animate-fadeInUp"
            onClick={closeMenus}
          >
            Home
          </Link>
          <div>
            <button
              className="w-full text-lg font-semibold hover:text-indigo-300 transition-all duration-300 py-2 flex items-center justify-between"
              onClick={toggleMegaMenu}
            >
              Categories
              <svg
                className={`w-5 h-5 transform transition-transform duration-500 ${isMegaMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isMegaMenuOpen && (
              <div className="mt-2 pl-4 space-y-2 animate-dropIn">
                {categories.map((category, index) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="block p-3 bg-indigo-900 hover:bg-indigo-700 rounded-lg transition-all duration-300 flex items-center space-x-3 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={closeMenus}
                  >
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            to="/cart"
            className="block text-lg font-semibold hover:text-indigo-300 transition-all duration-300 py-2 animate-fadeInUp"
            style={{ animationDelay: '0.1s' }}
            onClick={closeMenus}
          >
            Cart
          </Link>
          {user ? (
            <>
              <Link
                to="/order-history"
                className="block text-lg font-semibold hover:text-indigo-300 transition-all duration-300 py-2 animate-fadeInUp"
                style={{ animationDelay: '0.2s' }}
                onClick={closeMenus}
              >
                Order History
              </Link>
              {user.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="block text-lg font-semibold hover:text-indigo-300 transition-all duration-300 py-2 animate-fadeInUp"
                    style={{ animationDelay: '0.3s' }}
                    onClick={closeMenus}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/products"
                    className="block text-lg font-semibold hover:text-indigo-300 transition-all duration-300 py-2 animate-fadeInUp"
                    style={{ animationDelay: '0.4s' }}
                    onClick={closeMenus}
                  >
                    Manage Products
                  </Link>
                  <Link
                    to="/admin/orders"
                    className="block text-lg font-semibold hover:text-indigo-300 transition-all duration-300 py-2 animate-fadeInUp"
                    style={{ animationDelay: '0.5s' }}
                    onClick={closeMenus}
                  >
                    Manage Orders
                  </Link>
                  <Link
                    to="/admin/users"
                    className="block text-lg font-semibold hover:text-indigo-300 transition-all duration-300 py-2 animate-fadeInUp"
                    style={{ animationDelay: '0.6s' }}
                    onClick={closeMenus}
                  >
                    Manage Users
                  </Link>
                  <Link
                    to="/admin/categories"
                    className="block text-lg font-semibold hover:text-indigo-300 transition-all duration-300 py-2 animate-fadeInUp"
                    style={{ animationDelay: '0.7s' }}
                    onClick={closeMenus}
                  >
                    Manage Categories
                  </Link>
                </>
              )}
              {/* Mobile Profile Dropdown */}
              <div>
                <button
                  className="w-full text-lg font-semibold hover:text-indigo-300 transition-all duration-300 py-2 flex items-center justify-between"
                  onClick={toggleProfile}
                >
                  {user.username || 'Profile'}
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-500 ${isProfileOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isProfileOpen && (
                  <div className="mt-2 pl-4 space-y-2 animate-dropIn">
                    <Link
                      to="/profile"
                      className="block p-3 bg-indigo-900 hover:bg-indigo-700 rounded-lg transition-all duration-300"
                      onClick={closeMenus}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        closeMenus();
                      }}
                      className="block w-full text-left bg-gradient-to-r from-red-600 to-red-800 px-5 py-3 rounded-full font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-300 animate-fadeInUp"
                      style={{ animationDelay: '0.8s' }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block text-lg font-semibold hover:text-indigo-300 transition-all duration-300 py-2 animate-fadeInUp"
                style={{ animationDelay: '0.2s' }}
                onClick={closeMenus}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: '0.3s' }}
                onClick={closeMenus}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

// CSS remains unchanged
const customStyles = `
  @keyframes pulseLogo {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInMobile {
    from { opacity: 0; max-height: 0; transform: translateY(-10px); }
    to { opacity: 1; max-height: 600px; transform: translateY(0); }
  }

  .animate-pulseLogo {
    animation: pulseLogo 2s infinite ease-in-out;
  }

  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }

  .animate-dropIn {
    animation: dropIn 0.4s ease-out forwards;
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.4s ease-out forwards;
  }

  .animate-slideInMobile {
    animation: slideInMobile 0.5s ease-out forwards;
  }
`;

export default Navbar;