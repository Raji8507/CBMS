import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, AlertCircle, Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(formData);
    if (result.success) {
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="illustration-container">
           {/* Placeholder for illustration - in a real app this would be an SVG or Image */}
           <div className="illustration-mockup">
             <div className="building-icon-large">
               <GraduationCap size={120} color="#1a237e" />
             </div>
             <div className="floating-coin">$</div>
             <div className="floating-chart"></div>
           </div>
        </div>
        <div className="brand-section">
          <div className="brand-logo">
            <GraduationCap size={40} color="#1a237e" />
            <h1>CBMS</h1>
          </div>
          <h2>Welcome back.</h2>
          <p>Secure financial management for institutions.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <div className="login-header">
            <h2>Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-alert">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Institutional Email</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Institutional Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-footer">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            
            <div className="signup-link-container" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{ color: '#666' }}>Don't have an account? </span>
              <Link to="/signup" style={{ color: '#1a237e', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
            </div>

            <button type="submit" className="signin-btn" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="support-link">
            <a href="#">Contact Admin for support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
