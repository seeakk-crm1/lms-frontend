import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://seeakk.com';

const HOME_TITLE = 'SEEAKK – Sales Execution & Accountability Platform with CRM';

/** Public pages that search engines may index. Everything else is noindex. */
const INDEXABLE_ROUTES = new Set(['/', '/privacy-policy', '/terms', '/data-deletion']);

const upsertMeta = (name: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertCanonical = (href: string | null) => {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

/**
 * Keeps robots/canonical (and the homepage title) in sync with the current route.
 * Public legal pages set their own document.title; app pages are marked noindex.
 */
const RouteSeo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalized = pathname.replace(/\/+$/, '') || '/';
    const indexable = INDEXABLE_ROUTES.has(normalized);

    upsertMeta('robots', indexable ? 'index, follow' : 'noindex, nofollow');
    upsertCanonical(indexable ? `${SITE_URL}${normalized === '/' ? '/' : normalized}` : null);

    if (normalized === '/') document.title = HOME_TITLE;
  }, [pathname]);

  return null;
};

export default RouteSeo;
