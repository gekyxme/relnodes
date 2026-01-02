'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Globe, Upload, LayoutDashboard, Menu, X, Linkedin, LogIn, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Home', icon: Globe, protected: false },
  { href: '/upload', label: 'Upload', icon: Upload, protected: true },
  { href: '/dashboard', label: 'My Network', icon: LayoutDashboard, protected: true },
];

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Filter nav items based on auth status
  const visibleNavItems = navItems.filter(item => 
    !item.protected || session
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1d2226] border-b border-[#38434f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded bg-[#0a66c2] flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">
              Relnodes
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex flex-col items-center gap-0.5 px-6 py-2 text-xs font-medium transition-all relative
                    ${isActive 
                      ? 'text-white' 
                      : 'text-[#b0b0b0] hover:text-white'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-[#38434f] animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#38434f]/50">
                  <div className="w-6 h-6 rounded-full bg-[#0a66c2] flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-white max-w-[120px] truncate">
                    {session.user?.name || session.user?.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-[#b0b0b0] hover:text-white hover:bg-[#38434f] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-[#b0b0b0] hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-[#0a66c2] text-white hover:bg-[#004182] transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#38434f] bg-[#1d2226]"
          >
            <div className="px-4 py-3 space-y-1">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-[#0a66c2]/20 text-[#70b5f9]' 
                        : 'text-[#b0b0b0] hover:text-white hover:bg-white/5'}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Auth - Mobile */}
              <div className="pt-3 mt-3 border-t border-[#38434f]">
                {session ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-[#0a66c2] flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-white">{session.user?.name || 'User'}</div>
                        <div className="text-xs text-[#666666]">{session.user?.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#b24020] hover:bg-[#b24020]/10 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#b0b0b0] hover:text-white hover:bg-white/5 transition-all"
                    >
                      <LogIn className="w-5 h-5" />
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#0a66c2] hover:bg-[#0a66c2]/10 transition-all"
                    >
                      <User className="w-5 h-5" />
                      Create account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
