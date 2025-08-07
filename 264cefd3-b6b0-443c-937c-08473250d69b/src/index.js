import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import VericidApp from './App'; // or './App' if you're keeping the original name

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <VericidApp />
  </React.StrictMode>
);

