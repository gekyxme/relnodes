'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Linkedin, Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, Check } from 'lucide-react';

const PASSWORD_REQUIREMENTS = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = PASSWORD_REQUIREMENTS.filter(req => req.test(password)).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < PASSWORD_REQUIREMENTS.length) {
      setError('Password does not meet all requirements');
      return;
    }

    setLoading(true);

    try {
      // Register
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but sign in failed - redirect to login
        router.push('/login?registered=true');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-black to-black" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0a66c2] flex items-center justify-center">
              <Linkedin className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Relnodes</span>
          </Link>
        </div>

        {/* Card */}
        <div className="card-linkedin p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-2">Create an account</h1>
          <p className="text-[#b0b0b0] text-center mb-8">Start visualizing your network today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm text-[#b0b0b0] mb-2">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                  className="w-full bg-[#1d2226] border border-[#38434f] rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-[#666666] focus:outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-[#b0b0b0] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full bg-[#1d2226] border border-[#38434f] rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-[#666666] focus:outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-[#b0b0b0] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full bg-[#1d2226] border border-[#38434f] rounded-lg py-3 pl-11 pr-11 text-white placeholder:text-[#666666] focus:outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#38434f] rounded transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#666666]" />
                  ) : (
                    <Eye className="w-4 h-4 text-[#666666]" />
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrength
                            ? passwordStrength <= 1
                              ? 'bg-[#b24020]'
                              : passwordStrength <= 2
                              ? 'bg-yellow-500'
                              : passwordStrength <= 3
                              ? 'bg-[#0a66c2]'
                              : 'bg-[#057642]'
                            : 'bg-[#38434f]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PASSWORD_REQUIREMENTS.map((req, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-1.5 text-xs ${
                          req.test(password) ? 'text-[#057642]' : 'text-[#666666]'
                        }`}
                      >
                        <Check className={`w-3 h-3 ${req.test(password) ? 'opacity-100' : 'opacity-30'}`} />
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-[#b0b0b0] mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className={`w-full bg-[#1d2226] border rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-[#666666] focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-[#b24020] focus:border-[#b24020] focus:ring-[#b24020]/20'
                      : 'border-[#38434f] focus:border-[#0a66c2] focus:ring-[#0a66c2]/20'
                  }`}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-[#b24020]">Passwords do not match</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-[#b24020]/10 border border-[#b24020]/20 flex items-center gap-2 text-[#b24020] text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || passwordStrength < PASSWORD_REQUIREMENTS.length}
              className="w-full btn-linkedin py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#38434f]" />
            <span className="text-sm text-[#666666]">or</span>
            <div className="flex-1 h-px bg-[#38434f]" />
          </div>

          {/* Sign in link */}
          <p className="text-center text-[#b0b0b0]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#0a66c2] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-[#666666] hover:text-[#b0b0b0] transition-colors">
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

