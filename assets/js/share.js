// 社交分享：基于 data-url / data-title 生成分享入口
export function initShare() {
  const bar = document.getElementById('share-bar');
  if (!bar) return;

  const url = encodeURIComponent(bar.dataset.url || location.href);
  const title = encodeURIComponent(bar.dataset.title || document.title);

  const items = [
    { key: 'weibo', label: '微博', href: `https://service.weibo.com/share/share.php?url=${url}&title=${title}` },
    { key: 'twitter', label: 'Twitter', href: `https://twitter.com/intent/tweet?url=${url}&text=${title}` },
    { key: 'douban', label: '豆瓣', href: `https://www.douban.com/share/service?href=${url}&name=${title}` },
    { key: 'link', label: '复制链接', href: '#' }
  ];

  bar.className = 'flex flex-wrap items-center gap-2';
  bar.innerHTML = items
    .map((it) => `<a href="${it.href}" target="_blank" rel="noopener" data-key="${it.key}" class="ui-tag">${it.label}</a>`)
    .join('');

  const linkBtn = bar.querySelector('[data-key="link"]');
  if (linkBtn) {
    linkBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(decodeURIComponent(url));
        linkBtn.textContent = '已复制';
        setTimeout(() => { linkBtn.textContent = '复制链接'; }, 1500);
      } catch (_) {}
    });
  }
}
