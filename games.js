'use strict';
(() => {
  const {Minesweeper,Solitaire} = TavernGames;
  const desktop = document.querySelector('#desktop');
  const $ = selector => document.querySelector(selector);
  const icons = {games:'joystick_3.png',mines:'game_mine_1_0.png',solitaire:'game_solitaire_0.png'};
  const titles = {games:'Игры',mines:'Сапёр',solitaire:'Косынка'};
  const windows = {};
  function createWindow(id,content) {
    const win = document.createElement('section');
    win.id = `game-${id}`;win.className = `window game-window ${id}-window`;win.hidden = true;
    win.setAttribute('aria-label',titles[id]);
    win.innerHTML = `<header class="titlebar" data-drag="game-${id}"><img src="assets/icons/${icons[id]}" alt=""><strong>${titles[id]}</strong><div class="window-controls"><button data-game-hide="${id}" aria-label="Свернуть ${titles[id]}">_</button><button data-game-hide="${id}" aria-label="Закрыть ${titles[id]}">×</button></div></header>${content}`;
    desktop.append(win);TavernDesktop.registerWindow(win);
    const task = document.createElement('button');task.className = 'task-button game-task';task.hidden = true;
    task.innerHTML = `<img src="assets/icons/${icons[id]}" alt=""><span>${titles[id]}</span>`;
    task.title = titles[id];task.setAttribute('aria-label',titles[id]);task.dataset.windowTarget = win.id;
    task.addEventListener('click', () => {if(win.hidden) openWindow(id);else hideWindow(id,false);});
    $('.taskbar-space').before(task);windows[id] = {win,task};
    return win;
  }
  function openWindow(id) {
    const entry = windows[id];if (!entry) return;
    entry.win.hidden = false;entry.task.hidden = false;entry.task.classList.add('active');
    TavernDesktop.bringToFront(entry.win);TavernDesktop.closeStart();
    if (id === 'mines' && !mineGame) newMines();
    if (id === 'solitaire' && !solitaire) newSolitaire();
  }
  function hideWindow(id,close = true) {
    const entry = windows[id];entry.win.hidden = true;entry.task.classList.remove('active');
    if (close) entry.task.hidden = true;
  }
  createWindow('games',`<div class="game-folder-address">Адрес <span><img src="assets/icons/joystick_3.png" alt=""> C:\\Мой компьютер\\Игры</span></div><div class="game-folder-intro"><strong>Ренри разрешает ещё партию.</strong><span>А потом Хуман точно вернётся к делам. Наверное.</span></div><div class="game-shortcuts"><button data-game-open="mines"><img src="assets/icons/game_mine_1_0.png" alt=""><strong>Сапёр</strong><small>Ренри верит в Хумана.<br>Но флажки всё-таки ставь.</small></button><button data-game-open="solitaire"><img src="assets/icons/game_solitaire_0.png" alt=""><strong>Косынка</strong><small>Ренри сдаёт карты.<br>Спешить тут некуда.</small></button></div><div class="game-folder-footer"><span>2 объекта</span><span>Работают офлайн</span></div>`);
  createWindow('mines',`<div class="game-menu"><details class="classic-dropdown"><summary>Игра</summary><div class="classic-popup"><button id="mines-new">Новая игра <kbd>F2</kbd></button><label>Поле <select id="mines-size" aria-label="Размер поля"><option value="9">9 × 9 · 10 мин</option><option value="16">16 × 16 · 40 мин</option></select></label></div></details><button id="mines-help" aria-expanded="false">Справка</button></div><div class="mines-shell"><div class="mines-dashboard"><output class="digital-counter" id="mine-count" aria-label="Осталось мин">010</output><button class="mine-reset" id="mine-reset" aria-label="Начать новую игру"><span class="smiley" id="mine-smiley"><i></i></span></button><output class="digital-counter" id="mine-time" aria-label="Секунд">000</output></div><div class="mine-scroll"><div class="mine-grid" id="mine-grid" role="group" aria-label="Минное поле"></div></div><div class="mines-bottom"><button class="classic flag-mode" id="flag-mode" aria-pressed="false"><span class="mini-flag" aria-hidden="true">⚑</span> Флажок</button><span id="mine-record">Рекорд: —</span></div></div><p class="game-help" id="mine-help" hidden>Открой все клетки без мин. Правый клик ставит флаг. На телефоне включи «Флажок». Цифра — количество мин рядом. Нажми открытую цифру, когда все мины вокруг помечены: остальные соседи откроются. Первый ход безопасен.</p><div class="game-status" id="mine-status" aria-live="polite">Выбери первую клетку.</div>`);
  createWindow('solitaire',`<div class="game-menu solitaire-menu"><button id="solitaire-new">Новая игра</button><button id="solitaire-undo" disabled>Отменить</button><button id="solitaire-auto">В дом ↑</button><button id="solitaire-help" aria-expanded="false">?</button></div><div class="solitaire-scroll"><div class="solitaire-felt" id="solitaire-felt"><div class="solitaire-top" id="solitaire-top"></div><div class="solitaire-tableau" id="solitaire-tableau"></div><div class="solitaire-win" id="solitaire-win" hidden><strong>Пасьянс сошёлся!</strong><span>Ренри засчитала победу. Ещё партию?</span><button class="classic" id="solitaire-again">Ещё партию</button></div></div></div><p class="game-help" id="card-help" hidden>Собери четыре дома от туза до короля по мастям. Внизу складывай карты по убыванию, чередуя красные и чёрные. Пустое место — для короля. Нажми карту, затем место назначения, или перетащи мышью. Двойной клик отправляет карту в дом. Колода сдаёт по одной карте и пересдаётся без ограничений.</p><div class="solitaire-bottom"><span id="card-status" aria-live="polite">Нажми карту, затем место.</span><span id="card-moves">Ходов: 0</span></div>`);
  const startGame = document.createElement('button');startGame.dataset.gameOpen = 'games';startGame.innerHTML = '<img src="assets/icons/joystick_3.png" alt="">Игры';
  $('#start-menu nav').insertBefore(startGame,$('#start-menu nav hr'));
  document.addEventListener('click',event => {
    const launch = event.target.closest('[data-game-open]');if (launch) openWindow(launch.dataset.gameOpen);
    const hide = event.target.closest('[data-game-hide]');if (hide) hideWindow(hide.dataset.gameHide,!hide.getAttribute('aria-label').startsWith('Свернуть'));
  });
  for (const [button,panel] of [['#mines-help','#mine-help'],['#solitaire-help','#card-help']]) {
    $(button).addEventListener('click',() => {const show = $(panel).hidden;$(panel).hidden = !show;$(button).setAttribute('aria-expanded',String(show));});
  }

  // Minesweeper: generate only on the first reveal, including a safe opening area.
  let mineGame = null, mineStarted = 0, mineElapsed = 0, flagMode = false;
  function readRecord(size) {try {const raw = localStorage.getItem(`tavern98-mines-${size}`);const value = Number(raw);return raw !== null && Number.isFinite(value) && value >= 0 ? value : null;} catch {return null;}}
  function formatCounter(number) {return number < 0 ? '-' + String(Math.min(99,-number)).padStart(2,'0') : String(Math.min(999,number)).padStart(3,'0');}
  function newMines() {
    $('#game-mines details').open = false;
    const size = Number($('#mines-size').value);mineGame = new Minesweeper(size,size === 9 ? 10 : 40);
    mineStarted = 0;mineElapsed = 0;flagMode = false;
    $('#flag-mode').setAttribute('aria-pressed','false');
    const grid = $('#mine-grid');grid.style.setProperty('--mine-size',size);grid.innerHTML = '';
    mineGame.cells.forEach((_,index) => {const tile = document.createElement('button');tile.className = 'mine-cell';tile.dataset.cell = index;grid.append(tile);});
    renderMines();
  }
  function renderMines() {
    const {status,cells,size} = mineGame;
    const ended = status === 'lost' || status === 'won';
    cells.forEach((cell,index) => {
      const tile = $('#mine-grid').children[index];
      const mine = cell.mine && (cell.open || status === 'lost');
      const wrong = status === 'lost' && cell.flag && !cell.mine;
      tile.className = `mine-cell${cell.open ? ' is-open' : ''}${mine ? ' is-mine' : ''}${cell.flag && !mine ? ' is-flag' : ''}${index === mineGame.exploded ? ' exploded' : ''}${wrong ? ' wrong-flag' : ''}`;
      tile.textContent = cell.open && !cell.mine && cell.adjacent ? cell.adjacent : '';
      tile.dataset.number = cell.adjacent;
      const description = mine ? 'Мина' : cell.flag ? 'Флажок' : cell.open ? cell.adjacent ? `Рядом мин: ${cell.adjacent}` : 'Пусто' : 'Закрыто';
      tile.setAttribute('aria-label',`${Math.floor(index / size) + 1}, ${index % size + 1}: ${description}`);
      tile.setAttribute('aria-disabled',String(ended));
    });
    $('#mine-count').textContent = formatCounter(mineGame.mines - mineGame.flags);
    $('#mine-time').textContent = formatCounter(mineElapsed);
    $('#mine-smiley').className = `smiley ${status}`;
    $('#mine-status').textContent = status === 'won' ? `Поле очищено! Твоё время: ${mineElapsed} сек.` : status === 'lost' ? 'Бум. Ренри советует нажать смайлик.' : flagMode ? 'Режим флажка. Нажми клетку, чтобы поставить или убрать флаг.' : status === 'ready' ? 'Выбери первую клетку. Она безопасна.' : 'Ренри верит в твои флажки.';
    $('#mine-record').textContent = `Рекорд: ${readRecord(size) === null ? '—' : readRecord(size) + ' сек.'}`;
    windows.mines.win.classList.toggle('large-field',size === 16);
  }
  function mineAction(index,flag = false) {
    if (['won','lost'].includes(mineGame.status)) return;
    if (mineGame.status === 'playing') mineElapsed = Math.min(999,Math.floor((Date.now() - mineStarted) / 1000));
    const before = mineGame.status;
    const changed = flag ? mineGame.flag(index) : mineGame.reveal(index);
    if (!changed) return;
    if (before === 'ready' && mineGame.status !== 'ready') mineStarted = Date.now();
    if (mineGame.status === 'won') { const best = readRecord(mineGame.size);if (best === null || mineElapsed < best) try {localStorage.setItem(`tavern98-mines-${mineGame.size}`,String(mineElapsed));} catch {} }
    renderMines();
  }
  $('#mine-grid').addEventListener('click',event => {const tile = event.target.closest('[data-cell]');if (tile) mineAction(Number(tile.dataset.cell),flagMode);});
  $('#mine-grid').addEventListener('contextmenu',event => {event.preventDefault();const tile = event.target.closest('[data-cell]');if (tile) mineAction(Number(tile.dataset.cell),true);});
  $('#mine-grid').addEventListener('keydown',event => {
    const tile = event.target.closest('[data-cell]');if (!tile) return;
    const index = Number(tile.dataset.cell), size = mineGame.size;
    const offsets = {ArrowUp:-size,ArrowDown:size,ArrowLeft:-1,ArrowRight:1};
    if (event.key in offsets) {event.preventDefault();const next = index + offsets[event.key];if (next >= 0 && next < mineGame.cells.length) $('#mine-grid').children[next].focus();}
    if (event.key.toLowerCase() === 'f' || event.key.toLowerCase() === 'а') {event.preventDefault();mineAction(index,true);}
  });
  $('#flag-mode').addEventListener('click',() => {flagMode = !flagMode;$('#flag-mode').setAttribute('aria-pressed',String(flagMode));renderMines();});
  $('#mines-new').addEventListener('click',newMines);$('#mine-reset').addEventListener('click',newMines);$('#mines-size').addEventListener('change',newMines);
  windows.mines.win.addEventListener('keydown',event => {if (event.key === 'F2') {event.preventDefault();newMines();}});
  setInterval(() => {if (mineGame?.status === 'playing') {mineElapsed = Math.min(999,Math.floor((Date.now() - mineStarted) / 1000));$('#mine-time').textContent = formatCounter(mineElapsed);}},250);

  // Klondike: draw one, unlimited redeals, click or drag to move, full undo.
  let solitaire = null, selected = null, dragSource = null, lastCardTap = null;
  const suits = ['♠','♥','♦','♣'], suitNames = ['пики','червы','бубны','трефы'];
  const ranks = ['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const rankNames = ['','Туз','Двойка','Тройка','Четвёрка','Пятёрка','Шестёрка','Семёрка','Восьмёрка','Девятка','Десятка','Валет','Дама','Король'];
  function locationData(location) {return `data-zone="${location.zone}"${location.pile === undefined ? '' : ` data-pile="${location.pile}"`}${location.index === undefined ? '' : ` data-index="${location.index}"`}`;}
  function locationOf(element) {return {zone:element.dataset.zone,pile:element.dataset.pile === undefined ? undefined : Number(element.dataset.pile),index:element.dataset.index === undefined ? undefined : Number(element.dataset.index)};}
  function isSelected(location) {return selected && selected.zone === location.zone && selected.pile === location.pile && selected.index === location.index;}
  function cardMarkup(card,location,style = '') {
    if (!card.up) return `<div class="playing-card card-back" style="${style}" aria-label="Закрытая карта"></div>`;
    const red = solitaire.isRed(card), rank = ranks[card.rank], suit = suits[card.suit];
    const pipPositions = {2:[[50,25],[50,75]],3:[[50,25],[50,50],[50,75]],4:[[30,25],[70,25],[30,75],[70,75]],5:[[30,25],[70,25],[50,50],[30,75],[70,75]],6:[[30,25],[70,25],[30,50],[70,50],[30,75],[70,75]],7:[[30,25],[70,25],[50,37],[30,50],[70,50],[30,75],[70,75]],8:[[30,25],[70,25],[50,37],[30,50],[70,50],[50,63],[30,75],[70,75]],9:[[30,21],[70,21],[30,40],[70,40],[50,50],[30,60],[70,60],[30,79],[70,79]],10:[[30,21],[70,21],[50,30],[30,40],[70,40],[30,60],[70,60],[50,70],[30,79],[70,79]]};
    const court = card.rank > 10 ? `<span class="card-court"><b>${rank}</b><span>${suit}</span><b>${rank}</b></span>` : card.rank === 1 ? `<span class="card-center">${suit}</span>` : pipPositions[card.rank].map(([x,y]) => `<span class="card-pip" style="left:${x}%;top:${y}%;--pip-flip:${y > 50 ? '180deg' : '0deg'}" aria-hidden="true">${suit}</span>`).join('');
    return `<button class="playing-card${red ? ' card-red' : ''}${isSelected(location) ? ' card-selected' : ''}" style="${style}" ${locationData(location)} data-card="${card.id}" draggable="true" aria-label="${rankNames[card.rank]}, ${suitNames[card.suit]}" aria-pressed="${Boolean(isSelected(location))}"><span class="card-corner">${rank}<i>${suit}</i></span>${court}<span class="card-corner bottom">${rank}<i>${suit}</i></span></button>`;
  }
  function newSolitaire() {solitaire = new Solitaire();selected = null;lastCardTap = null;renderSolitaire();}
  function renderSolitaire(message = '') {
    const focusedCard = document.activeElement?.dataset.card;
    const focusedStock = document.activeElement?.hasAttribute('data-stock');
    const {stock,waste,foundations,tableau,moves,won} = solitaire.state;
    $('#solitaire-top').innerHTML = `<button class="card-slot stock-slot${stock.length ? ' has-stock' : ''}" data-stock aria-label="${stock.length ? `Взять карту из колоды. Осталось ${stock.length}` : 'Пересдать колоду'}"><span>${stock.length ? '' : '↻'}</span></button><div class="card-slot waste-slot">${waste.length ? cardMarkup(waste.at(-1),{zone:'waste'}) : '<span class="slot-label">сброс</span>'}</div><div class="top-spacer"></div>${foundations.map((pile,index) => `<div class="card-slot foundation-slot" data-zone="foundation" data-pile="${index}" role="group" aria-label="Дом ${index + 1}">${pile.length ? cardMarkup(pile.at(-1),{zone:'foundation',pile:index}) : `<button class="empty-slot" data-zone="foundation" data-pile="${index}" aria-label="Пустой дом ${index + 1}">A</button>`}</div>`).join('')}`;
    $('#solitaire-tableau').innerHTML = tableau.map((pile,index) => `<div class="tableau-pile" data-zone="tableau" data-pile="${index}" role="group" aria-label="Столбец ${index + 1}" style="height:calc(var(--card-height) + ${Math.max(0,pile.length - 1)} * var(--card-step))"><button class="card-slot empty-tableau" data-zone="tableau" data-pile="${index}" aria-label="Столбец ${index + 1}: место для короля"><span>K</span></button>${pile.map((card,position) => cardMarkup(card,{zone:'tableau',pile:index,index:position},`top:calc(${position} * var(--card-step));z-index:${position + 1}`)).join('')}</div>`).join('');
    $('#solitaire-undo').disabled = solitaire.undoStack.length === 0;
    $('#card-moves').textContent = `Ходов: ${moves}`;
    $('#card-status').textContent = won ? 'Все карты дома. Ренри одобряет.' : message || (selected ? 'Теперь выбери место для карты.' : 'Нажми карту, затем место.');
    $('#solitaire-win').hidden = !won;
    if (focusedCard !== undefined) $(`#solitaire-felt [data-card="${focusedCard}"]`)?.focus({preventScroll:true});
    else if (focusedStock) $('[data-stock]').focus({preventScroll:true});
  }
  function chooseCard(element) {
    const target = locationOf(element);
    if (selected) {
      if (solitaire.move(selected,target)) {selected = null;renderSolitaire();return;}
      if (isSelected(target)) {selected = null;renderSolitaire();return;}
    }
    if (solitaire.cardsAt(target).length) {selected = target;renderSolitaire();}
    else {selected = null;renderSolitaire('Здесь нужен король; в дом — туз или следующая карта по масти.');}
  }
  $('#solitaire-felt').addEventListener('click',event => {
    if (event.target.closest('[data-stock]')) {solitaire.draw();selected = null;lastCardTap = null;renderSolitaire();return;}
    const element = event.target.closest('[data-zone]');
    if (element) {
      const cardId = element.dataset.card, now = performance.now();
      if (cardId !== undefined && lastCardTap?.id === cardId && now - lastCardTap.time < 400 && element.dataset.zone !== 'foundation') {
        lastCardTap = null;
        if (solitaire.toFoundation(locationOf(element))) {selected = null;renderSolitaire();return;}
      } else lastCardTap = cardId === undefined ? null : {id:cardId,time:now};
      chooseCard(element);
    }
  });
  $('#solitaire-felt').addEventListener('dragstart',event => {
    const card = event.target.closest('.playing-card[data-zone]');if (!card) {event.preventDefault();return;}
    dragSource = locationOf(card);
    if (!solitaire.cardsAt(dragSource).length) {event.preventDefault();dragSource = null;return;}
    event.dataTransfer.effectAllowed = 'move';event.dataTransfer.setData('text/plain','tavern-card');card.classList.add('card-dragging');
  });
  $('#solitaire-felt').addEventListener('dragover',event => {
    const target = event.target.closest('[data-zone]');if (dragSource && target && solitaire.canMove(dragSource,locationOf(target))) {event.preventDefault();event.dataTransfer.dropEffect = 'move';}
  });
  $('#solitaire-felt').addEventListener('drop',event => {
    event.preventDefault();const target = event.target.closest('[data-zone]');
    if (dragSource && target && solitaire.move(dragSource,locationOf(target))) {selected = null;renderSolitaire();}
    dragSource = null;
  });
  $('#solitaire-felt').addEventListener('dragend',() => {dragSource = null;document.querySelectorAll('.card-dragging').forEach(card => card.classList.remove('card-dragging'));});
  $('#solitaire-new').addEventListener('click',newSolitaire);$('#solitaire-again').addEventListener('click',newSolitaire);
  $('#solitaire-undo').addEventListener('click',() => {solitaire.undo();selected = null;renderSolitaire();});
  $('#solitaire-auto').addEventListener('click',() => {const moved = solitaire.autoFoundation();selected = null;renderSolitaire(moved ? '' : 'Пока нет открытых карт, которые можно отправить в дом.');});
  windows.solitaire.win.addEventListener('keydown',event => {
    if (event.key === 'Escape') {selected = null;renderSolitaire();}
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {event.preventDefault();solitaire.undo();selected = null;renderSolitaire();}
  });
})();
