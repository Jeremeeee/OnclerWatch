import React, { useState } from 'react';
import axios from 'axios';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post('http://127.0.0.1:8080/login/user', {
        username,
        password,
      });

      if (response.status === 200) {
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.response && err.response.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('Server error. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-indigo-700 mb-4 tracking-wide">Onclerwatch</h1>
        <p className="text-center text-gray-500 mb-8">Protecting the Forests</p>

        {error && (
          <p className="text-red-500 mb-6 text-center font-semibold">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;