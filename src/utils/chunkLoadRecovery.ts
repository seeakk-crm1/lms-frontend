import { ComponentType, LazyExoticComponent, lazy } from 'react';

const CHUNK_RELOAD_STORAGE_KEY = 'seeakk:last-chunk-reload-at';
const CHUNK_RELOAD_COOLDOWN_MS = 30_000;

const CHUNK_LOAD_ERROR_PATTERNS = [
  'failed to fetch dynamically imported module',
  'dynamically imported module',
  'expected a javascript-or-wasm module script',
  'mime type of "text/html"',
  'importing a module script failed',
  'module script load failed',
  'chunkloaderror',
  'loading chunk',
];

const getErrorMessage = (error: unknown): string => {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return `${error.name} ${error.message}`.trim();

  const maybeError = error as { message?: unknown; reason?: unknown; error?: unknown; payload?: unknown };
  return [
    maybeError.message,
    maybeError.reason ? getErrorMessage(maybeError.reason) : '',
    maybeError.error ? getErrorMessage(maybeError.error) : '',
    maybeError.payload ? getErrorMessage(maybeError.payload) : '',
  ]
    .filter(Boolean)
    .join(' ');
};

export const isChunkLoadError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return CHUNK_LOAD_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
};

export const requestFreshAppReload = (): boolean => {
  if (typeof window === 'undefined') return false;

  const now = Date.now();
  const lastReloadAt = Number(window.sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY) || '0');

  if (Number.isFinite(lastReloadAt) && now - lastReloadAt < CHUNK_RELOAD_COOLDOWN_MS) {
    return false;
  }

  window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(now));
  window.location.reload();
  return true;
};

export const handleChunkLoadFailure = (error: unknown): boolean => {
  if (!isChunkLoadError(error)) return false;
  return requestFreshAppReload();
};

export const lazyWithChunkRecovery = <T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
): LazyExoticComponent<T> =>
  lazy(async () => {
    try {
      return await importer();
    } catch (error) {
      if (handleChunkLoadFailure(error)) {
        return await new Promise<never>(() => undefined);
      }
      throw error;
    }
  });

let listenersInstalled = false;

export const installChunkLoadRecovery = (): void => {
  if (listenersInstalled || typeof window === 'undefined') return;
  listenersInstalled = true;

  window.addEventListener('vite:preloadError', (event) => {
    const preloadEvent = event as Event & { payload?: unknown };
    if (!isChunkLoadError(preloadEvent.payload)) return;

    event.preventDefault();
    requestFreshAppReload();
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (!isChunkLoadError(event.reason)) return;

    event.preventDefault();
    requestFreshAppReload();
  });

  window.addEventListener(
    'error',
    (event) => {
      if (!isChunkLoadError(event.error || event.message)) return;

      event.preventDefault();
      requestFreshAppReload();
    },
    true,
  );
};
