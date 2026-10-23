// Page: Analysis Results — display detailed analysis for a specific scan
import { icon } from '../js/icons.js';
import { supabase, isSupabaseConfigured } from '../js/supabaseClient.js';
import { getCurrentUser } from '../js/shell.js';

export function resultsPage() {
  return {
    async onMount(el, path) {
      const id = path.split('/results/')[1] || '';

      // Loading state
      el.innerHTML = `
        <div class="results-page">
          <div class="results-back">
            <a href="/scanner" class="btn btn-ghost btn-sm" data-link>${icon('arrowLeft')} Back to Scanner</a>
          </div>
          <div class="card card-glow results-loading">
            <div class="spinner" style="margin:0 auto 16px;"></div>
            <p class="text-muted">Loading analysis results...</p>
          </div>
        </div>
      `;

      if (!isSupabaseConfigured || !id) {
        renderError(el, 'Results unavailable', 'Database is not configured or no scan ID was provided.');
        return;
      }

      const user = getCurrentUser();
      if (!user) {
        renderError(el, 'Sign in required', 'Please sign in to view your analysis results.');
        return;
      }

      try {
        const { data: scan, error } = await supabase
          .from('scans')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!scan) {
          renderError(el, 'Scan not found', 'This scan may have been deleted or does not belong to your account.');
          return;
        }

        renderResults(el, scan);
      } catch (err) {
        renderError(el, 'Failed to load results', err.message || 'An unexpected error occurred.');
      }
    }
  };
}

function renderResults(el, scan) {
  const risk = scan.risk_level || 'medium';
  const label = scan.risk_label || risk.toUpperCase();
  const score = scan.risk_score || 0;
  const signals = scan.red_flags || [];
  const recs = scan.recommendations || [];
  const method = scan.analysis_method || 'unknown';
  const methodLabel = method === 'ai' ? 'AI Analysis' : method === 'rule-based' ? 'Rule-Based Analysis' : method === 'auto' ? 'Auto Analysis' : 'Analysis';
  const message = scan.message_text || '';
  const created = new Date(scan.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  el.innerHTML = `
    <div class="results-page">
      <!-- Back link -->
      <div class="results-back">
        <a href="/scanner" class="btn btn-ghost btn-sm" data-link>${icon('arrowLeft')} Back to Scanner</a>
        <a href="/history" class="btn btn-ghost btn-sm" data-link>${icon('history')} View All Scans</a>
      </div>

      <!-- Result header -->
      <div class="results-hero" data-risk="${risk}">
        <div class="results-hero-left">
          <div class="results-hero-badge">
            <span class="badge badge-${risk}"><span class="badge-dot"></span>${label} RISK</span>
            <span class="scan-method-tag">${icon(method === 'ai' ? 'sparkles' : 'shield')} ${methodLabel}</span>
          </div>
          <h1 class="results-hero-title">Analysis Report</h1>
          <p class="results-hero-date">${icon('clock')} ${created}</p>
          <p class="results-hero-score-label">Risk Score</p>
          <div class="results-hero-score">
            <span class="results-score-num" style="color:var(--risk-${risk})">${score}</span>
            <span class="results-score-max">/ 100</span>
          </div>
        </div>
        <div class="results-hero-gauge">
          ${renderGauge(score, risk)}
        </div>
      </div>

      <!-- Main content grid -->
      <div class="results-grid">

        <!-- Summary -->
        <div class="card results-summary-card">
          <div class="card-header">
            <span class="card-title">${icon('fileReport')} Analysis Summary</span>
          </div>
          <p class="results-summary-text">${escapeHtml(scan.summary || 'No summary available.')}</p>
          ${scan.is_preview ? '<div class="scan-fallback-note">This analysis was run in preview mode without a configured AI key.</div>' : ''}
        </div>

        <!-- Warning signs -->
        ${signals.length > 0 ? `
          <div class="card results-signals-card">
            <div class="card-header">
              <span class="card-title">${icon('alert')} Detected Warning Signs (${signals.length})</span>
            </div>
            <div class="scan-signals">
              ${signals.map(s => renderSignalItem(s, message)).join('')}
            </div>
          </div>` : `
          <div class="card results-signals-card">
            <div class="card-header">
              <span class="card-title">${icon('shieldCheck')} No Warning Signs Detected</span>
            </div>
            <p class="text-muted">No explicit scam signals were detected by the analysis engine. This does not guarantee the message is safe — always verify through official channels.</p>
          </div>`}

        <!-- Recommendations -->
        ${recs.length > 0 ? `
          <div class="card results-recs-card">
            <div class="card-header">
              <span class="card-title">${icon('shieldCheck')} Recommended Next Steps</span>
            </div>
            <ul class="scan-rec-list results-rec-list">
              ${recs.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
            </ul>
          </div>` : ''}

        <!-- Original message -->
        <div class="card results-message-card">
          <div class="card-header">
            <span class="card-title">${icon('clipboard')} Original Message</span>
            <button class="btn btn-ghost btn-sm" id="copy-msg-btn">${icon('clipboard')} Copy</button>
          </div>
          <div class="results-message-text">${escapeHtml(message)}</div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="results-disclaimer">
        ${icon('info')}
        <span>This assessment is advisory and cannot guarantee whether a message is genuine. Always verify through official channels before sharing personal information or making payments. If you suspect fraud, report it to the appropriate authorities.</span>
      </div>

      <!-- Actions -->
      <div class="results-actions">
        <a href="/scanner" class="btn btn-primary" data-link>${icon('scan')} Scan Another Message</a>
        <a href="/history" class="btn btn-secondary" data-link>${icon('history')} View Scan History</a>
      </div>
    </div>
  `;

  // Copy message button
  el.querySelector('#copy-msg-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(message).then(() => {
      const btn = el.querySelector('#copy-msg-btn');
      const orig = btn.innerHTML;
      btn.innerHTML = `${icon('check')} Copied!`;
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    }).catch(() => {});
  });
}

function renderGauge(score, risk) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const color = risk === 'high' ? 'var(--risk-high)' : risk === 'medium' ? 'var(--risk-medium)' : 'var(--risk-low)';

  return `
    <svg class="results-gauge" viewBox="0 0 150 150">
      <circle cx="75" cy="75" r="${radius}" fill="none" stroke="var(--border-strong)" stroke-width="8"/>
      <circle cx="75" cy="75" r="${radius}" fill="none" stroke="${color}" stroke-width="8"
        stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
        stroke-linecap="round" transform="rotate(-90 75 75)"
        style="transition: stroke-dashoffset 1s ease; filter: drop-shadow(0 0 8px ${color});"/>
      <text x="75" y="78" text-anchor="middle" font-size="32" font-weight="800" fill="var(--text)">${score}</text>
      <text x="75" y="96" text-anchor="middle" font-size="11" fill="var(--text-dim)" font-weight="600">/ 100</text>
    </svg>
  `;
}

function renderSignalItem(signal, originalMessage) {
  const severity = signal.severity || 'medium';
  let evidenceSnippet = '';
  if (originalMessage && signal.title) {
    const keywords = signal.title.toLowerCase().split(/\s+/).filter(k => k.length > 4).slice(0, 2);
    for (const kw of keywords) {
      const idx = originalMessage.toLowerCase().indexOf(kw);
      if (idx >= 0) {
        const start = Math.max(0, idx - 30);
        const end = Math.min(originalMessage.length, idx + kw.length + 30);
        evidenceSnippet = originalMessage.substring(start, end).trim();
        if (start > 0) evidenceSnippet = '...' + evidenceSnippet;
        if (end < originalMessage.length) evidenceSnippet = evidenceSnippet + '...';
        break;
      }
    }
  }

  return `
    <div class="scan-signal-item">
      <div class="scan-signal-dot" style="background:var(--risk-${severity})"></div>
      <div class="scan-signal-body">
        <div class="scan-signal-title">${escapeHtml(signal.title)}</div>
        <div class="scan-signal-desc">${escapeHtml(signal.description || '')}</div>
        ${evidenceSnippet ? `<div class="scan-signal-evidence">${icon('quote')}<span>${escapeHtml(evidenceSnippet)}</span></div>` : ''}
      </div>
    </div>
  `;
}

function renderError(el, title, msg) {
  el.innerHTML = `
    <div class="results-page">
      <div class="results-back">
        <a href="/scanner" class="btn btn-ghost btn-sm" data-link>${icon('arrowLeft')} Back to Scanner</a>
      </div>
      <div class="card results-error-card">
        <div class="results-error-icon">${icon('alert')}</div>
        <h3>${escapeHtml(title)}</h3>
        <p class="text-muted">${escapeHtml(msg)}</p>
        <a href="/scanner" class="btn btn-primary mt-2" data-link>${icon('scan')} Scan a Message</a>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
