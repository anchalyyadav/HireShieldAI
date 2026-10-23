// Page: Threat Analysis Results — advanced SOC-style investigation workspace
import { icon } from '../js/icons.js';
import { supabase, isSupabaseConfigured } from '../js/supabaseClient.js';
import { getCurrentUser, getSystemStatus } from '../js/shell.js';

export function resultsPage() {
  return {
    async onMount(el, path) {
      const id = path.split('/results/')[1] || '';

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

        const status = getSystemStatus();
        renderResults(el, scan, status);
      } catch (err) {
        renderError(el, 'Failed to load results', err.message || 'An unexpected error occurred.');
      }
    }
  };
}

// ---------------------------------------------------------------------------
// Main render
// ---------------------------------------------------------------------------
function renderResults(el, scan, systemStatus) {
  const risk = scan.risk_level || 'medium';
  const label = scan.risk_label || risk.toUpperCase();
  const score = scan.risk_score || 0;
  const signals = scan.red_flags || [];
  const recs = scan.recommendations || [];
  const method = scan.analysis_method || 'unknown';
  const message = scan.message_text || '';
  const created = new Date(scan.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const aiConfigured = systemStatus?.aiConfigured || false;

  // Severity breakdown
  const sevBreakdown = { high: 0, medium: 0, low: 0 };
  signals.forEach(s => { sevBreakdown[s.severity] = (sevBreakdown[s.severity] || 0) + 1; });

  // Method display
  const methodDisplay = method === 'ai' ? 'AI-Based' : method === 'rule-based' ? 'Rule-Based' : method === 'auto' ? 'Combined' : 'Unknown';
  const methodIcon = method === 'ai' ? 'sparkles' : method === 'rule-based' ? 'shield' : 'shieldCheck';

  el.innerHTML = `
    <div class="results-page">

      <!-- Breadcrumb + back -->
      <div class="results-top-bar">
        <div class="results-breadcrumb">
          <a href="/scanner" data-link>AI Threat Analysis</a>
          <span class="results-crumb-sep">/</span>
          <span class="results-crumb-current">Analysis Results</span>
        </div>
        <a href="/scanner" class="btn btn-ghost btn-sm" data-link>${icon('arrowLeft')} Back to Scanner</a>
      </div>

      <!-- Page heading -->
      <div class="results-heading">
        <h1 class="results-page-title">Threat Analysis Results</h1>
        <p class="results-page-sub">Investigate detected signals, understand the evidence, and take informed action.</p>
      </div>

      <!-- ROW 1: Risk overview + metadata + executive summary -->
      <div class="results-row-1">

        <!-- Risk score panel -->
        <div class="results-panel results-risk-panel" data-risk="${risk}">
          <div class="results-panel-head">
            <span class="results-panel-title">${icon('target')} Risk Assessment</span>
          </div>
          <div class="results-risk-body">
            <div class="results-gauge-wrap">
              ${renderGauge(score, risk)}
            </div>
            <div class="results-risk-meta">
              <span class="badge badge-${risk}"><span class="badge-dot"></span>${label} RISK</span>
              <p class="results-risk-explain">${riskExplanation(risk, score)}</p>
            </div>
          </div>
        </div>

        <!-- Scan metadata panel -->
        <div class="results-panel results-meta-panel">
          <div class="results-panel-head">
            <span class="results-panel-title">${icon('fileReport')} Scan Metadata</span>
          </div>
          <div class="results-meta-grid">
            <div class="results-meta-item">
              <span class="results-meta-label">Scan ID</span>
              <span class="results-meta-value" title="${escapeHtml(scan.id || '')}">${scan.id ? truncate(scan.id, 12) : 'N/A'}</span>
            </div>
            <div class="results-meta-item">
              <span class="results-meta-label">Date / Time</span>
              <span class="results-meta-value">${created}</span>
            </div>
            <div class="results-meta-item">
              <span class="results-meta-label">Detection Mode</span>
              <span class="results-meta-value">${icon(methodIcon)} ${methodDisplay}</span>
            </div>
            <div class="results-meta-item">
              <span class="results-meta-label">Analysis Status</span>
              <span class="results-meta-value">${scan.is_preview ? 'Preview Mode' : 'Completed'}</span>
            </div>
            <div class="results-meta-item">
              <span class="results-meta-label">Findings</span>
              <span class="results-meta-value">${signals.length} detected</span>
            </div>
            <div class="results-meta-item">
              <span class="results-meta-label">Message Length</span>
              <span class="results-meta-value">${message.length} chars</span>
            </div>
          </div>
        </div>

        <!-- Executive summary -->
        <div class="results-panel results-summary-panel">
          <div class="results-panel-head">
            <span class="results-panel-title">${icon('chart')} Executive Summary</span>
          </div>
          <p class="results-exec-text">${escapeHtml(scan.summary || 'No summary available.')}</p>
          ${signals.length > 0 ? `
            <div class="results-sev-row">
              ${sevBreakdown.high > 0 ? `<span class="results-sev-chip high">${sevBreakdown.high} High</span>` : ''}
              ${sevBreakdown.medium > 0 ? `<span class="results-sev-chip medium">${sevBreakdown.medium} Medium</span>` : ''}
              ${sevBreakdown.low > 0 ? `<span class="results-sev-chip low">${sevBreakdown.low} Low</span>` : ''}
            </div>` : `
            <div class="results-sev-empty">No findings detected by the analysis engine.</div>`}
          ${scan.is_preview ? '<div class="scan-fallback-note">This analysis was run in preview mode without a configured AI key.</div>' : ''}
        </div>
      </div>

      <!-- ROW 2: Detection Intelligence tabs + findings -->
      <div class="results-row-2">
        <div class="results-panel results-tabs-panel">
          <div class="results-panel-head">
            <span class="results-panel-title">${icon('brain')} Detection Intelligence</span>
          </div>

          <!-- Tab buttons -->
          <div class="results-tabs" role="tablist" id="engine-tabs">
            <button class="results-tab active" role="tab" data-tab="rule" aria-selected="true">${icon('shield')} Rule-Based Engine</button>
            <button class="results-tab" role="tab" data-tab="ai" aria-selected="false">${icon('sparkles')} AI Intelligence</button>
            <button class="results-tab" role="tab" data-tab="combined" aria-selected="false">${icon('shieldCheck')} Combined Intelligence</button>
          </div>

          <!-- Tab content container -->
          <div class="results-tab-content" id="tab-content">
            ${renderRuleTab(signals, message, method)}
          </div>
        </div>

        <!-- Evidence filters + findings -->
        <div class="results-panel results-evidence-panel">
          <div class="results-panel-head">
            <span class="results-panel-title">${icon('fileSearch')} Evidence Investigation</span>
          </div>
          <div class="results-filters" id="evidence-filters">
            <button class="results-filter-btn active" data-filter="all">All Findings</button>
            <button class="results-filter-btn" data-filter="high">Critical / High</button>
            <button class="results-filter-btn" data-filter="medium">Medium</button>
            <button class="results-filter-btn" data-filter="low">Low</button>
            <button class="results-filter-btn" data-filter="rule-based">Rule-Based</button>
            <button class="results-filter-btn" data-filter="ai">AI-Based</button>
          </div>
          <div class="results-evidence-list" id="evidence-list">
            ${renderEvidenceCards(signals, message, 'all')}
          </div>
        </div>
      </div>

      <!-- ROW 3: Original message + recommendations -->
      <div class="results-row-3">
        <div class="results-panel results-msg-panel">
          <div class="results-panel-head">
            <span class="results-panel-title">${icon('clipboard')} Original Message</span>
            <div class="results-panel-actions">
              <button class="btn btn-ghost btn-sm" id="msg-collapse-btn">${icon('chevronDown')} Collapse</button>
              <button class="btn btn-ghost btn-sm" id="copy-msg-btn">${icon('clipboard')} Copy</button>
            </div>
          </div>
          <div class="results-msg-body" id="msg-body">
            <div class="results-message-text">${escapeHtml(message)}</div>
          </div>
        </div>

        <div class="results-panel results-recs-panel">
          <div class="results-panel-head">
            <span class="results-panel-title">${icon('shieldCheck')} Recommended Actions</span>
          </div>
          <div class="results-recs-body">
            ${recs.length > 0 ? `
              <div class="results-recs-section">
                <span class="results-recs-label">Finding-Specific Recommendations</span>
                <ul class="results-rec-list">
                  ${recs.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
                </ul>
              </div>` : `
              <div class="results-recs-empty">No finding-specific recommendations were generated for this scan.</div>`}

            <div class="results-recs-section results-recs-general">
              <span class="results-recs-label">General Safety Advice</span>
              <ul class="results-rec-list">
                <li>Verify the sender through an independent official channel before responding.</li>
                <li>Avoid paying unexpected fees before verifying any offer.</li>
                <li>Never share passwords, OTPs, or banking credentials via messages.</li>
                <li>Avoid opening suspicious links or downloading attachments from unknown senders.</li>
                <li>Report or block suspicious senders through your platform's abuse tools.</li>
              </ul>
            </div>

            <div class="results-disclaimer">
              ${icon('info')}
              <span>This assessment provides risk indicators, not a guarantee that a message is genuine or fraudulent.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom actions -->
      <div class="results-actions">
        <a href="/scanner" class="btn btn-primary" data-link>${icon('scan')} Scan Another Message</a>
        <a href="/history" class="btn btn-secondary" data-link>${icon('history')} View Scan History</a>
      </div>
    </div>
  `;

  wireInteractions(el, signals, message, method, aiConfigured);
}

// ---------------------------------------------------------------------------
// Tab renderers
// ---------------------------------------------------------------------------
function renderRuleTab(signals, message, method) {
  const ruleSignals = signals; // all stored signals are from rule-based currently
  if (ruleSignals.length === 0) {
    return `
      <div class="results-tab-empty">
        <div class="results-tab-empty-icon">${icon('shieldCheck')}</div>
        <h4>No Rule-Based Findings</h4>
        <p>The rule engine did not detect any known scam patterns in this message. This does not guarantee the message is safe — rules only match specific, pre-identified patterns.</p>
      </div>`;
  }
  return `
    <div class="results-tab-body">
      <p class="results-tab-intro">The rule-based engine matched ${ruleSignals.length} pattern${ruleSignals.length !== 1 ? 's' : ''} from a deterministic set of known scam indicators. Each finding includes the matching rule and an evidence excerpt.</p>
      <div class="results-tab-signals">
        ${ruleSignals.map(s => renderRuleFinding(s, message)).join('')}
      </div>
    </div>`;
}

function renderAITab(aiConfigured) {
  if (!aiConfigured) {
    return `
      <div class="results-tab-empty results-ai-unavailable">
        <div class="results-tab-empty-icon">${icon('sparkles')}</div>
        <h4>AI Intelligence Not Available</h4>
        <p>AI-powered analysis requires a server-side API key (OpenAI or Anthropic). The rule-based engine is fully functional without it.</p>
        <div class="results-ai-config-hint">
          ${icon('settings')}
          <span>Configure the AI provider by setting the API key in the server environment to enable contextual interpretation.</span>
        </div>
      </div>`;
  }
  return `
    <div class="results-tab-empty">
      <div class="results-tab-empty-icon">${icon('sparkles')}</div>
      <h4>AI Analysis Not Run for This Scan</h4>
      <p>This scan was processed using the rule-based engine. To get AI intelligence, run a new scan with AI or Auto mode selected.</p>
      <a href="/scanner" class="btn btn-primary btn-sm mt-2" data-link>${icon('scan')} New AI Scan</a>
    </div>`;
}

function renderCombinedTab(signals, method, aiConfigured) {
  const hasAI = method === 'ai' || method === 'auto';
  if (!hasAI || !aiConfigured) {
    return `
      <div class="results-tab-empty">
        <div class="results-tab-empty-icon">${icon('shieldCheck')}</div>
        <h4>Combined Intelligence Unavailable</h4>
        <p>A combined assessment requires results from both the rule-based engine and the AI engine. This scan was processed with only one engine.</p>
        <p class="results-tab-empty-hint">Run a scan in Auto mode with both engines configured to generate a combined assessment.</p>
      </div>`;
  }
  // If we had both, we'd show the overlap — but the current backend only stores one method
  return `
    <div class="results-tab-body">
      <p class="results-tab-intro">This scan was processed with a single detection engine. Combined intelligence requires both engines to have run independently.</p>
      <div class="results-combined-stats">
        <div class="results-combined-stat">
          <span class="results-combined-stat-num">${signals.length}</span>
          <span class="results-combined-stat-label">Total Findings</span>
        </div>
        <div class="results-combined-stat">
          <span class="results-combined-stat-num">—</span>
          <span class="results-combined-stat-label">AI-Only Findings</span>
        </div>
        <div class="results-combined-stat">
          <span class="results-combined-stat-num">—</span>
          <span class="results-combined-stat-label">Rule-Only Findings</span>
        </div>
      </div>
      <p class="results-tab-empty-hint">A combined scoring policy that merges both engines is not yet implemented. Individual findings from each engine are available in their respective tabs.</p>
    </div>`;
}

function renderRuleFinding(signal, message) {
  const severity = signal.severity || 'medium';
  const evidence = extractEvidence(signal, message);
  return `
    <div class="results-tab-finding">
      <div class="results-tab-finding-head">
        <span class="results-tab-finding-dot" style="background:var(--risk-${severity})"></span>
        <span class="results-tab-finding-title">${escapeHtml(signal.title)}</span>
        <span class="results-tab-finding-sev sev-${severity}">${severity.toUpperCase()}</span>
        <span class="results-tab-finding-source">${icon('shield')} Rule-Based</span>
      </div>
      <p class="results-tab-finding-desc">${escapeHtml(signal.description || '')}</p>
      ${evidence ? `<div class="results-tab-finding-evidence">${icon('quote')}<span>${escapeHtml(evidence)}</span></div>` : '<div class="results-tab-finding-evidence contextual">No direct quote available — this finding is based on pattern matching rather than a specific phrase.</div>'}
    </div>`;
}

function renderEvidenceCards(signals, message, filter) {
  const filtered = filterSignals(signals, filter);
  if (filtered.length === 0) {
    return `
      <div class="results-evidence-empty">
        <div class="results-evidence-empty-icon">${icon('fileSearch')}</div>
        <p>No findings match this filter.</p>
      </div>`;
  }
  return filtered.map(s => renderEvidenceCard(s, message)).join('');
}

function renderEvidenceCard(signal, message) {
  const severity = signal.severity || 'medium';
  const evidence = extractEvidence(signal, message);
  return `
    <div class="evidence-card" data-severity="${severity}" data-source="rule-based">
      <button class="evidence-card-head" aria-expanded="false">
        <span class="evidence-card-dot" style="background:var(--risk-${severity})"></span>
        <span class="evidence-card-title">${escapeHtml(signal.title)}</span>
        <span class="evidence-card-sev sev-${severity}">${severity.toUpperCase()}</span>
        <span class="evidence-card-source">${icon('shield')}</span>
        <span class="evidence-card-chevron">${icon('chevronDown')}</span>
      </button>
      <div class="evidence-card-body">
        <div class="evidence-card-section">
          <span class="evidence-card-label">Why this matters</span>
          <p>${escapeHtml(signal.description || '')}</p>
        </div>
        <div class="evidence-card-section">
          <span class="evidence-card-label">Evidence from message</span>
          ${evidence ? `<div class="evidence-card-excerpt">${escapeHtml(evidence)}</div>` : '<p class="evidence-card-contextual">No direct quote — this finding is based on pattern matching rather than a specific phrase.</p>'}
        </div>
        <div class="evidence-card-section">
          <span class="evidence-card-label">Recommended next step</span>
          <p>${escapeHtml(recommendationForSignal(signal))}</p>
        </div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------
function wireInteractions(el, signals, message, method, aiConfigured) {
  // Engine tabs
  const tabs = el.querySelectorAll('.results-tab');
  const tabContent = el.querySelector('#tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const tabKey = tab.dataset.tab;
      if (tabKey === 'rule') tabContent.innerHTML = renderRuleTab(signals, message, method);
      else if (tabKey === 'ai') tabContent.innerHTML = renderAITab(aiConfigured);
      else tabContent.innerHTML = renderCombinedTab(signals, method, aiConfigured);
    });
  });

  // Evidence filters
  const filterBtns = el.querySelectorAll('.results-filter-btn');
  const evidenceList = el.querySelector('#evidence-list');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      evidenceList.innerHTML = renderEvidenceCards(signals, message, btn.dataset.filter);
      wireEvidenceCards(el);
    });
  });

  wireEvidenceCards(el);

  // Copy message
  el.querySelector('#copy-msg-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(message).then(() => {
      const btn = el.querySelector('#copy-msg-btn');
      const orig = btn.innerHTML;
      btn.innerHTML = `${icon('check')} Copied!`;
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    }).catch(() => {});
  });

  // Collapse/expand message
  const msgCollapseBtn = el.querySelector('#msg-collapse-btn');
  const msgBody = el.querySelector('#msg-body');
  msgCollapseBtn?.addEventListener('click', () => {
    const isCollapsed = msgBody.classList.toggle('collapsed');
    msgCollapseBtn.innerHTML = isCollapsed ? `${icon('chevronDown')} Expand` : `${icon('chevronDown')} Collapse`;
  });
}

function wireEvidenceCards(el) {
  el.querySelectorAll('.evidence-card-head').forEach(head => {
    head.addEventListener('click', () => {
      const card = head.closest('.evidence-card');
      const isOpen = card.classList.toggle('open');
      head.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderGauge(score, risk) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const color = riskColor(risk);
  return `
    <svg class="results-gauge" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r="${radius}" fill="none" stroke="var(--border-strong)" stroke-width="7"/>
      <circle cx="65" cy="65" r="${radius}" fill="none" stroke="${color}" stroke-width="7"
        stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
        stroke-linecap="round" transform="rotate(-90 65 65)"
        style="transition: stroke-dashoffset 1s ease; filter: drop-shadow(0 0 6px ${color});"/>
      <text x="65" y="70" text-anchor="middle" font-size="28" font-weight="800" fill="var(--text)">${score}</text>
      <text x="65" y="86" text-anchor="middle" font-size="10" fill="var(--text-dim)" font-weight="600">/ 100</text>
    </svg>
  `;
}

function riskColor(risk) {
  if (risk === 'high') return 'var(--risk-high)';
  if (risk === 'medium') return 'var(--risk-medium)';
  return 'var(--risk-low)';
}

function riskExplanation(risk, score) {
  if (risk === 'high') return `A risk score of ${score}/100 indicates strong scam patterns were detected. Exercise heightened caution and do not share any personal or financial information.`;
  if (risk === 'medium') return `A risk score of ${score}/100 suggests some concerning patterns. Verify the sender through official channels before taking any action.`;
  return `A risk score of ${score}/100 indicates minimal known scam patterns. This does not guarantee safety — always verify through official channels.`;
}

function extractEvidence(signal, message) {
  if (!message || !signal.title) return '';
  const keywords = signal.title.toLowerCase().split(/\s+/).filter(k => k.length > 4).slice(0, 2);
  for (const kw of keywords) {
    const idx = message.toLowerCase().indexOf(kw);
    if (idx >= 0) {
      const start = Math.max(0, idx - 35);
      const end = Math.min(message.length, idx + kw.length + 35);
      let snippet = message.substring(start, end).trim();
      if (start > 0) snippet = '...' + snippet;
      if (end < message.length) snippet = snippet + '...';
      return snippet;
    }
  }
  return '';
}

function recommendationForSignal(signal) {
  const id = signal.id || signal.title?.toLowerCase() || '';
  if (id.includes('payment') || id.includes('fee')) return 'Never pay any fee to secure a job or internship. Legitimate employers do not charge candidates.';
  if (id.includes('bank')) return 'Do not share bank or financial details until you have independently verified the employer.';
  if (id.includes('personal') || id.includes('info')) return 'Do not share ID documents, passport, or sensitive personal information through messages.';
  if (id.includes('urgency')) return 'Take your time. Legitimate recruiters will not pressure you to respond within hours.';
  if (id.includes('link')) return 'Do not open suspicious or shortened links. Verify the destination independently.';
  if (id.includes('email') || id.includes('recruiter')) return 'Verify the recruiter through the company\'s official website or LinkedIn.';
  if (id.includes('guaranteed') || id.includes('offer')) return 'Be skeptical of guaranteed offers with no interview or application process.';
  if (id.includes('whatsapp') || id.includes('telegram')) return 'Be cautious of requests to move off-platform. Legitimate recruiters use official channels.';
  return 'Verify this independently through official channels before taking any action.';
}

function filterSignals(signals, filter) {
  if (filter === 'all') return signals;
  if (filter === 'high') return signals.filter(s => s.severity === 'high');
  if (filter === 'medium') return signals.filter(s => s.severity === 'medium');
  if (filter === 'low') return signals.filter(s => s.severity === 'low');
  if (filter === 'rule-based') return signals; // all current signals are rule-based
  if (filter === 'ai') return []; // no AI signals stored yet
  return signals;
}

function truncate(str, maxLen) {
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
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
