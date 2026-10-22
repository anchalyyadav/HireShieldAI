// Minimal vanilla JS router with history API + browser back/forward support
import { renderShell, mountShellInteractions, fetchUser, isSupabaseConfigured } from './shell.js';

const routes = new Map();
const patternRoutes = []; // {prefix, loader}

export function registerRoute(path, loader) {
  if (path.endsWith('/*')) {
    patternRoutes.push({ prefix: path.slice(0, -2), loader });
  } else if (path.endsWith('/:id')) {
    patternRoutes.push({ prefix: path.slice(0, -4), loader });
  } else {
    routes.set(path, loader);
  }
}

function normalizePath() {
  let path = location.pathname;
  if (path !== '/' && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path || '/';
}

const PUBLIC_ROUTES = new Set(['/', '/login']);

async function guardRoute(path) {
  if (PUBLIC_ROUTES.has(path)) return null;

  if (!isSupabaseConfigured) {
    return null; // allow viewing UI shells
  }

  const user = await fetchUser();
  if (!user) {
    location.assign('/login');
    return 'redirect';
  }
  return null;
}

function matchRoute(path) {
  if (routes.has(path)) return routes.get(path);

  for (const { prefix, loader } of patternRoutes) {
    if (path === prefix || path.startsWith(prefix + '/')) {
      return loader;
    }
  }
  return routes.get('*');
}

export async function router() {
  const path = normalizePath();
  const app = document.querySelector('#app');

  app.innerHTML = renderShell(path);

  const result = await guardRoute(path);
  if (result === 'redirect') return;

  const pageEl = document.querySelector('#page-content');
  const loader = matchRoute(path);

  if (loader && pageEl) {
    const { onMount } = loader(path);
    if (typeof onMount === 'function') {
      await onMount(pageEl, path);
    }
  } else if (pageEl) {
    pageEl.innerHTML = `<div class="empty-state">
      <h3>Page not found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/dashboard" class="btn btn-primary mt-2" data-link>Go to Dashboard</a>
    </div>`;
  }

  mountShellInteractions();
  window.scrollTo(0, 0);
}

// Intercept internal link clicks
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-link]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('#')) return;
  e.preventDefault();
  history.pushState({}, '', href);
  router();
});

window.addEventListener('popstate', router);
