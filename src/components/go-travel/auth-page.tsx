'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Plane,
  Train,
  Bike,
  MapPin,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useGoTravelStore } from '@/store/go-travel-store';

type AuthMode = 'login' | 'register';

const features = [
  { icon: Plane, label: 'Flights' },
  { icon: Train, label: 'Trains' },
  { icon: Bike, label: 'Bikes' },
  { icon: MapPin, label: 'Experiences' },
];

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { setAuth } = useAuthStore();
  const { setCurrentPage } = useGoTravelStore();

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  }, []);

  const toggleMode = useCallback(() => {
    const next = mode === 'login' ? 'register' : 'login';
    setMode(next);
    resetForm();
  }, [mode, resetForm]);

  const validateRegister = useCallback((): boolean => {
    if (!name.trim()) {
      setError('Full name is required.');
      return false;
    }
    if (!email.trim()) {
      setError('Email address is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (phone && !/^[0-9+\-\s()]{7,15}$/.test(phone)) {
      setError('Please enter a valid phone number.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    setError('');
    return true;
  }, [name, email, phone, password, confirmPassword]);

  const validateLogin = useCallback((): boolean => {
    if (!email.trim()) {
      setError('Email address is required.');
      return false;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return false;
    }
    setError('');
    return true;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        if (mode === 'register') {
          if (!validateRegister()) {
            setLoading(false);
            return;
          }
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              email: email.trim(),
              ...(phone.trim() ? { phone: phone.trim() } : {}),
              password,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.error || 'Registration failed. Please try again.');
            setLoading(false);
            return;
          }

          setAuth(data.user, data.token);
          setSuccess('Account created successfully! Redirecting…');
          setTimeout(() => {
            setCurrentPage('home');
          }, 1200);
        } else {
          if (!validateLogin()) {
            setLoading(false);
            return;
          }
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.trim(),
              password,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.error || 'Login failed. Please check your credentials.');
            setLoading(false);
            return;
          }

          setAuth(data.user, data.token);
          setSuccess('Welcome back! Redirecting…');
          setTimeout(() => {
            setCurrentPage('home');
          }, 1200);
        }
      } catch {
        setError('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    },
    [mode, validateRegister, validateLogin, name, email, phone, password, setAuth, setCurrentPage],
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-5xl"
      >
        <Card className="overflow-hidden border-0 shadow-2xl rounded-2xl">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* ───── Left branding panel ───── */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-10 text-white flex-col justify-between"
            >
              {/* Decorative circles */}
              <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
              <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-white/5" />

              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 mb-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Plane className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight">Go Travel</span>
                </motion.div>
                <p className="text-emerald-100 text-sm mt-1">India&apos;s Trusted Travel Companion</p>
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold leading-snug mb-6"
                >
                  Explore India
                  <br />
                  Like Never Before
                </motion.h2>

                <div className="grid grid-cols-2 gap-4">
                  {features.map((feat, i) => (
                    <motion.div
                      key={feat.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
                    >
                      <feat.icon className="w-5 h-5 text-emerald-100" />
                      <span className="text-sm font-medium">{feat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="relative z-10 text-emerald-200 text-xs"
              >
                Trusted by 2M+ travellers across India
              </motion.p>
            </motion.div>

            {/* ───── Right form panel ───── */}
            <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Mobile branding */}
                  <div className="lg:hidden flex items-center gap-2 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">Go Travel</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1 mb-6">
                    {mode === 'login'
                      ? 'Sign in to continue your journey'
                      : 'Start your adventure with Go Travel'}
                  </p>

                  {/* Error / Success banners */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                      >
                        {error}
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        {success}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ── Name (register only) ── */}
                    {mode === 'register' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <label className="block font-semibold text-xs uppercase text-gray-600 mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 h-12 rounded-xl border-gray-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                            disabled={loading}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* ── Email ── */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block font-semibold text-xs uppercase text-gray-600 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-12 rounded-xl border-gray-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                          disabled={loading}
                        />
                      </div>
                    </motion.div>

                    {/* ── Phone (register only, optional) ── */}
                    {mode === 'register' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <label className="block font-semibold text-xs uppercase text-gray-600 mb-1.5">
                          Phone Number{' '}
                          <span className="text-gray-400 normal-case font-normal">(optional)</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-10 h-12 rounded-xl border-gray-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                            disabled={loading}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* ── Password ── */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block font-semibold text-xs uppercase text-gray-600 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {mode === 'register' && password.length > 0 && password.length < 6 && (
                        <p className="text-xs text-amber-600 mt-1">
                          Password must be at least 6 characters.
                        </p>
                      )}
                    </motion.div>

                    {/* ── Confirm Password (register only) ── */}
                    {mode === 'register' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <label className="block font-semibold text-xs uppercase text-gray-600 mb-1.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`pl-10 pr-10 h-12 rounded-xl border-gray-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 ${
                              confirmPassword && confirmPassword !== password
                                ? 'border-red-300 focus-visible:ring-red-400 focus-visible:border-red-400'
                                : ''
                            }`}
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            tabIndex={-1}
                            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                          >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmPassword && confirmPassword !== password && (
                          <p className="text-xs text-red-600 mt-1">Passwords do not match.</p>
                        )}
                        {confirmPassword && confirmPassword === password && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Passwords match
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* ── Submit button ── */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm mt-2 transition-colors"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  {/* ── Divider ── */}
                  <div className="flex items-center gap-4 my-6">
                    <Separator className="flex-1" />
                    <span className="text-xs text-gray-400 uppercase">or</span>
                    <Separator className="flex-1" />
                  </div>

                  {/* ── Toggle mode ── */}
                  <p className="text-center text-sm text-gray-500">
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                      disabled={loading}
                    >
                      {mode === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>

                  {/* ── Secure badge ── */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Your data is encrypted and secure</span>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
