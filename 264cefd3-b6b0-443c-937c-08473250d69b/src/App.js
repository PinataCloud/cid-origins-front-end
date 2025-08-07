// Enhanced VericidApp with origin card rendering and view switching

import React, { useState, useCallback, useRef, useMemo } from 'react';
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
  const [originData, setOriginData] = useState({
    cid: 'bafybeibc5sgo2plmjkq2tzmhrn54bk3crhnc23zd2msg4ea7a4pxrkgfna',
    origins: [
      {
        id: 2,
        source: 'base',
        location: '0x9876567890123456789012345678901234567890',
        metadata: { type: 'NFT', standard: 'ERC721' },
        timestamp: 1754590419348
      },
      {
        id: 1,
        source: 'polygon',
        location: '0x1234567890123456789012345678901234567890',
        metadata: { type: 'NFT', standard: 'ERC1155' },
        timestamp: 1754590301232
      }
    ]
  });

  const handleFileSelect = () => {};
  const copyToClipboard = () => {};
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
                <div>
                  <p className="font-mono text-sm">{file.name}</p>
                  <div className="flex gap-2 items-center">
                    <a href={file.url} target="_blank" rel="noreferrer" className="text-blue-400 text-xs underline">{file.cid}</a>
                    <button onClick={() => copyToClipboard(file.cid)} title="Copy CID"><Copy className="w-4 h-4 hover:text-green-400" /></button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{formatDistanceToNow(new Date(file.timestamp))} ago</p>
                </div>
                <button onClick={() => handleDeleteFile(file.cid)} title="Delete">
                  <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                </button>
              </li>
            ))}
            {filteredFiles.length === 0 && <p className="text-zinc-500">No files match this filter.</p>}
          </ul>

          {originData && (
            <div className="mt-12 border rounded p-4 bg-zinc-800 text-white">
              <h3 className="text-lg font-semibold mb-3">CID Origins</h3>
              <p className="text-sm mb-2">CID: <code className="text-amber-300">{originData.cid}</code></p>
              <ul className="space-y-2">
                {originData.origins.map((origin) => {
                  const explorerBase = origin.source === 'polygon' ? 'https://polygonscan.com/address/' :
                    origin.source === 'base' ? 'https://basescan.org/address/' : '';
                  return (
                    <li key={origin.id} className="border p-3 rounded bg-zinc-900">
                      <p className="text-sm mb-1">Chain: <span className="font-semibold capitalize">{origin.source}</span></p>
                      <p className="text-sm mb-1">Type: {origin.metadata.type} ({origin.metadata.standard})</p>
                      <p className="text-sm mb-1">Found: {formatDistanceToNow(new Date(origin.timestamp))} ago</p>
                      <p className="text-sm">
                        Contract: <a href={`${explorerBase}${origin.location}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{origin.location}</a>
                      </p>
                    </li>
                  );
                })}
              </ul>
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

