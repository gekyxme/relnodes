'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, Globe, MapPin, UserCheck, LogOut, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

// Dynamically import Threads to avoid SSR issues with WebGL
const Threads = dynamic(() => import('@/components/Threads'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black" />
  )
});

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Import',
    description: 'Export your LinkedIn connections CSV and upload it in seconds.',
  },
  {
    number: '02',
    icon: MapPin,
    title: 'Map',
    description: 'Watch your connections appear on an interactive 3D globe.',
  },
  {
    number: '03',
    icon: UserCheck,
    title: 'Discover',
    description: 'Find referrals and opportunities within your network.',
  },
];

export default function Home() {
  const { data: session, status } = useSession();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Fixed Threads Background - Covers entire page */}
      <div className="fixed inset-0 z-0">
        <Threads
          color={[0.039, 0.404, 0.761]}
          amplitude={1.5}
          distance={0.2}
          enableMouseInteraction={true}
        />
      </div>

      {/* Subtle gradient overlay for readability */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/30 to-black/70 pointer-events-none" />

      {/* Navigation - Minimal centered header */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-6 md:gap-8 px-4 md:px-6 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium hidden sm:block"
              >
                How It Works
              </button>
              <Link 
                href="/dashboard"
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>
              
              {/* Auth Section */}
              {status === 'loading' ? (
                <div className="w-20 h-8 bg-white/10 rounded-full animate-pulse" />
              ) : session ? (
                // Authenticated: Show user info + logout
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-white/80">
                    <div className="w-7 h-7 rounded-full bg-[#0a66c2] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
                      {session.user?.name || session.user?.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all text-sm"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:block">Logout</span>
                  </button>
                </div>
              ) : (
                // Not authenticated: Show sign in/up
                <>
                  <Link 
                    href="/login"
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup"
                    className="px-4 py-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white text-sm font-medium rounded-full transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Scrollable */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
                See Your{' '}
                <span className="text-[#0a66c2]">LinkedIn</span>
                <br />
                Network on a Globe
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Transform your professional connections into an interactive 3D visualization. 
              Find referrals, discover opportunities, and understand your reach.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center"
            >
              <Link 
                href="/upload" 
                className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all"
              >
                <Globe className="w-5 h-5" />
                View Dashboard
              </Link>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-24"
            >
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="inline-flex flex-col items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
              >
                <span className="text-xs uppercase tracking-widest">Scroll</span>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
                </motion.div>
              </button>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="min-h-screen flex items-center justify-center px-6 py-32">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Three Simple Steps
              </h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto">
                From export to insight in minutes
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    viewport={{ once: true }}
                    className="relative group"
                  >
                    <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#0a66c2]/50 transition-all duration-300 hover:bg-white/10">
                      {/* Step number */}
                      <span className="text-6xl font-bold text-white/10 absolute top-4 right-6">
                        {step.number}
                      </span>
                      
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-[#0a66c2]/20 flex items-center justify-center mb-6 group-hover:bg-[#0a66c2]/30 transition-colors">
                          <Icon className="w-7 h-7 text-[#0a66c2]" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                        <p className="text-white/60 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <Link 
                href="/upload" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-[#0a66c2] hover:bg-[#004182] text-white font-semibold rounded-full transition-all"
              >
                Upload Your Connections
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer - Minimal */}
        <footer className="relative z-10 py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Globe className="w-4 h-4" />
              <span className="font-medium">Relnodes</span>
            </div>
            <p className="text-white/30 text-sm">
              Your data stays private. Always.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
