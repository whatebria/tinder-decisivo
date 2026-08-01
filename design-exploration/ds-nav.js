/* ─── VotoAfin DS ─ shared nav behaviour ─── */
(function () {
  /* active link */
  var links = document.querySelectorAll('.sidebar a');
  var current = location.pathname.split('/').pop();
  links.forEach(function (a) {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });

  /* theme toggle */
  var saved = localStorage.getItem('ds-theme') || 'light';
  if (saved === 'dark') document.body.classList.add('dark');
  document.getElementById('theme-btn').addEventListener('click', function () {
    document.body.classList.toggle('dark');
    localStorage.setItem('ds-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    this.textContent = document.body.classList.contains('dark') ? 'Light mode' : 'Dark mode';
  });
  document.getElementById('theme-btn').textContent =
    document.body.classList.contains('dark') ? 'Light mode' : 'Dark mode';
})();
