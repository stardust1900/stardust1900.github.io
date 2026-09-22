import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initSearch } from './search.js';
import { initShare } from './share.js';
import { initPagination } from './paginate.js';

function boot() {
  initTheme();
  initNav();
  initSearch();
  initShare();
  initPagination();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
