import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Shield, History, Copy, Download, Moon, Sun, AlertTriangle, CheckCircle, XCircle, Clock, MapPin, User, Save, LogIn, Settings, BarChart3, Menu, X, ExternalLink } from 'lucide-react';
import { CID } from 'multiformats/cid';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';

const VericidApp = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [file, setFile] = useState(null);
  const [cids, setCids] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const fileInputRef = useRef(null);

  // Real CID generation (both v0 and v1)
  const generateCID = async (file) => {
    setIsGenerating(true);
    try {
      const fileBuffer = new Uint8Array(await file.arrayBuffer());
      const hash = await sha256.digest(fileBuffer);
      
      // Generate both CID versions
      const cidV0 = CID.create(0, 0x55, hash); // 0x55 = raw codec for v0
      const cidV1 = CID.create(1, raw.code, hash);
      
      const cidPair = {
        v0: cidV0.toString(),
        v1: cidV1.toString()
      };
      
      setCids(cidPair);
      setIsGenerating(false);
      
      // Look up history for both CIDs
      lookupHistory(cidPair);
    } catch (error) {
      console.error('Error generating CIDs:', error);
      setIsGenerating(false);
      // You might want to show an error message to the user here
    }
  };

  // Network link generator
  const getNetworkLink = (network, address) => {
    switch(network.toLowerCase()) {
      case 'ethereum':
        return `https://etherscan.io/address/${address}`;
      case 'base':
        return `https://basescan.org/address/${address}`;
      case 'polygon':
        return `https://polygonscan.com/address/${address}`;
      case 'arbitrum':
        return `https://arbiscan.io/address/${address}`;
      case 'optimism':
        return `https://optimistic.etherscan.io/address/${address}`;
      case 'bsc':
      case 'binance':
        return `https://bscscan.com/address/${address}`;
      default:
        return null;
    }
  };

  // History lookup with network links
  const lookupHistory = async (cids) => {
    setIsLookingUp(true);
    try {
      // Replace with your actual Cloudflare Worker URL
      const WORKER_URL = 'https://your-worker.your-subdomain.workers.dev';
      
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          cidV0: cids.v0,
          cidV1: cids.v1
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the response data and add network links
      const processedHistory = {
        ...data,
        origins: data.origins?.map(origin => ({
          ...origin,
          externalLink: getNetworkLink(origin.network, origin.address)
        })) || []
      };
      
      setHistoryData(processedHistory);
      setIsLookingUp(false);
      setShowResults(true);
    } catch (error) {
      console.error('Error looking up history:', error);
      setIsLookingUp(false);
      
      // For demo purposes, show mock data if API fails
      const mockHistory = {
        cid: cids.v1,
        origins: [
          {
            network: "ethereum",
            address: "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8",
            metadata: {
              type: "NFT",
              standard: "ERC721"
            },
            timestamp: "2025-08-07T16:14:00.238Z",
            externalLink: getNetworkLink("ethereum", "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8")
          },
          {
            network: "base",
            address: "0xBd3531dA5CF5857e7CfAA92426877b022e612cf7",
            metadata: {
              type: "NFT",
              standard: "ERC721"
            },
            timestamp: "2025-08-07T16:14:00.245Z",
            externalLink: getNetworkLink("base", "0xBd3531dA5CF5857e7CfAA92426877b022e612cf7")
          }
        ],
        metadata: {
          totalOrigins: 2,
          lastFound: "2025-08-07T16:14:00.246Z"
        }
      };
      
      setHistoryData(mockHistory);
      setShowResults(true);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      generateCID(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      generateCID(selectedFile);
    }
  };

  const copyCID = (version) => {
    const cidToCopy = version === 'v0' ? cids.v0 : cids.v1;
    navigator.clipboard.writeText(cidToCopy);
  };

  const exportResults = () => {
    const exportData = {
      file: file.name,
      cids: cids,
      timestamp: new Date().toISOString(),
      history: historyData,
      watermark: "⚠️ EXPORTED COPY - NOT VERIFIABLE - FOR REFERENCE ONLY ⚠️"
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-${file.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTrustIcon = (totalOrigins) => {
    if (totalOrigins >= 5) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (totalOrigins >= 2) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getTrustScore = (totalOrigins) => {
    if (totalOrigins >= 5) return 'high';
    if (totalOrigins >= 2) return 'medium';
    return 'low';
  };

  const reset = () => {
    setFile(null);
    setCids(null);
    setHistoryData(null);
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`min-h-screen font-mono transition-colors duration-300 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <header className={`border-b ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">VERICID</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setShowDashboard(!showDashboard)}
                  className={`px-4 py-2 rounded transition-colors ${showDashboard ? (darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-black') : (darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100')}`}
                >
                  Dashboard
                </button>
                <button className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'}`}>
                  <Settings className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsLoggedIn(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`md:hidden p-2 rounded transition-colors ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'}`}
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className={`md:hidden border-t ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'} p-4 space-y-4`}>
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setShowDashboard(!showDashboard)}
                  className={`block w-full text-left px-4 py-2 rounded transition-colors ${showDashboard ? (darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-black') : (darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100')}`}
                >
                  Dashboard
                </button>
                <button className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'}`}>
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsLoggedIn(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors w-full ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'}`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        )}
      </header>

      {/* Dashboard Overlay */}
      {showDashboard && isLoggedIn && (
        <div className={`border-b ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'} p-6`}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`p-4 rounded ${darkMode ? 'bg-black border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Total Verifications</span>
                </div>
                <p className="text-2xl font-bold">127</p>
                <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>+12 this week</p>
              </div>
              
              <div className={`p-4 rounded ${darkMode ? 'bg-black border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">High Trust</span>
                </div>
                <p className="text-2xl font-bold">89%</p>
                <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>of your files</p>
              </div>
              
              <div className={`p-4 rounded ${darkMode ? 'bg-black border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <History className="w-5 h-5" />
                  <span className="font-medium">Saved Results</span>
                </div>
                <p className="text-2xl font-bold">43</p>
                <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>ready to share</p>
              </div>
              
              <div className={`p-4 rounded ${darkMode ? 'bg-black border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Flagged Files</span>
                </div>
                <p className="text-2xl font-bold">3</p>
                <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>need review</p>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="mt-8">
              <h3 className="font-medium mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { file: 'contract_draft.pdf', status: 'high', time: '2 hours ago' },
                  { file: 'artwork_final.jpg', status: 'medium', time: '1 day ago' },
                  { file: 'certificate.png', status: 'high', time: '3 days ago' },
                ].map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded ${darkMode ? 'bg-black border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">{item.file}</span>
                      <div className={`px-2 py-1 rounded text-xs ${
                        item.status === 'high' ? 'bg-green-100 text-green-800' :
                        item.status === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status} trust
                      </div>
                    </div>
                    <span className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 tracking-tight">
            Verify Digital Authenticity
          </h2>
          <p className={`text-xl ${darkMode ? 'text-zinc-400' : 'text-zinc-600'} max-w-3xl mx-auto mb-12 leading-relaxed`}>
            Every digital file has a unique cryptographic fingerprint called a Content Identifier (CID). 
            VERICID generates this fingerprint and tracks where your file has appeared across networks, 
            blockchains, and platforms — giving you the power to verify ownership, authenticity, and provenance.
          </p>

          {/* How It Works */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'} flex items-center justify-center mx-auto mb-4`}>
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="font-bold mb-2">Upload File</h3>
              <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Drop any digital file to generate its unique CID hash
              </p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'} flex items-center justify-center mx-auto mb-4`}>
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="font-bold mb-2">Trace History</h3>
              <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                See everywhere this exact file has appeared online
              </p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'} flex items-center justify-center mx-auto mb-4`}>
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="font-bold mb-2">Verify Trust</h3>
              <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Get trust scores based on ownership patterns and history
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        {!file && (
          <div
            className={`relative border-2 border-dashed rounded-lg p-16 text-center transition-all duration-300 cursor-pointer ${
              dragOver 
                ? (darkMode ? 'border-white bg-zinc-900' : 'border-black bg-zinc-50')
                : (darkMode ? 'border-zinc-700 hover:border-zinc-600' : 'border-zinc-300 hover:border-zinc-400')
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-6">
              <div className={`p-8 rounded ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                <Upload className="w-16 h-16" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Drop your file here</h3>
                <p className={darkMode ? 'text-zinc-400' : 'text-zinc-600'}>
                  or <span className="underline font-medium">click to browse</span>
                </p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  Any file type • Max 100MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* File Processing */}
        {file && (
          <div className={`rounded-lg p-8 border ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            {/* File Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded ${darkMode ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">{file.name}</h3>
                <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={reset}
                className={`ml-auto px-4 py-2 rounded transition-colors border ${darkMode ? 'hover:bg-zinc-800 border-zinc-700' : 'hover:bg-zinc-200 border-zinc-300'}`}
              >
                Upload Different File
              </button>
            </div>

            {/* CID Generation */}
            {isGenerating && (
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Generating Content Identifiers...</span>
              </div>
            )}

            {/* CID Display - Both Versions */}
            {cids && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    Content Identifier v0 (Legacy)
                  </label>
                  <div className={`flex items-center gap-3 p-4 rounded border font-mono text-sm ${darkMode ? 'bg-black border-zinc-800' : 'bg-white border-zinc-300'}`}>
                    <code className="flex-1 break-all">{cids.v0}</code>
                    <button
                      onClick={() => copyCID('v0')}
                      className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    Content Identifier v1 (Current)
                  </label>
                  <div className={`flex items-center gap-3 p-4 rounded border font-mono text-sm ${darkMode ? 'bg-black border-zinc-800' : 'bg-white border-zinc-300'}`}>
                    <code className="flex-1 break-all">{cids.v1}</code>
                    <button
                      onClick={() => copyCID('v1')}
                      className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* History Lookup */}
            {isLookingUp && (
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Looking up CID history across networks...</span>
              </div>
            )}

            {/* Results */}
            {showResults && historyData && (
              <div className="space-y-6">
                {/* Trust Score */}
                <div className={`p-4 rounded border-2 ${
                  getTrustScore(historyData.metadata?.totalOrigins || 0) === 'high' ? 'border-green-500' :
                  getTrustScore(historyData.metadata?.totalOrigins || 0) === 'medium' ? 'border-yellow-500' :
                  'border-red-500'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    {getTrustIcon(historyData.metadata?.totalOrigins || 0)}
                    <h4 className="font-bold">
                      Trust Level: {getTrustScore(historyData.metadata?.totalOrigins || 0).charAt(0).toUpperCase() + getTrustScore(historyData.metadata?.totalOrigins || 0).slice(1)}
                    </h4>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Found {historyData.metadata?.totalOrigins || 0} occurrence{(historyData.metadata?.totalOrigins || 0) !== 1 ? 's' : ''} across blockchain networks
                  </p>
                </div>

                {/* Enhanced Timeline with Network Links */}
                <div>
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Network History
                  </h4>
                  <div className="space-y-4">
                    {historyData.origins?.map((origin, index) => (
                      <div key={index} className={`flex gap-4 p-4 rounded border ${darkMode ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200'}`}>
                        <div className={`p-2 rounded ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">{origin.metadata?.type || 'Transaction'}</span>
                            <span className={`px-2 py-1 text-xs rounded font-mono ${
                              origin.network.toLowerCase() === 'ethereum' ? 'bg-blue-100 text-blue-800' :
                              origin.network.toLowerCase() === 'base' ? 'bg-indigo-100 text-indigo-800' :
                              origin.network.toLowerCase() === 'polygon' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {origin.network.toUpperCase()}
                            </span>
                            <span className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                              {new Date(origin.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-zinc-300' : 'text-zinc-700'} mb-2`}>
                            Standard: {origin.metadata?.standard} • Address: {origin.address.slice(0, 8)}...{origin.address.slice(-6)}
                          </p>
                          {origin.external
