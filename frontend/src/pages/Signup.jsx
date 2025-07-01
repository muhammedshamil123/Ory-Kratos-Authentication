import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import COLORS from '../constants/Colors';

const KRATOS_PUBLIC_URL = 'http://localhost:4433';

function Signup() {
  const [flowId, setFlowId] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${KRATOS_PUBLIC_URL}/sessions/whoami`, { withCredentials: true })
      .then(() => navigate('/'))
      .catch(() => {});
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('flow');

    if (id) {
      setFlowId(id);
      axios
        .get(`${KRATOS_PUBLIC_URL}/self-service/registration/flows?id=${id}`, {
          withCredentials: true,
        })
        .then((res) => {
          const csrfNode = res.data.ui.nodes.find(
            (n) => n.attributes.name === 'csrf_token'
          );
          if (csrfNode) setCsrfToken(csrfNode.attributes.value);
        })
        .catch(() => setError('Failed to load registration form.'));
    } else {
      axios
        .get(`${KRATOS_PUBLIC_URL}/self-service/registration/browser`, {
          withCredentials: true,
        })
        .then((res) => {
          window.location.href = res.request.responseURL;
        })
        .catch(() => setError('Could not start registration flow.'));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flowId) return;

    setIsLoading(true);
    setError(null);

    try {
      await axios.post(
        "http://localhost:8080/api/register", 
        {
          flow: flowId,
          data: {
            method: "password",
            csrf_token: csrfToken,
            traits: {
              email: email,
              name: name,
            },
            password: password,
          },
        }, 
        { withCredentials: true }
      );
      navigate("/login");
    } catch (err) {
      console.error('Registration Error:', err);
      if (err.response?.data?.ui?.messages?.length > 0) {
        err.response.data.ui.messages.forEach((msg) => {
          setError('Email already exists');
          console.error(`- ${msg.type}: ${msg.text}`);
        });
      }
      if (err.response?.data?.ui?.nodes?.length > 0) {
        err.response.data.ui.nodes.forEach((node) => {
          if (node.messages?.length > 0) {
            node.messages.forEach((msg) => {
              const field = node.attributes?.name || node.group || 'unknown';
              setError('Password is not strong enough');
              console.error(`- ${field}: ${msg.text}`);
            });
          }
        });
      }
      if (!err.response?.data?.ui?.messages?.length && !err.response?.data?.ui?.nodes) {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/auth/oidc/google'; 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-blue-600 p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
          <p className="text-blue-100">Join us to get started</p>
        </div>

        <div className="p-8">
          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg border border-gray-200 mb-6 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-gray-700">Sign up with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-sm text-gray-500">
                Or sign up with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="traits.name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="traits.email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use at least 8 characters with a mix of letters, numbers & symbols
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm rounded-lg bg-red-50 text-red-600 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;