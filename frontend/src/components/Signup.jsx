import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

    // const data = {
    //   method: 'password',
    //   csrf_token: csrfToken,
    //   password: password,
    //   traits: {
    //     email: email,
    //     name: name,
    //     role: 'user',
    //   },
    // };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e2f] text-gray-100">
      <div className="bg-[#2b2b3c] shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-[#cdd9e5] mb-6">Sign Up</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              id="name"
              name="traits.name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-[#1e1e2f] border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              className="w-full px-4 py-2 rounded-lg bg-[#1e1e2f] border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              className="w-full px-4 py-2 rounded-lg bg-[#1e1e2f] border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Password"
            />
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Register
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#a0aec0]">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-indigo-400 hover:underline font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
