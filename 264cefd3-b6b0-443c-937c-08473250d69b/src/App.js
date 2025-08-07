import React, { useState, useRef, useMemo } from 'react';
import {
  Upload, FileText, Shield, History, Copy, Download, Moon, Sun, AlertTriangle,
  CheckCircle, XCircle, Clock, MapPin, User, Save, LogIn, Settings, BarChart3,
  Menu, X, ExternalLink, Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import errorImage from './assets/image.png';

const VericidApp = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [originData, setOriginData] = useState<any>(null);
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isUploading, setIsUploading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('pinataApiKey') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!apiKey);
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');
  const [hasError, setHasError] = useState(false);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('CID copied to clipboard!');
  };

  const fetchOriginData = async (cid: string) => {
    try {
      const response = await fetch(`https://cid-verifier.pinata.cloud/lookup/${cid}`);
      if (!response.ok) throw new Error('Origin fetch failed');
      const data = await response.json();
      setOriginData(data?.origins?.length ? data : null);
    } catch (err) {
      console.error('Origin lookup failed:', err);
      setOriginData(null);
    }
  };

  const uploadToPinata = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    setHasError(false);
    try {
      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });
      const data = await res.json();
      if (!data.IpfsHash) throw new Error('Missing CID');
      const newEntry = {
        name: file.name,
        cid: data.IpfsHash,
        type: file.type,
        url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
        timestamp: new Date().toISOString(),
      };
      setUploadedFiles(prev => [newEntry, ...prev]);
      fetchOriginData(data.IpfsHash);
    } catch (err) {
      console.error('Upload failed:', err);
      setHasError(true);
    }
    setIsUploading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => uploadToPinata(file));
  };

  const handleDeleteFile = (cid: string) => {
    fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${apiKey}` },
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
      ? [...files].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      : [...files].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [uploadedFiles, filterType, sortOrder]);

  const stats = useMemo(() => {
    const count = uploadedFiles.length;
    const types: { [key: string]: number } = {};
    uploadedFiles.forEach(file => {
      const cat = file.type?.split('/')[0] || 'other';
      types[cat] = (types[cat] || 0) + 1;
    });
    return { count, types };
  }, [uploadedFiles]);

  return (
    <div className={`min-h-screen font-mono ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <header className="border-b border-zinc-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield className="w-6 h-6" />
            <h1 className="text-xl font-bold">VERICID</h1>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setView('dashboard')}>Dashboard</button>
            <button onClick={() => setView('settings')}>Settings</button>
            <button onClick={() => window.open('https://app.pinata.cloud/login', '_blank')}>Sign In</button>
            <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun /> : <Moon />}</button>
          </div>
        </div>
      </header>

      {hasError && (
        <div className="text-center border p-4 border-red-500 mt-4 max-w-xl mx-auto">
          <img src={errorImage} className="w-24 h-24 mx-auto mb-3" />
          <p className="text-red-400">Something went wrong! Don’t worry, Matt is on it.</p>
        </div>
      )}

      {view === 'settings' && (
        <div className="max-w-xl mx-auto mt-10 px-6">
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="text-black px-4 py-2 w-full rounded" />
          <div className="flex gap-4 mt-4">
            <button onClick={handleApiKeySave} className="bg-blue-600 text-white px-4 py-2 rounded">Save Key</button>
            <button onClick={handleApiKeyReset} className="bg-red-600 text-white px-4 py-2 rounded">Clear Key</button>
          </div>
        </div>
      )}

      {view === 'dashboard' && (
        <div className="max-w-3xl mx-auto mt-10 px-6">
          <h3 className="text-lg font-semibold mb-2">Dashboard Stats</h3>
          <p>Total Files: {stats.count}</p>
          <ul className="text-sm mb-6">
            {Object.entries(stats.types).map(([type, count]) => (
              <li key={type}>{type}: {count}</li>
            ))}
          </ul>

          <input type="file" multiple onChange={handleFileSelect} className="mb-4" />
          {isUploading && <p className="text-yellow-400">Uploading to Pinata...</p>}

          <div className="flex gap-4 items-center mt-6">
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-black px-2 py-1 rounded">
              <option value="all">All</option>
              <option value="image">Image</option>
              <option value="application">Application</option>
              <option value="text">Text</option>
            </select>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="text-black px-2 py-1 rounded">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          <ul className="space-y-3 mt-6">
            {filteredFiles.map(file => (
              <li key={file.cid} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <p className="text-sm">{file.name}</p>
                  <a href={file.url} target="_blank" rel="noreferrer" className="text-blue-400 text-xs underline">{file.cid}</a>
                  <button onClick={() => copyToClipboard(file.cid)} title="Copy CID"><Copy className="w-4 h-4 ml-2 hover:text-green-400" /></button>
                  <p className="text-xs text-zinc-500 mt-1">{formatDistanceToNow(new Date(file.timestamp))} ago</p>
                </div>
                <button onClick={() => handleDeleteFile(file.cid)} title="Delete"><Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" /></button>
              </li>
            ))}
          </ul>

          {originData && (
            <div className="mt-12 border rounded p-4 bg-zinc-800 text-white">
              <h3 className="text-lg font-semibold mb-3">CID Origins</h3>
              <p className="text-sm mb-2">CID: <code className="text-amber-300">{originData.cid}</code></p>
              <ul className="space-y-2">
                {originData.origins.map((origin: any) => {
                  const explorerBase = origin.source === 'polygon'
                    ? 'https://polygonscan.com/address/'
                    : origin.source === 'base'
                      ? 'https://basescan.org/address/'
                      : '';
                  return (
                    <li key={origin.id} className="border p-3 rounded bg-zinc-900">
                      <p>Chain: <span className="capitalize">{origin.source}</span></p>
                      <p>Type: {origin.metadata.type} ({origin.metadata.standard})</p>
                      <p>Found: {formatDistanceToNow(new Date(origin.timestamp))} ago</p>
                      <p>
                        Contract:{' '}
                        <a href={`${explorerBase}${origin.location}`} target="_blank" rel="noreferrer" className="text-blue-400 underline">
                          {origin.location}
                        </a>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VericidApp;



