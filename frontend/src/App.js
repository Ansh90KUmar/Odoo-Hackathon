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

// Futuristic Navbar
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="cyber-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3">
            <div className="cyber-logo">
              <span className="text-3xl font-black cyber-gradient-text">ReWear</span>
              <div className="cyber-logo-underline"></div>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/browse" className="cyber-link">
                  <span className="cyber-text">BROWSE</span>
                </Link>
                <Link to="/add-item" className="cyber-link">
                  <span className="cyber-text">UPLOAD</span>
                </Link>
                <Link to="/dashboard" className="cyber-link">
                  <span className="cyber-text">CONTROL</span>
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="cyber-points">
                    <span className="points-value">{user.points}</span>
                    <span className="points-label">CREDITS</span>
                  </div>
                  <div className="cyber-user">
                    <span className="user-name">{user.username}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="cyber-btn cyber-btn-danger"
                  >
                    LOGOUT
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="cyber-link">
                  <span className="cyber-text">LOGIN</span>
                </Link>
                <Link to="/register" className="cyber-btn cyber-btn-primary">
                  JOIN NETWORK
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Futuristic Landing Page
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
    <div className="cyber-main">
      {/* Hero Section */}
      <div className="cyber-hero">
        <div className="cyber-grid"></div>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
            <div className="cyber-hero-content">
              <div className="cyber-badge">
                <span>NEXT-GEN FASHION EXCHANGE</span>
              </div>
              <h1 className="cyber-title">
                <span className="cyber-gradient-text">REWEAR</span>
                <br />
                <span className="text-white">THE FUTURE</span>
                <br />
                <span className="cyber-neon-text">OF FASHION</span>
              </h1>
              <p className="cyber-subtitle">
                Neural-powered clothing exchange platform. Trade, swap, and redeem fashion items 
                in the metaverse. Join the sustainable fashion revolution.
              </p>
              <div className="cyber-hero-buttons">
                <Link
                  to={user ? "/browse" : "/register"}
                  className="cyber-btn cyber-btn-hero"
                >
                  <span>ENTER SYSTEM</span>
                  <div className="cyber-btn-glow"></div>
                </Link>
                <Link
                  to="/browse"
                  className="cyber-btn cyber-btn-secondary"
                >
                  EXPLORE ITEMS
                </Link>
              </div>
            </div>
            <div className="cyber-hero-image">
              <div className="cyber-image-container">
                <img
                  src="https://images.unsplash.com/photo-1702384867394-9770ff58d944?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwZmFzaGlvbnxlbnwwfHx8fDE3NTIyOTI0NTV8MA&ixlib=rb-4.1.0&q=85"
                  alt="Futuristic Fashion"
                  className="cyber-hero-img"
                />
                <div className="cyber-image-overlay"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="cyber-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="cyber-section-badge">
              <span>SYSTEM FEATURES</span>
            </div>
            <h2 className="cyber-section-title">
              <span className="cyber-gradient-text">NEXT-LEVEL</span> EXCHANGE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="cyber-feature-card">
              <div className="cyber-feature-icon">
                <div className="cyber-icon-glow"></div>
                <span className="text-2xl">🔬</span>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1597699639265-bb1b1fd01026?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxmdXR1cmlzdGljJTIwZmFzaGlvbnxlbnwwfHx8fDE3NTIyOTI0NTV8MA&ixlib=rb-4.1.0&q=85" 
                alt="Neural Upload" 
                className="cyber-feature-img" 
              />
              <h3 className="cyber-feature-title">NEURAL UPLOAD</h3>
              <p className="cyber-feature-desc">
                Upload your fashion items to the neural network. AI-powered cataloging and smart tagging.
              </p>
            </div>

            <div className="cyber-feature-card">
              <div className="cyber-feature-icon">
                <div className="cyber-icon-glow"></div>
                <span className="text-2xl">🌐</span>
              </div>
              <img 
                src="https://images.pexels.com/photos/32952906/pexels-photo-32952906.jpeg" 
                alt="Quantum Browse" 
                className="cyber-feature-img" 
              />
              <h3 className="cyber-feature-title">QUANTUM BROWSE</h3>
              <p className="cyber-feature-desc">
                Explore infinite fashion possibilities. Quantum-enhanced search and discovery algorithms.
              </p>
            </div>

            <div className="cyber-feature-card">
              <div className="cyber-feature-icon">
                <div className="cyber-icon-glow"></div>
                <span className="text-2xl">⚡</span>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1702384867394-9770ff58d944?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwZmFzaGlvbnxlbnwwfHx8fDE3NTIyOTI0NTV8MA&ixlib=rb-4.1.0&q=85" 
                alt="Instant Exchange" 
                className="cyber-feature-img" 
              />
              <h3 className="cyber-feature-title">INSTANT EXCHANGE</h3>
              <p className="cyber-feature-desc">
                Lightning-fast swaps and credit transactions. Blockchain-secured fashion exchanges.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <div className="cyber-featured">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
              <div className="cyber-section-badge">
                <span>TRENDING NOW</span>
              </div>
              <h2 className="cyber-section-title">
                <span className="cyber-neon-text">FEATURED</span> ITEMS
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredItems.map((item) => (
                <div key={item.id} className="cyber-item-card">
                  <div className="cyber-item-image">
                    {item.images && item.images.length > 0 ? (
                      <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} />
                    ) : (
                      <div className="cyber-no-image">
                        <span>NO IMAGE</span>
                      </div>
                    )}
                    <div className="cyber-item-overlay">
                      <Link to={`/items/${item.id}`} className="cyber-btn cyber-btn-small">
                        VIEW DATA
                      </Link>
                    </div>
                  </div>
                  <div className="cyber-item-info">
                    <h3 className="cyber-item-title">{item.title}</h3>
                    <div className="cyber-item-meta">
                      <span className="cyber-tag">{item.category}</span>
                      <span className="cyber-tag">SIZE {item.size}</span>
                    </div>
                    <p className="cyber-item-desc">{item.description}</p>
                    <div className="cyber-item-footer">
                      <span className="cyber-credits">{item.price_points} CREDITS</span>
                      <span className="cyber-owner">by {item.owner_username}</span>
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

// Futuristic Login Page
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
      setError(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cyber-auth-page">
      <div className="cyber-grid"></div>
      <div className="cyber-auth-container">
        <div className="cyber-auth-box">
          <div className="cyber-auth-header">
            <h2 className="cyber-auth-title">
              <span className="cyber-gradient-text">SYSTEM</span> ACCESS
            </h2>
            <p className="cyber-auth-subtitle">Enter your neural credentials</p>
          </div>
          
          <form onSubmit={handleSubmit} className="cyber-form">
            <div className="cyber-input-group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cyber-input"
                placeholder="Neural Email ID"
              />
              <div className="cyber-input-glow"></div>
            </div>
            
            <div className="cyber-input-group">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cyber-input"
                placeholder="Security Passphrase"
              />
              <div className="cyber-input-glow"></div>
            </div>

            {error && (
              <div className="cyber-error">
                <span>❌ {error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cyber-btn cyber-btn-submit"
            >
              {loading ? 'ACCESSING...' : 'AUTHENTICATE'}
              <div className="cyber-btn-glow"></div>
            </button>

            <div className="cyber-auth-link">
              <Link to="/register" className="cyber-link">
                Create Neural Profile →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Futuristic Register Page
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
      setError(error.response?.data?.detail || 'Neural profile creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cyber-auth-page">
      <div className="cyber-grid"></div>
      <div className="cyber-auth-container">
        <div className="cyber-auth-box">
          <div className="cyber-auth-header">
            <h2 className="cyber-auth-title">
              <span className="cyber-neon-text">NEURAL</span> REGISTRATION
            </h2>
            <p className="cyber-auth-subtitle">Create your digital identity</p>
          </div>
          
          <form onSubmit={handleSubmit} className="cyber-form">
            <div className="cyber-input-group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cyber-input"
                placeholder="Neural Email Protocol"
              />
              <div className="cyber-input-glow"></div>
            </div>
            
            <div className="cyber-input-group">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="cyber-input"
                placeholder="User Handle"
              />
              <div className="cyber-input-glow"></div>
            </div>
            
            <div className="cyber-input-group">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cyber-input"
                placeholder="Security Algorithm"
              />
              <div className="cyber-input-glow"></div>
            </div>

            {error && (
              <div className="cyber-error">
                <span>❌ {error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cyber-btn cyber-btn-submit"
            >
              {loading ? 'INITIALIZING...' : 'CREATE PROFILE'}
              <div className="cyber-btn-glow"></div>
            </button>

            <div className="cyber-auth-link">
              <Link to="/login" className="cyber-link">
                Access Existing Profile →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Futuristic Browse Items
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
      <div className="cyber-loading">
        <div className="cyber-spinner"></div>
        <span>SCANNING NEURAL NETWORK...</span>
      </div>
    );
  }

  return (
    <div className="cyber-browse">
      <div className="cyber-grid"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="cyber-page-header">
          <h1 className="cyber-page-title">
            <span className="cyber-gradient-text">BROWSE</span> NETWORK
          </h1>
          <div className="cyber-stats">
            <span className="cyber-stat">
              <span className="stat-value">{items.length}</span>
              <span className="stat-label">ITEMS AVAILABLE</span>
            </span>
          </div>
        </div>
        
        {items.length === 0 ? (
          <div className="cyber-empty-state">
            <div className="cyber-empty-icon">🚀</div>
            <h3 className="cyber-empty-title">NETWORK EMPTY</h3>
            <p className="cyber-empty-desc">No items detected in the neural network.</p>
            <Link to="/add-item" className="cyber-btn cyber-btn-primary">
              UPLOAD FIRST ITEM
            </Link>
          </div>
        ) : (
          <div className="cyber-items-grid">
            {items.map((item) => (
              <div key={item.id} className="cyber-item-card">
                <div className="cyber-item-image">
                  {item.images && item.images.length > 0 ? (
                    <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} />
                  ) : (
                    <div className="cyber-no-image">
                      <span>NO IMAGE</span>
                    </div>
                  )}
                  <div className="cyber-item-overlay">
                    <Link to={`/items/${item.id}`} className="cyber-btn cyber-btn-small">
                      ACCESS DATA
                    </Link>
                  </div>
                </div>
                <div className="cyber-item-info">
                  <h3 className="cyber-item-title">{item.title}</h3>
                  <div className="cyber-item-meta">
                    <span className="cyber-tag">{item.category}</span>
                    <span className="cyber-tag">SIZE {item.size}</span>
                    <span className="cyber-tag cyber-tag-condition">{item.condition}</span>
                  </div>
                  <p className="cyber-item-desc">{item.description}</p>
                  <div className="cyber-item-footer">
                    <span className="cyber-credits">{item.price_points} CREDITS</span>
                    <span className="cyber-owner">by {item.owner_username}</span>
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

// Futuristic Add Item
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
      alert('Neural upload failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="cyber-success">
        <div className="cyber-success-icon">✅</div>
        <h2 className="cyber-success-title">UPLOAD SUCCESSFUL</h2>
        <p className="cyber-success-desc">Item uploaded to neural network</p>
      </div>
    );
  }

  return (
    <div className="cyber-upload">
      <div className="cyber-grid"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="cyber-page-header">
          <h1 className="cyber-page-title">
            <span className="cyber-neon-text">NEURAL</span> UPLOAD
          </h1>
          <p className="cyber-page-subtitle">Upload your fashion data to the network</p>
        </div>
        
        <form onSubmit={handleSubmit} className="cyber-upload-form">
          <div className="cyber-form-grid">
            <div className="cyber-input-group cyber-input-full">
              <label className="cyber-label">ITEM DESIGNATION</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="cyber-input"
                placeholder="e.g., Quantum Denim Jacket"
              />
              <div className="cyber-input-glow"></div>
            </div>

            <div className="cyber-input-group cyber-input-full">
              <label className="cyber-label">DATA DESCRIPTION</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="cyber-input cyber-textarea"
                placeholder="Neural description of item properties..."
              />
              <div className="cyber-input-glow"></div>
            </div>

            <div className="cyber-input-group">
              <label className="cyber-label">CATEGORY MATRIX</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="cyber-input cyber-select"
              >
                <option value="tops">NEURAL_TOPS</option>
                <option value="bottoms">QUANTUM_BOTTOMS</option>
                <option value="dresses">HOLO_DRESSES</option>
                <option value="outerwear">CYBER_OUTERWEAR</option>
                <option value="shoes">DIGITAL_FOOTWEAR</option>
                <option value="accessories">TECH_ACCESSORIES</option>
              </select>
              <div className="cyber-input-glow"></div>
            </div>

            <div className="cyber-input-group">
              <label className="cyber-label">SIZE PROTOCOL</label>
              <input
                type="text"
                name="size"
                required
                value={formData.size}
                onChange={handleInputChange}
                className="cyber-input"
                placeholder="M, L, 32, 8..."
              />
              <div className="cyber-input-glow"></div>
            </div>

            <div className="cyber-input-group">
              <label className="cyber-label">CONDITION STATUS</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="cyber-input cyber-select"
              >
                <option value="excellent">PRISTINE</option>
                <option value="good">OPTIMAL</option>
                <option value="fair">FUNCTIONAL</option>
                <option value="poor">DEGRADED</option>
              </select>
              <div className="cyber-input-glow"></div>
            </div>

            <div className="cyber-input-group">
              <label className="cyber-label">CREDIT VALUE</label>
              <input
                type="number"
                name="price_points"
                value={formData.price_points}
                onChange={handleInputChange}
                min="1"
                className="cyber-input"
              />
              <div className="cyber-input-glow"></div>
            </div>

            <div className="cyber-input-group cyber-input-full">
              <label className="cyber-label">NEURAL TAGS</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="cyber-input"
                placeholder="vintage, cyber, neon, holographic..."
              />
              <div className="cyber-input-glow"></div>
            </div>

            <div className="cyber-input-group cyber-input-full">
              <label className="cyber-label">IMAGE UPLOAD</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImages(Array.from(e.target.files))}
                className="cyber-file-input"
              />
              <div className="cyber-file-info">Upload visual data to neural network</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cyber-btn cyber-btn-submit cyber-btn-upload"
          >
            {loading ? 'UPLOADING TO NETWORK...' : 'INITIATE UPLOAD'}
            <div className="cyber-btn-glow"></div>
          </button>
        </form>
      </div>
    </div>
  );
};

// Dashboard and other components would follow similar futuristic styling...
// For brevity, I'll include key components

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
      alert(`Neural ${action} failed`);
    }
  };

  if (loading) {
    return (
      <div className="cyber-loading">
        <div className="cyber-spinner"></div>
        <span>ACCESSING NEURAL DASHBOARD...</span>
      </div>
    );
  }

  return (
    <div className="cyber-dashboard">
      <div className="cyber-grid"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="cyber-dashboard-header">
          <h1 className="cyber-page-title">
            <span className="cyber-gradient-text">NEURAL</span> COMMAND CENTER
          </h1>
          <div className="cyber-user-info">
            <div className="cyber-user-avatar">
              <span>{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="cyber-user-details">
              <span className="cyber-username">{user.username}</span>
              <span className="cyber-credits-large">{user.points} CREDITS</span>
            </div>
            <Link to="/add-item" className="cyber-btn cyber-btn-primary">
              + UPLOAD ITEM
            </Link>
          </div>
        </div>

        {/* Dashboard sections with futuristic styling */}
        <div className="cyber-dashboard-grid">
          {/* My Items */}
          <div className="cyber-dashboard-section">
            <h2 className="cyber-section-title">
              MY NEURAL ITEMS ({myItems.length})
            </h2>
            {myItems.length === 0 ? (
              <div className="cyber-empty-state cyber-empty-small">
                <p>No items in neural storage</p>
                <Link to="/add-item" className="cyber-link">Upload first item →</Link>
              </div>
            ) : (
              <div className="cyber-items-list">
                {myItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="cyber-item-mini">
                    <div className="cyber-item-mini-image">
                      {item.images && item.images.length > 0 ? (
                        <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} />
                      ) : (
                        <div className="cyber-no-image-mini">📁</div>
                      )}
                    </div>
                    <div className="cyber-item-mini-info">
                      <h3>{item.title}</h3>
                      <span className={`cyber-status ${item.available ? 'available' : 'unavailable'}`}>
                        {item.available ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <span className="cyber-credits-mini">{item.price_points}C</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Received Swaps */}
          <div className="cyber-dashboard-section">
            <h2 className="cyber-section-title">
              INCOMING REQUESTS ({receivedSwaps.length})
            </h2>
            {receivedSwaps.length === 0 ? (
              <div className="cyber-empty-state cyber-empty-small">
                <p>No incoming neural requests</p>
              </div>
            ) : (
              <div className="cyber-swaps-list">
                {receivedSwaps.slice(0, 3).map((swap) => (
                  <div key={swap.id} className="cyber-swap-item">
                    <div className="cyber-swap-info">
                      <h4>{swap.item_title}</h4>
                      <span className="cyber-requester">from {swap.requester_username}</span>
                      {swap.is_points_request ? (
                        <span className="cyber-swap-type points">CREDITS</span>
                      ) : (
                        <span className="cyber-swap-type swap">ITEM SWAP</span>
                      )}
                    </div>
                    {swap.status === 'pending' && (
                      <div className="cyber-swap-actions">
                        <button
                          onClick={() => handleSwapAction(swap.id, 'accept')}
                          className="cyber-btn cyber-btn-mini cyber-btn-success"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleSwapAction(swap.id, 'reject')}
                          className="cyber-btn cyber-btn-mini cyber-btn-danger"
                        >
                          ✗
                        </button>
                      </div>
                    )}
                    <span className={`cyber-status ${swap.status}`}>{swap.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Swaps */}
          <div className="cyber-dashboard-section">
            <h2 className="cyber-section-title">
              OUTGOING REQUESTS ({sentSwaps.length})
            </h2>
            {sentSwaps.length === 0 ? (
              <div className="cyber-empty-state cyber-empty-small">
                <p>No outgoing neural requests</p>
                <Link to="/browse" className="cyber-link">Browse items →</Link>
              </div>
            ) : (
              <div className="cyber-swaps-list">
                {sentSwaps.slice(0, 3).map((swap) => (
                  <div key={swap.id} className="cyber-swap-item">
                    <div className="cyber-swap-info">
                      <h4>{swap.item_title}</h4>
                      <span className="cyber-requester">to {swap.owner_username}</span>
                      {swap.is_points_request ? (
                        <span className="cyber-swap-type points">CREDITS</span>
                      ) : (
                        <span className="cyber-swap-type swap">ITEM SWAP</span>
                      )}
                    </div>
                    <span className={`cyber-status ${swap.status}`}>{swap.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Item Detail Page
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
      alert('Neural request transmitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating swap request:', error);
      alert(error.response?.data?.detail || 'Neural transmission failed');
    }
  };

  if (loading) {
    return (
      <div className="cyber-loading">
        <div className="cyber-spinner"></div>
        <span>SCANNING ITEM DATA...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="cyber-error-page">
        <h2>ITEM NOT FOUND</h2>
        <p>Neural scan failed to locate item data</p>
        <Link to="/browse" className="cyber-btn cyber-btn-primary">Return to Browse</Link>
      </div>
    );
  }

  const isOwner = user && item.owner_id === user.id;

  return (
    <div className="cyber-item-detail">
      <div className="cyber-grid"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="cyber-item-detail-container">
          <div className="cyber-item-gallery">
            <div className="cyber-main-image">
              {item.images && item.images.length > 0 ? (
                <img src={`${BACKEND_URL}${item.images[0]}`} alt={item.title} />
              ) : (
                <div className="cyber-no-image-large">
                  <span>NO VISUAL DATA</span>
                </div>
              )}
              <div className="cyber-image-glow"></div>
            </div>
            {item.images && item.images.length > 1 && (
              <div className="cyber-image-thumbs">
                {item.images.slice(1, 4).map((image, index) => (
                  <img
                    key={index}
                    src={`${BACKEND_URL}${image}`}
                    alt={`${item.title} ${index + 2}`}
                    className="cyber-thumb"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="cyber-item-details">
            <div className="cyber-item-header">
              <h1 className="cyber-item-title-large">{item.title}</h1>
              <div className="cyber-item-badges">
                <span className="cyber-badge cyber-badge-category">{item.category}</span>
                <span className="cyber-badge cyber-badge-size">SIZE {item.size}</span>
                <span className="cyber-badge cyber-badge-condition">{item.condition}</span>
              </div>
            </div>

            <div className="cyber-item-description">
              <p>{item.description}</p>
            </div>

            <div className="cyber-item-meta-grid">
              <div className="cyber-meta-item">
                <span className="cyber-meta-label">OWNER</span>
                <span className="cyber-meta-value">{item.owner_username}</span>
              </div>
              <div className="cyber-meta-item">
                <span className="cyber-meta-label">CREDIT VALUE</span>
                <span className="cyber-meta-value cyber-credits">{item.price_points} CREDITS</span>
              </div>
              <div className="cyber-meta-item">
                <span className="cyber-meta-label">STATUS</span>
                <span className={`cyber-meta-value cyber-status ${item.available ? 'available' : 'unavailable'}`}>
                  {item.available ? 'AVAILABLE' : 'ACQUIRED'}
                </span>
              </div>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="cyber-tags">
                <span className="cyber-tags-label">NEURAL TAGS:</span>
                <div className="cyber-tags-list">
                  {item.tags.map((tag, index) => (
                    <span key={index} className="cyber-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Swap Interface */}
            {!isOwner && item.available && user && (
              <div className="cyber-swap-interface">
                <h3 className="cyber-interface-title">INITIATE EXCHANGE</h3>
                
                <div className="cyber-swap-options">
                  <label className="cyber-radio-option">
                    <input
                      type="radio"
                      name="swap_type"
                      checked={swapData.is_points_request}
                      onChange={() => setSwapData({...swapData, is_points_request: true, offered_item_id: ''})}
                    />
                    <div className="cyber-radio-design"></div>
                    <span>CREDIT EXCHANGE ({item.price_points} credits)</span>
                    {user.points < item.price_points && (
                      <span className="cyber-warning">INSUFFICIENT CREDITS</span>
                    )}
                  </label>

                  <label className="cyber-radio-option">
                    <input
                      type="radio"
                      name="swap_type"
                      checked={!swapData.is_points_request}
                      onChange={() => setSwapData({...swapData, is_points_request: false})}
                    />
                    <div className="cyber-radio-design"></div>
                    <span>ITEM EXCHANGE</span>
                  </label>
                </div>

                {!swapData.is_points_request && (
                  <div className="cyber-input-group">
                    <label className="cyber-label">SELECT EXCHANGE ITEM</label>
                    <select
                      value={swapData.offered_item_id}
                      onChange={(e) => setSwapData({...swapData, offered_item_id: e.target.value})}
                      className="cyber-input cyber-select"
                    >
                      <option value="">Choose item to offer...</option>
                      {myItems.map((myItem) => (
                        <option key={myItem.id} value={myItem.id}>
                          {myItem.title} ({myItem.category}, {myItem.size})
                        </option>
                      ))}
                    </select>
                    <div className="cyber-input-glow"></div>
                  </div>
                )}

                <div className="cyber-input-group">
                  <label className="cyber-label">NEURAL MESSAGE</label>
                  <textarea
                    value={swapData.message}
                    onChange={(e) => setSwapData({...swapData, message: e.target.value})}
                    placeholder="Optional exchange message..."
                    className="cyber-input cyber-textarea"
                    rows={3}
                  />
                  <div className="cyber-input-glow"></div>
                </div>

                <button
                  onClick={handleSwapRequest}
                  disabled={
                    (swapData.is_points_request && user.points < item.price_points) ||
                    (!swapData.is_points_request && !swapData.offered_item_id)
                  }
                  className="cyber-btn cyber-btn-exchange"
                >
                  TRANSMIT REQUEST
                  <div className="cyber-btn-glow"></div>
                </button>
              </div>
            )}

            {!user && (
              <div className="cyber-auth-prompt">
                <Link to="/login" className="cyber-btn cyber-btn-primary cyber-btn-full">
                  ACCESS REQUIRED - LOGIN
                </Link>
              </div>
            )}

            {isOwner && (
              <div className="cyber-owner-notice">
                <span>⚡ YOU OWN THIS ITEM</span>
              </div>
            )}

            {!item.available && (
              <div className="cyber-unavailable-notice">
                <span>❌ ITEM NO LONGER AVAILABLE</span>
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
      <div className="cyber-loading">
        <div className="cyber-spinner"></div>
        <span>AUTHENTICATING...</span>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="App cyber-app">
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