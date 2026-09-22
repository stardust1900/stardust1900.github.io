// 分页：根据 pageNav.html 中的隐藏字段生成页码
export function initPagination() {
  const container = document.getElementById('page-link-container');
  if (!container) return;

  const total = parseInt(document.getElementById('total_pages').value, 10);
  const current = parseInt(document.getElementById('current_pages').value, 10);
  const base = document.getElementById('base_url').value || '/';

  const linkFor = (n) => (n === 1 ? base : `${base}page${n}/`);
  const linkCls = 'inline-flex min-w-[2.25rem] items-center justify-center rounded-lg px-3 py-1.5 text-sm transition';

  const make = (n, label, active = false) => {
    const a = document.createElement('a');
    a.href = linkFor(n);
    a.className = linkCls + (active
      ? ' bg-brand text-white'
      : ' text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700');
    a.textContent = label;
    return a;
  };

  if (current > 1) container.appendChild(make(current - 1, '‹'));

  const candidates = [1, current - 1, current, current + 1, total]
    .filter((n) => n >= 1 && n <= total);
  const pages = [...new Set(candidates)].sort((a, b) => a - b);

  let prev = 0;
  pages.forEach((n) => {
    if (n - prev > 1) {
      const span = document.createElement('span');
      span.className = 'px-1 text-slate-400';
      span.textContent = '…';
      container.appendChild(span);
    }
    container.appendChild(make(n, String(n), n === current));
    prev = n;
  });

  if (current < total) container.appendChild(make(current + 1, '›'));
}
