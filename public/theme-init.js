// Applies the saved theme before first paint. Kept in its own file so the
// Content-Security-Policy can forbid inline scripts (script-src 'self').
(function () {
  try {
    var stored = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', stored || 'light');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
