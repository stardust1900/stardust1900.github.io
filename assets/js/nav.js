// 移动端导航菜单开合
export function initNav() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const hidden = menu.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', String(!hidden));
  });
}
