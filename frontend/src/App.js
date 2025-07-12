import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { token, user: userData } = response.data;
    
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    
    return userData;
  };

  const register = async (email, username, password) => {
    const response = await axios.post(`${API}/auth/register`, { email, username, password });
    const { token, user: userData } = response.data;
    
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

// Components
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              ReWear
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/browse" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  Browse Items
                </Link>
                <Link to="/add-item" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  List Item
                </Link>
                <Link to="/dashboard" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {user.points} points
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Landing = () => {
  const { user } = useAuth();
  const [featuredItems, setFeaturedItems] = useState([]);

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  const fetchFeaturedItems = async () => {
    try {
      const response = await axios.get(`${API}/items?limit=6`);
      setFeaturedItems(response.data);
    } catch (error) {
      console.error('Error fetching featured items:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Sustainable</span>{' '}
                  <span className="block text-green-600 xl:inline">Fashion Exchange</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Give your clothes a second life! Exchange, swap, or redeem clothing items with our community-driven platform. Reduce waste, save money, and discover unique fashion pieces.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to={user ? "/browse" : "/register"}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
                    >
                      Start Swapping
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/browse"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 md:py-4 md:text-lg md:px-10"
                    >
                      Browse Items
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.pexels.com/photos/6769372/pexels-photo-6769372.jpeg"
            alt="Clothing exchange"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How ReWear Works
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <span className="text-xl font-bold">1</span>
                </div>
                <div className="ml-16">
                  <img src="https://images.unsplash.com/photo-1573311392049-4186e3a47e9c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxjbG90aGluZyUyMHdhcmRyb2JlfGVufDB8fHx8MTc1MjI5MTU0MXww&ixlib=rb-4.1.0&q=85" alt="Organized wardrobe" className="h-32 w-full object-cover rounded-lg mb-4" />
                  <h3 className="text-lg leading-6 font-medium text-gray-900">List Your Items</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Upload photos and details of clothing items you no longer wear. Set your preferred exchange method.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <span className="text-xl font-bold">2</span>
                </div>
                <div className="ml-16">
                  <img src="https://images.unsplash.com/photo-1638604587609-fbb8469f4234?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxjbG90aGluZyUyMHdhcmRyb2JlfGVufDB8fHx8MTc1MjI5MTU0MXww&ixlib=rb-4.1.0&q=85" alt="Clothing variety" className="h-32 w-full object-cover rounded-lg mb-4" />
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Browse & Discover</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Explore items from our community. Filter by size, category, and condition to find perfect matches.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <span className="text-xl font-bold">3</span>
                </div>
                <div className="ml-16">
                  <img src="https://images.unsplash.com/photo-1610210972338-ee1f30604994?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY29tbXVuaXR5fGVufDB8fHx8MTc1MjI5MTU0OHww&ixlib=rb-4.1.0&q=85" alt="Fashion community" className="h-32 w-full object-cover rounded-lg mb-4" />
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Exchange & Earn</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Swap items directly or use points to redeem. Earn points when others choose your items.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
              Featured Items
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {item.images && item.images.length > 0 ? (
                      <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.category} • Size {item.size}</p>
                    <p className="text-sm text-gray-500 mt-2">{item.description}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-green-600 font-semibold">{item.price_points} points</span>
                      <Link 
                        to={`/items/${item.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center">
            <Link to="/register" className="text-green-600 hover:text-green-500">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(email, username, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Email address"
            />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Username"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-green-600 hover:text-green-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/items`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading items...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Items</h1>
          
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No items available yet.</div>
              <Link to="/add-item" className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
                Be the first to list an item!
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {item.images && item.images.length > 0 ? (
                      <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.category} • Size {item.size} • {item.condition}
                    </p>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                    <p className="text-xs text-gray-400 mt-1">by {item.owner_username}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-green-600 font-semibold">{item.price_points} points</span>
                      <Link 
                        to={`/items/${item.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AddItem = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tops',
    size: '',
    condition: 'good',
    tags: '',
    price_points: 50
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create item
      const itemData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      const response = await axios.post(`${API}/items`, itemData);
      const itemId = response.data.id;

      // Upload images
      for (const image of images) {
        const formData = new FormData();
        formData.append('file', image);
        await axios.post(`${API}/items/${itemId}/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Error creating item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-600 text-2xl font-semibold mb-4">Item listed successfully!</div>
          <div className="text-gray-600">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">List a New Item</h1>
          
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Vintage Denim Jacket"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe the item, its condition, style, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="tops">Tops</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="dresses">Dresses</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <input
                  type="text"
                  name="size"
                  required
                  value={formData.size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., M, L, 32, 8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Points Required</label>
              <input
                type="number"
                name="price_points"
                value={formData.price_points}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., vintage, casual, summer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImages(Array.from(e.target.files))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-sm text-gray-500 mt-1">You can select multiple images</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
            >
              {loading ? 'Creating Item...' : 'List Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [receivedSwaps, setReceivedSwaps] = useState([]);
  const [sentSwaps, setSentSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [itemsRes, receivedRes, sentRes] = await Promise.all([
        axios.get(`${API}/my-items`),
        axios.get(`${API}/swaps/received`),
        axios.get(`${API}/swaps/sent`)
      ]);
      
      setMyItems(itemsRes.data);
      setReceivedSwaps(receivedRes.data);
      setSentSwaps(sentRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapAction = async (swapId, action) => {
    try {
      await axios.put(`${API}/swaps/${swapId}/${action}`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error(`Error ${action}ing swap:`, error);
      alert(`Error ${action}ing swap`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="mt-4 bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Welcome back, {user.username}!</h2>
                  <p className="text-gray-600">You have {user.points} points available</p>
                </div>
                <Link
                  to="/add-item"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  List New Item
                </Link>
              </div>
            </div>
          </div>

          {/* My Items */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Items ({myItems.length})</h2>
            {myItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">You haven't listed any items yet.</p>
                <Link to="/add-item" className="mt-2 inline-block text-green-600 hover:text-green-500">
                  List your first item
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow p-4">
                    <div className="h-32 bg-gray-200 rounded mb-3 flex items-center justify-center">
                      {item.images && item.images.length > 0 ? (
                        <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} className="h-full w-full object-cover rounded" />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.category} • {item.condition}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className={`text-sm ${item.available ? 'text-green-600' : 'text-red-600'}`}>
                        {item.available ? 'Available' : 'Not Available'}
                      </span>
                      <span className="text-sm text-gray-500">{item.price_points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Received Swap Requests */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Received Requests ({receivedSwaps.length})</h2>
            {receivedSwaps.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No swap requests received yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {receivedSwaps.map((swap) => (
                    <div key={swap.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{swap.item_title}</h3>
                          <p className="text-sm text-gray-600">
                            Request from {swap.requester_username}
                          </p>
                          {swap.is_points_request ? (
                            <p className="text-sm text-green-600">Points redemption request</p>
                          ) : (
                            <p className="text-sm text-blue-600">
                              Offering: {swap.offered_item_title || 'Direct swap'}
                            </p>
                          )}
                          {swap.message && (
                            <p className="text-sm text-gray-500 mt-1">"{swap.message}"</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {swap.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleSwapAction(swap.id, 'accept')}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleSwapAction(swap.id, 'reject')}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <span className={`px-2 py-1 rounded text-xs ${
                            swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            swap.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {swap.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sent Swap Requests */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sent Requests ({sentSwaps.length})</h2>
            {sentSwaps.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No swap requests sent yet.</p>
                <Link to="/browse" className="mt-2 inline-block text-green-600 hover:text-green-500">
                  Browse items to start swapping
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {sentSwaps.map((swap) => (
                    <div key={swap.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{swap.item_title}</h3>
                          <p className="text-sm text-gray-600">
                            Request to {swap.owner_username}
                          </p>
                          {swap.is_points_request ? (
                            <p className="text-sm text-green-600">Points redemption request</p>
                          ) : (
                            <p className="text-sm text-blue-600">Direct swap request</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          swap.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {swap.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [swapData, setSwapData] = useState({
    is_points_request: false,
    offered_item_id: '',
    message: ''
  });
  const [myItems, setMyItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItem();
    if (user) {
      fetchMyItems();
    }
  }, [id, user]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`${API}/items/${id}`);
      setItem(response.data);
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyItems = async () => {
    try {
      const response = await axios.get(`${API}/my-items`);
      setMyItems(response.data.filter(item => item.available && item.id !== id));
    } catch (error) {
      console.error('Error fetching my items:', error);
    }
  };

  const handleSwapRequest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${API}/swaps`, swapData);
      alert('Swap request sent successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating swap request:', error);
      alert(error.response?.data?.detail || 'Error sending swap request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading item...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Item not found</div>
      </div>
    );
  }

  const isOwner = user && item.owner_id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Image Gallery */}
              <div>
                <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  {item.images && item.images.length > 0 ? (
                    <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-gray-400">No image available</span>
                  )}
                </div>
                {item.images && item.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {item.images.slice(1).map((image, index) => (
                      <img
                        key={index}
                        src={`${BACKEND_URL}${image}`}
                        alt={`${item.title} ${index + 2}`}
                        className="h-16 w-16 object-cover rounded flex-shrink-0"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {item.category}
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                    Size {item.size}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {item.condition}
                  </span>
                </div>

                <p className="text-gray-700 mb-6">{item.description}</p>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Owner</h3>
                  <p className="text-gray-600">{item.owner_username}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Points Required</h3>
                  <p className="text-2xl font-bold text-green-600">{item.price_points} points</p>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Swap Options */}
                {!isOwner && item.available && user && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Request this item</h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="swap_type"
                          checked={swapData.is_points_request}
                          onChange={() => setSwapData({...swapData, is_points_request: true, offered_item_id: ''})}
                          className="mr-2"
                        />
                        <span>Redeem with points ({item.price_points} points)</span>
                        {user.points < item.price_points && (
                          <span className="ml-2 text-red-600 text-sm">(Insufficient points)</span>
                        )}
                      </label>

                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="swap_type"
                          checked={!swapData.is_points_request}
                          onChange={() => setSwapData({...swapData, is_points_request: false})}
                          className="mr-2"
                        />
                        <span>Offer item in exchange</span>
                      </label>

                      {!swapData.is_points_request && (
                        <select
                          value={swapData.offered_item_id}
                          onChange={(e) => setSwapData({...swapData, offered_item_id: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select an item to offer</option>
                          {myItems.map((myItem) => (
                            <option key={myItem.id} value={myItem.id}>
                              {myItem.title} ({myItem.category}, {myItem.size})
                            </option>
                          ))}
                        </select>
                      )}

                      <textarea
                        value={swapData.message}
                        onChange={(e) => setSwapData({...swapData, message: e.target.value})}
                        placeholder="Add a message (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                      />

                      <button
                        onClick={handleSwapRequest}
                        disabled={
                          (swapData.is_points_request && user.points < item.price_points) ||
                          (!swapData.is_points_request && !swapData.offered_item_id)
                        }
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md"
                      >
                        Send Request
                      </button>
                    </div>
                  </div>
                )}

                {!user && (
                  <div className="border-t pt-6">
                    <Link
                      to="/login"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md text-center block"
                    >
                      Login to request this item
                    </Link>
                  </div>
                )}

                {isOwner && (
                  <div className="border-t pt-6">
                    <p className="text-gray-600">This is your item.</p>
                  </div>
                )}

                {!item.available && (
                  <div className="border-t pt-6">
                    <p className="text-red-600 font-medium">This item is no longer available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import useParams for ItemDetail
import { useParams } from 'react-router-dom';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/browse" element={<BrowseItems />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/add-item" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;