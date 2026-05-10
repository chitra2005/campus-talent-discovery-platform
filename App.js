import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import StudentDashboard from './components/dashboards/StudentDashboard';
import FacultyDashboard from './components/dashboards/FacultyDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import FacultyStudents from './components/dashboards/FacultyStudents';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './App.css';

const roleNavLinks = {
  Student: [{ path: '/dashboard', label: 'Student' }],
  Faculty: [
    { path: '/faculty-dashboard', label: 'My Dashboard' }
  ],
  Admin: [{ path: '/admin-dashboard', label: 'Admin Panel' }],
};



const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Student' });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`, form);
      localStorage.setItem('role', form.role);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Registration successful! Welcome to Campus Talent Discovery Platform.');
      navigate(form.role === 'Faculty' ? '/faculty-dashboard' : form.role === 'Admin' ? '/admin-dashboard' : '/dashboard');
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <h1>Create Account</h1>
        <p>Join the Campus Talent platform and start building your placement-ready profile.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full Name
            <input name="name" value={form.name} onChange={handleChange} placeholder="Bhargav V" />
          </label>
          <label>
            Email Address
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="********" />
          </label>
          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option>Student</option>
              <option>Faculty</option>
              <option>Admin</option>
            </select>
          </label>
          <button type="submit" className="btn-primary">Sign Up</button>
        </form>
        <p className="auth-note">Already have an account? <Link to="/login">Sign in here</Link></p>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'Student' });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, { email: form.email, password: form.password });
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Login successful! Welcome back to Campus Talent Discovery Platform.');
      navigate(res.data.user.role === 'Faculty' ? '/faculty-dashboard' : res.data.user.role === 'Admin' ? '/admin-dashboard' : '/dashboard');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <h1>Sign In</h1>
        <p>Access your Campus Talent dashboard.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email Address
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="********" />
          </label>
          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option>Student</option>
              <option>Faculty</option>
              <option>Admin</option>
            </select>
          </label>
          <button type="submit" className="btn-primary">Log In</button>
        </form>
        <p className="auth-note" style={{ marginTop: '8px' }}>
          <Link to="/forgot-password" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Forgot your password?</Link>
        </p>
        <p className="auth-note">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  );
};

function App() {
  const location = useLocation();
  const role = localStorage.getItem('role');
  const isLogged = Boolean(localStorage.getItem('token') && role);
  const navLinks = role ? roleNavLinks[role] || [] : [];
  const defaultDashboard = role === 'Faculty' ? '/faculty-dashboard' : role === 'Admin' ? '/admin-dashboard' : '/dashboard';

  return (
    <div className="App">
      <nav className="app-nav glass-panel">
        <Link to={isLogged ? defaultDashboard : '/login'} className="nav-brand">Campus Talent</Link>
        {isLogged && (
          <div className="nav-links">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} className="nav-link">{link.label}</Link>
            ))}
          </div>
        )}
        <div className="nav-actions">
          {!isLogged ? (
            <>
              <Link to="/login" className="btn-small">Log In</Link>
              <Link to="/register" className="btn-primary btn-small">Sign Up</Link>
            </>
          ) : (
            <Link
              to="/login"
              className="btn-small"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
              }}
            >
              Log Out
            </Link>
          )}
        </div>
      </nav>
      <Routes>
        <Route path="/" element={isLogged ? <Navigate to={defaultDashboard} /> : <Navigate to="/login" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={isLogged && role === 'Student' ? <StudentDashboard /> : <Navigate to="/login" />} />
        <Route path="/faculty-dashboard" element={isLogged && role === 'Faculty' ? <FacultyDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin-dashboard" element={isLogged && role === 'Admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/faculty/students" element={isLogged && role === 'Faculty' ? <FacultyStudents /> : <Navigate to="/login" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to={isLogged ? defaultDashboard : '/login'} />} />
      </Routes>
    </div>
  );
}

export default App;