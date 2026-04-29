/**
 * Unpacked Reading Path — auto-generates chapter-navigation links for unpacked topic pages.
 * Expects: <div class="chapter-navigation" data-auto-path></div>
 * Reads:  data/unpacked-reading-paths.json
 */
(function () {
  'use strict';

  const mount = document.querySelector('.chapter-navigation[data-auto-path]');
  if (!mount) return;

  const pageName = location.pathname.split('/').pop() || 'index.html';

  fetch('data/unpacked-reading-paths.json')
    .then(r => {
      if (!r.ok) throw new Error('reading-path data unavailable');
      return r.json();
    })
    .then(data => {
      const cfg = (data.paths || {})[pageName];
      if (!cfg) return;

      mount.innerHTML = '';

      const prev = cfg.prev;
      const next = cfg.next;

      if (prev) {
        const a = document.createElement('a');
        a.href = prev.href;
        a.className = 'btn btn-secondary';
        a.textContent = '\u2190 ' + prev.label;
        mount.appendChild(a);
      }

      if (next) {
        const a = document.createElement('a');
        a.href = next.href;
        a.className = 'btn btn-primary';
        a.textContent = next.label + ' \u2192';
        mount.appendChild(a);
      }

      // Ensure flex spacing if only one side present
      if (prev && !next) {
        const spacer = document.createElement('span');
        spacer.style.flex = '1';
        mount.appendChild(spacer);
      }
    })
    .catch(err => {
      // Fail silently; leave mount empty so hardcoded fallback (if any) is untouched.
      console.warn('unpacked-reading-path:', err.message);
    });
})();
