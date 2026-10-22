// HireShield AI — app entry point
import { registerRoute, router } from './js/router.js';
import { onAuthChange } from './js/shell.js';

import { landingPage } from './pages/landing.js';
import { loginPage } from './pages/login.js';
import { dashboardPage } from './pages/dashboard.js';
import { scannerPage } from './pages/scanner.js';
import { resultsPage } from './pages/results.js';
import { historyPage } from './pages/history.js';
import { safetyPage } from './pages/safety.js';
import { profilePage } from './pages/profile.js';

// Register routes
registerRoute('/', landingPage);
registerRoute('/login', loginPage);
registerRoute('/dashboard', dashboardPage);
registerRoute('/scanner', scannerPage);
registerRoute('/results/*', resultsPage);
registerRoute('/history', historyPage);
registerRoute('/safety', safetyPage);
registerRoute('/profile', profilePage);

// Listen for auth state changes
onAuthChange(() => {});

// Initial render
router();
