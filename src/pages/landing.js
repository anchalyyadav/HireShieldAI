// Page: Landing — dashboard-style "Job Scam Threat Center"
import { icon } from '../js/icons.js';

export function landingPage() {
  return {
    onMount(el) {
      el.innerHTML = `
        <div class="tc-page">
          <!-- ===== Top Navigation ===== -->
          <nav class="tc-nav">
            <div class="tc-nav-inner">
              <a href="/" class="tc-nav-brand" data-link>
                <img src="/favicon.svg" width="32" height="32" alt="HireShield AI logo" />
                <span class="tc-brand-text">Hire<span>Shield</span> AI</span>
              </a>
              <div class="tc-nav-links" id="tc-nav-links">
                <a href="/" class="tc-nav-link active" data-link>Home</a>
                <a href="#how-it-works" class="tc-nav-link">How It Works</a>
                <a href="/safety" class="tc-nav-link" data-link>Safety Center</a>
                <a href="/history" class="tc-nav-link" data-link>Reports</a>
              </div>
              <div class="tc-nav-actions">
                <a href="/login" class="btn btn-ghost btn-sm" data-link>Login</a>
                <a href="/login?mode=signup" class="btn btn-primary btn-sm" data-link>Get Started</a>
                <button class="tc-burger" id="tc-burger" aria-label="Toggle menu" aria-expanded="false">
                  <span></span><span></span><span></span>
                </button>
              </div>
            </div>
            <div class="tc-nav-mobile" id="tc-nav-mobile">
              <a href="/" class="tc-nav-link" data-link>Home</a>
              <a href="#how-it-works" class="tc-nav-link">How It Works</a>
              <a href="/safety" class="tc-nav-link" data-link>Safety Center</a>
              <a href="/history" class="tc-nav-link" data-link>Reports</a>
              <a href="/login" class="tc-nav-link" data-link>Login</a>
              <a href="/login?mode=signup" class="btn btn-primary btn-sm" data-link>Get Started</a>
            </div>
          </nav>

          <!-- ===== Main Container ===== -->
          <div class="tc-container">

            <!-- Page Heading -->
            <div class="tc-heading-row">
              <div>
                <h1 class="tc-page-title">Job Scam Threat Center</h1>
                <p class="tc-page-sub">Check suspicious job and internship offers before you trust them.</p>
              </div>
              <div class="tc-heading-ctas">
                <a href="/scanner" class="btn btn-primary" data-link>${icon('scan')} Scan a Job Message</a>
                <a href="#how-it-works" class="btn btn-secondary">${icon('info')} Learn How It Works</a>
              </div>
            </div>

            <!-- Sample data disclaimer -->
            <div class="tc-disclaimer">${icon('eye')} Illustrative sample insights — not real user data</div>

            <!-- ===== Top Analytics Grid ===== -->
            <div class="tc-analytics-grid">

              <!-- Large left card: Threat Overview -->
              <div class="card card-glow tc-card tc-card-overview">
                <div class="tc-card-head">
                  <span class="tc-card-title">${icon('shield')} Message Threat Overview</span>
                </div>
                <div class="tc-globe-viz">
                  <div class="tc-globe"></div>
                  <div class="tc-globe-ring r1"></div>
                  <div class="tc-globe-ring r2"></div>
                  <div class="tc-globe-ring r3"></div>
                  <div class="tc-globe-dot d1"></div>
                  <div class="tc-globe-dot d2"></div>
                  <div class="tc-globe-dot d3"></div>
                  <div class="tc-globe-dot d4"></div>
                  <div class="tc-globe-center">${icon('shieldCheck')}</div>
                </div>
                <div class="tc-overview-stats">
                  <div class="tc-mini-stat">
                    <span class="tc-mini-stat-val" style="color:var(--risk-high)">High</span>
                    <span class="tc-mini-stat-label">Payment Scams</span>
                  </div>
                  <div class="tc-mini-stat">
                    <span class="tc-mini-stat-val" style="color:var(--risk-medium)">Medium</span>
                    <span class="tc-mini-stat-label">Urgency Tactics</span>
                  </div>
                  <div class="tc-mini-stat">
                    <span class="tc-mini-stat-val" style="color:var(--risk-low)">Low</span>
                    <span class="tc-mini-stat-label">Safe Messages</span>
                  </div>
                </div>
              </div>

              <!-- Middle column: Detection Insights + Risk Exposure -->
              <div class="tc-mid-col">
                <div class="card card-glow tc-card">
                  <div class="tc-card-head">
                    <span class="tc-card-title">${icon('chart')} Detection Insights</span>
                    <span class="tc-sample-tag">Sample</span>
                  </div>
                  <div class="tc-insight-row">
                    <div class="tc-insight-icon" style="color:var(--risk-high)">${icon('dollar')}</div>
                    <div class="tc-insight-body">
                      <div class="tc-insight-label">Suspicious payment demands</div>
                      <div class="tc-insight-bar"><div class="tc-insight-fill" style="width:82%;background:var(--risk-high)"></div></div>
                    </div>
                    <span class="tc-insight-pct">82%</span>
                  </div>
                  <div class="tc-insight-row">
                    <div class="tc-insight-icon" style="color:var(--risk-medium)">${icon('clock')}</div>
                    <div class="tc-insight-body">
                      <div class="tc-insight-label">Urgent selection claims</div>
                      <div class="tc-insight-bar"><div class="tc-insight-fill" style="width:67%;background:var(--risk-medium)"></div></div>
                    </div>
                    <span class="tc-insight-pct">67%</span>
                  </div>
                  <div class="tc-insight-row">
                    <div class="tc-insight-icon" style="color:var(--blue)">${icon('externalLink')}</div>
                    <div class="tc-insight-body">
                      <div class="tc-insight-label">Suspicious links embedded</div>
                      <div class="tc-insight-bar"><div class="tc-insight-fill" style="width:54%;background:var(--blue)"></div></div>
                    </div>
                    <span class="tc-insight-pct">54%</span>
                  </div>
                </div>

                <div class="card card-glow tc-card">
                  <div class="tc-card-head">
                    <span class="tc-card-title">${icon('target')} Risk Exposure</span>
                    <span class="tc-sample-tag">Sample</span>
                  </div>
                  <div class="tc-gauge-wrap">
                    <svg class="tc-gauge" viewBox="0 0 120 70" aria-hidden="true">
                      <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8" stroke-linecap="round"/>
                      <path d="M10 60 A50 50 0 0 1 75 14" fill="none" stroke="url(#gauge-grad)" stroke-width="8" stroke-linecap="round"/>
                      <defs>
                        <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stop-color="#22C55E"/>
                          <stop offset="50%" stop-color="#F59E0B"/>
                          <stop offset="100%" stop-color="#EF4444"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div class="tc-gauge-label">
                      <span class="tc-gauge-num">74<span>/100</span></span>
                      <span class="tc-gauge-tag" style="color:var(--risk-medium)">Elevated</span>
                    </div>
                  </div>
                  <div class="tc-gauge-zones">
                    <span class="tc-zone low">Low</span>
                    <span class="tc-zone med">Medium</span>
                    <span class="tc-zone high">High</span>
                  </div>
                </div>
              </div>

              <!-- Right card: Common Warning Signs -->
              <div class="card card-glow tc-card tc-card-signs">
                <div class="tc-card-head">
                  <span class="tc-card-title">${icon('flag')} Common Warning Signs</span>
                  <span class="tc-sample-tag">Sample</span>
                </div>
                <div class="tc-sign-matrix">
                  <div class="tc-sign-cell">
                    <div class="tc-sign-dot" style="background:var(--risk-high)"></div>
                    <span>Upfront fees</span>
                  </div>
                  <div class="tc-sign-cell">
                    <div class="tc-sign-dot" style="background:var(--risk-high)"></div>
                    <span>Bank details</span>
                  </div>
                  <div class="tc-sign-cell">
                    <div class="tc-sign-dot" style="background:var(--risk-medium)"></div>
                    <span>Urgent deadline</span>
                  </div>
                  <div class="tc-sign-cell">
                    <div class="tc-sign-dot" style="background:var(--risk-medium)"></div>
                    <span>No interview</span>
                  </div>
                  <div class="tc-sign-cell">
                    <div class="tc-sign-dot" style="background:var(--risk-medium)"></div>
                    <span>Vague role</span>
                  </div>
                  <div class="tc-sign-cell">
                    <div class="tc-sign-dot" style="background:var(--blue)"></div>
                    <span>Free email addr</span>
                  </div>
                  <div class="tc-sign-cell">
                    <div class="tc-sign-dot" style="background:var(--blue)"></div>
                    <span>Unverified co.</span>
                  </div>
                  <div class="tc-sign-cell">
                    <div class="tc-sign-dot" style="background:var(--risk-low)"></div>
                    <span>Clear contract</span>
                  </div>
                  <div class="tc-sign-cell">
                    <div class="tc-sign-dot" style="background:var(--risk-low)"></div>
                    <span>Verified domain</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ===== Lower Content Grid ===== -->
            <div class="tc-lower-grid">

              <!-- Left: Common Job Scam Patterns -->
              <div class="card card-glow tc-card" id="how-it-works">
                <div class="tc-card-head">
                  <span class="tc-card-title">${icon('alert')} Common Job Scam Patterns</span>
                </div>
                <div class="tc-pattern-list">
                  <div class="tc-pattern">
                    <div class="tc-pattern-icon" style="color:var(--risk-high)">${icon('dollar')}</div>
                    <div>
                      <div class="tc-pattern-title">Upfront registration fees</div>
                      <div class="tc-pattern-desc">Scammers ask for payment to cover "training materials" or "onboarding costs" before you start.</div>
                    </div>
                  </div>
                  <div class="tc-pattern">
                    <div class="tc-pattern-icon" style="color:var(--risk-medium)">${icon('sparkles')}</div>
                    <div>
                      <div class="tc-pattern-title">Unrealistic salary promises</div>
                      <div class="tc-pattern-desc">Offers of unusually high pay for minimal work, often for remote or part-time roles with no interview.</div>
                    </div>
                  </div>
                  <div class="tc-pattern">
                    <div class="tc-pattern-icon" style="color:var(--blue)">${icon('mail')}</div>
                    <div>
                      <div class="tc-pattern-title">Fake recruiter messages</div>
                      <div class="tc-pattern-desc">Emails from free domains or messaging apps claiming to represent well-known companies.</div>
                    </div>
                  </div>
                  <div class="tc-pattern">
                    <div class="tc-pattern-icon" style="color:var(--risk-medium)">${icon('clock')}</div>
                    <div>
                      <div class="tc-pattern-title">Pressure to act immediately</div>
                      <div class="tc-pattern-desc">"Positions filling fast" or "respond within 24 hours" to prevent you from researching the offer.</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: How HireShield AI Helps -->
              <div class="card card-glow tc-card">
                <div class="tc-card-head">
                  <span class="tc-card-title">${icon('shieldCheck')} How HireShield AI Helps</span>
                </div>

                <!-- Risk-analysis visualization -->
                <div class="tc-rail-viz">
                  <div class="tc-rail-row">
                    <span class="tc-rail-label">AI Analysis</span>
                    <div class="tc-rail-track"><div class="tc-rail-fill" style="width:90%;background:var(--purple)"></div></div>
                    <span class="tc-rail-pct">90%</span>
                  </div>
                  <div class="tc-rail-row">
                    <span class="tc-rail-label">Rule Checks</span>
                    <div class="tc-rail-track"><div class="tc-rail-fill" style="width:78%;background:var(--blue)"></div></div>
                    <span class="tc-rail-pct">78%</span>
                  </div>
                  <div class="tc-rail-row">
                    <span class="tc-rail-label">Evidence Report</span>
                    <div class="tc-rail-track"><div class="tc-rail-fill" style="width:95%;background:var(--risk-low)"></div></div>
                    <span class="tc-rail-pct">95%</span>
                  </div>
                </div>

                <div class="tc-steps">
                  <div class="tc-step">
                    <div class="tc-step-num">1</div>
                    <div>
                      <div class="tc-step-title">Paste a job or internship message</div>
                      <div class="tc-step-desc">Copy the full text of any suspicious email, DM, or message into the scanner.</div>
                    </div>
                  </div>
                  <div class="tc-step">
                    <div class="tc-step-num">2</div>
                    <div>
                      <div class="tc-step-title">Analyze suspicious signals</div>
                      <div class="tc-step-desc">HireShield combines AI analysis with rule-based detection to evaluate red flags.</div>
                    </div>
                  </div>
                  <div class="tc-step">
                    <div class="tc-step-num">3</div>
                    <div>
                      <div class="tc-step-title">Review evidence and safety recommendations</div>
                      <div class="tc-step-desc">Get a clear risk report with specific warning signs and recommended next steps.</div>
                    </div>
                  </div>
                </div>

                <a href="/scanner" class="btn btn-primary btn-block mt-2" data-link>${icon('scan')} Scan a Job Message</a>
              </div>
            </div>

            <!-- ===== Safety Notice ===== -->
            <div class="card card-glow tc-safety-notice">
              <div class="tc-safety-icon" style="color:var(--purple)">${icon('shieldCheck')}</div>
              <div>
                <h3>Verify before you trust</h3>
                <p>Always confirm companies through their official website or verified career portal. Automated analysis is a helpful signal but can make mistakes — no tool catches every scam. If something feels off, trust that instinct and report it.</p>
              </div>
              <a href="/safety" class="btn btn-secondary btn-sm" data-link>${icon('safety')} Safety Center</a>
            </div>

          </div>

          <!-- ===== Footer ===== -->
          <footer class="tc-footer">
            <div class="tc-footer-inner">
              <div class="tc-footer-brand">
                <img src="/favicon.svg" width="28" height="28" alt="" />
                <span class="tc-brand-text sm">Hire<span>Shield</span> AI</span>
              </div>
              <nav class="tc-footer-links" aria-label="Footer">
                <a href="/" data-link>Home</a>
                <a href="/safety" data-link>Safety Center</a>
                <a href="/login?mode=signup" data-link>Privacy</a>
                <a href="/login" data-link>About</a>
              </nav>
              <p class="tc-footer-copy">© 2026 HireShield AI · Built for students, by students</p>
            </div>
          </footer>
        </div>
      `;

      // ---- Mobile nav toggle ----
      const burger = el.querySelector('#tc-burger');
      const mobile = el.querySelector('#tc-nav-mobile');
      burger?.addEventListener('click', () => {
        const open = mobile.classList.toggle('open');
        burger.classList.toggle('active', open);
        burger.setAttribute('aria-expanded', String(open));
      });
      mobile?.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          mobile.classList.remove('open');
          burger?.classList.remove('active');
          burger?.setAttribute('aria-expanded', 'false');
        });
      });

      // ---- Smooth scroll for in-page anchors ----
      el.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
          const id = a.getAttribute('href').slice(1);
          const target = id ? document.getElementById(id) : null;
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }
  };
}
