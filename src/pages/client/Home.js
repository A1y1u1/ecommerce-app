import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [
    '/uploads/1.jpg',
    '/uploads/2.jpg',
    '/uploads/3.jpg',
    '/uploads/4.jpg',
    '/uploads/5.jpg',
    '/uploads/6.jpg',
    '/uploads/7.jpg',
    '/uploads/8.jpg',
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/products');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products.');
        setLoading(false);
      }
    };
    fetchProducts();

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    carouselImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  const goToSlide = (index) => setCurrentSlide(index);

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

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );
  if (error) return (
    <div className="text-center p-4 text-red-500 animate-pulse">{error}</div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Carousel */}
      <div className="relative mb-12 overflow-hidden rounded-xl shadow-2xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {carouselImages.map((image, index) => (
            <div key={index} className="min-w-full h-[300px] sm:h-[400px] md:h-[500px] relative">
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <h2 className="text-white text-2xl md:text-3xl font-bold animate-fadeInUp">
                  Tiles View Collections {index + 1}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 text-gray-800 p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
        >
          ❮
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 text-gray-800 p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
        >
          ❯
        </button>

        {/* Enhanced Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Animated Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center text-gray-800 animate-fadeIn">
        Discover Our Products
      </h1>

      {/* Enhanced Search Bar */}
      <div className="mb-8 max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 pl-12 border-2 border-gray-200 rounded-full shadow-md focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 bg-white"
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

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <p className="text-gray-600 text-center text-lg animate-fadeIn">
          No products found. Try a different search!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <Link
              to={`/product/${product.id}`}
              key={product.id}
              className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-48 w-full object-cover transform transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h2 className="text-xl font-semibold mt-4 text-gray-800 line-clamp-1">
                {product.title}
              </h2>
              <p className="text-gray-600 mt-2 line-clamp-2">{product.description}</p>
              <div className="mt-3 text-blue-600 font-medium hover:underline">
                View Details →
              </div>
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
`;

export default Home;