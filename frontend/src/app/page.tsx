'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, 
  AreaChart, Area
} from 'recharts';
import { 
  ShieldCheck, HelpCircle, Download, RefreshCw, Layers, 
  Activity, Search, AlertTriangle, Info, X, MapPin, ListFilter
} from 'lucide-react';

// Dynamically import Leaflet Map to prevent Next.js SSR error
const MapComponent = dynamic(
  () => import('../components/MapComponent'),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-surface border border-border text-gray-400">Loading Map Engine...</div> }
);

// Fallback Mock Data as required by Guardrails
const fallbackProjects = [
  {
    "type": "Feature",
    "geometry": { "type": "Point", "coordinates": [-62.2159, -3.4653] },
    "properties": {
      "id": "VCS-984",
      "title": "Amazon Rainforest Conservation Project",
      "registry": "Verra Registry",
      "methodology": "VM0007 REDD+ Methodology",
      "category": "Governance & Trust",
      "credits_issued": 1250000,
      "credits_retired": 850000,
      "status": "Active",
      "region": "South America",
      "country": "Brazil",
      "price_per_credit": 15.50,
      "price_vs_regional_pct": 21.1,
      "retirement_ratio_pct": 68.0,
      "trust_score": 87.5,
      "verifier": "SCS Global Services",
      "last_updated": "2026-06-15"
    }
  },
  {
    "type": "Feature",
    "geometry": { "type": "Point", "coordinates": [78.9629, 20.5937] },
    "properties": {
      "id": "GS-4021",
      "title": "Clean Wind Energy Grid Integration",
      "registry": "Gold Standard Registry",
      "methodology": "ACM0002 Grid-connected Renewables",
      "category": "Governance & Trust",
      "credits_issued": 450000,
      "credits_retired": 410000,
      "status": "Active",
      "region": "Asia",
      "country": "India",
      "price_per_credit": 9.20,
      "price_vs_regional_pct": 8.2,
      "retirement_ratio_pct": 91.1,
      "trust_score": 93.7,
      "verifier": "TÜV NORD",
      "last_updated": "2026-05-10"
    }
  },
  {
    "type": "Feature",
    "geometry": { "type": "Point", "coordinates": [113.9213, -0.7893] },
    "properties": {
      "id": "VCS-1123",
      "title": "Southern Peatland Restoration and Protection",
      "registry": "Verra Registry",
      "methodology": "VM0034 Peatland Rewetting",
      "category": "Governance & Trust",
      "credits_issued": 800000,
      "credits_retired": 320000,
      "status": "Active",
      "region": "Southeast Asia",
      "country": "Indonesia",
      "price_per_credit": 18.00,
      "price_vs_regional_pct": 24.1,
      "retirement_ratio_pct": 40.0,
      "trust_score": 79.0,
      "verifier": "Vesta Verifiers",
      "last_updated": "2026-07-01"
    }
  },
  {
    "type": "Feature",
    "geometry": { "type": "Point", "coordinates": [36.8219, -1.2921] },
    "properties": {
      "id": "GS-5820",
      "title": "Community Boreholes and Water Purification",
      "registry": "Gold Standard Registry",
      "methodology": "GS-TPDDTEC Safe Water Supply",
      "category": "Governance & Trust",
      "credits_issued": 300000,
      "credits_retired": 285000,
      "status": "Active",
      "region": "Africa",
      "country": "Kenya",
      "price_per_credit": 11.50,
      "price_vs_regional_pct": 12.7,
      "retirement_ratio_pct": 95.0,
      "trust_score": 94.3,
      "verifier": "Gold Standard Auditor",
      "last_updated": "2026-06-28"
    }
  },
  {
    "type": "Feature",
    "geometry": { "type": "Point", "coordinates": [-86.2419, 15.2000] },
    "properties": {
      "id": "VCS-2451",
      "title": "Mangrove Blue Carbon Coastal Protection",
      "registry": "Verra Registry",
      "methodology": "VM0033 Tidal Wetland Restoration",
      "category": "Governance & Trust",
      "credits_issued": 620000,
      "credits_retired": 150000,
      "status": "Under Review",
      "region": "Central America",
      "country": "Honduras",
      "price_per_credit": 22.00,
      "price_vs_regional_pct": 33.3,
      "retirement_ratio_pct": 24.2,
      "trust_score": 67.2,
      "verifier": "SCS Global Services",
      "last_updated": "2026-04-18"
    }
  },
  {
    "type": "Feature",
    "geometry": { "type": "Point", "coordinates": [29.8739, -1.9403] },
    "properties": {
      "id": "GS-3104",
      "title": "Improved Biomass Cookstoves for Rural Households",
      "registry": "Gold Standard Registry",
      "methodology": "GS-COOKSTOVE Improved Thermal",
      "category": "Governance & Trust",
      "credits_issued": 950000,
      "credits_retired": 910000,
      "status": "Active",
      "region": "Africa",
      "country": "Rwanda",
      "price_per_credit": 13.00,
      "price_vs_regional_pct": 27.5,
      "retirement_ratio_pct": 95.8,
      "trust_score": 94.4,
      "verifier": "Carbon Verification Corp",
      "last_updated": "2026-07-05"
    }
  }
];

const fallbackStats = {
  total_issued: 4350000,
  total_retired: 3180000,
  avg_retirement_rate: 73.1,
  avg_trust_score: 86.0,
  total_projects: 6,
  active_methodologies: 6
};

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>(fallbackProjects);
  const [stats, setStats] = useState<any>(fallbackStats);
  const [registryFilter, setRegistryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>('VCS-984');
  const [isLive, setIsLive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Dynamic slide-over control
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  // Signature Popover
  const [infoOpen, setInfoOpen] = useState<boolean>(false);
  
  // Floating panes toggle
  const [showLedger, setShowLedger] = useState<boolean>(true);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);

  const fetchLiveMetrics = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const projectsRes = await fetch(`http://127.0.0.1:8000/api/projects?registry=${registryFilter}&status=${statusFilter}`);
      if (!projectsRes.ok) throw new Error('Live API projects response failed');
      const projectsData = await projectsRes.json();

      const statsRes = await fetch('http://127.0.0.1:8000/api/stats');
      if (!statsRes.ok) throw new Error('Live API stats response failed');
      const statsData = await statsRes.json();

      setProjects(projectsData.features);
      setStats(statsData);
      setIsLive(true);
    } catch (err: any) {
      console.warn("Live API connection failed. Switching to local mock fallback.", err);
      // Fallback logic
      let filtered = [...fallbackProjects];
      if (registryFilter !== 'All') {
        filtered = filtered.filter(p => p.properties.registry === registryFilter);
      }
      if (statusFilter !== 'All') {
        filtered = filtered.filter(p => p.properties.status === statusFilter);
      }
      setProjects(filtered);
      setIsLive(false);
      setErrorMsg("Using offline mock fallback data. Backend API server not reachable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, [registryFilter, statusFilter]);

  const handleDownload = () => {
    if (isLive) {
      window.open('http://127.0.0.1:8000/api/download');
    } else {
      // Simulate download using data URI
      const headers = "id,title,registry,methodology,category,credits_issued,credits_retired,status,region,country,price_per_credit,price_vs_regional_pct,retirement_ratio_pct,trust_score,verifier,last_updated\n";
      const rows = fallbackProjects.map(p => {
        const prop = p.properties;
        return `"${prop.id}","${prop.title}","${prop.registry}","${prop.methodology}","${prop.category}",${prop.credits_issued},${prop.credits_retired},"${prop.status}","${prop.region}","${prop.country}",${prop.price_per_credit},${prop.price_vs_regional_pct},${prop.retirement_ratio_pct},${prop.trust_score},"${prop.verifier}","${prop.last_updated}"`;
      }).join('\n');
      
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'carbon_credit_registry_mock_data.csv');
      a.click();
    }
  };

  // Filter projects by search query
  const displayedProjects = projects.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    return (
      p.properties.title.toLowerCase().includes(searchLower) ||
      p.properties.id.toLowerCase().includes(searchLower) ||
      p.properties.methodology.toLowerCase().includes(searchLower) ||
      p.properties.country.toLowerCase().includes(searchLower)
    );
  });

  const selectedProject = projects.find(p => p.properties.id === selectedProjectId) || null;

  // Chart data preparing
  const chartData = projects.map(p => ({
    name: p.properties.id,
    issued: p.properties.credits_issued / 1000, // in thousands
    retired: p.properties.credits_retired / 1000,
    price: p.properties.price_per_credit,
    trust: p.properties.trust_score
  }));

  const selectProject = (id: string) => {
    setSelectedProjectId(id);
    setSidebarOpen(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background text-foreground flex flex-col antialiased">
      
      {/* 100% Stage (Full Screen Map Backdrop) */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <MapComponent 
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={selectProject}
        />
      </div>

      {/* Pillar III: Transparent Minimalist Header */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background/90 to-transparent px-6 flex items-center justify-between z-30 pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto">
          <Layers className="text-accent-primary w-5 h-5 animate-pulse" />
          <div>
            <h1 className="text-md font-bold tracking-tight text-white flex items-center font-sans">
              Carbon Credit Registry Explorer - Infocreon Internship
            </h1>
            <p className="text-sm text-white uppercase tracking-widest font-mono">GOVERNANCE & TRUST</p>
          </div>
        </div>

        {/* Action Controls & Info Signature Trigger */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          {errorMsg && (
            <div className="hidden md:flex items-center space-x-1.5 text-amber-500 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] border border-amber-500/20">
              <AlertTriangle className="w-3 h-3" />
              <span>Offline Fallback</span>
            </div>
          )}
          <button 
            onClick={fetchLiveMetrics} 
            disabled={loading}
            className="p-1.5 rounded hover:bg-border/60 text-accent-primary border border-border/40 bg-surface/80 backdrop-blur-md transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Information Signature Popover Button */}
          <div className="relative">
            <button 
              onClick={() => setInfoOpen(!infoOpen)}
              className="p-1.5 rounded hover:bg-accent-primary hover:text-background text-accent-primary border border-accent-primary/40 bg-surface/80 backdrop-blur-md transition-all active:scale-95 shadow-cyan-glow"
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            {/* Metadata Popover Modal */}
            {infoOpen && (
              <div className="absolute right-0 mt-2.5 w-64 bg-surface/95 backdrop-blur-md border border-border p-4 rounded-lg shadow-2xl z-50 pointer-events-auto">
                <div className="flex justify-between items-center border-b border-border/40 pb-2 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">System Architecture</h4>
                  <button onClick={() => setInfoOpen(false)} className="text-gray-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Architect:</span>
                    <span className="text-accent-primary font-semibold font-mono">Anjana KS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Batch:</span>
                    <span className="text-white">Batch 4 Interns</span>
                  </div>
                  <div className="flex flex-col gap-1 border-t border-border/30 pt-2 mt-2">
                    <span className="text-[10px] text-gray-400 uppercase font-mono">Stack Components</span>
                    <span className="text-white font-mono text-[10px]">Next.js, FastAPI, Tailwind CSS, Leaflet, Recharts</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Control Overlays (Left/Bottom layout) */}
      <div className="absolute left-6 top-20 z-20 flex flex-col space-y-4 max-w-sm sm:max-w-md pointer-events-none">
        
        {/* Toggle Controls to show/hide Overlay Modules */}
        <div className="flex space-x-2 pointer-events-auto">
          <button 
            onClick={() => setShowLedger(!showLedger)}
            className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all bg-surface/90 backdrop-blur-md ${
              showLedger ? 'border-accent-primary text-accent-primary' : 'border-border text-gray-400'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Ledger Feed</span>
          </button>
          <button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all bg-surface/90 backdrop-blur-md ${
              showAnalytics ? 'border-accent-secondary text-accent-secondary' : 'border-border text-gray-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Floating Ledger Feed & Telemetry Filters Panel */}
        {showLedger && (
          <div className="glass-panel p-4 rounded-lg shadow-xl w-[90vw] sm:w-[420px] pointer-events-auto transition-all animate-in fade-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Registry Ledger</h3>
                <p className="text-[9px] text-gray-400 font-mono">Real-time asset validation</p>
              </div>
              <div className="relative w-36">
                <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-[10px] bg-background border border-border rounded focus:outline-none focus:border-accent-primary text-white font-mono"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <select 
                  value={registryFilter}
                  onChange={(e) => setRegistryFilter(e.target.value)}
                  className="w-full bg-background border border-border text-[9px] rounded p-1.5 text-white focus:border-accent-primary focus:outline-none font-mono"
                >
                  <option value="All">All Registries</option>
                  <option value="Verra Registry">Verra Registry</option>
                  <option value="Gold Standard Registry">Gold Standard Registry</option>
                </select>
              </div>
              <div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-background border border-border text-[9px] rounded p-1.5 text-white focus:border-accent-primary focus:outline-none font-mono"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>
            </div>

            {/* Scrollable Mini Table */}
            <div className="max-h-[180px] overflow-y-auto border border-border/60 rounded">
              <table className="w-full text-left text-[10px]">
                <thead>
                  <tr className="border-b border-border bg-background/50 text-gray-400 font-mono sticky top-0">
                    <th className="p-2">ID</th>
                    <th className="p-2">Project</th>
                    <th className="p-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {displayedProjects.map(p => (
                    <tr 
                      key={p.properties.id}
                      onClick={() => selectProject(p.properties.id)}
                      className={`hover:bg-border/30 cursor-pointer transition-colors ${selectedProjectId === p.properties.id ? 'bg-accent-primary/10 border-l border-accent-primary' : ''}`}
                    >
                      <td className="p-2 font-mono text-accent-primary font-bold">{p.properties.id}</td>
                      <td className="p-2 font-medium text-white truncate max-w-[180px]">{p.properties.title}</td>
                      <td className="p-2 text-right font-mono text-white">${p.properties.price_per_credit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Floating Analytics Graph Pane */}
        {showAnalytics && (
          <div className="glass-panel p-4 rounded-lg shadow-xl w-[90vw] sm:w-[420px] pointer-events-auto transition-all animate-in fade-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Credit flow metrics (kCO2e)</h3>
              <Activity className="w-3.5 h-3.5 text-accent-secondary" />
            </div>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={8} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={8} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#05121b', borderColor: '#1F2937', fontSize: 10 }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="issued" name="Issued (k)" fill="#818CF8" radius={[1, 1, 0, 0]} />
                  <Bar dataKey="retired" name="Retired (k)" fill="#38BDF8" radius={[1, 1, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Pillar II: Slide-over Intelligence Panel */}
      <div className={`fixed top-0 right-0 bottom-0 w-full sm:w-[360px] bg-surface/95 backdrop-blur-md border-l border-border z-40 transition-transform duration-300 transform pointer-events-auto flex flex-col shadow-2xl ${
        sidebarOpen && selectedProject ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Slide-over header / controls */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-background/50">
          <div className="flex items-center space-x-1.5 text-accent-primary">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Asset Intelligence</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded hover:bg-border/60 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable details content */}
        {selectedProject && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            
            {/* Project Title Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-accent-primary font-bold">{selectedProject.properties.id}</span>
                <span className="text-[8px] bg-border px-1.5 py-0.5 rounded text-gray-400 uppercase font-mono">{selectedProject.properties.registry}</span>
              </div>
              <h2 className="text-md font-bold text-white leading-snug">{selectedProject.properties.title}</h2>
            </div>

            {/* A: Metric stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/40 p-2.5 border border-border/40 rounded">
                <span className="text-[8px] text-gray-400 block uppercase font-mono">Issued Credits</span>
                <span className="text-sm font-bold text-white font-mono">{selectedProject.properties.credits_issued.toLocaleString('en-US')}</span>
              </div>
              <div className="bg-background/40 p-2.5 border border-border/40 rounded">
                <span className="text-[8px] text-gray-400 block uppercase font-mono">Retirement Ratio</span>
                <span className="text-sm font-bold text-accent-primary font-mono">{selectedProject.properties.retirement_ratio_pct}%</span>
              </div>
            </div>

            {/* B: Narrative Section: Why This Matters */}
            <div className="bg-accent-primary/5 border border-accent-primary/10 p-3.5 rounded-lg space-y-1.5">
              <div className="flex items-center space-x-1.5 text-accent-primary">
                <HelpCircle className="w-3.5 h-3.5" />
                <h4 className="text-[10px] font-bold uppercase tracking-wider font-mono">Why This Matters</h4>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                A useful governance-rail episode where markets meet reporting. Ensuring transparency and tracking offset permanence guarantees sovereign credibility.
              </p>
            </div>

            {/* C: Narrative Section: Who Controls */}
            <div className="bg-accent-secondary/5 border border-accent-secondary/10 p-3.5 rounded-lg space-y-1.5">
              <div className="flex items-center space-x-1.5 text-accent-secondary">
                <ShieldCheck className="w-3.5 h-3.5" />
                <h4 className="text-[10px] font-bold uppercase tracking-wider font-mono">Who Controls the Rail</h4>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
                The power dynamics of a carbon credit registry explorer lie in its ability to democratize data access, shifting influence away from opaque, centralized registries and project developers by empowering buyers, watchdogs, and the public to independently verify, audit, and expose double-counting or greenwashing in environmental markets.
              </p>
            </div>

            {/* Project parameters table */}
            <div className="bg-background/30 border border-border/60 rounded p-3.5 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-white font-mono">Audit Parameters</h4>
              
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="flex justify-between border-b border-border/40 pb-1 text-gray-400">
                  <span>Methodology</span>
                  <span className="text-white truncate max-w-[130px]">{selectedProject.properties.methodology}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1 text-gray-400">
                  <span>Price / Credit</span>
                  <span className="text-accent-primary font-bold">${selectedProject.properties.price_per_credit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1 text-gray-400">
                  <span>vs Regional Avg</span>
                  <span className={`font-semibold ${selectedProject.properties.price_vs_regional_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedProject.properties.price_vs_regional_pct >= 0 ? '+' : ''}{selectedProject.properties.price_vs_regional_pct}%
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1 text-gray-400">
                  <span>Trust Score</span>
                  <span className="text-white font-bold">{selectedProject.properties.trust_score}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Auditor</span>
                  <span className="text-white">{selectedProject.properties.verifier}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Slide-over Footer Download */}
        <div className="p-4 border-t border-border bg-background/50">
          <button 
            onClick={handleDownload}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-accent-primary text-background font-bold text-xs uppercase tracking-wider rounded hover:bg-white hover:shadow-cyan-glow transition-all active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample Data</span>
          </button>
        </div>
      </div>

    </div>
  );
}
