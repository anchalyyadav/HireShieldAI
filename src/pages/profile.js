// Page: Profile & Settings
import { icon } from '../js/icons.js';
import { supabase, isSupabaseConfigured } from '../js/supabaseClient.js';
import { getCurrentUser } from '../js/shell.js';

export function profilePage() {
  return {
    onMount(el) {
      const user = getCurrentUser();
      const email = user?.email || 'Not signed in';
      const initial = (email.charAt(0) || '?').toUpperCase();

      el.innerHTML = `
        <div class="page-header">
          <h1>Profile & Settings</h1>
          <p>Manage your account and preferences.</p>
        </div>
        <div class="card-grid card-grid-2">
          <div class="card card-glow">
            <div class="flex items-center gap-2 mb-3">
              <div class="user-avatar" style="width:56px;height:56px;font-size:1.5rem;">${initial}</div>
              <div>
                <div style="font-weight:600;font-size:1.125rem;">${email}</div>
                <div class="text-dim">Student account</div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" type="email" value="${email}" disabled />
            </div>
          </div>
          <div class="card">
            <h3 class="mb-2">Preferences</h3>
            <label class="flex items-center justify-between mb-2" style="cursor:pointer;">
              <span>Email notifications for new scam patterns</span>
              <input type="checkbox" checked disabled />
            </label>
            <label class="flex items-center justify-between mb-2" style="cursor:pointer;">
              <span>Auto-save scans to history</span>
              <input type="checkbox" checked disabled />
            </label>
            <p class="form-hint">More preferences coming soon.</p>
          </div>
        </div>
      `;
    }
  };
}
