'use strict';
const $ = selector => document.querySelector(selector);
const explorer = $('#explorer');
const notepad = $('#notepad');
const startMenu = $('#start-menu');
const startButton = $('#start-button');
const labels = {home:'главная',preset:'пресеты',extensions:'расширения',scripts:'скрипты',bots:'БОТЫ',about:'о сайте'};
const statuses = {home:'Ренри на связи. Располагайся, Хуман.',preset:'2 пресета · Актуальный: GODDESS LITE v5.51 · Можно забирать, Хуман.',extensions:'7 расширений · SillyStyles в архиве · Ренри всё сложила.',scripts:'5 наборов · 6 JSON · JS Slash Runner · Ренри всё сложила.',bots:'1 карточка · JSON и PNG · Ренри готова к переселению.',about:'Соединение с Ренри установлено.'};
let currentPage = 'home';
let history = [];
let topLayer = 20;
let noteVisible = matchMedia('(min-width: 801px)').matches;
function menu(open) { startMenu.hidden = !open; startButton.setAttribute('aria-expanded', String(open)); }
function bringToFront(win) {
  win.style.zIndex = ++topLayer;
  for (const other of document.querySelectorAll('.desktop > .window')) other.classList.toggle('is-active',other === win);
  for (const task of document.querySelectorAll('.task-button[data-window-target]')) task.classList.toggle('active',task.dataset.windowTarget === win.id && !win.hidden);
  document.dispatchEvent(new CustomEvent('tavern:activate',{detail:{window:win}}));
}
$('#explorer-task').dataset.windowTarget = 'explorer';
$('#note-task').dataset.windowTarget = 'notepad';
function showExplorer() { explorer.hidden = false; $('#explorer-task').classList.add('active'); bringToFront(explorer); }
function navigate(page, push = true) {
  if (!Object.hasOwn(labels, page)) return;
  if (push && page !== currentPage) history.push(currentPage);
  currentPage = page;
  for (const section of document.querySelectorAll('.page')) section.hidden = section.id !== `page-${page}`;
  for (const button of document.querySelectorAll('.tree [data-page]')) {
    const selected = button.dataset.page === page;
    button.classList.toggle('selected', selected);
    if (selected) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
    button.title = button.textContent.trim();
  }
  $('#address').textContent = `C:\\my little tavern\\${labels[page]}`;
  $('#status').textContent = statuses[page];
  $('#back').disabled = history.length === 0;
  $('#page-scroll').scrollTop = 0;
  showExplorer();
  menu(false);
  window.history.replaceState(null, '', `#${page}`);
  document.dispatchEvent(new CustomEvent('tavern:navigate',{detail:{page}}));
}
function showNote(show = true) {
  noteVisible = show;
  notepad.hidden = !show;
  notepad.classList.toggle('mobile-open', show);
  $('#note-task').classList.toggle('active', show);
  if (show) bringToFront(notepad);
}
// Dark entries from the standard Windows palette; keep white icon labels legible.
const themes = ['#008080', '#000080', '#008000', '#800000', '#800080', '#808000', '#808080', '#000000'];
let themeIndex = 0;
try { const saved = localStorage.getItem('tavern98-desktop'); if (themes.includes(saved)) {themeIndex = themes.indexOf(saved);document.documentElement.style.setProperty('--desktop',saved);} else if (saved !== null) localStorage.removeItem('tavern98-desktop'); } catch {}
const actions = {
  minimize() { explorer.hidden = true; $('#explorer-task').classList.remove('active'); },
  close() { actions.minimize(); },
  maximize() { explorer.classList.toggle('maximized'); },
  note() { showNote(); menu(false); },
  'close-note'() { showNote(false); },
  recycle() { $('#message-dialog').showModal(); },
  'close-dialog'() { $('#message-dialog').close(); },
  theme() { themeIndex = (themeIndex + 1) % themes.length; const color = themes[themeIndex]; document.documentElement.style.setProperty('--desktop', color); try {localStorage.setItem('tavern98-desktop',color);} catch {} menu(false); }
};
document.addEventListener('click', event => {
  const target = event.target.closest('[data-page], [data-action]');
  if (target?.dataset.page) navigate(target.dataset.page);
  else if (target?.dataset.action) actions[target.dataset.action]?.();
  if (!startMenu.contains(event.target) && !startButton.contains(event.target)) menu(false);
});
$('#back').addEventListener('click', () => { if (history.length) navigate(history.pop(), false); });
startButton.addEventListener('click', () => menu(startMenu.hidden));
$('#explorer-task').addEventListener('click', () => { if (explorer.hidden) showExplorer(); else actions.minimize(); });
$('#note-task').addEventListener('click', () => showNote(!noteVisible));
document.addEventListener('keydown', event => { if (event.key === 'Escape') menu(false); });
function tick() { const now = new Date(); $('#clock').textContent = now.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}); $('#clock').dateTime = now.toISOString(); $('#clock').title = now.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'}); }
tick(); setInterval(tick, 1000);

// Pointer capture keeps dragging stable even when the pointer leaves the title bar.
function registerWindow(win) {
  const bar = win.querySelector('[data-drag]');
  if (!bar || bar.dataset.registered) return;
  bar.dataset.registered = 'true';
  win.addEventListener('pointerdown', () => bringToFront(win));
  win.addEventListener('focusin', () => bringToFront(win));
  let drag = null;
  bar.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || event.button !== 0 || win.classList.contains('maximized')) return;
    if (matchMedia('(max-width: 800px)').matches) return;
    const rect = win.getBoundingClientRect();
    drag = {x:event.clientX - rect.left,y:event.clientY - rect.top};
    win.style.transform = 'none';
    win.style.left = `${rect.left}px`;win.style.top = `${rect.top}px`;win.style.bottom = 'auto';win.style.right = 'auto';
    bar.setPointerCapture(event.pointerId);
    bringToFront(win);
    event.preventDefault();
  });
  bar.addEventListener('pointermove', event => {
    if (!drag) return;
    win.style.left = `${Math.max(0,Math.min(innerWidth - Math.min(win.offsetWidth,160),event.clientX - drag.x))}px`;
    win.style.top = `${Math.max(0,Math.min(innerHeight - 68,event.clientY - drag.y))}px`;
  });
  const stop = () => { drag = null; };
  bar.addEventListener('pointerup',stop);bar.addEventListener('pointercancel',stop);bar.addEventListener('lostpointercapture',stop);
  if (win === explorer) bar.addEventListener('dblclick',event => {if(!event.target.closest('button')) actions.maximize();});
}
for (const win of document.querySelectorAll('.desktop > .window')) registerWindow(win);
window.TavernDesktop = {registerWindow,bringToFront,navigate,closeStart:() => menu(false)};
new MutationObserver(() => {
  const active = document.querySelector('.desktop > .window.is-active');
  if (active && !active.hidden) return;
  const visible = [...document.querySelectorAll('.desktop > .window')].filter(win => !win.hidden && getComputedStyle(win).display !== 'none');
  visible.sort((a,b) => Number(a.style.zIndex || 0) - Number(b.style.zIndex || 0));
  if (visible.length) bringToFront(visible.at(-1));
}).observe($('#desktop'),{subtree:true,attributes:true,attributeFilter:['hidden']});
document.addEventListener('click',event => {
  for (const detail of document.querySelectorAll('.classic-dropdown[open]')) if (!detail.contains(event.target)) detail.open = false;
});
document.addEventListener('keydown',event => {if (event.key === 'Escape') document.querySelectorAll('.classic-dropdown[open]').forEach(detail => detail.open = false);});
window.addEventListener('resize', () => {
  for (const win of document.querySelectorAll('.desktop > .window')) {
    if (win.style.left) win.style.left = `${Math.max(0,Math.min(parseFloat(win.style.left),innerWidth - Math.min(win.offsetWidth,160)))}px`;
    if (win.style.top) win.style.top = `${Math.max(0,Math.min(parseFloat(win.style.top),innerHeight - 68))}px`;
  }
});
showNote(noteVisible);
navigate(location.hash.slice(1) || 'home',false);
window.addEventListener('hashchange',() => navigate(location.hash.slice(1),false));
