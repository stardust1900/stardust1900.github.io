// 站内搜索：基于 search.json 的前端模糊匹配
export function initSearch() {
  const input = document.getElementById('search_input');
  const box = document.getElementById('search_result');
  if (!input || !box) return;

  let posts = [];
  fetch(`${location.origin}/search.json`)
    .then((r) => r.json())
    .then((d) => { posts = Array.isArray(d) ? d : []; })
    .catch(() => {});

  const render = (q) => {
    const query = q.trim().toLowerCase();
    if (!query) {
      box.classList.add('hidden');
      box.innerHTML = '';
      return;
    }
    const matches = posts
      .filter((p) => `${p.title} ${p.tags || ''}`.toLowerCase().includes(query))
      .slice(0, 8);
    if (!matches.length) {
      box.innerHTML = '<div class="px-2 py-1.5 text-slate-400">无匹配结果</div>';
    } else {
      box.innerHTML = matches
        .map((m) => `<a href="${m.url}" class="block rounded px-2 py-1.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">${m.title}</a>`)
        .join('');
    }
    box.classList.remove('hidden');
  };

  let timer;
  input.addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => render(e.target.value), 120);
  });
  input.addEventListener('focus', () => {
    if (input.value.trim()) render(input.value);
  });
  document.addEventListener('click', (e) => {
    if (e.target.id !== 'search_input' && e.target.id !== 'search_result' && !box.contains(e.target)) {
      box.classList.add('hidden');
    }
  });
}
