import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AgeGate from './components/AgeGate.jsx';
import EnvironmentArtEnhancer from './components/EnvironmentArtEnhancer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import EvidenceArtEnhancer from './components/EvidenceArtEnhancer.jsx';
import UiArtEnhancer from './components/UiArtEnhancer.jsx';
import './styles.css';
import './extra.css';
import './ui-art.css';
import './environment-art.css';
import './age-gate.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AgeGate>
        <App />
        <EvidenceArtEnhancer />
        <UiArtEnhancer />
        <EnvironmentArtEnhancer />
      </AgeGate>
    </ErrorBoundary>
  </React.StrictMode>
);
