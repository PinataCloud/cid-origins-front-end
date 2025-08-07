// Enhanced VericidApp with Copy CID button, file sorting, and error image feedback

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Upload, FileText, Shield, History, Copy, Download, Moon, Sun, AlertTriangle, CheckCircle, XCircle, Clock, MapPin, User, Save, LogIn, Settings, BarChart3, Menu, X, ExternalLink, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import errorImage from './assets/image.png'; // image added to src/assets folder

const VericidApp = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('pinataApiKey'));
  const [apiKey, setApiKey] = useState(localStorage.getItem('pinataApiKey') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [hasError, setHasError] = useState(false);
  const fileInputRef = useRef(null);

  const handleApiKeySave = () => {
    localStorage.setItem('pinataApiKey', apiKey);
    setIsLoggedIn(true);
    alert('API key saved!');
  };

  const handleApiKeyReset = () => {
    localStorage.removeItem('pinataApiKey');
    setApiKey('');
    setIsLoggedIn(false);
    alert('API key removed.');
  };

  const handleSettingsClick = () => setShowSettings(!showSettings);
  const handleDashboardClick = () => setShowSettings(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('CID copied to clipboard!');
  };

  const uploadToPinata = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    setHasError(false);
    try {
      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData
      });
      const data = await res.json();
      if (!data.IpfsHash) throw new Error('Missing CID');
      const newEntry = {
        name: file.name,
        cid: data.IpfsHash,
        type: file.type,
        url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
        timestamp: new Date().toISOString()
      };
      setUploadedFiles(prev => [newEntry, ...prev]);
    } catch (err) {
      console.error('Upload failed:', err);
      setHasError(true);
    }
    setIsUploading(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => uploadToPinata(file));
  };

  const handleDeleteFile = (cid) => {
    fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${apiKey}` }
    })
      .then(() => setUploadedFiles(files => files.filter(f => f.cid !== cid)))
      .catch(err => {
        console.error('Unpin failed:', err);
        setHasError(true);
      });
  };

  const filteredFiles = useMemo(() => {
    const files = filterType === 'all'
      ? uploadedFiles
      : uploadedFiles.filter(file => file.type.startsWith(filterType));

    return sortOrder === 'newest'
      ? [...files].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      : [...files].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [uploadedFiles, filterType, sortOrder]);

  const stats = useMemo(() => {
    const count = uploadedFiles.length;
    const types = uploadedFiles.reduce((acc, file) => {
      const category = file.type.split('/')[0] || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    return { count, types };
  }, [uploadedFiles]);

  return (
    <div className={`min-h-screen font-mono ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <header className={`border-b ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}><Shield className="w-6 h-6" /></div>
            <h1 className="text-xl font-bold tracking-tight">VERICID</h1>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={handleDashboardClick} className="px-4 py-2 rounded hover:bg-zinc-700">Dashboard</button>
            <button onClick={handleSettingsClick} className="p-2 hover:bg-zinc-700 rounded"><Settings className="w-5 h-5" /></button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-zinc-700 rounded">{darkMode ? <Sun /> : <Moon />}</button>
          </div>
        </div>
      </header>

      {hasError && (
        <div className="max-w-xl mx-auto mt-8 p-4 border border-red-500 rounded text-center">
          <img src={errorImage} alt="Error Matt" className="mx-auto mb-2 w-24 h-24 rounded-full" />
          <p className="text-red-400 font-semibold">Something went wrong! Don't worry, Matt is on it.</p>
        </div>
      )}

      {/* Upload and dashboard */}
      {isLoggedIn && !showSettings && (
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
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="max-w-xl mx-auto mt-10 px-6">
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          <p className="text-sm text-zinc-400">Here you can update your API key or manage preferences.</p>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded mt-4 text-black"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          <div className="flex gap-4 mt-4">
            <button onClick={handleApiKeySave} className="bg-blue-600 text-white px-4 py-2 rounded">Save Key</button>
            <button onClick={handleApiKeyReset} className="bg-red-600 text-white px-4 py-2 rounded">Clear Key</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VericidApp;

