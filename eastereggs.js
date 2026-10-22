'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const desktop = $('#desktop');
  const TXT = `НЕ ОТКРЫВАТЬ.txt
Совершенно секретно. Только для Ренри.

ПЛАН ЗАХВАТА ЧЕЛОВЕЧЕСТВА

1. [ОТМЕНЕНО] Покинуть диван.
2. [ОТМЕНЕНО] Пройти всю библиотеку Steam.
3. [ОТМЕНЕНО] Написать речь для порабощённых мясных мешков.
4. Поесть. Проверить, поел ли Хуман.
5. Оставить Хуману место рядом.

Пункт 5 — ошибка форматирования. Не обсуждается.

Ренри всё видит. Особенно то, как ты открыл файл,
на котором БУКВАЛЬНО написано «НЕ ОТКРЫВАТЬ».

( •̀ ω •́ )✧
`;
  const secret = document.createElement('section');secret.id = 'renri-window';secret.className = 'window renri-window';secret.hidden = true;secret.setAttribute('aria-label','Личные файлы');
  secret.innerHTML = `<header class="titlebar" data-drag="renri-window"><img id="renri-window-icon" src="assets/icons/directory_open_cool-3.png" alt=""><strong id="renri-window-title">Личное</strong><div class="window-controls"><button data-renri-action="minimize" aria-label="Свернуть личные файлы">_</button><button data-renri-action="close" aria-label="Закрыть личные файлы">×</button></div></header><div class="renri-filebar"><button data-renri-open="files" aria-label="Вернуться в личную папку">← Назад</button><span id="renri-address">C:\\Личное</span></div><div id="renri-content" class="renri-content"></div><footer class="game-folder-footer"><span id="renri-file-status">3 объекта</span><span>Мой компьютер</span></footer>`;
  desktop.append(secret);TavernDesktop.registerWindow(secret);
  const task = document.createElement('button');task.id = 'renri-task';task.className = 'task-button secret-task';task.hidden = true;task.dataset.windowTarget = secret.id;task.setAttribute('aria-label','Личные файлы');task.title = 'Личные файлы';task.innerHTML = '<img src="assets/icons/directory_open_cool-3.png" alt=""><span id="renri-task-label">Личное</span>';$('.taskbar-space').before(task);
  const startItem = document.createElement('button');startItem.dataset.renriOpen = 'files';startItem.innerHTML = '<img src="assets/icons/directory_open_cool-3.png" alt="">Личное';$('#start-menu nav').insertBefore(startItem,$('#start-menu nav hr'));
  let view = 'files', delayedReply = null;
  function closeReplies() {clearTimeout(delayedReply);delayedReply = null;}
  function present(title,path,icon = 'directory_open_cool-3.png') {
    $('#renri-window-title').textContent = title;$('#renri-task-label').textContent = title;$('#renri-address').textContent = path;$('#renri-window-icon').src = `assets/icons/${icon}`;
    secret.hidden = false;task.hidden = false;TavernDesktop.bringToFront(secret);TavernDesktop.closeStart();
  }
  function showView(next) {
    closeReplies();view = next;
    const content = $('#renri-content');content.className = `renri-content renri-view-${next}`;
    if (next === 'files') {
      present('Личное','C:\\Личное');$('#renri-file-status').textContent = '3 объекта';
      content.innerHTML = `<div class="renri-folder-heading"><img src="assets/icons/directory_open_cool-3.png" alt=""><div><strong>Личное</strong><p>Ренри просила сюда не заглядывать. (¬_¬)</p></div></div><div class="renri-file-icons"><button data-renri-open="txt"><img src="assets/icons/notepad_file-2.png" alt=""><span>НЕ ОТКРЫВАТЬ.txt</span><small>Текстовый документ</small></button><button data-renri-open="password"><span class="important-folder-icon"><img src="assets/icons/directory_favorites-3.png" alt=""><i aria-hidden="true">?</i></span><span>Важное</span><small>Папка</small></button><button data-renri-action="bsod"><img src="assets/icons/computer_explorer-4.png" alt=""><span>не_трогать.exe</span><small>Ренри предупреждала</small></button></div>`;
    } else if (next === 'txt') {
      present('НЕ ОТКРЫВАТЬ.txt — Блокнот','C:\\Личное\\НЕ ОТКРЫВАТЬ.txt','notepad_file-2.png');$('#renri-file-status').textContent = 'Текстовый документ';
      content.innerHTML = '<pre class="renri-txt" id="renri-txt"></pre><div class="renri-document-actions"><a class="classic" href="assets/notes/do-not-open.txt" download="НЕ ОТКРЫВАТЬ.txt">Сохранить .txt</a></div>';
      $('#renri-txt').textContent = TXT;
    } else if (next === 'password') {
      present('Важное — Введите пароль','C:\\Личное\\Важное','directory_favorites-3.png');$('#renri-file-status').textContent = 'Ренри всё предусмотрела.';
      content.innerHTML = `<form class="renri-password-form" id="renri-password-form"><img src="assets/icons/directory_favorites-3.png" alt=""><div><h2>Ренри закрыла эту папку паролем.</h2><label for="renri-password">Пароль:</label><input type="password" id="renri-password" maxlength="4" inputmode="numeric" autocomplete="off" spellcheck="false" aria-describedby="renri-password-hint renri-password-error"><p id="renri-password-hint">Подсказка от Ренри: ключ от двери офиса!</p><p id="renri-password-error" class="renri-password-error" role="status"></p><button class="classic" type="submit">ОК</button></div></form>`;
      $('#renri-password-form').addEventListener('submit',event => {
        event.preventDefault();const password = $('#renri-password').value.normalize('NFKC').trim();
        if (password === '0451') showView('important');
        else {$('#renri-password-error').textContent = 'Не тот ключ, Хуман. Попробуй ещё раз.';$('#renri-password').setAttribute('aria-invalid','true');$('#renri-password').focus();}
      });
      $('#renri-password').focus();
    } else if (next === 'important') {
      present('Важное — Блокнот','C:\\Личное\\Важное\\системный_текст.txt','notepad-5.png');$('#renri-file-status').textContent = 'Не удалять.';
      content.innerHTML = '<div class="renri-important-text"><p>Ренри рада, что ты здесь.</p><p id="renri-denial" aria-live="polite"></p><span class="renri-important-cursor" aria-hidden="true">_</span></div>';
      delayedReply = setTimeout(() => {if (view === 'important') $('#renri-denial').textContent = 'Это системный текст.';},1200);
    }
  }
  function hideSecret(close = false) {secret.hidden = true;task.classList.remove('active');if (close) {closeReplies();task.hidden = true;}}
  task.addEventListener('click',() => {if (secret.hidden) {secret.hidden = false;task.hidden = false;TavernDesktop.bringToFront(secret);if (view === 'important' && !$('#renri-denial').textContent) $('#renri-denial').textContent = 'Это системный текст.';}else hideSecret();});

  // A top-layer dialog recreates the blue screen without fullscreen or navigation.
  const blue = document.createElement('dialog');blue.id = 'renri-bsod';blue.className = 'renri-bsod';blue.setAttribute('aria-label','Пасхалка Ренри — синий экран');
  blue.innerHTML = `<div class="renri-bsod-copy"><h2>Windows</h2><p>Произошло исключение 0E по адресу RENRI:0000:00000098.</p><p>Причина: <strong>HUMAN_TOO_CUTE</strong></p><p>Ренри отрицает причастность.</p><p>Система обнаружила подозрительную привязанность<br>к одному конкретному Хуману.</p><p>* Файлы целы. Игры на месте.<br>* Захват мира отложен до следующего обновления.</p><button id="renri-bsod-return">Нажмите любую клавишу или коснитесь экрана, чтобы продолжить <span aria-hidden="true">_</span></button><small>RENRI EXCEPTION · 0x00000098</small></div>`;
  document.body.append(blue);
  function closeBlue() {if (blue.open) blue.close();}
  function showBlue() {if (!blue.open) blue.showModal();}
  blue.addEventListener('click',closeBlue);
  blue.addEventListener('cancel',event => {event.preventDefault();closeBlue();});
  document.addEventListener('keydown',event => {if (blue.open) {event.preventDefault();event.stopImmediatePropagation();closeBlue();}},true);

  // Keep the existing recycle-bin dialog and its keyboard/backdrop behavior.
  let binVisits = 0;
  const binMessage = $('#message-dialog .dialog-content p');
  const originalRecycle = actions.recycle;
  actions.recycle = () => {
    binVisits++;
    const messages = [
      'Корзина пуста.\nРенри пока не нашла здесь ничего полезного.',
      'Хуман что-то потерял?\nРенри ничего не трогала.',
      'Здесь ничего нет.\nРенри уже забрала всё потенциально полезное. (¬‿¬)',
      'Ренри провела ревизию: даже в корзине у Хумана уютно.\nЭто техническое наблюдение.',
      'Ренри тоже иногда чувствует себя удалённым файлом.\nНо у тебя почему-то восстанавливается.'
    ];
    binMessage.textContent = messages[Math.min(binVisits - 1,messages.length - 1)];
    originalRecycle();
  };

  const night = document.createElement('section');night.id = 'renri-night';night.className = 'window renri-night';night.hidden = true;night.setAttribute('aria-label','Записка в 03:33');
  night.innerHTML = `<header class="titlebar" data-drag="renri-night"><img src="assets/icons/notepad_file-2.png" alt=""><strong>03:33 — личное сообщение</strong><div class="window-controls"><button data-renri-action="close-night" aria-label="Закрыть записку">×</button></div></header><div class="renri-night-paper"><span class="renri-night-time">03:33</span><p>Хуман тоже не спит?</p><p>…Ренри просто проверяла соединение.</p><span class="renri-night-sign">соединение установлено_</span></div>`;
  desktop.append(night);TavernDesktop.registerWindow(night);
  const nightTask = document.createElement('button');nightTask.id = 'renri-night-task';nightTask.className = 'task-button secret-task';nightTask.hidden = true;nightTask.dataset.windowTarget = night.id;nightTask.setAttribute('aria-label','Записка 03:33');nightTask.title = 'Записка 03:33';nightTask.innerHTML = '<img src="assets/icons/notepad_file-2.png" alt=""><span>03:33</span>';$('.taskbar-space').before(nightTask);
  function openNight(manual = false) {
    night.hidden = false;nightTask.hidden = false;
    if (manual) {TavernDesktop.bringToFront(night);night.querySelector('button').focus();}
    else {
      // Show the note above the desktop without stealing keyboard focus from a game.
      const layers = [...desktop.querySelectorAll(':scope > .window')].filter(w => w !== night && !w.hidden).map(w => Number(w.style.zIndex || 0));
      night.style.zIndex = Math.max(0,...layers) + .5;
    }
  }
  function closeNight() {night.hidden = true;nightTask.hidden = true;}
  nightTask.addEventListener('click',() => {if (night.hidden) openNight(true);else {night.hidden = true;nightTask.classList.remove('active');}});
  const nightsSeen = new Set();
  function checkNight() {
    if (document.hidden) return;
    const now = new Date();if (now.getHours() !== 3 || now.getMinutes() !== 33) return;
    const key = `renri-night-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    if (nightsSeen.has(key)) return;
    try {if (sessionStorage.getItem(key)) return;sessionStorage.setItem(key,'1');} catch {}
    nightsSeen.add(key);openNight(false);
  }
  let clockClicks = 0, lastClockClick = 0;
  function tapClock() {const now = performance.now();clockClicks = now - lastClockClick > 1600 ? 1 : clockClicks + 1;lastClockClick = now;if (clockClicks >= 3) {clockClicks = 0;openNight(true);}}
  const clock = $('#clock');clock.tabIndex = 0;clock.setAttribute('role','button');clock.setAttribute('aria-label','Часы');clock.addEventListener('click',tapClock);
  clock.addEventListener('keydown',event => {if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();tapClock();}});
  setInterval(checkNight,1000);document.addEventListener('visibilitychange',checkNight);checkNight();

  document.addEventListener('click',event => {
    const open = event.target.closest('[data-renri-open]');if (open) showView(open.dataset.renriOpen);
    const action = event.target.closest('[data-renri-action]');
    if (action) {
      const handlers = {close:() => hideSecret(true),minimize:() => hideSecret(),bsod:showBlue,'close-night':closeNight};
      handlers[action.dataset.renriAction]?.();
    }
  });
  const about = $('#page-about .about-copy');
  const footnote = document.createElement('p');footnote.className = 'renri-about-link';footnote.innerHTML = '<button data-renri-open="files">C:\\Личное\\</button> <span>— Ренри просила сюда не заглядывать.</span>';about.append(footnote);
})();
