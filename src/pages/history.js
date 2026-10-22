// Page: Scan History — list of past scans
import { icon } from '../js/icons.js';

export function historyPage() {
  return {
    onMount(el) {
      el.innerHTML = `
        <div class="page-header">
          <h1>Scan History</h1>
          <p>Review all messages you've scanned and their risk assessments.</p>
        </div>
        <div class="card">
          <div class="empty-state">
            ${icon('history')}
            <h3>No scans yet</h3>
            <p>Your scan history will appear here once you start analyzing messages.</p>
            <a href="/scanner" class="btn btn-primary mt-2" data-link>${icon('scan')} Scan a message</a>
          </div>
        </div>
      `;
    }
  };
}
