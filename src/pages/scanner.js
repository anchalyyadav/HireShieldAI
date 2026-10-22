// Page: Message Scanner — paste message for AI or rule-based analysis
import { icon } from '../js/icons.js';
import { toast } from '../js/toast.js';
import { supabase, isSupabaseConfigured } from '../js/supabaseClient.js';
import { getCurrentUser, getSystemStatus } from '../js/shell.js';

export function scannerPage() {
  return {
    onMount(el) {
      const status = getSystemStatus();
      const aiAvailable = status?.aiConfigured || false;

      el.innerHTML = `
        <div class="page-header">
          <h1>Message Scanner</h1>
          <p>Paste any suspicious job or internship message for instant risk analysis.</p>
        </div>

        <!-- Mode selector -->
        <div class="card mb-3">
          <div class="form-label">Analysis Mode</div>
          <div class="scan-mode-selector">
            <label class="scan-mode-option ${aiAvailable ? '' : 'disabled'}">
              <input type="radio" name="scan-mode" value="ai" ${aiAvailable ? '' : 'disabled'}>
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
              <input type="radio" name="scan-mode" value="rule-based" checked>
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
              <input type="radio" name="scan-mode" value="auto" ${aiAvailable ? 'checked' : ''}>
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

        <div class="card card-glow mb-3">
          <form id="scan-form">
            <div class="form-group">
              <label class="form-label" for="message-input">Suspicious message</label>
              <textarea class="form-textarea" id="message-input" rows="8"
                placeholder="Paste the full text of the job offer, DM, email, or SMS you received..."
                required minlength="20"></textarea>
              <div class="form-hint">Include as much of the original message as possible for the most accurate analysis.</div>
            </div>
            <div class="flex gap-2 items-center">
              <button type="submit" class="btn btn-primary btn-lg" id="scan-submit">${icon('scan')} Analyze message</button>
              <span class="text-dim text-sm" id="char-count">0 characters</span>
            </div>
          </form>
        </div>
        <div id="scan-result"></div>
      `;

      const textarea = el.querySelector('#message-input');
      const charCount = el.querySelector('#char-count');
      const form = el.querySelector('#scan-form');
      const submitBtn = el.querySelector('#scan-submit');
      const resultEl = el.querySelector('#scan-result');

      textarea.addEventListener('input', () => {
        charCount.textContent = `${textarea.value.length} characters`;
      });

      // Mode selector visual feedback
      el.querySelectorAll('input[name="scan-mode"]').forEach(radio => {
        radio.addEventListener('change', () => {
          el.querySelectorAll('.scan-mode-option').forEach(opt => opt.classList.remove('selected'));
          radio.closest('.scan-mode-option').classList.add('selected');
        });
      });
      // Trigger initial selection
      el.querySelector('input[name="scan-mode"]:checked')?.dispatchEvent(new Event('change'));

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = textarea.value.trim();
        if (message.length < 20) {
          toast.warning('Message too short', 'Please paste at least 20 characters for analysis.');
          return;
        }

        const selectedMode = el.querySelector('input[name="scan-mode"]:checked')?.value || 'auto';

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div> Analyzing...';
        resultEl.innerHTML = `<div class="card" style="text-align:center;padding:48px;"><div class="spinner" style="margin:0 auto 16px;"></div><p class="text-muted">Analyzing your message...</p></div>`;

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

          // Try to persist to database
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
                history.pushState({}, '', `/results/${inserted.id}`);
                window.dispatchEvent(new PopStateEvent('popstate'));
                return;
              }
            }
          }

          // Fallback: show inline result
          resultEl.innerHTML = renderInlineResult(data);
        } catch (err) {
          resultEl.innerHTML = `<div class="card" style="border-color:var(--risk-high)"><p style="color:var(--risk-high);font-weight:600">Analysis failed</p><p class="text-muted mt-1">${escapeHtml(err.message)}</p><p class="text-dim mt-1">If AI mode was selected, try switching to rule-based mode.</p></div>`;
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${icon('scan')} Analyze message`;
        }
      });

      function renderInlineResult(data) {
        const risk = data.riskLevel || 'medium';
        const methodLabel = data.analysisMethod === 'rule-based' ? 'Rule-Based Analysis' : data.analysisMethod === 'ai' ? 'AI Analysis' : 'Analysis';
        const signals = data.redFlags || [];
        const recs = data.recommendations || [];
        const fallbackNote = data.fallbackFromAI ? '<div class="scan-fallback-note">AI analysis failed — results shown are from the rule-based fallback engine.</div>' : '';

        return `
          <div class="card card-glow" style="border-left:3px solid var(--risk-${risk})">
            <div class="flex items-center justify-between mb-2">
              <span class="card-title">Analysis Result</span>
              <span class="badge badge-${risk}"><span class="badge-dot"></span>${data.riskLabel || risk.toUpperCase()} RISK</span>
            </div>
            <div class="scan-method-tag">${icon('shield')} ${methodLabel} · Score: ${data.riskScore}/100</div>
            <p class="text-muted mt-2">${escapeHtml(data.summary || 'Analysis complete.')}</p>
            ${fallbackNote}
            ${signals.length > 0 ? `
              <div class="scan-signals mt-2">
                <div class="scan-signals-label">Detected Signals (${signals.length})</div>
                ${signals.map(s => `
                  <div class="scan-signal-item">
                    <div class="scan-signal-dot" style="background:var(--risk-${s.severity})"></div>
                    <div>
                      <div class="scan-signal-title">${escapeHtml(s.title)}</div>
                      <div class="scan-signal-desc">${escapeHtml(s.description || '')}</div>
                    </div>
                  </div>
                `).join('')}
              </div>` : ''}
            ${recs.length > 0 ? `
              <div class="scan-recs mt-2">
                <div class="scan-signals-label">Recommendations</div>
                <ul class="scan-rec-list">
                  ${recs.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
                </ul>
              </div>` : ''}
          </div>
        `;
      }
    }
  };
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
