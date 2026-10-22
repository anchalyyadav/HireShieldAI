// Shared app shell: sidebar + navbar + auth state
import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { icon } from './icons.js';
import { toast } from './toast.js';

export { isSupabaseConfigured };

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: 'grid', section: 'Command Center' },
  { path: '/scanner', label: 'AI Threat Analysis', icon: 'brain', section: 'Command Center' },
  { path: '/scanner', label: 'Manual Scan', icon: 'scan', section: 'Command Center', params: '?mode=rule-based' },
  { path: '/history', label: 'Scan History', icon: 'history', section: 'Command Center' },
  { path: '/safety', label: 'Threat Intelligence', icon: 'radar', section: 'Intelligence' },
  { path: '/history', label: 'Reports', icon: 'report', section: 'Intelligence' },
  { path: '/profile', label: 'Settings', icon: 'settings', section: 'Intelligence' },
];

let currentUser = null;
let authReady = false;
let systemStatus = null;

export function getCurrentUser() {
  return currentUser;
}

export function isAuthReady() {
  return authReady;
}

export async function fetchUser() {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getUser();
  currentUser = data?.user || null;
  return currentUser;
}

export function onAuthChange(cb) {
  if (!isSupabaseConfigured) {
    authReady = true;
    return () => {};
  }
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    authReady = true;
    cb(currentUser);
    updateShellAuth();
  });
  return () => sub.subscription.unsubscribe();
}

async function fetchSystemStatus() {
  try {
    const resp = await fetch('/api/health');
    if (resp.ok) {
      systemStatus = await resp.json();
    } else {
      systemStatus = null;
    }
  } catch {
    systemStatus = null;
  }
  return systemStatus;
}

export function getSystemStatus() {
  return systemStatus;
}

function updateShellAuth() {
  const navRight = document.querySelector('#navbar-right');
  if (!navRight) return;

  if (currentUser) {
    const email = currentUser.email || '';
    const initial = email.charAt(0).toUpperCase();
    const displayName = currentUser.user_metadata?.full_name || email.split('@')[0];
    navRight.innerHTML = `
      <div class="cmd-bar-status" id="cmd-status-indicator">
        <span class="cmd-status-dot"></span>
        <span class="cmd-status-text">Checking</span>
      </div>
      <button class="cmd-bar-icon-btn" id="cmd-bell" aria-label="Notifications">
        ${icon('bell')}
      </button>
      <div class="cmd-bar-avatar-wrap" id="cmd-avatar-wrap">
        <div class="user-avatar cmd-bar-avatar">${initial}</div>
        <span class="hide-mobile cmd-bar-avatar-name">${displayName}</span>
        ${icon('chevronDown')}
      </div>
    `;
    // Wire avatar dropdown
    const avatarWrap = document.querySelector('#cmd-avatar-wrap');
    avatarWrap?.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = document.querySelector('#avatar-dropdown');
      if (menu) {
        menu.classList.toggle('show');
        return;
      }
      // Create dropdown
      const dd = document.createElement('div');
      dd.id = 'avatar-dropdown';
      dd.className = 'avatar-dropdown';
      dd.innerHTML = `
        <a href="/profile" class="avatar-dd-item" data-link>${icon('profile')} Profile & Settings</a>
        <button class="avatar-dd-item" id="dd-logout">${icon('logout')} Sign out</button>
      `;
      avatarWrap.appendChild(dd);
      dd.classList.add('show');
      dd.querySelector('#dd-logout')?.addEventListener('click', handleLogout);
      dd.querySelectorAll('[data-link]').forEach(link => {
        link.addEventListener('click', () => {
          dd.classList.remove('show');
          const sidebar = document.querySelector('#sidebar');
          const backdrop = document.querySelector('#sidebar-backdrop');
          sidebar?.classList.remove('open');
          backdrop?.classList.remove('show');
        });
      });
    });
    // Close dropdown on outside click
    document.addEventListener('click', () => {
      document.querySelector('#avatar-dropdown')?.classList.remove('show');
    });
    // Bell — no notifications yet, show toast
    document.querySelector('#cmd-bell')?.addEventListener('click', () => {
      toast.info('No new notifications', 'You are all caught up.');
    });
  } else {
    navRight.innerHTML = `
      <a href="/login" class="btn btn-ghost btn-sm" data-link>Sign in</a>
      <a href="/login?mode=signup" class="btn btn-primary btn-sm" data-link>Get started</a>
    `;
  }

  updateSidebarStatus();
  updateSidebarProfile();
  updateCmdBarStatus();
}

function updateCmdBarStatus() {
  const indicator = document.querySelector('#cmd-status-indicator');
  if (!indicator) return;

  if (!systemStatus) {
    indicator.innerHTML = `<span class="cmd-status-dot unverified"></span><span class="cmd-status-text">Not Verified</span>`;
    return;
  }

  const aiOn = systemStatus.aiConfigured;
  const ruleOn = systemStatus.ruleEngine;

  if (aiOn && ruleOn) {
    indicator.innerHTML = `<span class="cmd-status-dot active"></span><span class="cmd-status-text">All Systems Active</span>`;
  } else if (ruleOn) {
    indicator.innerHTML = `<span class="cmd-status-dot active"></span><span class="cmd-status-text">Rule Engine Active</span>`;
  } else {
    indicator.innerHTML = `<span class="cmd-status-dot unverified"></span><span class="cmd-status-text">Not Verified</span>`;
  }
}

function updateSidebarStatus() {
  const indicator = document.querySelector('#sidebar-status');
  if (!indicator) return;

  if (!systemStatus) {
    indicator.innerHTML = `
      <div class="sys-mode-dot unverified"></div>
      <div class="sys-mode-text">
        <span class="sys-mode-label">Engine Status</span>
        <span class="sys-mode-value">Not verified</span>
      </div>`;
    return;
  }

  const aiOn = systemStatus.aiConfigured;
  const ruleOn = systemStatus.ruleEngine;

  let label, dotClass;
  if (aiOn && ruleOn) { label = 'AI + Rule Engine'; dotClass = 'active'; }
  else if (ruleOn) { label = 'Rule-Based Mode'; dotClass = 'active'; }
  else if (aiOn) { label = 'AI Mode'; dotClass = 'active'; }
  else { label = 'Not verified'; dotClass = 'unverified'; }

  indicator.innerHTML = `
    <div class="sys-mode-dot ${dotClass}"></div>
    <div class="sys-mode-text">
      <span class="sys-mode-label">Engine Status</span>
      <span class="sys-mode-value">${label}</span>
    </div>`;
}

function updateSidebarProfile() {
  const profileEl = document.querySelector('#sidebar-profile');
  if (!profileEl) return;

  if (currentUser) {
    const email = currentUser.email || '';
    const displayName = currentUser.user_metadata?.full_name || email.split('@')[0];
    const initial = email.charAt(0).toUpperCase();
    profileEl.innerHTML = `
      <a href="/profile" class="sidebar-profile-link" data-link>
        <div class="user-avatar sm">${initial}</div>
        <div class="sidebar-profile-info">
          <span class="sidebar-profile-name">${displayName}</span>
          <span class="sidebar-profile-email">${email}</span>
        </div>
      </a>`;
  } else {
    profileEl.innerHTML = `
      <a href="/login" class="sidebar-profile-link" data-link>
        <div class="user-avatar sm">?</div>
        <div class="sidebar-profile-info">
          <span class="sidebar-profile-name">Not signed in</span>
          <span class="sidebar-profile-email">Click to sign in</span>
        </div>
      </a>`;
  }

  profileEl?.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', () => {
      const sidebar = document.querySelector('#sidebar');
      const backdrop = document.querySelector('#sidebar-backdrop');
      sidebar?.classList.remove('open');
      backdrop?.classList.remove('show');
    });
  });
}

async function handleLogout() {
  if (!isSupabaseConfigured) {
    toast.info('Auth not configured', 'Supabase credentials are missing.');
    return;
  }
  await supabase.auth.signOut();
  toast.success('Signed out', 'You have been safely signed out.');
  setTimeout(() => location.assign('/login'), 500);
}

export function renderShell(path) {
  const isPublic = path === '/' || path === '/login';
  if (isPublic) {
    return '<div id="page-content"></div>';
  }

  // Build nav — deduplicate by path+params for active state
  const sections = {};
  NAV_ITEMS.forEach(item => {
    (sections[item.section] = sections[item.section] || []).push(item);
  });

  // Determine active nav item — match by path prefix
  const navHtml = Object.entries(sections).map(([section, items]) => `
    <div class="nav-section-label">${section}</div>
    ${items.map(item => {
      const isActive = path === item.path || (item.path === '/scanner' && path === '/scanner' && !item.params);
      const href = item.params ? `${item.path}${item.params}` : item.path;
      return `
        <a href="${href}" class="nav-link${isActive ? ' active' : ''}" data-link>
          ${icon(item.icon)}
          <span>${item.label}</span>
        </a>`;
    }).join('')}
  `).join('');

  const pathMap = {
    '/dashboard': { crumb: 'Command Center / Overview', title: 'Overview' },
    '/scanner': { crumb: 'Command Center / AI Threat Analysis', title: 'AI Threat Analysis' },
    '/history': { crumb: 'Command Center / Scan History', title: 'Scan History' },
    '/safety': { crumb: 'Intelligence / Threat Intelligence', title: 'Threat Intelligence' },
    '/profile': { crumb: 'Intelligence / Settings', title: 'Settings' },
  };
  const pageInfo = pathMap[path] || { crumb: 'Command Center', title: 'Overview' };

  return `
    <div class="app-shell">
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <img src="/favicon.svg" alt="" />
          <div class="sidebar-brand-info">
            <div class="sidebar-brand-text">Sachet<span>AI</span></div>
            <div class="sidebar-brand-sub">CYBERSECURITY INTELLIGENCE</div>
          </div>
        </div>
        <nav class="sidebar-nav" aria-label="Main navigation">
          ${navHtml}
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-status" id="sidebar-status">
            <div class="sys-mode-dot loading"></div>
            <div class="sys-mode-text">
              <span class="sys-mode-label">Engine Status</span>
              <span class="sys-mode-value">Checking…</span>
            </div>
          </div>
          <div class="sidebar-profile" id="sidebar-profile"></div>
        </div>
      </aside>
      <div class="main-area">
        <header class="navbar">
          <div class="navbar-left">
            <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu">${icon('menu')}</button>
            <div class="navbar-breadcrumb">
              <span class="navbar-crumb">${pageInfo.crumb}</span>
            </div>
          </div>
          <div class="navbar-center hide-mobile">
            <div class="cmd-search" id="cmd-search">
              ${icon('search')}
              <input type="text" placeholder="Search scans, threats…" id="cmd-search-input" />
              <span class="cmd-search-kbd">Ctrl K</span>
            </div>
          </div>
          <div class="navbar-right" id="navbar-right"></div>
        </header>
        <main class="content" id="page-content"></main>
      </div>
    </div>
  `;
}

export async function mountShellInteractions() {
  const toggle = document.querySelector('#menu-toggle');
  const sidebar = document.querySelector('#sidebar');
  const backdrop = document.querySelector('#sidebar-backdrop');

  function openSidebar() {
    sidebar?.classList.add('open');
    backdrop?.classList.add('show');
  }
  function closeSidebar() {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('show');
  }

  toggle?.addEventListener('click', openSidebar);
  backdrop?.addEventListener('click', closeSidebar);

  sidebar?.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

  // Ctrl+K to focus search
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.querySelector('#cmd-search-input')?.focus();
    }
  });

  // Search → navigate to history on enter
  const searchInput = document.querySelector('#cmd-search-input');
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      history.pushState({}, '', '/history');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  });

  updateShellAuth();

  await fetchSystemStatus();
  updateSidebarStatus();
  updateCmdBarStatus();
}
