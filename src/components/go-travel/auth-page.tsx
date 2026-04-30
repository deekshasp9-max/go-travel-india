'use client';

import { useState, useCallback } from 'react';
import { useGoTravelStore } from '@/store/go-travel-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Mail, Lock, User, Phone, Eye, EyeOff, Shield,
  ArrowRight, Loader2, CheckCircle, AlertCircle, X, Globe, Heart
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AuthPage() {
  const { setCurrentPage } = useGoTravelStore();
  const { setAuth } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (mode === 'signup' && !name.trim()) errs.name = 'Please enter your name';
    if (!email.trim()) errs.email = 'Please enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
    if (mode === 'signup' && phone.trim()) {
      if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, '')))
        errs.phone = 'Enter a valid 10-digit Indian phone number';
    }
    if (!password) errs.password = 'Please enter your password';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [mode, name, email, phone, password]);

  // Login handler
  const handleLogin = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user && data.token) {
        setAuth(data.user, data.token);
        toast({
          title: 'Welcome back! 👋',
          description: `Signed in as ${data.user.name}`,
        });
        setCurrentPage('home');
      } else {
        toast({
          title: 'Login Failed',
          description: data.error || 'Invalid email or password',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Login Failed',
        description: 'Network error. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [email, password, validate, setAuth, setCurrentPage]);

  // Signup handler
  const handleSignup = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (res.ok && data.user && data.token) {
        setAuth(data.user, data.token);
        toast({
          title: 'Account Created! 🎉',
          description: `Welcome to Go Travel, ${data.user.name}!`,
        });
        setCurrentPage('home');
      } else {
        toast({
          title: 'Sign Up Failed',
          description: data.error || 'Could not create account',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Sign Up Failed',
        description: 'Network error. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [name, email, phone, password, validate, setAuth, setCurrentPage]);

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setErrors({});
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Go Travel</h1>
                <p className="text-emerald-200 text-xs font-medium tracking-wider">INDIA&apos;S TRAVEL COMPANION</p>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4">
              Your Journey{' '}
              <span className="text-yellow-200">Starts Here</span>
            </h2>
            <p className="text-emerald-100 text-lg leading-relaxed mb-10 max-w-md">
              Explore India&apos;s best destinations, compare flights, trains & buses, book local rides with GPS tracking — all in one platform.
            </p>

            <div className="space-y-4">
              {[
                { icon: '✈️', title: '50+ Airlines Compared', desc: 'Find the cheapest flights' },
                { icon: '🚂', title: 'IRCTC Train Booking', desc: 'Real-time seat availability' },
                { icon: '🛡️', title: "Women's Safety", desc: 'SOS alert with GPS tracking' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm">{feature.title}</h3>
                    <p className="text-emerald-200 text-xs mt-0.5">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center gap-2 text-emerald-200 text-xs"
          >
            <Shield className="w-4 h-4" />
            <span>Trusted by 50L+ travelers across India</span>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Go Travel
            </h1>
          </div>

          {/* Back button */}
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6"
          >
            <X className="w-4 h-4" /> Back to Home
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-gray-500 mt-1">
              {mode === 'login'
                ? 'Sign in to access your bookings and rides'
                : 'Join Go Travel and start exploring India'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="bg-gray-100 rounded-xl p-1 flex mb-6">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m as 'login' | 'signup'); setErrors({}); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === m
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 sm:p-6 space-y-4">
              {/* Name (signup only) */}
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1"
                  >
                    <Label htmlFor="name" className="text-sm font-medium">
                      <User className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                      placeholder="Enter your full name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-medium">
                  <Mail className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                  placeholder="you@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone (signup only) */}
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1"
                  >
                    <Label htmlFor="phone" className="text-sm font-medium">
                      <Phone className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                      Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500">
                        +91
                      </span>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors((p) => ({ ...p, phone: '' })); }}
                        placeholder="10-digit mobile number"
                        className="rounded-l-none"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium">
                  <Lock className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                    placeholder="Enter your password"
                    className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                onClick={mode === 'login' ? handleLogin : handleSignup}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl font-bold text-base shadow-lg shadow-emerald-200 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              {/* Toggle Mode Link */}
              <div className="text-center text-sm text-gray-500">
                {mode === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button onClick={switchMode} className="text-emerald-600 font-semibold hover:underline">
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button onClick={switchMode} className="text-emerald-600 font-semibold hover:underline">
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Your data is encrypted and secure</span>
            <Badge variant="secondary" className="text-[9px] ml-1">256-bit SSL</Badge>
          </div>

          {/* Mobile footer */}
          <div className="lg:hidden mt-8 text-center text-xs text-gray-400">
            <p className="flex items-center justify-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-400" /> in India
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
