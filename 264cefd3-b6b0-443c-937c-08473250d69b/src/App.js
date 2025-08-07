// Enhanced VericidApp with origin card rendering and view switching

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Upload, FileText, Shield, History, Copy, Download, Moon, Sun, AlertTriangle, CheckCircle, XCircle, Clock, MapPin, User, Save, LogIn, Settings, BarChart3, Menu, X, ExternalLink, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import errorImage from './assets/image.png';

const VericidApp = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [view, setView] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('pinataApiKey'));
  const [stats, setStats] = useState({ count: 3, types: { image: 1, application: 1, text: 1 } });
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [files, setFiles] = useState([
    { cid: 'bafkrei123', name: 'photo.jpg', timestamp: Date.now() - 500000, type: 'image', url: '#' },
    { cid: 'bafkrei456', name: 'resume.pdf', timestamp: Date.now() - 1000000, type: 'application', url: '#' },
    { cid: 'bafkrei789', name: 'note.txt', timestamp: Date.now() - 2000000, type: 'text', url: '#' }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingOrigins, setIsLoadingOrigins] = useState(false);
  const [originData, setOriginData] = useState(null);
  const [selectedCid, setSelectedCid] = useState(null);
  const [error, setError] = useState(null);

  // Fetch origins for a CID
  const fetchOrigins = async (cid) => {
    setIsLoadingOrigins(true);
    setError(null);
    
    try {
      const response = await fetch(`https://cid-origins.pinata-marketing-enterprise.workers.dev/cid/${cid}/origins`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the data to match our expected format
      const transformedData = {
        cid: cid,
        origins: data.origins || []
      };
      
      setOriginData(transformedData);
      setSelectedCid(cid);
    } catch (err) {
      console.error('Error fetching origins:', err);
      setError(`Failed to fetch origins: ${err.message}`);
      setOriginData(null);
    } finally {
      setIsLoadingOrigins(false);
    }
  };

  // Load origins for the first file on mount
  useEffect(() => {
    if (files.length > 0 && !selectedCid) {
      fetchOrigins(files[0].cid);
    }
  }, []);

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileSelect = () => {};
  const copyToClipboard = (cid) => {
    navigator.clipboard.writeText(cid).then(() => {
      alert('CID copied to clipboard!');
    });
  };
  const handleDeleteFile = () => {};

  const filteredFiles = useMemo(() => {
    let result = [...files];
    if (filterType !== 'all') result = result.filter(f => f.type === filterType);
    result.sort((a, b) => sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);
    return result;
  }, [files, filterType, sortOrder]);

  return (
    <div className={`min-h-screen font-mono ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <header className="p-4 border-b border-zinc-700 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Shield className="w-5 h-5" /> Vericid
        </h1>
        <div className="flex gap-2 items-center">
          <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
          <button onClick={() => setView('dashboard')}><BarChart3 className="w-5 h-5" /></button>
          <button onClick={() => setView('settings')}><Settings className="w-5 h-5" /></button>
          {!isLoggedIn ? (
            <button onClick={() => setView('signin')} className="flex items-center gap-1 border px-3 py-1 rounded text-sm hover:bg-zinc-800">
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          ) : (
            <span className="text-xs text-green-400">Logged in</span>
          )}
        </div>
      </header>

      {view === 'dashboard' && (
        <div className="max-w-3xl mx-auto mt-10 px-6">
          <h3 className="text-lg font-semibold mb-2">Dashboard Stats</h3>
          <p>Total Files: {stats.count}</p>
          <ul className="text-sm mb-6">
            {Object.entries(stats.types).map(([type, count]) => (
              <li key={type}>{type}: {count}</li>
            ))}
          </ul>

          <label className="block font-bold mb-2">Upload Files</label>
          <input type="file" multiple onChange={handleFileSelect} className="mb-4" />
          {isUploading && <p className="text-yellow-400">Uploading to Pinata...</p>}

          <div className="flex gap-4 items-center mt-6">
            <span className="text-sm">Filter by type:</span>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-black px-2 py-1 rounded">
              <option value="all">All</option>
              <option value="image">Image</option>
              <option value="application">Application</option>
              <option value="text">Text</option>
            </select>

            <span className="text-sm">Sort by:</span>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="text-black px-2 py-1 rounded">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          <h3 className="text-lg font-semibold mt-10 mb-4">Uploaded Files</h3>
          <ul className="space-y-3">
            {filteredFiles.map(file => (
              <li key={file.cid} className="border p-3 rounded flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-mono text-sm">{file.name}</p>
                  <div className="flex gap-2 items-center">
                    <a href={file.url} target="_blank" rel="noreferrer" className="text-blue-400 text-xs underline">{file.cid}</a>
                    <button onClick={() => copyToClipboard(file.cid)} title="Copy CID"><Copy className="w-4 h-4 hover:text-green-400" /></button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{formatDistanceToNow(new Date(file.timestamp))} ago</p>
                </div>
                <div className="flex gap-2 items-center">
                  <button 
                    onClick={() => fetchOrigins(file.cid)} 
                    className={`px-2 py-1 text-xs border rounded ${selectedCid === file.cid ? 'bg-blue-500 text-white' : 'hover:bg-zinc-700'}`}
                    title="View Origins"
                  >
                    View Origins
                  </button>
                  <button onClick={() => handleDeleteFile(file.cid)} title="Delete">
                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              </li>
            ))}
            {filteredFiles.length === 0 && <p className="text-zinc-500">No files match this filter.</p>}
          </ul>

          {/* Error Display */}
          {error && (
            <div className="mt-12 border border-red-500 rounded p-4 bg-red-900/20 text-red-400">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoadingOrigins && (
            <div className="mt-12 border rounded p-4 bg-zinc-800 text-white">
              <h3 className="text-lg font-semibold mb-3">Loading CID Origins...</h3>
              <div className="animate-pulse">
                <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
              </div>
            </div>
          )}

          {/* Origins Display */}
          {!isLoadingOrigins && originData && (
            <div className="mt-12 border rounded p-4 bg-zinc-800 text-white">
              <h3 className="text-lg font-semibold mb-3">CID Origins</h3>
              <p className="text-sm mb-2">CID: <code className="text-amber-300">{originData.cid}</code></p>
              
              {originData.origins && originData.origins.length > 0 ? (
                <ul className="space-y-2">
                  {originData.origins.map((origin, index) => {
                    const network = origin.network || origin.source || 'unknown';
                    const address = origin.address || origin.location || '';
                    const explorerBase = network === 'polygon' ? 'https://polygonscan.com/address/' :
                      network === 'base' ? 'https://basescan.org/address/' :
                      network === 'ethereum' ? 'https://etherscan.io/address/' : '';
                    
                    return (
                      <li key={origin.id || index} className="border p-3 rounded bg-zinc-900">
                        <p className="text-sm mb-1">Chain: <span className="font-semibold capitalize">{network}</span></p>
                        {origin.metadata && (
                          <>
                            <p className="text-sm mb-1">Type: {origin.metadata.type || 'N/A'} {origin.metadata.standard && `(${origin.metadata.standard})`}</p>
                          </>
                        )}
                        {origin.timestamp && (
                          <p className="text-sm mb-1">Found: {formatDistanceToNow(new Date(origin.timestamp))} ago</p>
                        )}
                        {address && (
                          <p className="text-sm">
                            Contract: {explorerBase ? (
                              <a href={`${explorerBase}${address}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                                {address.slice(0, 10)}...{address.slice(-8)}
                              </a>
                            ) : (
                              <code className="text-xs">{address.slice(0, 10)}...{address.slice(-8)}</code>
                            )}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-zinc-400 text-sm">No origins found for this CID</p>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'settings' && (
        <div className="max-w-3xl mx-auto mt-10 px-6">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <p className="text-zinc-400">Settings functionality coming soon!</p>
        </div>
      )}

      {view === 'signin' && (
        <div className="max-w-3xl mx-auto mt-10 px-6">
          <h2 className="text-2xl font-bold mb-4">Sign In</h2>
          <p className="text-zinc-400 mb-4">Sign in with your Pinata API Key.</p>
          <input
            type="text"
            placeholder="Enter Pinata API Key"
            className="w-full px-3 py-2 rounded text-black mb-4"
            onChange={(e) => {
              localStorage.setItem('pinataApiKey', e.target.value);
              setIsLoggedIn(true);
              alert("API key saved. You're signed in!");
              setView('dashboard');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VericidApp;

