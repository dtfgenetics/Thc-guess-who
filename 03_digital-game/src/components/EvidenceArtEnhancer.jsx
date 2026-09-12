import { useEffect } from 'react';

import itemArt from '../data/item-art.json';

const VERSION = 'who-took-it-evidence-art-v1';
const APPROVED_BY_NAME = new Map(
  itemArt.entries
    .filter((entry) => entry.status === 'approved')
    .map((entry) => [entry.name, entry])
);

function runtimeAssetUrl(filename) {
  const runtimeBase = itemArt.runtimeBase.replace(/^\/+|\/+$/g, '');
  return `${import.meta.env.BASE_URL}${runtimeBase}/${filename}`;
}

function clearArt(icon) {
  icon.classList.remove('has-evidence-art');
  icon.style.removeProperty('--evidence-art');
  delete icon.dataset.evidenceArtStatus;
}

function enhanceCard(card) {
  const icon = card.querySelector('.evidence-icon');
  const itemName = card.querySelector('strong')?.textContent?.trim();
  if (!icon || !itemName) return;

  const entry = APPROVED_BY_NAME.get(itemName);
  if (!entry) {
    delete icon.dataset.evidenceArtRequest;
    clearArt(icon);
    return;
  }

  const requestKey = `${entry.itemId}:${entry.asset}`;
  if (icon.dataset.evidenceArtRequest === requestKey) return;

  icon.dataset.evidenceArtRequest = requestKey;
  icon.dataset.evidenceArtStatus = 'loading';
  const src = runtimeAssetUrl(entry.asset);
  const preload = new Image();

  preload.onload = () => {
    if (!icon.isConnected || icon.dataset.evidenceArtRequest !== requestKey) return;
    icon.style.setProperty('--evidence-art', `url("${src}")`);
    icon.classList.add('has-evidence-art');
    icon.dataset.evidenceArtStatus = 'loaded';
  };

  preload.onerror = () => {
    if (!icon.isConnected || icon.dataset.evidenceArtRequest !== requestKey) return;
    clearArt(icon);
    icon.dataset.evidenceArtRequest = requestKey;
    icon.dataset.evidenceArtStatus = 'fallback';
  };

  preload.src = src;
}

export default function EvidenceArtEnhancer() {
  useEffect(() => {
    const root = document.querySelector('#root');
    if (!root) return undefined;

    const enhance = () => {
      for (const card of root.querySelectorAll('.evidence-card')) enhanceCard(card);
    };

    const observer = new MutationObserver((records) => {
      if (!records.some((record) => record.type === 'childList')) return;
      queueMicrotask(enhance);
    });

    observer.observe(root, { childList: true, subtree: true });
    enhance();

    window.__WHO_TOOK_IT_EVIDENCE_ART__ = Object.freeze({
      version: VERSION,
      approvedCount: APPROVED_BY_NAME.size,
      canonicalCount: itemArt.entries.length,
      refresh: enhance
    });

    return () => {
      observer.disconnect();
      delete window.__WHO_TOOK_IT_EVIDENCE_ART__;
    };
  }, []);

  return null;
}
