import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email_id, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/signup', { 
        name, 
        email_id, 
        password, 
        role: isAdminRole ? 'Admin' : 'User' 
      });
      login(data, data.token);
      if (data.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthConfig = [
    null,
    { label: 'Weak', color: 'bg-red-400', textColor: 'text-red-500' },
    { label: 'Good', color: 'bg-yellow-400', textColor: 'text-yellow-600' },
    { label: 'Strong', color: 'bg-green-400', textColor: 'text-green-600' },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-dark via-gray-900 to-black flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand-yellow/5 pointer-events-none" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-brand-yellow/10 pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-yellow rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-brand-dark font-black text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>M</span>
            </div>
            <div>
              <span className="text-white font-black text-xl block" style={{ fontFamily: 'Poppins, sans-serif' }}>McDonald's</span>
              <span className="text-white/30 text-xs font-semibold tracking-widest uppercase">Portal</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Join the<br />
            Family! <span className="text-brand-yellow">🍔</span>
          </h2>
          <p className="text-white/50 text-base font-medium leading-relaxed max-w-xs">
            Create your free account and start ordering your favourite meals instantly.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { emoji: '⚡', title: 'Instant Setup', desc: 'Ready in seconds' },
              { emoji: '🔒', title: 'Secure', desc: 'Your data is safe' },
              { emoji: '🍟', title: 'Full Menu', desc: 'Every item available' },
              { emoji: '📜', title: 'Order History', desc: 'Always accessible' },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-2xl">{item.emoji}</span>
                <p className="text-white font-bold text-sm mt-2">{item.title}</p>
                <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-xs font-medium">
          © 2025 McDonald's Hackathon Portal
        </p>
      </div>

      {/* Right: Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
              <span className="text-brand-dark font-black text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>M</span>
            </div>
            <span className="font-black text-brand-dark text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>McDonald's Portal</span>
          </div>

          <h1 className="text-3xl font-black text-brand-dark mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Create Account
          </h1>
          <p className="text-gray-400 text-sm font-medium mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-red font-bold hover:underline">
              Sign in
            </Link>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm font-medium flex items-start gap-2">
              <span className="text-red-400 text-base leading-none mt-0.5">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="signup-email_id"
                  type="email_id"
                  required
                  value={email_id}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-field pl-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2 text-left">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= level
                            ? strengthConfig[passwordStrength]?.color
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-bold ${strengthConfig[passwordStrength]?.textColor}`}>
                    {strengthConfig[passwordStrength]?.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Role Toggle */}
            <div className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-xl transition-colors hover:border-brand-yellow/50">
              <input 
                type="checkbox" 
                id="role-toggle" 
                checked={isAdminRole}
                onChange={(e) => setIsAdminRole(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow/30"
              />
              <label htmlFor="role-toggle" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                Sign up as a Restaurant Seller <span className="text-xs text-gray-400 font-medium ml-1">(Admin)</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              id="signup-submit-btn"
              className="w-full bg-brand-yellow hover:bg-yellow-400 disabled:opacity-60 text-brand-dark font-black py-4 rounded-xl mt-2 flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg shadow-brand-yellow/40 shimmer-btn"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6 font-medium">
            By signing up you agree to our Terms of Service &amp; Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
