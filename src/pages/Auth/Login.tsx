import React, { useState, ChangeEvent, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, Alert, Typography, Box, Paper } from '@mui/material';
import { FaUser } from 'react-icons/fa';
import 'tailwindcss/tailwind.css';
import { FaSignInAlt, FaLock } from 'react-icons/fa';

interface FormData {
  identify_code: string;
  password: string;
}

interface LoginResponse {
  status_code: number;
  message?: string;
  data?: {
    access_token: string;
    account: {
      role: string;
      [key: string]: any;
    };
  };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    identify_code: '',
    password: ''
  });
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data: LoginResponse = await response.json();

      if (data.status_code === 200 && data.data) {
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('user', JSON.stringify(data.data.account));
        if (data.data.account.role === "ADMIN") navigate('/admin/dashboard');
        else if (data.data.account.role === "ORGANIZATION") navigate('/organization/activities');
        else navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Login error:', err);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-gradient-bg"></div>
      {/* Subtle Particle Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <Paper
        elevation={6}
        className="p-8 rounded-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105 bg-white/95 backdrop-blur-sm"
      >
        {/* @ts-ignore */}
        <Box className="flex flex-col items-center mb-6">
          <FaSignInAlt className="text-4xl text-blue-600 mb-2" />
          <Typography variant="h4" className="font-bold text-gray-800">
            Welcome Back
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600">
            Sign in to your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" className="mb-4 animate-pulse">
            {error}
          </Alert>
        )}

        <Box className="space-y-6">
          <Box className="flex items-center space-x-2">
            <FaUser className="text-gray-500" />
            <TextField
              fullWidth
              variant="outlined"
              label="Student Code"
              name="identify_code"
              value={formData.identify_code}
              onChange={handleChange}
              required
              className="rounded-lg"
              InputProps={{
                className: 'text-gray-700',
              }}
            />
          </Box>

          <Box className="flex items-center space-x-2">
            <FaLock className="text-gray-500" />
            <TextField
              fullWidth
              variant="outlined"
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="rounded-lg"
              InputProps={{
                className: 'text-gray-700',
              }}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            startIcon={<FaSignInAlt />}
            className="py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition duration-200"
          >
            Login
          </Button>
        </Box>

        <Typography className="mt-4 text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
        </Typography>
      </Paper>

      {/* Custom CSS for Background Animation and Particles */}
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-bg {
          background-size: 200% 200%;
          animation: gradientBG 15s ease infinite;
        }
        .particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: float 10s infinite linear;
        }
        .particle:nth-child(1) {
          width: 20px;
          height: 20px;
          top: 20%;
          left: 10%;
          animation-duration: 12s;
        }
        .particle:nth-child(2) {
          width: 15px;
          height: 15px;
          top: 60%;
          left: 30%;
          animation-duration: 15s;
        }
        .particle:nth-child(3) {
          width: 25px;
          height: 25px;
          top: 40%;
          left: 70%;
          animation-duration: 10s;
        }
        .particle:nth-child(4) {
          width: 10px;
          height: 10px;
          top: 80%;
          left: 90%;
          animation-duration: 18s;
        }
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Login; 
