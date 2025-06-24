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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!flowId) return;

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
        console.log("Signup successful");
        navigate("/login");
      })
      .catch((err) => {
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
          console.error('Unknown error:', err.message);
        }
      });
  };
  const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:8080/auth/oidc/google'; 
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.secondary }}>
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md" style={{ border: `1px solid ${COLORS.border}` }}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.text }}>
            Create Your Account
          </h2>
          <p className="text-sm" style={{ color: COLORS.muted }}>
            Join us to get started
          </p>
        </div>

        {/* Google Sign-In Button */}
        <button
        onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border mb-4 transition-all hover:shadow-sm"
          style={{ 
            borderColor: COLORS.border,
            color: COLORS.text,
            backgroundColor: COLORS.primary
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            <path fill="none" d="M1 1h22v22H1z"/>
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
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
              
            </label>
            <input
              id="name"
              name="traits.name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none"
              style={{ 
                backgroundColor: COLORS.primary,
                borderColor: COLORS.border,
                color: COLORS.text,
                focusRing: COLORS.accent
              }}
              placeholder="Full Name"
            />
          </div>

          <div>
            
            <input
              id="email"
              name="traits.email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none"
              style={{ 
                backgroundColor: COLORS.primary,
                borderColor: COLORS.border,
                color: COLORS.text,
                focusRing: COLORS.accent
              }}
              placeholder="Email"
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none"
              style={{ 
                backgroundColor: COLORS.primary,
                borderColor: COLORS.border,
                color: COLORS.text,
                focusRing: COLORS.accent
              }}
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="text-sm p-2 rounded text-center" style={{ 
              backgroundColor: `${COLORS.danger}10`,
              color: COLORS.danger
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: COLORS.accent,
              color: 'white',
              hoverBackground: `${COLORS.accent}dd`
            }}
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm" style={{ color: COLORS.muted }}>
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium hover:underline"
            style={{ color: COLORS.accent }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;