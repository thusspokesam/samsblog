/* Relative guide dates. Search and keyboard shortcuts are owned by Zensical. */
(() => {
  function refresh() {
    document.querySelectorAll('time[data-hub-updated]').forEach(el => {
      const date = new Date(el.dateTime);
      if (!Number.isFinite(date.getTime())) return;
      const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
      el.textContent = days === 0 ? 'Updated today' : days === 1 ? 'Updated 1 day ago' : `Updated ${days} days ago`;
      el.title = date.toISOString().replace('T', ' ').replace('.000Z', ' UTC');
    });
  }
  if (typeof document$ !== 'undefined') document$.subscribe(refresh);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh);
  else refresh();
})();
