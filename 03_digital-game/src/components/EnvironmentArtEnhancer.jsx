import { useEffect } from 'react';

import environmentArt from '../data/environment-art.json';

const VERSION = 'who-took-it-environment-art-v1';
const CSS_VARIABLE_BY_ID = Object.freeze({
  caseRoom: '--wti-environment-case-room'
});

function runtimeAssetUrl(filename) {
  const runtimeBase = environmentArt.runtimeBase.replace(/^\/+|\/+$/g, '');
  return `${import.meta.env.BASE_URL}${runtimeBase}/${filename}`;
}

export default function EnvironmentArtEnhancer() {
  useEffect(() => {
    const root = document.documentElement;
    const approved = environmentArt.entries.filter((entry) => entry.status === 'approved');
    const loaded = new Set();
    const failed = new Set();
    const preloaders = [];

    root.dataset.wtiEnvironmentArtStatus = 'loading';

    const refreshStatus = () => {
      if (loaded.size + failed.size !== approved.length) return;
      root.dataset.wtiEnvironmentArtStatus = failed.size ? 'partial' : 'loaded';
      window.__WHO_TOOK_IT_ENVIRONMENT_ART__ = Object.freeze({
        version: VERSION,
        approvedCount: approved.length,
        loadedCount: loaded.size,
        failedCount: failed.size,
        failedIds: [...failed]
      });
    };

    for (const entry of approved) {
      const cssVariable = CSS_VARIABLE_BY_ID[entry.id];
      if (!cssVariable) {
        failed.add(entry.id);
        continue;
      }

      const preload = new Image();
      const src = runtimeAssetUrl(entry.asset);
      preload.onload = () => {
        root.style.setProperty(cssVariable, `url("${src}")`);
        loaded.add(entry.id);
        refreshStatus();
      };
      preload.onerror = () => {
        root.style.removeProperty(cssVariable);
        failed.add(entry.id);
        refreshStatus();
      };
      preload.src = src;
      preloaders.push(preload);
    }

    refreshStatus();

    return () => {
      for (const cssVariable of Object.values(CSS_VARIABLE_BY_ID)) {
        root.style.removeProperty(cssVariable);
      }
      delete root.dataset.wtiEnvironmentArtStatus;
      delete window.__WHO_TOOK_IT_ENVIRONMENT_ART__;
      for (const preload of preloaders) {
        preload.onload = null;
        preload.onerror = null;
      }
    };
  }, []);

  return null;
}
