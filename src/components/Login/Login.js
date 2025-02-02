import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { ToastContainer, toast } from 'react-toastify';
import { register, login } from '../../services/authService';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      let response;
      if (isRegistering) {
        response = await register(formData);
        toast.success('Registration successful! Please login.');
        setIsRegistering(false);
        setFormData({ username: '', password: '', email: '' });
      } else {
        response = await login({
          username: formData.username,
          password: formData.password
        });
        localStorage.setItem('userToken', response.token);
        toast.success('Login successful!');
        navigate('/demo', { replace: true });
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <div className="login-box">
          <h2>{isRegistering ? 'Register' : 'Login'}</h2>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                disabled={isLoading}
              />
            </div>
            
            {isRegistering && (
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className={`pixel-button primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading 
                ? 'Processing...' 
                : (isRegistering ? 'Register' : 'Login')}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              {isRegistering 
                ? 'Already have an account?' 
                : "Don't have an account?"}
            </p>
            <button 
              className="switch-button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setFormData({ username: '', password: '', email: '' });
              }}
              disabled={isLoading}
            >
              {isRegistering ? 'Login' : 'Register'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default Login; 