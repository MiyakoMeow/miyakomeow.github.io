import { runAsWorker } from "synckit";
import { __unstable__loadDesignSystem } from "@tailwindcss/node";

const designSystemCache = new Map();

async function canonicalizeInWorker(cssContent, basePath, candidates, options = {}) {
  const cacheKey = basePath;
  let designSystem = designSystemCache.get(cacheKey);
  if (!designSystem) {
    designSystem = await __unstable__loadDesignSystem(cssContent, { base: basePath });
    designSystemCache.set(cacheKey, designSystem);
  }
  return designSystem.canonicalizeCandidates(candidates, options);
}

runAsWorker(canonicalizeInWorker);

