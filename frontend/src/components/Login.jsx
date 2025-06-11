import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const KRATOS_PUBLIC_URL = 'http://localhost:4433';

function Login() {
  const [flowId, setFlowId] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
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
      axios
        .get(`${KRATOS_PUBLIC_URL}/self-service/login/browser`, {
          withCredentials: true,
        })
        .then((res) => {
          window.location.href = res.request.responseURL;
        })
        .catch(() => setError('Could not start login flow.'));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!flowId) {
      setError('No login flow found.');
      return;
    }

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
        setError('Login failed. Check your credentials.');
        if (err.response?.data?.ui?.messages?.length > 0) {
          err.response.data.ui.messages.forEach((msg) =>
            console.error(`- ${msg.type}: ${msg.text}`)
          );
        }
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e2f] text-gray-100">
      <div className="bg-[#2b2b3c] shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-[#cdd9e5] mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            
            <input
              id="identifier"
              type="email"
              name="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-[#1e1e2f] border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Email"
            />
          </div>

          <div>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-[#1e1e2f] border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Password"
            />
          </div>

          <input type="hidden" name="csrf_token" value={csrfToken} />

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#a0aec0]">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-indigo-400 hover:underline font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
