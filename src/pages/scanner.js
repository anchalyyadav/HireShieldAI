// Page: AI Message Scanner — premium scan interface
import { icon } from '../js/icons.js';
import { toast } from '../js/toast.js';
import { supabase, isSupabaseConfigured } from '../js/supabaseClient.js';
import { getCurrentUser, getSystemStatus } from '../js/shell.js';
import { saveScanResult } from '../js/scanState.js';

const SAMPLE_MESSAGE = `Congratulations! You have been selected for a remote internship at TechVision Solutions with a guaranteed ₹45,000 monthly stipend. Pay a refundable registration fee of ₹999 today to confirm your offer. Limited seats available — respond within 24 hours. Send your Aadhaar card and bank details immediately to hr@techvision-solutions-online.com or WhatsApp +91-98765-43210.`;

const SCAN_STEPS = [
  { label: 'Checking urgency signals', icon: 'clock' },
  { label: 'Evaluating payment requests', icon: 'dollar' },
  { label: 'Reviewing suspicious claims', icon: 'alert' },
  { label: 'Analyzing contact patterns', icon: 'mail' },
  { label: 'Compiling risk assessment', icon: 'shieldCheck' },
];

const SOURCE_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'job-portal', label: 'Job Portal' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_OPTIONS = [
  { value: 'job', label: 'Job / Internship' },
  { value: 'financial', label: 'Financial Offer' },
  { value: 'lottery', label: 'Lottery / Prize' },
  { value: 'security', label: 'Account Security' },
  { value: 'other', label: 'Other' },
];

const COMMON_SIGNALS = [
  { title: 'Upfront payment requests', desc: 'Legitimate employers never ask for fees' },
  { title: 'Guaranteed offers without interview', desc: 'Real jobs require a selection process' },
  { title: 'Urgent deadlines', desc: 'Pressure tactics to prevent research' },
  { title: 'Requests for personal documents', desc: 'Aadhaar, passport, bank details' },
  { title: 'Free email domains', desc: 'Gmail/Yahoo instead of corporate email' },
  { title: 'WhatsApp/Telegram contact', desc: 'Moving off-platform to avoid trails' },
];

export function scannerPage() {
  return {
    onMount(el) {
      const status = getSystemStatus();
      const aiAvailable = status?.aiConfigured || false;

      // Check for ?mode=rule-based query param (from "Manual Scan" nav item)
      const urlParams = new URLSearchParams(window.location.search);
      const forceRuleBased = urlParams.get('mode') === 'rule-based';
      const defaultMode = forceRuleBased ? 'rule-based' : (aiAvailable ? 'auto' : 'rule-based');

      el.innerHTML = `
        <div class="scan-page">

          <!-- Page header -->
          <div class="scan-header">
            <div class="scan-header-left">
              <h1 class="scan-title">AI Message Scanner</h1>
              <p class="scan-subtitle">Check suspicious messages before they cost you money, data, or opportunities.</p>
            </div>
            <div class="scan-trust">
              ${icon('shieldCheck')}
              <span>SachetAI identifies warning signs and provides evidence-based guidance</span>
            </div>
          </div>

          <!-- How it works -->
          <div class="scan-howto">
            <div class="scan-howto-step">
              <div class="scan-howto-num">1</div>
              <div class="scan-howto-body">
                <span class="scan-howto-label">Submit Message</span>
                <span class="scan-howto-desc">Paste any suspicious text</span>
              </div>
            </div>
            <div class="scan-howto-arrow">${icon('arrowRight')}</div>
            <div class="scan-howto-step">
              <div class="scan-howto-num">2</div>
              <div class="scan-howto-body">
                <span class="scan-howto-label">Analyze Signals</span>
                <span class="scan-howto-desc">AI + rule-based detection</span>
              </div>
            </div>
            <div class="scan-howto-arrow">${icon('arrowRight')}</div>
            <div class="scan-howto-step">
              <div class="scan-howto-num">3</div>
              <div class="scan-howto-body">
                <span class="scan-howto-label">Review Evidence</span>
                <span class="scan-howto-desc">See findings and next steps</span>
              </div>
            </div>
          </div>

          <!-- Mode selector -->
          <div class="scan-mode-section">
            <div class="scan-mode-label">Analysis Mode</div>
            <div class="scan-mode-selector">
              <label class="scan-mode-option ${aiAvailable ? '' : 'disabled'}">
                <input type="radio" name="scan-mode" value="ai" ${defaultMode === 'ai' ? 'checked' : ''} ${aiAvailable ? '' : 'disabled'}>
                <div class="scan-mode-card">
                  <div class="scan-mode-card-head">
                    ${icon('sparkles')}
                    <span class="scan-mode-card-title">AI Analysis</span>
                  </div>
                  <p class="scan-mode-card-desc">Contextual interpretation with evidence-based explanations.</p>
                  ${aiAvailable ? '<span class="scan-mode-avail available">Available</span>' : '<span class="scan-mode-avail unavailable">No API key configured</span>'}
                </div>
              </label>
              <label class="scan-mode-option">
                <input type="radio" name="scan-mode" value="rule-based" ${defaultMode === 'rule-based' ? 'checked' : ''}>
                <div class="scan-mode-card">
                  <div class="scan-mode-card-head">
                    ${icon('shield')}
                    <span class="scan-mode-card-title">Rule-Based Analysis</span>
                  </div>
                  <p class="scan-mode-card-desc">Deterministic checks for known scam patterns. Works without an AI key.</p>
                  <span class="scan-mode-avail available">Available</span>
                </div>
              </label>
              <label class="scan-mode-option">
                <input type="radio" name="scan-mode" value="auto" ${defaultMode === 'auto' ? 'checked' : ''}>
                <div class="scan-mode-card">
                  <div class="scan-mode-card-head">
                    ${icon('shieldCheck')}
                    <span class="scan-mode-card-title">Auto (Recommended)</span>
                  </div>
                  <p class="scan-mode-card-desc">Tries AI first, falls back to rules if unavailable.</p>
                  <span class="scan-mode-avail available">Available</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Main grid: input + side panel -->
          <div class="scan-main-grid">

            <!-- Input section -->
            <div class="scan-input-col">
              <div class="scan-input-card">
                <div class="scan-input-head">
                  <span class="scan-input-title">${icon('clipboard')} Message to Analyze</span>
                  <button type="button" class="scan-clear-btn" id="clear-btn" style="display:none">${icon('close')} Clear</button>
                </div>

                <form id="scan-form">
                  <!-- Source selector -->
                  <div class="scan-source-row">
                    <label class="form-label" for="message-source">Message source</label>
                    <div class="scan-source-pills" id="source-pills">
                      ${SOURCE_OPTIONS.map(s => `
                        <button type="button" class="scan-source-pill${s.value === 'other' ? ' active' : ''}" data-source="${s.value}">${s.label}</button>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Textarea -->
                  <div class="form-group">
                    <textarea class="form-textarea scan-textarea" id="message-input" rows="9"
                      placeholder="Paste a job offer, internship message, WhatsApp text, email, or suspicious message here..."
                      required minlength="20" aria-label="Message to analyze"></textarea>
                    <div class="scan-textarea-footer">
                      <span class="scan-char-count" id="char-count">0 characters</span>
                      <span class="scan-char-indicator" id="char-indicator"></span>
                    </div>
                  </div>

                  <!-- Advanced options toggle -->
                  <button type="button" class="scan-advanced-toggle" id="advanced-toggle" aria-expanded="false">
                    <span>${icon('settings')} Advanced Analysis</span>
                    ${icon('chevronDown')}
                  </button>

                  <div class="scan-advanced-panel" id="advanced-panel">
                    <div class="scan-advanced-grid">
                      <div class="form-group">
                        <label class="form-label" for="msg-category">Message category</label>
                        <select class="form-select" id="msg-category">
                          <option value="">Auto-detect</option>
                          ${CATEGORY_OPTIONS.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
                        </select>
                      </div>
                      <div class="form-group">
                        <label class="form-label" for="sender-name">Sender / company name <span class="scan-optional">(optional)</span></label>
                        <input type="text" class="form-input" id="sender-name" placeholder="e.g. TechVision Solutions">
                      </div>
                      <div class="form-group scan-advanced-full">
                        <label class="form-label" for="contact-link">Website or contact link <span class="scan-optional">(optional)</span></label>
                        <input type="text" class="form-input" id="contact-link" placeholder="e.g. https://example.com or +91-98765-43210">
                      </div>
                    </div>
                  </div>

                  <!-- Action buttons -->
                  <div class="scan-actions">
                    <button type="submit" class="btn btn-primary btn-lg scan-cta" id="scan-submit" disabled>${icon('scan')} Analyze Message</button>
                    <button type="button" class="btn btn-secondary scan-sample-btn" id="sample-btn">${icon('fileSearch')} Try Sample Message</button>
                  </div>

                  <!-- Privacy note -->
                  <div class="scan-privacy">
                    ${icon('lock')}
                    <span>Your message text is sent to the analysis engine for processing. When signed in, scan results are saved to your account history.</span>
                  </div>
                </form>
              </div>
            </div>

            <!-- Side panel: detection signals -->
            <div class="scan-side-col">
              <div class="scan-side-card">
                <div class="scan-side-head">
                  ${icon('radar')}
                  <span>Detection Signals</span>
                </div>
                <p class="scan-side-desc">SachetAI checks for these common scam indicators:</p>
                <div class="scan-signals-list">
                  ${COMMON_SIGNALS.map(s => `
                    <div class="scan-signal-preview">
                      <span class="scan-signal-preview-dot"></span>
                      <div>
                        <span class="scan-signal-preview-title">${s.title}</span>
                        <span class="scan-signal-preview-desc">${s.desc}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="scan-side-card scan-side-card-mode">
                <div class="scan-side-head">
                  ${icon('activity')}
                  <span>Active Mode</span>
                </div>
                <div class="scan-active-mode" id="active-mode-display">
                  <span class="scan-active-mode-badge">${defaultMode === 'ai' ? 'AI' : defaultMode === 'rule-based' ? 'Rule-Based' : 'Auto'}</span>
                  <span class="scan-active-mode-desc" id="active-mode-desc">${defaultMode === 'ai' ? 'AI-powered contextual analysis' : defaultMode === 'rule-based' ? 'Deterministic pattern matching' : 'AI first, rules as fallback'}</span>
                </div>
                ${!aiAvailable ? '<div class="scan-ai-note">AI mode requires a server-side API key. Rule-based mode is fully functional.</div>' : ''}
              </div>
            </div>
          </div>

          <!-- Result / loading area -->
          <div id="scan-result"></div>
        </div>
      `;

      // --- Wire up interactions ---
      const textarea = el.querySelector('#message-input');
      const charCount = el.querySelector('#char-count');
      const charIndicator = el.querySelector('#char-indicator');
      const clearBtn = el.querySelector('#clear-btn');
      const form = el.querySelector('#scan-form');
      const submitBtn = el.querySelector('#scan-submit');
      const resultEl = el.querySelector('#scan-result');
      const sampleBtn = el.querySelector('#sample-btn');
      const advancedToggle = el.querySelector('#advanced-toggle');
      const advancedPanel = el.querySelector('#advanced-panel');
      const sourcePills = el.querySelector('#source-pills');
      const activeModeDisplay = el.querySelector('#active-mode-display');

      let selectedSource = 'other';

      // Char count + indicator + clear button + submit button state
      function updateCharCount() {
        const len = textarea.value.length;
        charCount.textContent = `${len} character${len !== 1 ? 's' : ''}`;
        clearBtn.style.display = len > 0 ? 'inline-flex' : 'none';
        submitBtn.disabled = len < 20;

        // Length indicator
        let indicatorClass, indicatorText;
        if (len === 0) { indicatorClass = ''; indicatorText = ''; }
        else if (len < 20) { indicatorClass = 'short'; indicatorText = 'Too short to analyze'; }
        else if (len < 200) { indicatorClass = 'ok'; indicatorText = 'Good length'; }
        else if (len < 2000) { indicatorClass = 'ok'; indicatorText = 'Detailed message'; }
        else { indicatorClass = 'long'; indicatorText = 'Very long — may take longer'; }
        charIndicator.className = `scan-char-indicator ${indicatorClass}`;
        charIndicator.textContent = indicatorText;
      }

      textarea.addEventListener('input', updateCharCount);

      // Clear button
      clearBtn.addEventListener('click', () => {
        textarea.value = '';
        updateCharCount();
        textarea.focus();
      });

      // Source pills
      sourcePills.addEventListener('click', (e) => {
        const pill = e.target.closest('.scan-source-pill');
        if (!pill) return;
        sourcePills.querySelectorAll('.scan-source-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedSource = pill.dataset.source;
      });

      // Sample message
      sampleBtn.addEventListener('click', () => {
        textarea.value = SAMPLE_MESSAGE;
        updateCharCount();
        textarea.focus();
        toast.info('Sample message loaded', 'This is a fictional example for demonstration. Edit it before scanning.');
      });

      // Advanced toggle
      advancedToggle.addEventListener('click', () => {
        const isOpen = advancedPanel.classList.toggle('open');
        advancedToggle.classList.toggle('open', isOpen);
        advancedToggle.setAttribute('aria-expanded', String(isOpen));
      });

      // Mode selector
      el.querySelectorAll('input[name="scan-mode"]').forEach(radio => {
        radio.addEventListener('change', () => {
          el.querySelectorAll('.scan-mode-option').forEach(opt => opt.classList.remove('selected'));
          radio.closest('.scan-mode-option').classList.add('selected');
          // Update active mode display
          const mode = radio.value;
          const badge = activeModeDisplay.querySelector('.scan-active-mode-badge');
          const desc = activeModeDisplay.querySelector('.scan-active-mode-desc');
          if (mode === 'ai') { badge.textContent = 'AI'; desc.textContent = 'AI-powered contextual analysis'; }
          else if (mode === 'rule-based') { badge.textContent = 'Rule-Based'; desc.textContent = 'Deterministic pattern matching'; }
          else { badge.textContent = 'Auto'; desc.textContent = 'AI first, rules as fallback'; }
        });
      });
      el.querySelector(`input[name="scan-mode"][value="${defaultMode}"]`)?.dispatchEvent(new Event('change'));

      // Form submit
      let isScanning = false;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isScanning) return;

        const message = textarea.value.trim();
        if (message.length < 20) {
          toast.warning('Message too short', 'Please paste at least 20 characters for analysis.');
          textarea.focus();
          return;
        }

        const selectedMode = el.querySelector('input[name="scan-mode"]:checked')?.value || 'auto';
        const category = el.querySelector('#msg-category')?.value || '';
        const senderName = el.querySelector('#sender-name')?.value || '';
        const contactLink = el.querySelector('#contact-link')?.value || '';

        isScanning = true;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div> Analyzing...';
        resultEl.innerHTML = renderScanningAnimation();
        runScanningSteps(resultEl);

        try {
          const resp = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, mode: selectedMode }),
          });

          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error || 'Analysis failed');
          }

          const data = await resp.json();

          // Save to shared state so the Results page can display it
          saveScanResult(data, message);

          // Try to persist to database for history
          let scanId = null;
          if (isSupabaseConfigured) {
            const user = getCurrentUser();
            if (user) {
              const { data: inserted, error: insertError } = await supabase
                .from('scans')
                .insert({
                  message_text: message,
                  risk_level: data.riskLevel,
                  risk_score: data.riskScore,
                  risk_label: data.riskLabel,
                  summary: data.summary,
                  red_flags: data.redFlags || [],
                  recommendations: data.recommendations || [],
                  analysis_method: data.analysisMethod || (data.preview ? 'preview' : 'unknown'),
                  is_preview: data.preview || false,
                })
                .select('id')
                .maybeSingle();

              if (!insertError && inserted) {
                scanId = inserted.id;
              }
            }
          }

          // Always navigate to the full Results page
          toast.success('Analysis complete', 'Opening your detailed results...');
          const resultsPath = scanId ? `/results/${scanId}` : '/results';
          setTimeout(() => {
            history.pushState({}, '', resultsPath);
            window.dispatchEvent(new PopStateEvent('popstate'));
          }, 600);
        } catch (err) {
          resultEl.innerHTML = `
            <div class="scan-error-card">
              <div class="scan-error-icon">${icon('alert')}</div>
              <div class="scan-error-body">
                <p class="scan-error-title">Analysis failed</p>
                <p class="scan-error-msg">${escapeHtml(err.message)}</p>
                <p class="scan-error-hint">If AI mode was selected, try switching to rule-based mode.</p>
              </div>
              <button class="btn btn-secondary btn-sm" id="retry-btn">Try Again</button>
            </div>
          `;
          resultEl.querySelector('#retry-btn')?.addEventListener('click', () => {
            resultEl.innerHTML = '';
            form.dispatchEvent(new Event('submit'));
          });
        } finally {
          isScanning = false;
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${icon('scan')} Analyze Message`;
        }
      });

      function renderScanningAnimation() {
        return `
          <div class="scan-loading-card">
            <div class="scan-loading-radar">
              <div class="scan-loading-ring r1"></div>
              <div class="scan-loading-ring r2"></div>
              <div class="scan-loading-ring r3"></div>
              <div class="scan-loading-sweep"></div>
              <div class="scan-loading-center">${icon('scan')}</div>
            </div>
            <div class="scan-loading-steps" id="scan-steps">
              ${SCAN_STEPS.map((step, i) => `
                <div class="scan-step-item" data-step="${i}">
                  <div class="scan-step-icon">${icon(step.icon)}</div>
                  <span class="scan-step-label">${step.label}</span>
                  <div class="scan-step-status"></div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      async function runScanningSteps(container) {
        const steps = container.querySelectorAll('.scan-step-item');
        const stepDelay = 500;
        for (let i = 0; i < steps.length; i++) {
          steps[i].classList.add('active');
          await sleep(stepDelay);
          steps[i].classList.remove('active');
          steps[i].classList.add('done');
        }
      }

      function renderInlineResult(data, originalMessage) {
        const risk = data.riskLevel || 'medium';
        const methodLabel = data.analysisMethod === 'rule-based' ? 'Rule-Based Analysis' : data.analysisMethod === 'ai' ? 'AI Analysis' : 'Analysis';
        const signals = data.redFlags || [];
        const recs = data.recommendations || [];
        const fallbackNote = data.fallbackFromAI ? '<div class="scan-fallback-note">AI analysis failed — results shown are from the rule-based fallback engine.</div>' : '';

        return `
          <div class="scan-result-card" data-risk="${risk}">
            <div class="scan-result-header">
              <div class="scan-result-gauge-mini">
                ${renderMiniGauge(data.riskScore || 0, risk)}
              </div>
              <div class="scan-result-meta">
                <span class="badge badge-${risk}"><span class="badge-dot"></span>${data.riskLabel || risk.toUpperCase()} RISK</span>
                <span class="scan-method-tag">${icon('shield')} ${methodLabel} · Score: ${data.riskScore}/100</span>
              </div>
            </div>

            <p class="scan-result-summary">${escapeHtml(data.summary || 'Analysis complete.')}</p>
            ${fallbackNote}

            ${signals.length > 0 ? `
              <div class="scan-result-signals">
                <div class="scan-signals-label">Detected Warning Signs (${signals.length})</div>
                ${signals.map(s => renderSignalItem(s, originalMessage)).join('')}
              </div>` : ''}

            ${recs.length > 0 ? `
              <div class="scan-result-recs">
                <div class="scan-signals-label">Recommended Next Steps</div>
                <ul class="scan-rec-list">
                  ${recs.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
                </ul>
              </div>` : ''}

            <div class="scan-result-disclaimer">
              ${icon('info')}
              <span>This assessment is advisory and cannot guarantee whether a message is genuine. Always verify through official channels before sharing information or making payments.</span>
            </div>

            <div class="scan-result-actions">
              <button class="btn btn-secondary btn-sm" id="scan-again-btn">${icon('scan')} Scan Another Message</button>
            </div>
          </div>
        `;
      }

      function wireInlineResultActions(container, data, message) {
        container.querySelector('#scan-again-btn')?.addEventListener('click', () => {
          container.innerHTML = '';
          textarea.value = '';
          updateCharCount();
          textarea.focus();
          textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }

      updateCharCount();
    }
  };
}

function renderMiniGauge(score, risk) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const color = risk === 'high' ? 'var(--risk-high)' : risk === 'medium' ? 'var(--risk-medium)' : 'var(--risk-low)';
  return `
    <svg class="scan-mini-gauge" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="${radius}" fill="none" stroke="var(--border-strong)" stroke-width="5"/>
      <circle cx="40" cy="40" r="${radius}" fill="none" stroke="${color}" stroke-width="5"
        stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
        stroke-linecap="round" transform="rotate(-90 40 40)"
        style="transition: stroke-dashoffset 0.8s ease; filter: drop-shadow(0 0 4px ${color});"/>
      <text x="40" y="44" text-anchor="middle" font-size="18" font-weight="800" fill="var(--text)">${score}</text>
      <text x="40" y="56" text-anchor="middle" font-size="8" fill="var(--text-dim)" font-weight="600">/ 100</text>
    </svg>
  `;
}

function renderSignalItem(signal, originalMessage) {
  const severity = signal.severity || 'medium';
  // Try to extract a short evidence snippet from the message
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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
