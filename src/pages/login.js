// Page: Login / Sign Up
import { supabase, isSupabaseConfigured } from '../js/supabaseClient.js';
import { toast } from '../js/toast.js';
import { icon } from '../js/icons.js';

export function loginPage() {
  return {
    onMount(el) {
      const params = new URLSearchParams(location.search);
      const initialMode = params.get('mode') === 'signup' ? 'signup' : 'login';

      el.innerHTML = `
        <div class="auth-wrap">
          <div class="auth-glow"></div>
          <div class="auth-card card card-glow">
            <a href="/" class="auth-brand" data-link>
              <img src="/favicon.svg" width="40" height="40" alt="HireShield AI" />
              <span class="auth-brand-text">Hire<span>Shield</span> AI</span>
            </a>

            <div class="auth-tabs" role="tablist">
              <button class="auth-tab ${initialMode === 'login' ? 'active' : ''}" data-mode="login" role="tab" aria-selected="${initialMode === 'login'}">Log In</button>
              <button class="auth-tab ${initialMode === 'signup' ? 'active' : ''}" data-mode="signup" role="tab" aria-selected="${initialMode === 'signup'}">Sign Up</button>
            </div>

            <form id="auth-form" class="auth-form" novalidate>
              <!-- Name (signup only) -->
              <div class="form-group" id="name-field" style="display:${initialMode === 'signup' ? 'block' : 'none'}">
                <label class="form-label" for="auth-name">Full name</label>
                <input class="form-input" type="text" id="auth-name" placeholder="Jane Doe" autocomplete="name" />
                <div class="form-error" id="name-error"></div>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label class="form-label" for="auth-email">Email</label>
                <input class="form-input" type="email" id="auth-email" placeholder="you@university.edu" autocomplete="email" required />
                <div class="form-error" id="email-error"></div>
              </div>

              <!-- Password -->
              <div class="form-group">
                <label class="form-label" for="auth-password">Password</label>
                <div class="pwd-wrap">
                  <input class="form-input pwd-input" type="password" id="auth-password" placeholder="At least 6 characters" autocomplete="${initialMode === 'signup' ? 'new-password' : 'current-password'}" required minlength="6" />
                  <button type="button" class="pwd-toggle" id="pwd-toggle" aria-label="Show password" tabindex="-1">${icon('eye')}</button>
                </div>
                <div class="form-error" id="password-error"></div>
              </div>

              <!-- Confirm password (signup only) -->
              <div class="form-group" id="confirm-field" style="display:${initialMode === 'signup' ? 'block' : 'none'}">
                <label class="form-label" for="auth-confirm">Confirm password</label>
                <div class="pwd-wrap">
                  <input class="form-input pwd-input" type="password" id="auth-confirm" placeholder="Re-enter your password" autocomplete="new-password" required />
                  <button type="button" class="pwd-toggle" id="confirm-toggle" aria-label="Show password" tabindex="-1">${icon('eye')}</button>
                </div>
                <div class="form-error" id="confirm-error"></div>
              </div>

              <!-- Config warning -->
              <div class="auth-config-warn" id="config-warn" style="display:${isSupabaseConfigured ? 'none' : 'block'}">
                ${icon('alert')}
                <span>Supabase is not configured. Authentication is unavailable until environment variables are set.</span>
              </div>

              <button type="submit" class="btn btn-primary btn-block btn-lg" id="auth-submit">${initialMode === 'signup' ? 'Create Account' : 'Log In'}</button>
            </form>

            <a href="/" class="auth-back" data-link>${icon('arrowLeft')} Back to home</a>

            <p class="auth-privacy">
              ${icon('lock')}
              <span>Sign in to save and revisit your scan reports. Your password is never stored in plain text — authentication is handled securely by Supabase.</span>
            </p>
          </div>
        </div>
      `;

      let mode = initialMode;

      // ---- Tab switching ----
      const tabs = el.querySelectorAll('.auth-tab');
      const nameField = el.querySelector('#name-field');
      const confirmField = el.querySelector('#confirm-field');
      const submitBtn = el.querySelector('#auth-submit');
      const passwordInput = el.querySelector('#auth-password');
      const confirmInput = el.querySelector('#auth-confirm');
      const errors = {
        name: el.querySelector('#name-error'),
        email: el.querySelector('#email-error'),
        password: el.querySelector('#password-error'),
        confirm: el.querySelector('#confirm-error'),
      };

      function clearErrors() {
        Object.values(errors).forEach(e => (e.textContent = ''));
        el.querySelectorAll('.form-input').forEach(i => i.classList.remove('input-error'));
      }

      function setMode(m) {
        mode = m;
        tabs.forEach(t => {
          const active = t.dataset.mode === m;
          t.classList.toggle('active', active);
          t.setAttribute('aria-selected', String(active));
        });
        nameField.style.display = m === 'signup' ? 'block' : 'none';
        confirmField.style.display = m === 'signup' ? 'block' : 'none';
        submitBtn.textContent = m === 'signup' ? 'Create Account' : 'Log In';
        passwordInput.setAttribute('autocomplete', m === 'signup' ? 'new-password' : 'current-password');
        clearErrors();
      }

      tabs.forEach(t => t.addEventListener('click', () => setMode(t.dataset.mode)));

      // ---- Password show/hide toggles ----
      function setupToggle(btnId, inputId) {
        const btn = el.querySelector(btnId);
        const input = el.querySelector(inputId);
        btn?.addEventListener('click', () => {
          const isPwd = input.type === 'password';
          input.type = isPwd ? 'text' : 'password';
          btn.innerHTML = isPwd ? icon('eyeOff') : icon('eye');
          btn.setAttribute('aria-label', isPwd ? 'Hide password' : 'Show password');
        });
      }
      setupToggle('#pwd-toggle', '#auth-password');
      setupToggle('#confirm-toggle', '#auth-confirm');

      // ---- Inline error helper ----
      function showError(field, msg) {
        errors[field].textContent = msg;
        const input = el.querySelector(
          field === 'name' ? '#auth-name' :
          field === 'email' ? '#auth-email' :
          field === 'password' ? '#auth-password' : '#auth-confirm'
        );
        input?.classList.add('input-error');
      }

      // ---- Validation ----
      function validate() {
        clearErrors();
        let valid = true;
        const email = el.querySelector('#auth-email').value.trim();
        const password = el.querySelector('#auth-password').value;
        const name = el.querySelector('#auth-name').value.trim();
        const confirm = el.querySelector('#auth-confirm').value;

        if (mode === 'signup' && name.length < 2) {
          showError('name', 'Please enter your full name.');
          valid = false;
        }

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) {
          showError('email', 'Please enter a valid email address.');
          valid = false;
        }

        if (password.length < 6) {
          showError('password', 'Password must be at least 6 characters.');
          valid = false;
        }

        if (mode === 'signup' && confirm !== password) {
          showError('confirm', 'Passwords do not match.');
          valid = false;
        }

        return valid;
      }

      // ---- Submit ----
      el.querySelector('#auth-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isSupabaseConfigured) {
          toast.warning('Auth not configured', 'Supabase credentials are missing — sign in is unavailable.');
          return;
        }

        if (!validate()) return;

        const email = el.querySelector('#auth-email').value.trim();
        const password = el.querySelector('#auth-password').value;
        const name = el.querySelector('#auth-name').value.trim();

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0 auto;"></div>';

        try {
          if (mode === 'signup') {
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: { data: { full_name: name } }
            });

            if (error) throw error;

            // Check if email confirmation is required
            if (data?.user && !data?.session) {
              el.querySelector('#auth-form').style.display = 'none';
              el.querySelector('.auth-tabs').style.display = 'none';
              const confirmMsg = el.querySelector('#confirm-msg');
              if (confirmMsg) confirmMsg.remove();
              const msg = document.createElement('div');
              msg.id = 'confirm-msg';
              msg.className = 'auth-confirm-msg';
              msg.innerHTML = `
                <div class="auth-confirm-icon">${icon('mail')}</div>
                <h3>Check your email</h3>
                <p>We sent a confirmation link to <strong>${email}</strong>. Click the link to activate your account, then return to sign in.</p>
                <button class="btn btn-secondary btn-block mt-2" id="back-to-login">Back to Log In</button>
              `;
              el.querySelector('.auth-card').insertBefore(msg, el.querySelector('.auth-back'));
              el.querySelector('#back-to-login')?.addEventListener('click', () => {
                msg.remove();
                el.querySelector('#auth-form').style.display = '';
                el.querySelector('.auth-tabs').style.display = '';
                setMode('login');
                el.querySelector('#auth-email').value = email;
              });
              toast.success('Account created', 'Check your email to confirm your account.');
            } else {
              toast.success('Welcome to HireShield AI', 'Your account is ready.');
              setTimeout(() => location.assign('/dashboard'), 600);
            }
          } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast.success('Welcome back', 'Signed in successfully.');
            setTimeout(() => location.assign('/dashboard'), 500);
          }
        } catch (err) {
          toast.error('Authentication failed', err.message || 'Please try again.');
          submitBtn.disabled = false;
          submitBtn.textContent = mode === 'signup' ? 'Create Account' : 'Log In';
        }
      });
    }
  };
}
