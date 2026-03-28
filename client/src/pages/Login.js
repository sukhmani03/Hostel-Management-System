import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/api';
import { setAuth } from '../utils/auth';

/**
 * Login Page - Allows users to sign in with email, password, and role.
 * Demo credentials: admin@hostel.com / admin123
 */
const Login = () => {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'admin',
  });
  const [loading, setLoading] = useState(false);

  // Update form field on change
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login(form.email, form.password);
      const { token, user } = res.data;
      setAuth(token, user);
      toast.success(`Welcome back, ${user.name}!`);
      // Redirect based on role
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Fill demo credentials quickly
  const fillDemo = () => {
    setForm({ email: 'admin@hostel.com', password: 'admin123', role: 'admin' });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>🏠</div>
          <h1 style={styles.title}>HostelMS</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {/* Demo Credentials Banner */}
        <div style={styles.demoBanner}>
          <span>🔑 Demo: </span>
          <strong>admin@hostel.com</strong>
          <span> / </span>
          <strong>admin123</strong>
          <button onClick={fillDemo} style={styles.fillBtn}>
            Auto-fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@hostel.com"
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="role">Sign in as</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="admin">Admin</option>
              <option value="warden">Warden</option>
              <option value="student">Student</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Link */}
        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e293b 0%, #1a73e8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logo: {
    fontSize: '48px',
    lineHeight: 1,
    marginBottom: '8px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '4px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '14px',
  },
  demoBanner: {
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#0369a1',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap',
  },
  fillBtn: {
    marginLeft: 'auto',
    background: '#0369a1',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    justifyContent: 'center',
    marginTop: '4px',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#64748b',
  },
  link: {
    color: '#1a73e8',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Login;
