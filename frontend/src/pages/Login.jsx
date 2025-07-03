import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import COLORS from '../constants/Colors';

const KRATOS_PUBLIC_URL = 'http://localhost:4433';

function Login() {
  const [flowId, setFlowId] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${KRATOS_PUBLIC_URL}/sessions/whoami`, { withCredentials: true })
      .then(() => navigate('/'))
      .catch(() => startLoginFlow());
  }, [navigate]);

  const startLoginFlow = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('flow');

    if (id) {
      setFlowId(id);
      axios
        .get(`${KRATOS_PUBLIC_URL}/self-service/login/flows?id=${id}`, {
          withCredentials: true,
        })
        .then((res) => {
          const csrfNode = res.data.ui.nodes.find(
            (n) => n.attributes.name === 'csrf_token'
          );
          if (csrfNode) setCsrfToken(csrfNode.attributes.value);
        })
        .catch(() => setError('Failed to load login flow.'));
    } else {
      setIsLoading(true);
      axios
        .get(`${KRATOS_PUBLIC_URL}/self-service/login/browser`, {
          withCredentials: true,
        })
        .then((res) => {
          window.location.href = res.request.responseURL;
        })
        .catch(() => {
          setError('Could not start login flow.');
          setIsLoading(false);
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!flowId) {
      setError('No login flow found.');
      return;
    }

    setIsLoading(true);
    const data = {
      method: 'password',
      csrf_token: csrfToken,
      identifier,
      password,
    };

    axios
      .post(`${KRATOS_PUBLIC_URL}/self-service/login?flow=${flowId}`, data, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })
      .then(() => navigate('/'))
      .catch((err) => {
        setError(err.response?.data?.ui?.messages?.[0]?.text || 'Login failed. Check your credentials.');
        setIsLoading(false);
      });
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/auth/oidc/google';
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4" 
      style={{ backgroundColor: COLORS.backgroundSecondary }}
    >
      <div 
        className="bg-white rounded-xl p-8 w-full max-w-md" 
        style={{ 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: `1px solid ${COLORS.border}`
        }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.text }}>
            Welcome Back
          </h2>
          <p className="text-sm" style={{ color: COLORS.textTertiary }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border mb-4 transition-all hover:shadow-sm disabled:opacity-70"
          style={{ 
            borderColor: COLORS.border,
            color: COLORS.text,
            backgroundColor: COLORS.white,
            hoverBackground: COLORS.backgroundSecondary
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium">Continue with Google</span>
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t" style={{ borderColor: COLORS.border }}></div>
          <span className="mx-4 text-sm" style={{ color: COLORS.muted }}>OR</span>
          <div className="flex-grow border-t" style={{ borderColor: COLORS.border }}></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
              Email
            </label>
            <input
              id="identifier"
              type="email"
              name="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-colors"
              style={{ 
                backgroundColor: COLORS.white,
                borderColor: COLORS.border,
                color: COLORS.text,
                focusBorderColor: COLORS.primary,
                focusRingColor: COLORS.highlight,
                disabledBackground: COLORS.backgroundSecondary
              }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-colors"
              style={{ 
                backgroundColor: COLORS.white,
                borderColor: COLORS.border,
                color: COLORS.text,
                focusBorderColor: COLORS.primary,
                focusRingColor: COLORS.highlight,
                disabledBackground: COLORS.backgroundSecondary
              }}
              placeholder="••••••••"
            />
          </div>

          <input type="hidden" name="csrf_token" value={csrfToken} />

          {error && (
            <div className="text-sm p-3 rounded-lg text-center" style={{ 
              backgroundColor: COLORS.dangerLight,
              color: COLORS.danger,
              border: `1px solid ${COLORS.danger}20`
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            style={{ 
              backgroundColor: isLoading ? COLORS.muted : COLORS.primary,
              color: COLORS.white,
              hoverBackground: COLORS.primaryDark
            }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm" style={{ color: COLORS.textTertiary }}>
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-medium hover:underline focus:outline-none"
            style={{ 
              color: COLORS.primary,
              focusOutline: COLORS.highlight
            }}
            disabled={isLoading}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;