'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GlobeViz from '@/components/GlobeViz';
import CityAutocomplete from '@/components/CityAutocomplete';
import GeocodingProgress from '@/components/GeocodingProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MapPin, Building2, User, ExternalLink, Search, 
  ChevronRight, Globe, Users, AlertCircle, Edit3, Check, Trash2,
  RefreshCw, Briefcase, UserCheck, Linkedin, Upload, UserPlus,
  Tag, FileText, Plus, Home, Menu
} from 'lucide-react';
import { City } from '@/lib/cities';

interface Connection {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  company?: string;
  position?: string;
  profileUrl?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  tags?: string;
  notes?: string;
}

interface Stats {
  total: number;
  geocoded: number;
  pending: number;
  topCompanies: { name: string; count: number }[];
  topCountries: { name: string; count: number }[];
}

interface Props {
  connections: Connection[];
  allConnections: Connection[];
  stats: Stats;
}

// Predefined tag options
const TAG_OPTIONS = [
  { value: 'recruiter', label: 'Recruiter', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'hiring-manager', label: 'Hiring Manager', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'referral', label: 'Can Refer', color: 'bg-green-500/20 text-green-400' },
  { value: 'mentor', label: 'Mentor', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'friend', label: 'Friend', color: 'bg-pink-500/20 text-pink-400' },
  { value: 'colleague', label: 'Colleague', color: 'bg-cyan-500/20 text-cyan-400' },
  { value: 'alumni', label: 'Alumni', color: 'bg-orange-500/20 text-orange-400' },
];

// Empty Dashboard Component
function EmptyDashboard({ onAddConnection }: { onAddConnection: () => void }) {
  return (
    <div className="flex h-screen w-full bg-black items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md px-6"
      >
        <div className="w-20 h-20 rounded-full bg-[#0a66c2]/10 flex items-center justify-center mx-auto mb-6">
          <Globe className="w-10 h-10 text-[#0a66c2]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">No Connections Yet</h1>
        <p className="text-[#b0b0b0] mb-8">
          Upload your LinkedIn connections CSV or add connections manually to see your network on the globe.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/upload" className="btn-linkedin flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            Upload CSV
          </Link>
          <button 
            onClick={onAddConnection}
            className="btn-linkedin-secondary flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Manually
          </button>
        </div>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm text-[#0a66c2] hover:underline">
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}

// Add Connection Modal
function AddConnectionModal({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    position: '',
    profileUrl: '',
    tags: [] as string[],
    notes: '',
  });
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/connections/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          city: selectedCity?.name,
          country: selectedCity?.country,
          latitude: selectedCity?.lat,
          longitude: selectedCity?.lng,
          tags: formData.tags.join(','),
        }),
      });

      if (res.ok) {
        onSave();
        onClose();
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          company: '',
          position: '',
          profileUrl: '',
          tags: [],
          notes: '',
        });
        setSelectedCity(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add connection');
      }
    } catch {
      setError('Failed to add connection');
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto card-linkedin"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-[#38434f] sticky top-0 bg-[#1d2226] z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0a66c2]/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#0a66c2]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Add Connection</h2>
                  <p className="text-sm text-[#b0b0b0]">Add a new connection manually</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-[#38434f] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#b0b0b0]" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#b0b0b0] mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  className="input-linkedin"
                />
              </div>
              <div>
                <label className="block text-sm text-[#b0b0b0] mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                  className="input-linkedin"
                />
              </div>
            </div>

            {/* Company & Position */}
            <div>
              <label className="block text-sm text-[#b0b0b0] mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Google, Meta, etc."
                className="input-linkedin"
              />
            </div>

            <div>
              <label className="block text-sm text-[#b0b0b0] mb-2">Position</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Software Engineer"
                className="input-linkedin"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm text-[#b0b0b0] mb-2">Location</label>
              <CityAutocomplete
                value=""
                onChange={(city) => setSelectedCity(city)}
                placeholder="Search for a city..."
              />
            </div>

            {/* LinkedIn URL */}
            <div>
              <label className="block text-sm text-[#b0b0b0] mb-2">LinkedIn Profile URL</label>
              <input
                type="url"
                value={formData.profileUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, profileUrl: e.target.value }))}
                placeholder="https://linkedin.com/in/..."
                className="input-linkedin"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm text-[#b0b0b0] mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => toggleTag(tag.value)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium transition-all
                      ${formData.tags.includes(tag.value) 
                        ? tag.color + ' ring-1 ring-current' 
                        : 'bg-[#38434f] text-[#b0b0b0] hover:text-white'}
                    `}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-[#b0b0b0] mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Private Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this connection..."
                rows={3}
                className="input-linkedin resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-[#b24020]/10 border border-[#b24020]/20 text-[#b24020] text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#38434f] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full bg-[#38434f] text-white font-medium hover:bg-[#4a5568] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-linkedin flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Connection
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function DashboardClient({ connections, allConnections, stats }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoStartGeocoding = searchParams.get('geocoding') === 'true';
  
  const [selectedNode, setSelectedNode] = useState<Connection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConnectionsList, setShowConnectionsList] = useState(false);
  const [showReferralFinder, setShowReferralFinder] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'geocoded' | 'pending'>('all');
  const [companySearch, setCompanySearch] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [currentNotes, setCurrentNotes] = useState('');
  const [geocodingDone, setGeocodingDone] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show empty state if no connections
  if (allConnections.length === 0) {
    return (
      <>
        <EmptyDashboard onAddConnection={() => setShowAddModal(true)} />
        <AnimatePresence>
          {showAddModal && (
            <AddConnectionModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSave={() => router.refresh()}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // Filter connections based on search and filter type
  const filteredConnections = useMemo(() => {
    let filtered = allConnections;
    
    if (filterType === 'geocoded') {
      filtered = filtered.filter(c => c.latitude !== null);
    } else if (filterType === 'pending') {
      filtered = filtered.filter(c => c.latitude === null);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.firstName?.toLowerCase().includes(query) ||
        c.lastName?.toLowerCase().includes(query) ||
        c.company?.toLowerCase().includes(query) ||
        c.city?.toLowerCase().includes(query) ||
        c.tags?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [allConnections, searchQuery, filterType]);

  // Company clusters for referral finder
  const companyClusters = useMemo(() => {
    const clusters: Record<string, Connection[]> = {};
    allConnections.forEach(c => {
      if (c.company) {
        if (!clusters[c.company]) clusters[c.company] = [];
        clusters[c.company].push(c);
      }
    });
    return Object.entries(clusters)
      .map(([name, conns]) => ({ name, count: conns.length, connections: conns }))
      .sort((a, b) => b.count - a.count);
  }, [allConnections]);

  // Filter companies for referral finder
  const filteredCompanies = useMemo(() => {
    if (!companySearch) return companyClusters.slice(0, 20);
    const query = companySearch.toLowerCase();
    return companyClusters.filter(c => c.name.toLowerCase().includes(query));
  }, [companyClusters, companySearch]);

  const handleSaveLocation = async () => {
    if (!selectedNode || !selectedCity) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/connections/${selectedNode.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: selectedCity.name,
          country: selectedCity.country,
          latitude: selectedCity.lat,
          longitude: selectedCity.lng,
        }),
      });
      
      if (res.ok) {
        setEditMode(false);
        setSelectedCity(null);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTagsNotes = async () => {
    if (!selectedNode) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/connections/${selectedNode.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: currentTags.join(','),
          notes: currentNotes,
        }),
      });
      
      if (res.ok) {
        setEditingTags(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConnection = async () => {
    if (!selectedNode) return;
    
    if (!confirm(`Remove ${selectedNode.firstName} ${selectedNode.lastName} from your network?`)) return;
    
    try {
      const res = await fetch(`/api/connections/${selectedNode.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setSelectedNode(null);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getTagColor = (tag: string) => {
    const tagOption = TAG_OPTIONS.find(t => t.value === tag);
    return tagOption?.color || 'bg-[#38434f] text-[#b0b0b0]';
  };

  const openNodeWithTags = (node: Connection) => {
    setSelectedNode(node);
    setEditMode(false);
    setEditingTags(false);
    setSelectedCity(null);
    setCurrentTags(node.tags ? node.tags.split(',').filter(Boolean) : []);
    setCurrentNotes(node.notes || '');
  };

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden relative">
      
      {/* MOBILE HEADER */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#1d2226] border-b border-[#38434f] flex items-center justify-between px-4 z-50 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#0a66c2] flex items-center justify-center">
            <Linkedin className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">Relnodes</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-[#38434f] rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* LEFT SIDEBAR */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`
          fixed lg:relative top-0 left-0 h-full w-72 lg:w-80 border-r border-[#38434f] bg-[#1d2226] flex flex-col z-40
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#38434f]">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded bg-[#0a66c2] flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-white group-hover:text-[#70b5f9] transition-colors">Relnodes</h1>
                <p className="text-xs text-[#b0b0b0]">Network Visualization</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Link 
                href="/" 
                className="p-2 hover:bg-[#38434f] rounded-lg transition-colors"
                title="Back to Home"
              >
                <Home className="w-4 h-4 text-[#b0b0b0]" />
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-[#38434f] rounded-lg transition-colors lg:hidden"
              >
                <X className="w-4 h-4 text-[#b0b0b0]" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-[#38434f]">
          <div className="grid grid-cols-2 gap-3">
            <div className="card-linkedin p-3 text-center">
              <div className="text-2xl font-bold text-[#0a66c2]">{stats.total}</div>
              <div className="text-xs text-[#b0b0b0]">Total</div>
            </div>
            <div className="card-linkedin p-3 text-center">
              <div className="text-2xl font-bold text-[#057642]">{stats.geocoded}</div>
              <div className="text-xs text-[#b0b0b0]">Mapped</div>
            </div>
          </div>
          
          {/* Pending Info */}
          {stats.pending > 0 && (
            <div className={`mt-3 flex items-center gap-3 p-3 rounded-lg ${
              geocodingDone 
                ? 'bg-[#b24020]/10 border border-[#b24020]/20' 
                : 'bg-[#0a66c2]/10 border border-[#0a66c2]/20'
            }`}>
              {geocodingDone ? (
                <AlertCircle className="w-4 h-4 text-[#b24020]" />
              ) : (
                <MapPin className="w-4 h-4 text-[#0a66c2]" />
              )}
              <span className={`text-sm flex-1 text-left ${
                geocodingDone ? 'text-[#e57373]' : 'text-[#70b5f9]'
              }`}>
                {geocodingDone 
                  ? `${stats.pending} couldn't be mapped`
                  : `${stats.pending} pending mapping`
                }
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-[#38434f] space-y-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0a66c2] hover:bg-[#004182] transition-colors text-left group"
          >
            <UserPlus className="w-5 h-5 text-white" />
            <div className="flex-1">
              <div className="text-sm font-medium text-white">Add Connection</div>
            </div>
            <Plus className="w-4 h-4 text-white" />
          </button>
          
          <button
            onClick={() => {
              setShowConnectionsList(false);
              setShowReferralFinder(true);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0a66c2]/10 hover:bg-[#0a66c2]/20 transition-colors text-left group"
          >
            <UserCheck className="w-5 h-5 text-[#0a66c2]" />
            <div className="flex-1">
              <div className="text-sm font-medium text-white">Find Referrals</div>
              <div className="text-xs text-[#b0b0b0]">Search by company</div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#b0b0b0] group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => {
              setShowReferralFinder(false);
              setShowConnectionsList(true);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#38434f]/50 transition-colors text-left group"
          >
            <Users className="w-5 h-5 text-[#b0b0b0]" />
            <div className="flex-1">
              <div className="text-sm font-medium text-white">All Connections</div>
              <div className="text-xs text-[#b0b0b0]">View and edit</div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#b0b0b0] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Top Companies */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-xs text-[#b0b0b0] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Building2 className="w-3 h-3" />
            Top Companies
          </h3>
          <div className="space-y-1">
            {stats.topCompanies.slice(0, 10).map((c, i) => (
              <button
                key={c.name}
                onClick={() => {
                  setShowConnectionsList(false);
                  setCompanySearch(c.name);
                  setShowReferralFinder(true);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#38434f]/50 transition-colors text-left group"
              >
                <span className="text-xs text-[#666666] w-4">{i + 1}</span>
                <span className="flex-1 text-sm text-[#b0b0b0] group-hover:text-white truncate transition-colors">
                  {c.name}
                </span>
                <span className="badge badge-blue text-xs">{c.count}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* MAIN STAGE - GLOBE */}
      <div className="flex-1 relative globe-container pt-14 lg:pt-0">
        <GlobeViz 
          data={connections} 
          onNodeClick={(node) => openNodeWithTags(node)} 
        />

        {/* DETAIL POPUP */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="absolute top-20 lg:top-6 right-4 lg:right-6 left-4 lg:left-auto w-auto lg:w-80 card-linkedin overflow-hidden max-h-[calc(100vh-6rem)] lg:max-h-[calc(100vh-3rem)] overflow-y-auto z-30"
            >
              {/* Header */}
              <div className="p-5 border-b border-[#38434f]">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      {getInitials(selectedNode.firstName, selectedNode.lastName)}
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">
                        {selectedNode.firstName} {selectedNode.lastName}
                      </h2>
                      <p className="text-sm text-[#b0b0b0] line-clamp-1">
                        {selectedNode.position || 'No title'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedNode(null)} 
                    className="p-1 hover:bg-[#38434f] rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-[#b0b0b0]" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Company */}
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-[#b0b0b0] mt-0.5" />
                  <div>
                    <div className="text-xs text-[#666666] uppercase">Company</div>
                    <div className="text-sm text-white">{selectedNode.company || 'Unknown'}</div>
                  </div>
                </div>

                {/* Location - Editable */}
                {editMode ? (
                  <div className="space-y-3 p-3 rounded-lg bg-[#38434f]/30">
                    <CityAutocomplete
                      value={selectedNode.city ? `${selectedNode.city}, ${selectedNode.country}` : ''}
                      onChange={(city) => setSelectedCity(city)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveLocation}
                        disabled={saving || !selectedCity}
                        className="flex-1 btn-linkedin py-2 text-sm flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setSelectedCity(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-[#38434f] text-[#b0b0b0] hover:text-white transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#b0b0b0] mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-[#666666] uppercase">Location</div>
                      <div className="text-sm text-[#b0b0b0]">
                        {selectedNode.city && selectedNode.country 
                          ? `${selectedNode.city}, ${selectedNode.country}`
                          : 'Not set'}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditMode(true)}
                      className="p-1.5 rounded-lg hover:bg-[#38434f] transition-colors"
                      title="Edit location"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#0a66c2]" />
                    </button>
                  </div>
                )}

                {/* Tags & Notes */}
                {editingTags ? (
                  <div className="space-y-3 p-3 rounded-lg bg-[#38434f]/30">
                    <div>
                      <label className="text-xs text-[#666666] uppercase mb-2 block">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {TAG_OPTIONS.map((tag) => (
                          <button
                            key={tag.value}
                            type="button"
                            onClick={() => {
                              setCurrentTags(prev => 
                                prev.includes(tag.value) 
                                  ? prev.filter(t => t !== tag.value)
                                  : [...prev, tag.value]
                              );
                            }}
                            className={`
                              px-2 py-1 rounded-full text-xs font-medium transition-all
                              ${currentTags.includes(tag.value) 
                                ? tag.color + ' ring-1 ring-current' 
                                : 'bg-[#38434f] text-[#b0b0b0] hover:text-white'}
                            `}
                          >
                            {tag.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-[#666666] uppercase mb-2 block">Notes</label>
                      <textarea
                        value={currentNotes}
                        onChange={(e) => setCurrentNotes(e.target.value)}
                        placeholder="Add notes..."
                        rows={2}
                        className="w-full bg-[#1d2226] border border-[#38434f] rounded-lg p-2 text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#0a66c2] resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTagsNotes}
                        disabled={saving}
                        className="flex-1 btn-linkedin py-2 text-sm flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingTags(false)}
                        className="px-4 py-2 rounded-lg bg-[#38434f] text-[#b0b0b0] hover:text-white transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Tag className="w-4 h-4 text-[#b0b0b0] mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-[#666666] uppercase mb-1">Tags & Notes</div>
                      {currentTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {currentTags.map(tag => (
                            <span key={tag} className={`px-2 py-0.5 rounded-full text-xs ${getTagColor(tag)}`}>
                              {TAG_OPTIONS.find(t => t.value === tag)?.label || tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-[#666666]">No tags</div>
                      )}
                      {currentNotes && (
                        <div className="text-xs text-[#b0b0b0] mt-1 line-clamp-2">{currentNotes}</div>
                      )}
                    </div>
                    <button
                      onClick={() => setEditingTags(true)}
                      className="p-1.5 rounded-lg hover:bg-[#38434f] transition-colors"
                      title="Edit tags & notes"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#0a66c2]" />
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-5 pt-0 flex gap-2">
                {selectedNode.profileUrl && (
                  <a 
                    href={selectedNode.profileUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-linkedin-secondary py-2 flex items-center justify-center gap-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                <button
                  onClick={handleDeleteConnection}
                  className="p-2 rounded-lg bg-[#b24020]/10 hover:bg-[#b24020]/20 text-[#b24020] transition-all"
                  title="Remove connection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ADD CONNECTION MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <AddConnectionModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={() => router.refresh()}
          />
        )}
      </AnimatePresence>

      {/* REFERRAL FINDER PANEL */}
      <AnimatePresence mode="sync">
        {showReferralFinder && (
          <>
            <motion.div
              key="referral-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowReferralFinder(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30"
            />
            
            <motion.div
              key="referral-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.8 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[400px] md:w-[450px] bg-[#1d2226] border-l border-[#38434f] z-40 flex flex-col"
            >
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                className="p-4 sm:p-6 border-b border-[#38434f]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#0a66c2]/10 flex items-center justify-center">
                      <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#0a66c2]" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white">Find Referrals</h2>
                      <p className="text-xs sm:text-sm text-[#b0b0b0]">Search connections by company</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowReferralFinder(false)}
                    className="p-2 hover:bg-[#38434f] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[#b0b0b0]" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                  <input
                    type="text"
                    placeholder="Search for a company (e.g., Google, Meta)..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="w-full bg-[#1d2226] border border-[#38434f] rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all"
                    autoFocus
                  />
                </div>
              </motion.div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredCompanies.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center py-12 text-[#b0b0b0]"
                  >
                    <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No connections found at this company</p>
                  </motion.div>
                ) : (
                  filteredCompanies.map((company, index) => (
                    <motion.div 
                      key={company.name} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="card-linkedin overflow-hidden"
                    >
                      <div className="p-4 border-b border-[#38434f]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-[#38434f] flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-[#b0b0b0]" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{company.name}</h3>
                              <p className="text-sm text-[#b0b0b0]">
                                {company.count} connection{company.count > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <span className="badge badge-blue">{company.count}</span>
                        </div>
                      </div>
                      <div className="divide-y divide-[#38434f]">
                        {company.connections.slice(0, 3).map((conn) => (
                          <button
                            key={conn.id}
                            onClick={() => {
                              openNodeWithTags(conn);
                              setShowReferralFinder(false);
                            }}
                            className="w-full connection-card"
                          >
                            <div className="avatar w-10 h-10 text-sm">
                              {getInitials(conn.firstName, conn.lastName)}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-medium text-white truncate">
                                {conn.firstName} {conn.lastName}
                              </div>
                              <div className="text-sm text-[#b0b0b0] truncate">
                                {conn.position || 'No title'}
                              </div>
                            </div>
                            {conn.profileUrl && (
                              <ExternalLink className="w-4 h-4 text-[#0a66c2]" />
                            )}
                          </button>
                        ))}
                        {company.count > 3 && (
                          <div className="p-3 text-center text-sm text-[#0a66c2]">
                            +{company.count - 3} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CONNECTIONS LIST PANEL */}
      <AnimatePresence mode="sync">
        {showConnectionsList && (
          <>
            <motion.div
              key="connections-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowConnectionsList(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30"
            />
            
            <motion.div
              key="connections-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.8 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[400px] md:w-[450px] bg-[#1d2226] border-l border-[#38434f] z-40 flex flex-col"
            >
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                className="p-4 sm:p-6 border-b border-[#38434f]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white">All Connections</h2>
                  <button 
                    onClick={() => setShowConnectionsList(false)}
                    className="p-2 hover:bg-[#38434f] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[#b0b0b0]" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                  <input
                    type="text"
                    placeholder="Search by name, company, city, or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1d2226] border border-[#38434f] rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  {(['all', 'geocoded', 'pending'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5
                        ${filterType === type 
                          ? 'bg-[#0a66c2] text-white' 
                          : 'bg-[#38434f] text-[#b0b0b0] hover:text-white'}
                      `}
                    >
                      {type === 'all' && <Users className="w-3 h-3" />}
                      {type === 'geocoded' && <MapPin className="w-3 h-3" />}
                      {type === 'pending' && <AlertCircle className="w-3 h-3" />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredConnections.map((conn, index) => (
                  <motion.button
                    key={conn.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25 }}
                    onClick={() => {
                      openNodeWithTags(conn);
                      setEditMode(!conn.latitude);
                      setShowConnectionsList(false);
                    }}
                    className="w-full card-linkedin p-4 flex items-center gap-4 card-hover text-left"
                  >
                    <div className={`avatar w-12 h-12 ${!conn.latitude ? 'opacity-50' : ''}`}>
                      {getInitials(conn.firstName, conn.lastName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {conn.firstName} {conn.lastName}
                      </div>
                      <div className="text-sm text-[#b0b0b0] truncate">
                        {conn.company || 'No company'}
                      </div>
                      {conn.tags && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {conn.tags.split(',').slice(0, 2).map(tag => (
                            <span key={tag} className={`px-1.5 py-0.5 rounded text-[10px] ${getTagColor(tag)}`}>
                              {TAG_OPTIONS.find(t => t.value === tag)?.label || tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {!conn.latitude && (
                        <div className="text-xs text-[#b24020] mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Location needed
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#666666]" />
                  </motion.button>
                ))}
                
                {filteredConnections.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center py-12 text-[#b0b0b0]"
                  >
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No connections found</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Background Geocoding Progress */}
      <GeocodingProgress
        pendingCount={stats.pending}
        totalCount={stats.total}
        autoStart={autoStartGeocoding}
        onComplete={() => {
          setGeocodingDone(true);
        }}
      />
    </div>
  );
}
