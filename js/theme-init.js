/**
 * Applies the saved (or OS) colour scheme before first paint.
 * Plain script, no dependencies: it runs in <head>.
 */
(function () {
  var theme = 'light';
  try {
    var stored = window.localStorage.getItem('kaliyattam-theme');
    if (stored === 'dark' || stored === 'light') {
      theme = stored;
    }
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
  }
  catch (e) {
    /* Storage blocked: fall back to light. */
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
