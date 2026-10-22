// Page: Dashboard — SachetAI Cybersecurity Intelligence Platform
// Hero radar + metrics + analytics timeline + threat feed + scan table + AI insights
import { icon } from '../js/icons.js';
import { supabase, isSupabaseConfigured } from '../js/supabaseClient.js';
import { getCurrentUser, getSystemStatus } from '../js/shell.js';

export function dashboardPage() {
  return {
    async onMount(el) {
      const user = getCurrentUser();
      const status = getSystemStatus();
      const aiAvailable = status?.aiConfigured || false;
      const ruleAvailable = status?.ruleEngine !== false;
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Operator';

      // Status pill
      let pillText, pillClass;
      if (aiAvailable && ruleAvailable) { pillText = 'AI + Rule Engine Active'; pillClass = 'pill-active'; }
      else if (ruleAvailable) { pillText = 'Rule Engine Active'; pillClass = 'pill-active'; }
      else { pillText = 'Engine: Not Verified'; pillClass = 'pill-pending'; }

      el.innerHTML = `
        <div class="soc-page">

          <!-- ===== HERO SECTION ===== -->
          <div class="soc-hero">
            <div class="soc-hero-left">
              <div class="soc-hero-greeting">${greeting}, ${escapeHtml(displayName)}</div>
              <h1 class="soc-hero-title">Security Operations Center</h1>
              <p class="soc-hero-sub">AI-powered job and internship scam detection. Monitor threats, analyze suspicious messages, and protect yourself from recruitment fraud.</p>
              <div class="soc-hero-actions">
                <a href="/scanner" class="btn btn-primary btn-lg" data-link>${icon('scan')} Start New Scan</a>
                <a href="/history" class="btn btn-secondary btn-lg" data-link>${icon('history')} View Scan History</a>
              </div>
              <div class="soc-hero-mode">
                <span class="soc-mode-pill ${aiAvailable ? 'on' : 'off'}">${icon('sparkles')} AI <em>${aiAvailable ? 'Available' : 'Unavailable'}</em></span>
                <span class="soc-mode-pill ${ruleAvailable ? 'on' : 'off'}">${icon('shield')} Rule-Based <em>${ruleAvailable ? 'Available' : 'Unavailable'}</em></span>
              </div>
            </div>
            <div class="soc-hero-radar" id="hero-radar">
              <div class="soc-radar-rings">
                <div class="soc-radar-ring r1"></div>
                <div class="soc-radar-ring r2"></div>
                <div class="soc-radar-ring r3"></div>
              </div>
              <div class="soc-radar-sweep"></div>
              <div class="soc-radar-grid"></div>
              <div class="soc-radar-center">${icon('shieldCheck')}</div>
              <div class="soc-radar-blips" id="radar-blips"></div>
              <div class="soc-radar-label">THREAT RADAR</div>
            </div>
          </div>

          <!-- ===== METRICS ROW ===== -->
          <div class="soc-metrics" id="soc-metrics">
            <div class="soc-metric" id="metric-total">
              <div class="soc-metric-icon" style="color:var(--blue);background:var(--blue-soft)">${icon('fileSearch')}</div>
              <div class="soc-metric-body">
                <span class="soc-metric-label">TOTAL SCANS</span>
                <span class="soc-metric-value" id="m-total"><span class="skeleton"></span></span>
              </div>
              <div class="soc-metric-trend" id="m-total-trend"></div>
            </div>
            <div class="soc-metric" id="metric-threats">
              <div class="soc-metric-icon" style="color:var(--risk-high);background:var(--risk-high-soft)">${icon('alert')}</div>
              <div class="soc-metric-body">
                <span class="soc-metric-label">THREATS DETECTED</span>
                <span class="soc-metric-value" id="m-threats"><span class="skeleton"></span></span>
              </div>
              <div class="soc-metric-trend" id="m-threats-trend"></div>
            </div>
            <div class="soc-metric" id="metric-high">
              <div class="soc-metric-icon" style="color:var(--risk-medium);background:var(--risk-medium-soft)">${icon('flag')}</div>
              <div class="soc-metric-body">
                <span class="soc-metric-label">HIGH-RISK FINDINGS</span>
                <span class="soc-metric-value" id="m-high"><span class="skeleton"></span></span>
              </div>
              <div class="soc-metric-trend" id="m-high-trend"></div>
            </div>
            <div class="soc-metric" id="metric-last">
              <div class="soc-metric-icon" style="color:var(--purple);background:var(--purple-soft)">${icon('clock')}</div>
              <div class="soc-metric-body">
                <span class="soc-metric-label">LAST SCAN</span>
                <span class="soc-metric-value sm" id="m-last"><span class="skeleton"></span></span>
              </div>
              <div class="soc-metric-trend" id="m-last-trend"></div>
            </div>
          </div>

          <!-- ===== ANALYTICS SECTION ===== -->
          <div class="soc-analytics-section">
            <div class="soc-panel-head">
              <div class="soc-panel-title-row">
                <h2 class="soc-panel-title">${icon('activity')} Threat Activity Timeline</h2>
                <span class="soc-status-pill ${pillClass}"><span class="soc-pill-dot"></span>${pillText}</span>
              </div>
              <div class="soc-tf-group" id="analytics-tf">
                <button class="soc-tf-btn active" data-tf="all">All Time</button>
                <button class="soc-tf-btn" data-tf="30">30D</button>
                <button class="soc-tf-btn" data-tf="7">7D</button>
              </div>
            </div>
            <div class="soc-analytics-body" id="analytics-body">
              <div class="soc-loading-inline"><div class="spinner" style="width:28px;height:28px;border-width:2px;"></div><span>Loading analytics…</span></div>
            </div>
          </div>

          <!-- ===== INTELLIGENCE FEED + AI INSIGHTS ===== -->
          <div class="soc-intel-grid">

            <!-- Threat Intelligence Feed -->
            <div class="soc-intel-panel">
              <div class="soc-panel-head">
                <h2 class="soc-panel-title">${icon('radar')} Threat Intelligence Feed</h2>
              </div>
              <div class="soc-feed-body" id="feed-body">
                <div class="soc-loading-inline"><div class="spinner" style="width:24px;height:24px;border-width:2px;"></div><span>Loading feed…</span></div>
              </div>
            </div>

            <!-- AI Insights Panel -->
            <div class="soc-ai-panel">
              <div class="soc-ai-panel-head">
                <div class="soc-ai-badge">${icon('brain')} AI INSIGHTS</div>
              </div>
              <div class="soc-ai-body" id="ai-insights-body">
                <div class="soc-loading-inline"><div class="spinner" style="width:24px;height:24px;border-width:2px;"></div><span>Loading insights…</span></div>
              </div>
            </div>
          </div>

          <!-- ===== RECENT SCANS TABLE ===== -->
          <div class="soc-scans-section">
            <div class="soc-panel-head">
              <h2 class="soc-panel-title">${icon('history')} Recent Scans</h2>
              <div class="soc-scans-controls">
                <select class="soc-filter-select" id="scan-filter">
                  <option value="all">All Risk Levels</option>
                  <option value="high">High Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="low">Low Risk</option>
                </select>
                <a href="/history" class="btn btn-ghost btn-sm" data-link>View All</a>
              </div>
            </div>
            <div class="soc-scans-table" id="scans-table">
              <div class="soc-loading-inline"><div class="spinner" style="width:28px;height:28px;border-width:2px;"></div><span>Loading scans…</span></div>
            </div>
          </div>

        </div>
      `;

      // Render radar blips (static decorative — animated by CSS)
      renderRadarBlips();

      // ---- Load data ----
      if (!isSupabaseConfigured || !user) {
        const errMsg = !isSupabaseConfigured ? 'Database not configured' : 'No authenticated user';
        renderMetrics(el, { error: errMsg });
        renderAnalytics(el, { error: errMsg });
        renderFeed(el, { error: errMsg });
        renderAIInsights(el, { error: errMsg, aiAvailable });
        renderScansTable(el, { error: errMsg });
        return;
      }

      try {
        const { data: allScans, error } = await supabase
          .from('scans')
          .select('id, risk_level, risk_score, risk_label, summary, message_text, analysis_method, red_flags, recommendations, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const scans = allScans || [];
        const total = scans.length;
        const high = scans.filter(s => s.risk_level === 'high').length;
        const medium = scans.filter(s => s.risk_level === 'medium').length;
        const low = scans.filter(s => s.risk_level === 'low').length;
        const threats = high + medium;
        const lastScan = scans[0] || null;

        renderMetrics(el, { total, threats, high, lastScan });
        renderAnalytics(el, { scans });
        renderFeed(el, { scans: scans.slice(0, 6) });
        renderAIInsights(el, { scans, aiAvailable });
        renderScansTable(el, { scans: scans.slice(0, 8) });

        // Timeframe + filter handlers
        el.querySelectorAll('.soc-tf-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            el.querySelectorAll('.soc-tf-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filtered = filterByTimeframe(scans, btn.dataset.tf);
            renderAnalytics(el, { scans: filtered });
          });
        });

        el.querySelector('#scan-filter')?.addEventListener('change', (e) => {
          const filter = e.target.value;
          const filtered = filter === 'all' ? scans.slice(0, 8) : scans.filter(s => s.risk_level === filter).slice(0, 8);
          renderScansTable(el, { scans: filtered });
        });
      } catch (err) {
        const msg = err.message || 'Failed to load';
        renderMetrics(el, { error: msg });
        renderAnalytics(el, { error: msg });
        renderFeed(el, { error: msg });
        renderAIInsights(el, { error: msg, aiAvailable });
        renderScansTable(el, { error: msg });
      }
    }
  };
}

// --- Radar blips — decorative animation ---
function renderRadarBlips() {
  const container = document.getElementById('radar-blips');
  if (!container) return;
  const blips = [
    { angle: 35, dist: 60, color: 'var(--risk-high)', delay: 0 },
    { angle: 120, dist: 40, color: 'var(--risk-medium)', delay: 1.5 },
    { angle: 200, dist: 70, color: 'var(--blue)', delay: 0.8 },
    { angle: 280, dist: 50, color: 'var(--risk-low)', delay: 2.2 },
    { angle: 70, dist: 80, color: 'var(--risk-medium)', delay: 3 },
    { angle: 160, dist: 55, color: 'var(--risk-high)', delay: 1.2 },
  ];
  container.innerHTML = blips.map(b => {
    const rad = (b.angle * Math.PI) / 180;
    const x = 50 + Math.cos(rad) * b.dist * 0.4;
    const y = 50 + Math.sin(rad) * b.dist * 0.4;
    return `<div class="soc-radar-blip" style="left:${x}%;top:${y}%;background:${b.color};box-shadow:0 0 8px ${b.color};animation-delay:${b.delay}s" title="Threat indicator"></div>`;
  }).join('');
}

function filterByTimeframe(scans, tf) {
  if (tf === 'all') return scans;
  const days = parseInt(tf, 10);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return scans.filter(s => new Date(s.created_at) >= cutoff);
}

// --- Metrics ---
function renderMetrics(el, result) {
  if (result.error) {
    ['m-total', 'm-threats', 'm-high', 'm-last'].forEach(id => {
      el.querySelector('#' + id).textContent = '—';
    });
    return;
  }

  el.querySelector('#m-total').textContent = result.total;
  el.querySelector('#m-threats').textContent = result.threats;
  el.querySelector('#m-high').textContent = result.high;
  el.querySelector('#m-last').textContent = result.lastScan
    ? new Date(result.lastScan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'None';

  // Trend mini-sparks
  el.querySelector('#m-total-trend').innerHTML = result.total > 0 ? renderMiniSpark([0, 1, 0, 2, 1, 3, 2, result.total > 5 ? 5 : result.total], 'var(--blue)') : '';
  el.querySelector('#m-threats-trend').innerHTML = result.threats > 0 ? renderMiniSpark([0, 0, 1, 0, 1, 2, 1, result.threats], 'var(--risk-high)') : '';
  el.querySelector('#m-high-trend').innerHTML = result.high > 0 ? renderMiniSpark([0, 0, 0, 1, 0, 1, 0, result.high], 'var(--risk-medium)') : '';
  el.querySelector('#m-last-trend').innerHTML = result.lastScan ? `<span class="soc-metric-status">Active</span>` : '';
}

function renderMiniSpark(data, color) {
  const max = Math.max(...data, 1);
  const w = 60, h = 24;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
  return `<svg class="soc-mini-spark" viewBox="0 0 ${w} ${h}"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// --- Analytics (timeline + severity distribution + activity bars) ---
function renderAnalytics(el, result) {
  const body = el.querySelector('#analytics-body');

  if (result.error) {
    body.innerHTML = `<div class="soc-viz-empty">${icon('alert')}<p>${escapeHtml(result.error)}</p></div>`;
    return;
  }

  const scans = result.scans || [];

  if (scans.length === 0) {
    body.innerHTML = `
      <div class="soc-viz-empty">
        <div class="soc-viz-empty-orb">${icon('chart')}</div>
        <h3>No analytics data yet</h3>
        <p>Run your first scan to see threat activity timelines and severity breakdowns here.</p>
        <a href="/scanner" class="btn btn-primary btn-sm" data-link>${icon('scan')} Start New Scan</a>
      </div>`;
    return;
  }

  // Severity distribution
  const high = scans.filter(s => s.risk_level === 'high').length;
  const medium = scans.filter(s => s.risk_level === 'medium').length;
  const low = scans.filter(s => s.risk_level === 'low').length;
  const total = scans.length;
  const maxSev = Math.max(high, medium, low, 1);

  // Activity over time (last 14 days)
  const dayMap = {};
  scans.forEach(s => {
    const d = new Date(s.created_at).toISOString().split('T')[0];
    dayMap[d] = (dayMap[d] || 0) + 1;
  });
  const dayCount = 14;
  const chartDays = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    chartDays.push({ key, count: dayMap[key] || 0, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
  }
  const maxActivity = Math.max(...chartDays.map(d => d.count), 1);

  body.innerHTML = `
    <div class="soc-analytics-grid">
      <!-- Severity distribution -->
      <div class="soc-severity-panel">
        <div class="soc-sub-label">SEVERITY DISTRIBUTION</div>
        <div class="soc-sev-bars">
          <div class="soc-sev-row">
            <span class="soc-sev-label" style="color:var(--risk-high)">HIGH</span>
            <div class="soc-sev-track"><div class="soc-sev-fill" style="width:${(high/maxSev)*100}%;background:var(--risk-high);box-shadow:0 0 8px var(--risk-high-soft)"></div></div>
            <span class="soc-sev-num">${high}</span>
          </div>
          <div class="soc-sev-row">
            <span class="soc-sev-label" style="color:var(--risk-medium)">MED</span>
            <div class="soc-sev-track"><div class="soc-sev-fill" style="width:${(medium/maxSev)*100}%;background:var(--risk-medium);box-shadow:0 0 8px var(--risk-medium-soft)"></div></div>
            <span class="soc-sev-num">${medium}</span>
          </div>
          <div class="soc-sev-row">
            <span class="soc-sev-label" style="color:var(--blue)">LOW</span>
            <div class="soc-sev-track"><div class="soc-sev-fill" style="width:${(low/maxSev)*100}%;background:var(--blue);box-shadow:0 0 8px var(--blue-soft)"></div></div>
            <span class="soc-sev-num">${low}</span>
          </div>
        </div>
        <div class="soc-sev-total">
          <span class="soc-sev-total-num">${total}</span>
          <span class="soc-sev-total-label">total analyses</span>
        </div>
      </div>

      <!-- Activity bar chart -->
      <div class="soc-activity-panel">
        <div class="soc-sub-label">SCAN ACTIVITY (14 DAYS)</div>
        <div class="soc-activity-chart">
          ${chartDays.map(d => `
            <div class="soc-act-col" title="${d.label}: ${d.count} scan${d.count !== 1 ? 's' : ''}">
              <div class="soc-act-bar-wrap">
                <div class="soc-act-bar ${d.count > 0 ? 'active' : ''}" style="height:${(d.count/maxActivity)*100}%"></div>
              </div>
              <span class="soc-act-val">${d.count > 0 ? d.count : ''}</span>
              <span class="soc-act-label">${d.label.split(' ')[1] || d.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="soc-analytics-explain">Threat severity distribution and daily scan activity for your account. Bars represent the number of messages analyzed per day. Filter by time range above.</div>
  `;
}

// --- Threat Intelligence Feed ---
function renderFeed(el, result) {
  const body = el.querySelector('#feed-body');

  if (result.error) {
    body.innerHTML = `<div class="soc-viz-empty sm">${icon('alert')}<p>${escapeHtml(result.error)}</p></div>`;
    return;
  }

  const scans = result.scans || [];

  if (scans.length === 0) {
    body.innerHTML = `
      <div class="soc-feed-empty">
        <div class="soc-feed-empty-icon">${icon('radar')}</div>
        <h3>No threats detected yet</h3>
        <p>Your intelligence feed is empty. Start scanning to build your threat profile.</p>
        <a href="/scanner" class="btn btn-primary btn-sm" data-link>${icon('scan')} Start New Scan</a>
      </div>`;
    return;
  }

  body.innerHTML = `
    <div class="soc-feed-timeline">
      ${scans.map(scan => {
        const preview = (scan.message_text || '').slice(0, 60);
        const truncated = scan.message_text && scan.message_text.length > 60 ? '…' : '';
        const date = new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const risk = scan.risk_level || 'medium';
        const label = scan.risk_label || risk.toUpperCase();
        const method = scan.analysis_method === 'ai' ? 'AI' : scan.analysis_method === 'rule-based' ? 'Rule' : '—';

        return `
          <a href="/results/${scan.id}" class="soc-feed-item" data-link>
            <div class="soc-feed-dot risk-${risk}"></div>
            <div class="soc-feed-line"></div>
            <div class="soc-feed-content">
              <div class="soc-feed-preview">${escapeHtml(preview)}${truncated}</div>
              <div class="soc-feed-meta">
                <span class="soc-feed-sev ${risk}">${label} RISK</span>
                <span class="soc-feed-method">${method}</span>
                <span class="soc-feed-time">${date}</span>
              </div>
            </div>
          </a>`;
      }).join('')}
    </div>`;
}

// --- AI Insights Panel ---
function renderAIInsights(el, result) {
  const body = el.querySelector('#ai-insights-body');

  if (result.error) {
    body.innerHTML = `<div class="soc-ai-empty"><p>${escapeHtml(result.error)}</p></div>`;
    return;
  }

  const scans = result.scans || [];
  const aiAvailable = result.aiAvailable;

  if (!aiAvailable) {
    body.innerHTML = `
      <div class="soc-ai-empty">
        <div class="soc-ai-empty-icon">${icon('brain')}</div>
        <h3>AI Analysis Not Configured</h3>
        <p>AI-powered insights require a server-side API key. Rule-based analysis is still available and detects explicit scam indicators.</p>
        <a href="/scanner" class="btn btn-secondary btn-sm" data-link>${icon('shield')} Use Rule-Based Scan</a>
      </div>`;
    return;
  }

  if (scans.length === 0) {
    body.innerHTML = `
      <div class="soc-ai-empty">
        <div class="soc-ai-empty-icon">${icon('brain')}</div>
        <h3>No insights yet</h3>
        <p>Run a scan to receive AI-generated threat analysis and recommendations.</p>
        <a href="/scanner" class="btn btn-primary btn-sm" data-link>${icon('scan')} Start New Scan</a>
      </div>`;
    return;
  }

  // Find the most recent AI scan, or fall back to latest scan with a note
  const aiScans = scans.filter(s => s.analysis_method === 'ai');
  const latestScan = aiScans[0] || scans[0];
  const isAI = latestScan.analysis_method === 'ai';

  const risk = latestScan.risk_level || 'medium';
  const label = latestScan.risk_label || risk.toUpperCase();
  const summary = latestScan.summary || 'No summary available.';
  const redFlags = latestScan.red_flags || [];
  const recs = latestScan.recommendations || [];

  body.innerHTML = `
    <div class="soc-ai-finding">
      <div class="soc-ai-finding-head">
        <span class="soc-ai-sev-badge ${risk}">${label} RISK</span>
        <span class="soc-ai-method-tag">${isAI ? icon('sparkles') + ' AI Analysis' : icon('shield') + ' Rule-Based'}</span>
      </div>
      <div class="soc-ai-finding-title">Latest Analysis Result</div>
      <p class="soc-ai-finding-summary">${escapeHtml(summary)}</p>
      ${redFlags.length > 0 ? `
        <div class="soc-ai-evidence">
          <div class="soc-ai-evidence-label">Key Findings</div>
          ${redFlags.slice(0, 3).map(f => `
            <div class="soc-ai-evidence-item">
              <span class="soc-ai-evidence-dot" style="background:var(--risk-${f.severity || 'medium'})"></span>
              <span>${escapeHtml(f.title)}</span>
            </div>`).join('')}
        </div>` : ''}
      ${recs.length > 0 ? `
        <div class="soc-ai-recs">
          <div class="soc-ai-evidence-label">Recommended Next Steps</div>
          <ul class="soc-ai-rec-list">
            ${recs.slice(0, 3).map(r => `<li>${escapeHtml(r)}</li>`).join('')}
          </ul>
        </div>` : ''}
      <a href="/results/${latestScan.id}" class="btn btn-secondary btn-sm btn-block" data-link>View Full Analysis</a>
    </div>`;
}

// --- Recent Scans Table ---
function renderScansTable(el, result) {
  const body = el.querySelector('#scans-table');

  if (result.error) {
    body.innerHTML = `<div class="soc-viz-empty">${icon('alert')}<p>${escapeHtml(result.error)}</p></div>`;
    return;
  }

  const scans = result.scans || [];

  if (scans.length === 0) {
    body.innerHTML = `
      <div class="soc-viz-empty">
        <div class="soc-viz-empty-orb">${icon('history')}</div>
        <h3>No scans recorded</h3>
        <p>Your scan history will appear here once you start analyzing messages.</p>
        <a href="/scanner" class="btn btn-primary btn-sm" data-link>${icon('scan')} Start New Scan</a>
      </div>`;
    return;
  }

  body.innerHTML = `
    <div class="soc-table">
      <div class="soc-table-thead">
        <span class="soc-th-target">Target / Message</span>
        <span class="soc-th-type">Type</span>
        <span class="soc-th-risk">Risk Level</span>
        <span class="soc-th-date">Date</span>
        <span class="soc-th-status">Status</span>
        <span class="soc-th-action"></span>
      </div>
      ${scans.map(scan => {
        const preview = (scan.message_text || '').slice(0, 50);
        const truncated = scan.message_text && scan.message_text.length > 50 ? '…' : '';
        const date = new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const risk = scan.risk_level || 'medium';
        const label = scan.risk_label || risk.toUpperCase();
        const method = scan.analysis_method || 'unknown';
        const typeLabel = method === 'ai' ? 'AI Analysis' : method === 'rule-based' ? 'Manual Scan' : 'Unknown';
        const statusLabel = risk === 'high' ? 'Flagged' : risk === 'medium' ? 'Review' : 'Cleared';

        return `
          <div class="soc-table-row">
            <span class="soc-td-target">${escapeHtml(preview)}${truncated}</span>
            <span class="soc-td-type"><span class="soc-type-tag ${method === 'ai' ? 'ai' : 'rule'}">${typeLabel}</span></span>
            <span class="soc-td-risk"><span class="badge badge-${risk}"><span class="badge-dot"></span>${label}</span></span>
            <span class="soc-td-date">${date}</span>
            <span class="soc-td-status"><span class="soc-status-tag ${risk}">${statusLabel}</span></span>
            <span class="soc-td-action"><a href="/results/${scan.id}" class="btn btn-ghost btn-sm" data-link>View Details</a></span>
          </div>`;
      }).join('')}
    </div>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
