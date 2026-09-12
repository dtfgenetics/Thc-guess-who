import { useEffect } from 'react';

import uiArt from '../data/ui-art.json';

const VERSION = 'who-took-it-ui-art-v1';

const CSS_VARIABLE_BY_ID = Object.freeze({
  suspectCardNormal: '--wti-ui-base',
  suspectCardActive: '--wti-ui-active',
  suspectCardEliminated: '--wti-ui-eliminated',
  mysteryCardHidden: '--wti-mystery-hidden',
  evidenceFrameNormal: '--wti-evidence-frame',
  evidenceFrameActive: '--wti-evidence-active',
  modalFrame: '--wti-modal-frame',
  questionChipDisabled: '--wti-question-disabled',
  questionChipActive: '--wti-question-active',
  bannerEmpty: '--wti-banner'
});

function runtimeAssetUrl(filename) {
  const runtimeBase = uiArt.runtimeBase.replace(/^\/+|\/+$/g, '');
  return `${import.meta.env.BASE_URL}${runtimeBase}/${filename}`;
}

export default function UiArtEnhancer() {
  useEffect(() => {
    const root = document.documentElement;
    const approved = uiArt.entries.filter((entry) => entry.status === 'approved');
    const loaded = new Set();
    const failed = new Set();
    const preloaders = [];

    root.dataset.wtiUiArtStatus = 'loading';

    const refreshStatus = () => {
      if (loaded.size + failed.size !== approved.length) return;
      root.dataset.wtiUiArtStatus = failed.size ? 'partial' : 'loaded';
      window.__WHO_TOOK_IT_UI_ART__ = Object.freeze({
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
      delete root.dataset.wtiUiArtStatus;
      delete window.__WHO_TOOK_IT_UI_ART__;
      for (const preload of preloaders) {
        preload.onload = null;
        preload.onerror = null;
      }
    };
  }, []);

  return null;
}
