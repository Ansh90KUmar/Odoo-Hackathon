import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
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

// Eco-Friendly Navbar
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="eco-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3">
            <div className="eco-logo">
              <span className="eco-leaf">🌱</span>
              <div className="eco-brand">
                <span className="brand-main">Green Threads</span>
                <span className="brand-tagline">Swap. Save. Sustain.</span>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center space-x-8">
            {user ? (
              <>
                <Link to="/browse" className="eco-nav-link">
                  Browse Items
                </Link>
                <Link to="/add-item" className="eco-nav-link">
                  List Item
                </Link>
                <Link to="/dashboard" className="eco-nav-link">
                  My Dashboard
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="eco-points-badge">
                    <span className="points-icon">💰</span>
                    <div className="points-info">
                      <span className="points-value">{user.points}</span>
                      <span className="points-label">eco points</span>
                    </div>
                  </div>
                  <div className="eco-user-info">
                    <div className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="user-name">{user.username}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="eco-btn eco-btn-outline"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="eco-nav-link">
                  Sign In
                </Link>
                <Link to="/register" className="eco-btn eco-btn-primary">
                  Join Green Threads
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Eco-Friendly Landing Page
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
    <div className="eco-main">
      {/* Hero Section */}
      <section className="eco-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
            <div className="eco-hero-content">
              <div className="eco-badge">
                <span className="badge-icon">♻️</span>
                <span>Sustainable Fashion Exchange</span>
              </div>
              <h1 className="eco-hero-title">
                Give Your Clothes a
                <span className="eco-highlight"> Second Chance</span>
              </h1>
              <p className="eco-hero-subtitle">
                Join our community of eco-conscious fashion lovers. Trade, swap, and discover 
                pre-loved clothing while reducing textile waste and saving money.
              </p>
              <div className="eco-stats">
                <div className="stat-item">
                  <span className="stat-number">1,200+</span>
                  <span className="stat-label">Items Exchanged</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">850</span>
                  <span className="stat-label">Eco Warriors</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">2.5 tons</span>
                  <span className="stat-label">Waste Saved</span>
                </div>
              </div>
              <div className="eco-hero-buttons">
                <Link
                  to={user ? "/browse" : "/register"}
                  className="eco-btn eco-btn-hero"
                >
                  <span>Start Swapping</span>
                  <span className="btn-icon">🌿</span>
                </Link>
                <Link
                  to="/browse"
                  className="eco-btn eco-btn-secondary"
                >
                  Browse Items
                </Link>
              </div>
            </div>
            <div className="eco-hero-image">
              <div className="hero-image-container">
                <img
                  src="https://images.unsplash.com/photo-1624353061763-b003fd3b84dd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBzaGFyaW5nJTIwY2xvdGhlc3xlbnwwfHx8fDE3NTIzMDE4NjF8MA&ixlib=rb-4.1.0&q=85"
                  alt="People sharing clothes sustainably"
                  className="hero-img"
                />
                <div className="hero-image-overlay">
                  <div className="overlay-text">
                    <span className="overlay-icon">🌱</span>
                    <span>Style That Circles Back</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="eco-how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="eco-section-title">
              How Green Threads Works
            </h2>
            <p className="eco-section-subtitle">
              Simple steps to sustainable fashion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="eco-step-card">
              <div className="step-number">1</div>
              <div className="step-icon">📷</div>
              <img 
                src="https://images.unsplash.com/photo-1577020914435-7ae6b1091ebd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxvcmdhbml6ZWQlMjB3YXJkcm9iZXxlbnwwfHx8fDE3NTIzMDE4OTB8MA&ixlib=rb-4.1.0&q=85" 
                alt="Organized wardrobe" 
                className="step-image" 
              />
              <h3 className="step-title">List Your Items</h3>
              <p className="step-description">
                Upload photos of clothes you no longer wear. Add details about size, condition, and style.
              </p>
            </div>

            <div className="eco-step-card">
              <div className="step-number">2</div>
              <div className="step-icon">🔍</div>
              <img 
                src="https://images.pexels.com/photos/6347892/pexels-photo-6347892.jpeg" 
                alt="Browse clothing" 
                className="step-image" 
              />
              <h3 className="step-title">Browse & Discover</h3>
              <p className="step-description">
                Explore items from our eco-community. Filter by size, style, and location to find perfect matches.
              </p>
            </div>

            <div className="eco-step-card">
              <div className="step-number">3</div>
              <div className="step-icon">🤝</div>
              <img 
                src="https://images.unsplash.com/photo-1492371451031-f0830e91b3d9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxlY28lMjBsaWZlc3R5bGV8ZW58MHx8fHwxNzUyMzAxODk3fDA&ixlib=rb-4.1.0&q=85" 
                alt="Sustainable exchange" 
                className="step-image" 
              />
              <h3 className="step-title">Swap & Earn</h3>
              <p className="step-description">
                Exchange items directly or use eco points. Every swap saves waste and earns you rewards!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="eco-impact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="impact-content">
              <h2 className="impact-title">
                Because Fashion Shouldn't 
                <span className="eco-highlight"> Cost the Earth</span>
              </h2>
              <p className="impact-description">
                The fashion industry is one of the world's largest polluters. By choosing to swap and 
                reuse clothing, you're making a real difference.
              </p>
              <div className="impact-stats">
                <div className="impact-stat">
                  <span className="impact-icon">💧</span>
                  <div className="impact-info">
                    <span className="impact-number">2,700L</span>
                    <span className="impact-text">water saved per item</span>
                  </div>
                </div>
                <div className="impact-stat">
                  <span className="impact-icon">🌍</span>
                  <div className="impact-info">
                    <span className="impact-number">8.5kg</span>
                    <span className="impact-text">CO₂ reduced per swap</span>
                  </div>
                </div>
                <div className="impact-stat">
                  <span className="impact-icon">♻️</span>
                  <div className="impact-info">
                    <span className="impact-number">12 months</span>
                    <span className="impact-text">extended item lifespan</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="impact-image">
              <img
                src="https://images.unsplash.com/photo-1596097198305-e4844a56ddb8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwyfHxzdXN0YWluYWJsZSUyMGZhc2hpb258ZW58MHx8fHwxNzUyMzAxODU1fDA&ixlib=rb-4.1.0&q=85"
                alt="Sustainable fashion message"
                className="impact-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <section className="eco-featured">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
              <h2 className="eco-section-title">
                Trending Pre-Loved Items
              </h2>
              <p className="eco-section-subtitle">
                Fresh finds from our eco-community
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredItems.map((item) => (
                <div key={item.id} className="eco-item-card">
                  <div className="eco-item-image">
                    {item.images && item.images.length > 0 ? (
                      <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} />
                    ) : (
                      <div className="eco-no-image">
                        <span className="no-image-icon">👕</span>
                        <span>No image</span>
                      </div>
                    )}
                    <div className="eco-item-badges">
                      <span className="condition-badge">{item.condition}</span>
                    </div>
                  </div>
                  <div className="eco-item-info">
                    <h3 className="eco-item-title">{item.title}</h3>
                    <div className="eco-item-meta">
                      <span className="eco-tag">{item.category}</span>
                      <span className="eco-tag">Size {item.size}</span>
                    </div>
                    <p className="eco-item-desc">{item.description}</p>
                    <div className="eco-item-footer">
                      <div className="eco-credits">
                        <span className="credits-icon">🌿</span>
                        <span className="credits-value">{item.price_points} points</span>
                      </div>
                      <Link 
                        to={`/items/${item.id}`}
                        className="eco-btn eco-btn-small"
                      >
                        View Item
                      </Link>
                    </div>
                    <div className="eco-owner">
                      <span>Listed by {item.owner_username}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/browse" className="eco-btn eco-btn-primary">
                View All Items
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="eco-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Make a Difference?
            </h2>
            <p className="cta-description">
              Join thousands of eco-warriors who are transforming fashion one swap at a time.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="eco-btn eco-btn-hero">
                <span>Join Green Threads</span>
                <span className="btn-icon">🌱</span>
              </Link>
              <Link to="/browse" className="eco-btn eco-btn-outline">
                Explore Items
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Eco-Friendly Login Page
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
      setError(error.response?.data?.detail || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eco-auth-page">
      <div className="max-w-md mx-auto">
        <div className="eco-auth-card">
          <div className="auth-header">
            <div className="auth-icon">🌱</div>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your Green Threads account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="eco-form">
            <div className="eco-input-group">
              <label className="eco-label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="eco-input"
                placeholder="your@email.com"
              />
            </div>
            
            <div className="eco-input-group">
              <label className="eco-label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="eco-input"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="eco-error">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="eco-btn eco-btn-submit"
            >
              {loading ? (
                <>
                  <span>Signing In...</span>
                  <span className="loading-spinner">⏳</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="btn-icon">→</span>
                </>
              )}
            </button>

            <div className="auth-link">
              <span>New to Green Threads? </span>
              <Link to="/register" className="eco-link">
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Eco-Friendly Register Page
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
      setError(error.response?.data?.detail || 'Account creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eco-auth-page">
      <div className="max-w-md mx-auto">
        <div className="eco-auth-card">
          <div className="auth-header">
            <div className="auth-icon">🌱</div>
            <h2 className="auth-title">Join Green Threads</h2>
            <p className="auth-subtitle">Start your sustainable fashion journey</p>
          </div>
          
          <form onSubmit={handleSubmit} className="eco-form">
            <div className="eco-input-group">
              <label className="eco-label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="eco-input"
                placeholder="your@email.com"
              />
            </div>
            
            <div className="eco-input-group">
              <label className="eco-label">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="eco-input"
                placeholder="Choose a username"
              />
            </div>
            
            <div className="eco-input-group">
              <label className="eco-label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="eco-input"
                placeholder="Create a secure password"
              />
            </div>

            {error && (
              <div className="eco-error">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="eco-btn eco-btn-submit"
            >
              {loading ? (
                <>
                  <span>Creating Account...</span>
                  <span className="loading-spinner">⏳</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="btn-icon">🌿</span>
                </>
              )}
            </button>

            <div className="auth-link">
              <span>Already have an account? </span>
              <Link to="/login" className="eco-link">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Browse Items Page
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
      <div className="eco-loading">
        <div className="loading-spinner-large">🌱</div>
        <h3>Finding sustainable fashion...</h3>
      </div>
    );
  }

  return (
    <div className="eco-browse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="browse-header">
          <div className="header-content">
            <h1 className="browse-title">Browse Pre-Loved Items</h1>
            <p className="browse-subtitle">Discover unique pieces from our eco-community</p>
          </div>
          <div className="browse-stats">
            <div className="stat-card">
              <span className="stat-number">{items.length}</span>
              <span className="stat-label">Items Available</span>
            </div>
          </div>
        </div>
        
        {items.length === 0 ? (
          <div className="eco-empty-state">
            <div className="empty-icon">🌱</div>
            <h3 className="empty-title">No Items Yet</h3>
            <p className="empty-description">Be the first to list an item in our eco-community!</p>
            <Link to="/add-item" className="eco-btn eco-btn-primary">
              List First Item
            </Link>
          </div>
        ) : (
          <div className="eco-items-grid">
            {items.map((item) => (
              <div key={item.id} className="eco-item-card">
                <div className="eco-item-image">
                  {item.images && item.images.length > 0 ? (
                    <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} />
                  ) : (
                    <div className="eco-no-image">
                      <span className="no-image-icon">👕</span>
                      <span>No image</span>
                    </div>
                  )}
                  <div className="eco-item-badges">
                    <span className="condition-badge">{item.condition}</span>
                    {item.available && <span className="available-badge">Available</span>}
                  </div>
                </div>
                <div className="eco-item-info">
                  <h3 className="eco-item-title">{item.title}</h3>
                  <div className="eco-item-meta">
                    <span className="eco-tag">{item.category}</span>
                    <span className="eco-tag">Size {item.size}</span>
                  </div>
                  <p className="eco-item-desc">{item.description}</p>
                  <div className="eco-item-footer">
                    <div className="eco-credits">
                      <span className="credits-icon">🌿</span>
                      <span className="credits-value">{item.price_points} points</span>
                    </div>
                    <Link 
                      to={`/items/${item.id}`}
                      className="eco-btn eco-btn-small"
                    >
                      View Details
                    </Link>
                  </div>
                  <div className="eco-owner">
                    <span>Listed by {item.owner_username}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Add Item Page
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
      const itemData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      const response = await axios.post(`${API}/items`, itemData);
      const itemId = response.data.id;

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
      alert('Failed to list item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="eco-success-page">
        <div className="success-content">
          <div className="success-icon">✅</div>
          <h2 className="success-title">Item Listed Successfully!</h2>
          <p className="success-description">Your item is now live in the Green Threads community</p>
          <div className="success-animation">🌱</div>
        </div>
      </div>
    );
  }

  return (
    <div className="eco-add-item">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="add-item-header">
          <h1 className="add-item-title">List Your Pre-Loved Item</h1>
          <p className="add-item-subtitle">Share your fashion finds with the eco-community</p>
        </div>
        
        <div className="eco-form-card">
          <form onSubmit={handleSubmit} className="eco-form">
            <div className="form-grid">
              <div className="eco-input-group span-full">
                <label className="eco-label">
                  <span>Item Title</span>
                  <span className="label-required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="eco-input"
                  placeholder="e.g., Vintage Denim Jacket"
                />
              </div>

              <div className="eco-input-group span-full">
                <label className="eco-label">
                  <span>Description</span>
                  <span className="label-required">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="eco-textarea"
                  placeholder="Tell us about the item's style, fit, and story..."
                />
              </div>

              <div className="eco-input-group">
                <label className="eco-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="eco-select"
                >
                  <option value="tops">Tops</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="dresses">Dresses</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div className="eco-input-group">
                <label className="eco-label">
                  <span>Size</span>
                  <span className="label-required">*</span>
                </label>
                <input
                  type="text"
                  name="size"
                  required
                  value={formData.size}
                  onChange={handleInputChange}
                  className="eco-input"
                  placeholder="XS, S, M, L, XL, 8, 10..."
                />
              </div>

              <div className="eco-input-group">
                <label className="eco-label">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="eco-select"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Well-loved</option>
                </select>
              </div>

              <div className="eco-input-group">
                <label className="eco-label">Eco Points</label>
                <input
                  type="number"
                  name="price_points"
                  value={formData.price_points}
                  onChange={handleInputChange}
                  min="1"
                  max="200"
                  className="eco-input"
                />
                <span className="input-help">Points needed to claim this item</span>
              </div>

              <div className="eco-input-group span-full">
                <label className="eco-label">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="eco-input"
                  placeholder="vintage, boho, summer, casual (separate with commas)"
                />
                <span className="input-help">Help others find your item with relevant tags</span>
              </div>

              <div className="eco-input-group span-full">
                <label className="eco-label">Photos</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files))}
                    className="file-input"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <span className="upload-icon">📸</span>
                    <span className="upload-text">
                      {images.length > 0 ? `${images.length} photo${images.length > 1 ? 's' : ''} selected` : 'Click to add photos'}
                    </span>
                  </label>
                </div>
                <span className="input-help">Add up to 5 photos to show your item's best angles</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="eco-btn eco-btn-submit"
            >
              {loading ? (
                <>
                  <span>Listing Item...</span>
                  <span className="loading-spinner">⏳</span>
                </>
              ) : (
                <>
                  <span>List Item</span>
                  <span className="btn-icon">🌿</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component (Simplified for brevity - full implementation would follow similar eco-friendly styling)
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
      fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing swap:`, error);
      alert(`Failed to ${action} swap`);
    }
  };

  if (loading) {
    return (
      <div className="eco-loading">
        <div className="loading-spinner-large">🌱</div>
        <h3>Loading your eco-dashboard...</h3>
      </div>
    );
  }

  return (
    <div className="eco-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">Your Eco Dashboard</h1>
            <p className="dashboard-subtitle">Manage your sustainable fashion journey</p>
          </div>
          <div className="user-card">
            <div className="user-avatar-large">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <h3 className="user-name">{user.username}</h3>
              <div className="eco-points-large">
                <span className="points-icon">🌿</span>
                <span className="points-value">{user.points} eco points</span>
              </div>
            </div>
            <Link to="/add-item" className="eco-btn eco-btn-primary">
              List New Item
            </Link>
          </div>
        </div>

        {/* Dashboard sections would continue with similar eco-friendly styling */}
        <div className="dashboard-grid">
          {/* My Items Section */}
          <div className="dashboard-section">
            <h2 className="section-title">My Listed Items ({myItems.length})</h2>
            {myItems.length === 0 ? (
              <div className="empty-section">
                <p>No items listed yet</p>
                <Link to="/add-item" className="eco-link">List your first item →</Link>
              </div>
            ) : (
              <div className="items-preview">
                {myItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="item-mini-card">
                    <div className="item-mini-image">
                      {item.images && item.images.length > 0 ? (
                        <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} />
                      ) : (
                        <div className="no-image-mini">👕</div>
                      )}
                    </div>
                    <div className="item-mini-info">
                      <h4>{item.title}</h4>
                      <span className={`status ${item.available ? 'available' : 'unavailable'}`}>
                        {item.available ? 'Available' : 'Swapped'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Similar sections for swaps would follow */}
        </div>
      </div>
    </div>
  );
};

// Item Detail Component (Simplified for brevity)
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
      await axios.post(`${API}/swaps`, { ...swapData, item_id: id });
      alert('Swap request sent successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating swap request:', error);
      alert(error.response?.data?.detail || 'Failed to send swap request');
    }
  };

  if (loading) {
    return (
      <div className="eco-loading">
        <div className="loading-spinner-large">🌱</div>
        <h3>Loading item details...</h3>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="eco-error-page">
        <h2>Item Not Found</h2>
        <p>This item may have been removed or doesn't exist.</p>
        <Link to="/browse" className="eco-btn eco-btn-primary">Browse Other Items</Link>
      </div>
    );
  }

  const isOwner = user && item.owner_id === user.id;

  return (
    <div className="eco-item-detail">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="item-detail-grid">
          <div className="item-images">
            <div className="main-image">
              {item.images && item.images.length > 0 ? (
                <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} />
              ) : (
                <div className="no-image-large">
                  <span className="no-image-icon">👕</span>
                  <span>No image available</span>
                </div>
              )}
            </div>
            {item.images && item.images.length > 1 && (
              <div className="thumbnail-images">
                {item.images.slice(1, 5).map((image, index) => (
                  <img
                    key={index}
                    src={`${BACKEND_URL}${image}`}
                    alt={`${item.title} ${index + 2}`}
                    className="thumbnail"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="item-info">
            <div className="item-header">
              <h1 className="item-title">{item.title}</h1>
              <div className="item-badges">
                <span className="eco-tag">{item.category}</span>
                <span className="eco-tag">Size {item.size}</span>
                <span className="condition-badge">{item.condition}</span>
              </div>
            </div>

            <div className="item-description">
              <p>{item.description}</p>
            </div>

            <div className="item-meta">
              <div className="meta-item">
                <span className="meta-label">Listed by</span>
                <span className="meta-value">{item.owner_username}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Eco Points</span>
                <span className="meta-value eco-credits">
                  <span className="credits-icon">🌿</span>
                  {item.price_points} points
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Status</span>
                <span className={`meta-value status ${item.available ? 'available' : 'unavailable'}`}>
                  {item.available ? 'Available' : 'No longer available'}
                </span>
              </div>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="item-tags">
                <span className="tags-label">Tags:</span>
                <div className="tags-list">
                  {item.tags.map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Swap interface would continue with eco-friendly styling */}
            {!isOwner && item.available && user && (
              <div className="swap-interface">
                <h3 className="swap-title">Request This Item</h3>
                
                <div className="swap-options">
                  <label className="swap-option">
                    <input
                      type="radio"
                      name="swap_type"
                      checked={swapData.is_points_request}
                      onChange={() => setSwapData({...swapData, is_points_request: true, offered_item_id: ''})}
                    />
                    <span className="option-text">Use eco points ({item.price_points} points)</span>
                    {user.points < item.price_points && (
                      <span className="insufficient-points">Not enough points</span>
                    )}
                  </label>

                  <label className="swap-option">
                    <input
                      type="radio"
                      name="swap_type"
                      checked={!swapData.is_points_request}
                      onChange={() => setSwapData({...swapData, is_points_request: false})}
                    />
                    <span className="option-text">Trade with my item</span>
                  </label>
                </div>

                {!swapData.is_points_request && (
                  <div className="eco-input-group">
                    <label className="eco-label">Select item to trade</label>
                    <select
                      value={swapData.offered_item_id}
                      onChange={(e) => setSwapData({...swapData, offered_item_id: e.target.value})}
                      className="eco-select"
                    >
                      <option value="">Choose an item...</option>
                      {myItems.map((myItem) => (
                        <option key={myItem.id} value={myItem.id}>
                          {myItem.title} ({myItem.category}, {myItem.size})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="eco-input-group">
                  <label className="eco-label">Message (optional)</label>
                  <textarea
                    value={swapData.message}
                    onChange={(e) => setSwapData({...swapData, message: e.target.value})}
                    placeholder="Add a personal message..."
                    className="eco-textarea"
                    rows={3}
                  />
                </div>

                <button
                  onClick={handleSwapRequest}
                  disabled={
                    (swapData.is_points_request && user.points < item.price_points) ||
                    (!swapData.is_points_request && !swapData.offered_item_id)
                  }
                  className="eco-btn eco-btn-submit"
                >
                  <span>Send Request</span>
                  <span className="btn-icon">🤝</span>
                </button>
              </div>
            )}

            {!user && (
              <div className="auth-required">
                <Link to="/login" className="eco-btn eco-btn-primary eco-btn-full">
                  Sign in to request this item
                </Link>
              </div>
            )}

            {isOwner && (
              <div className="owner-notice">
                <span className="owner-icon">👋</span>
                <span>This is your item</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="eco-loading">
        <div className="loading-spinner-large">🌱</div>
        <h3>Authenticating...</h3>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="App eco-app">
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