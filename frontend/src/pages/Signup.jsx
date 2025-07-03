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
  const [passwordStrength, setPasswordStrength] = useState(0);
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
      setIsLoading(true);
      axios
        .get(`${KRATOS_PUBLIC_URL}/self-service/registration/browser`, {
          withCredentials: true,
        })
        .then((res) => {
          window.location.href = res.request.responseURL;
        })
        .catch(() => {
          setError('Could not start registration flow.');
          setIsLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    // Simple password strength indicator
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!flowId) return;

    setIsLoading(true);
    setError(null);

    axios
      .post("http://localhost:8080/api/register", {
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
      }, { withCredentials: true })
      .then(() => {
        navigate("/login?registered=true");
      })
      .catch((err) => {
        let errorMessage = 'Registration failed. Please try again.';
        
        if (err.response?.data?.ui?.messages?.length > 0) {
          errorMessage = err.response.data.ui.messages[0].text;
        } else if (err.response?.data?.ui?.nodes) {
          const passwordNode = err.response.data.ui.nodes.find(
            n => n.group === 'password'
          );
          if (passwordNode?.messages?.length > 0) {
            errorMessage = passwordNode.messages[0].text;
          }
        }

        setError(errorMessage);
        setIsLoading(false);
      });
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/auth/oidc/google';
  };

  const getPasswordStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return COLORS.danger;
      case 1: return COLORS.warning;
      case 2: return COLORS.accent;
      case 3: return COLORS.primary;
      case 4: return COLORS.success;
      default: return COLORS.border;
    }
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
            Create Your Account
          </h2>
          <p className="text-sm" style={{ color: COLORS.textTertiary }}>
            Join us to get started
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
          <span className="font-medium">Sign up with Google</span>
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t" style={{ borderColor: COLORS.border }}></div>
          <span className="mx-4 text-sm" style={{ color: COLORS.muted }}>OR</span>
          <div className="flex-grow border-t" style={{ borderColor: COLORS.border }}></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
              Full Name
            </label>
            <input
              id="name"
              name="traits.name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
              Email
            </label>
            <input
              id="email"
              name="traits.email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {password && (
                <span className="float-right text-xs" style={{ color: getPasswordStrengthColor() }}>
                  {['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength]}
                </span>
              )}
            </label>
            <input
              id="password"
              name="password"
              type="password"
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
            {password && (
              <div className="h-1 mt-1 flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="flex-1 rounded-full transition-all"
                    style={{ 
                      backgroundColor: i <= passwordStrength ? getPasswordStrengthColor() : COLORS.border,
                      height: '2px'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm p-3 rounded-lg" style={{ 
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
                Creating account...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm" style={{ color: COLORS.textTertiary }}>
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium hover:underline focus:outline-none"
            style={{ 
              color: COLORS.primary,
              focusOutline: COLORS.highlight
            }}
            disabled={isLoading}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;