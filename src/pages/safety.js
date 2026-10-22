// Page: Safety Center — educational content about job scams
import { icon } from '../js/icons.js';

export function safetyPage() {
  return {
    onMount(el) {
      el.innerHTML = `
        <div class="page-header">
          <h1>Safety Center</h1>
          <p>Learn how to spot job scams and protect yourself while applying.</p>
        </div>
        <div class="card-grid card-grid-2 mb-3">
          <div class="card">
            <div class="feature-icon" style="color:var(--risk-high)">${icon('alert')}</div>
            <h3 class="mb-1">Common red flags</h3>
            <ul style="color:var(--text-muted);font-size:var(--fs-sm);line-height:1.8;">
              <li>• Requests for payment or bank details</li>
              <li>• Urgent deadlines pressuring you to act fast</li>
              <li>• Generic greetings ("Dear applicant")</li>
              <li>• Personal email addresses instead of company domains</li>
              <li>• Job offers without any interview</li>
              <li>• Vague job descriptions with no specifics</li>
            </ul>
          </div>
          <div class="card">
            <div class="feature-icon" style="color:var(--blue)">${icon('info')}</div>
            <h3 class="mb-1">How to verify a recruiter</h3>
            <ul style="color:var(--text-muted);font-size:var(--fs-sm);line-height:1.8;">
              <li>• Check their LinkedIn profile and connections</li>
              <li>• Verify the company website and careers page</li>
              <li>• Look up the phone number and email domain</li>
              <li>• Search for the company + "scam" or "reviews"</li>
              <li>• Contact the company directly through official channels</li>
            </ul>
          </div>
        </div>
        <div class="card">
          <div class="feature-icon" style="color:var(--risk-low)">${icon('safety')}</div>
          <h3 class="mb-1">If you've been scammed</h3>
          <p class="text-muted">If you've already shared sensitive information or sent money:</p>
          <ul style="color:var(--text-muted);font-size:var(--fs-sm);line-height:1.8;margin-top:8px;">
            <li>1. Contact your bank immediately to freeze accounts</li>
            <li>2. Change passwords for any compromised accounts</li>
            <li>3. Report to the FTC at reportfraud.ftc.gov</li>
            <li>4. File a report with your local police department</li>
            <li>5. Notify your university's career services office</li>
          </ul>
        </div>
      `;
    }
  };
}
