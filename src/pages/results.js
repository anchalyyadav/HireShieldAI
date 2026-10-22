// Page: Analysis Results — display AI analysis for a specific scan
import { icon } from '../js/icons.js';

export function resultsPage() {
  return {
    onMount(el, path) {
      // Extract scan ID from path /results/:id
      const id = path.split('/results/')[1] || '';

      el.innerHTML = `
        <div class="page-header">
          <a href="/scanner" class="btn btn-ghost btn-sm" data-link>${icon('arrowLeft')} Back to scanner</a>
        </div>
        <div class="card card-glow" style="text-align:center;padding:48px;">
          <div class="spinner" style="margin:0 auto 16px;"></div>
          <p class="text-muted">Loading analysis results...</p>
        </div>
      `;

      // Will be implemented when AI + database are configured
      // For now, show placeholder
      setTimeout(() => {
        el.innerHTML = `
          <div class="page-header">
            <a href="/scanner" class="btn btn-ghost btn-sm" data-link>${icon('arrowLeft')} Back to scanner</a>
            <h1 class="mt-2">Analysis Results</h1>
          </div>
          <div class="card">
            <div class="empty-state">
              ${icon('chart')}
              <h3>Results display coming soon</h3>
              <p>The AI analysis and database persistence need to be configured. Once set up, detailed risk breakdowns will appear here.</p>
              <a href="/scanner" class="btn btn-primary mt-2" data-link>Scan another message</a>
            </div>
          </div>
        `;
      }, 800);
    }
  };
}
