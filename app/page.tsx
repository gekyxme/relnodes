'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, Globe, Users, MapPin, Briefcase, UserCheck, Search, Network } from 'lucide-react';
import Navigation from '@/components/Navigation';

const features = [
  {
    icon: Upload,
    title: 'Import Connections',
    description: 'Export your LinkedIn connections CSV and upload it in seconds.',
  },
  {
    icon: MapPin,
    title: 'Map Your Network',
    description: 'See where your connections are located across the globe.',
  },
  {
    icon: UserCheck,
    title: 'Find Referrals',
    description: 'Discover who can refer you to your dream companies.',
  },
];

const useCases = [
  {
    icon: Briefcase,
    title: 'Job Hunting',
    description: 'Find connections at companies you want to work for and request referrals.',
  },
  {
    icon: Network,
    title: 'Network Analysis',
    description: 'Understand your network distribution across industries and regions.',
  },
  {
    icon: Search,
    title: 'Opportunity Discovery',
    description: 'Identify network gaps and grow strategically.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-14 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-black to-black" />
        
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-32">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a66c2]/20 text-[#70b5f9] text-sm font-medium mb-6">
                  <Globe className="w-4 h-4" />
                  Visualize Your Professional Network
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              >
                See Your{' '}
                <span className="text-[#0a66c2]">LinkedIn</span>
                <br />
                Connections on a Globe
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-[#b0b0b0] mb-8 max-w-lg mx-auto lg:mx-0"
              >
                Transform your network into an interactive 3D visualization. 
                Find referral opportunities, discover connections at target companies, 
                and understand your professional reach.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              >
                <Link href="/upload" className="btn-linkedin flex items-center gap-2 group">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/dashboard" className="btn-linkedin-secondary flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Dashboard
                </Link>
              </motion.div>
            </div>

            {/* Globe Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex-1 relative"
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-[#0a66c2]/20 blur-3xl" />
                
                {/* Globe representation */}
                <div className="relative w-full h-full rounded-full border border-[#38434f] bg-gradient-to-br from-[#1d2226] to-black flex items-center justify-center overflow-hidden">
                  {/* Grid lines */}
                  <div className="absolute inset-0">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 border-t border-[#38434f]/30"
                        style={{ top: `${(i + 1) * 14.28}%` }}
                      />
                    ))}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 border-l border-[#38434f]/30"
                        style={{ left: `${(i + 1) * 11.11}%` }}
                      />
                    ))}
                  </div>

                  {/* Connection dots */}
                  {[
                    { left: 25, top: 35 },
                    { left: 68, top: 28 },
                    { left: 45, top: 62 },
                    { left: 72, top: 55 },
                    { left: 30, top: 70 },
                    { left: 55, top: 42 },
                    { left: 82, top: 38 },
                    { left: 38, top: 25 },
                    { left: 62, top: 75 },
                    { left: 20, top: 50 },
                  ].map((pos, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-[#0a66c2]"
                      style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 2 + i * 0.3,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}

                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full">
                    <motion.line
                      x1="50%" y1="50%" x2="25%" y2="35%"
                      stroke="#0a66c2"
                      strokeWidth="1"
                      strokeOpacity="0.3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.5 }}
                    />
                    <motion.line
                      x1="50%" y1="50%" x2="68%" y2="28%"
                      stroke="#0a66c2"
                      strokeWidth="1"
                      strokeOpacity="0.3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.7 }}
                    />
                    <motion.line
                      x1="50%" y1="50%" x2="72%" y2="55%"
                      stroke="#0a66c2"
                      strokeWidth="1"
                      strokeOpacity="0.3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.9 }}
                    />
                  </svg>

                  {/* Center point (you) */}
                  <div className="relative z-10">
                    <div className="w-4 h-4 rounded-full bg-[#70b5f9] ring-4 ring-[#70b5f9]/30" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-[#1d2226]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-[#b0b0b0] max-w-xl mx-auto">
              Three simple steps to visualize and leverage your professional network
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-linkedin p-6 card-hover"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#0a66c2]/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#0a66c2]" />
                  </div>
                  <div className="text-sm text-[#0a66c2] font-semibold mb-2">
                    Step {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-[#b0b0b0] text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Why Visualize Your Network?</h2>
            <p className="text-[#b0b0b0] max-w-xl mx-auto">
              Your network is your net worth. Make the most of it.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <motion.div
                  key={useCase.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#0a66c2]/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-[#70b5f9]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{useCase.title}</h3>
                  <p className="text-[#b0b0b0]">
                    {useCase.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#1d2226]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#0a66c2] flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Map Your Network?
          </h2>
          <p className="text-[#b0b0b0] mb-8 max-w-md mx-auto">
            Export your LinkedIn connections and discover the global reach of your professional relationships.
          </p>
          <Link href="/upload" className="btn-linkedin inline-flex items-center gap-2 group">
            Upload Your Connections
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#38434f] bg-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#b0b0b0] text-sm">
            <Globe className="w-4 h-4" />
            <span>Relnodes</span>
          </div>
          <p className="text-[#666666] text-sm">
            Your data stays on your device. We never share your information.
          </p>
        </div>
      </footer>
    </div>
  );
}
