import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AgeGate from './components/AgeGate.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import EvidenceArtEnhancer from './components/EvidenceArtEnhancer.jsx';
import './styles.css';
import './extra.css';
import './age-gate.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AgeGate>
        <App />
        <EvidenceArtEnhancer />
      </AgeGate>
    </ErrorBoundary>
  </React.StrictMode>
);
