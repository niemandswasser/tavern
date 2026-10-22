'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const tools = [
    ['lasso','Выделение произвольной области','<path d="m4 3 9 2 2 7-6 4-6-3 1-10z" stroke-dasharray="1 2"/>'],
    ['select','Выделение','<path d="M3 4h13v11H3z" stroke-dasharray="1 2"/>'],
    ['eraser','Ластик','<path d="m3 10 7-7 7 6-7 7H8z" fill="#ffc4c4"/><path d="m3 10 5 5 4-4-5-5z" fill="#fff"/>'],
    ['fill','Заливка','<path d="m4 6 5-4 7 7-7 7-7-7z" fill="#eee"/><path d="m4 7 5-4 5 5-6 3z" fill="#008080"/><path d="m15 11 2 4-2 2-2-2z" fill="#000080"/>'],
    ['picker','Выбор цвета','<path d="m4 13 9-9 3 3-9 9H4z" fill="#ddd"/><path d="m11 3 5 5 2-2-5-5z" fill="#008080"/>'],
    ['zoom','Масштаб','<circle cx="8" cy="7" r="5" fill="#fff"/><path d="m12 11 5 6-2 1-5-6z" fill="#333"/>'],
    ['pencil','Карандаш','<path d="m3 16 2-5L14 2l3 3-9 9z" fill="#ffff00"/><path d="m5 11 3 3M12 4l3 3M3 16l2-1"/>'],
    ['brush','Кисть','<path d="m10 2 5 1-4 9-4-2z" fill="#a0522d"/><path d="m7 9 5 2-1 3-5-2z" fill="#ddd"/><path d="m6 12 5 2-3 3-5-1z" fill="#111"/>'],
    ['spray','Распылитель','<path d="M2 8h7v8H2z" fill="#008080"/><path d="M3 5h5v3H3z"/><path d="M10 5h1m2-2h1m2 3h1m-5 2h1m3 1h1m-2 3h1m-5-1h1m4 4h1"/>'],
    ['text','Надпись','<path d="m3 16 6-14 6 14M5 11h8M2 16h4m7 0h4" stroke-width="2"/>'],
    ['line','Линия','<path d="M3 16 16 3" stroke-width="2"/>'],
    ['curve','Кривая','<path d="M3 16c13 0-9-15 13-13" stroke-width="2"/>'],
    ['rect','Прямоугольник','<path d="M3 5h13v10H3z"/>'],
    ['polygon','Многоугольник','<path d="m3 5 7 1 6-3-1 13-7-4-5 3z"/>'],
    ['ellipse','Эллипс','<ellipse cx="9" cy="10" rx="7" ry="5"/>'],
    ['roundrect','Скруглённый прямоугольник','<rect x="3" y="5" width="13" height="10" rx="3"/>']
  ];
  const colors = ['#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080','#808040','#004040','#0080ff','#004080','#4000ff','#804000','#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ffff80','#00ff80','#80ffff','#8080ff','#ff0080','#ff8040'];
  const win = document.createElement('section');win.id = 'paint-window';win.className = 'window paint-window';win.hidden = true;win.setAttribute('aria-label','Paint');
  win.innerHTML = `<header class="titlebar" data-drag="paint-window"><img src="assets/icons/paint_old_0.png" alt=""><strong id="paint-title">Безымянный — Paint</strong><div class="window-controls"><button data-paint-action="minimize" aria-label="Свернуть Paint">_</button><button data-paint-action="maximize" aria-label="Развернуть Paint">□</button><button data-paint-action="close" aria-label="Закрыть Paint">×</button></div></header>
    <nav class="paint-menubar" aria-label="Меню Paint">
      <details class="classic-dropdown"><summary>Файл</summary><div class="classic-popup"><button data-paint-action="new">Создать <kbd>Ctrl+N</kbd></button><button data-paint-action="open">Открыть… <kbd>Ctrl+O</kbd></button><button data-paint-action="save">Сохранить как PNG… <kbd>Ctrl+S</kbd></button><hr><button data-paint-action="close">Выход</button></div></details>
      <details class="classic-dropdown"><summary>Правка</summary><div class="classic-popup"><button data-paint-action="undo" id="paint-undo" disabled>Отменить <kbd>Ctrl+Z</kbd></button><button data-paint-action="redo" id="paint-redo" disabled>Повторить <kbd>Ctrl+Y</kbd></button><hr><button data-paint-action="cut">Вырезать <kbd>Ctrl+X</kbd></button><button data-paint-action="copy">Копировать <kbd>Ctrl+C</kbd></button><button data-paint-action="paste">Вставить <kbd>Ctrl+V</kbd></button><button data-paint-action="delete">Удалить выделение <kbd>Del</kbd></button></div></details>
      <details class="classic-dropdown"><summary>Вид</summary><div class="classic-popup"><label>Масштаб <select id="paint-zoom" aria-label="Масштаб холста"><option value="fit">По окну</option><option value="0.5">50%</option><option value="1">100%</option><option value="2">200%</option><option value="4">400%</option></select></label></div></details>
      <details class="classic-dropdown"><summary>Рисунок</summary><div class="classic-popup"><button data-paint-action="clear">Очистить рисунок</button><button data-paint-action="flip-x">Отразить слева направо</button><button data-paint-action="flip-y">Отразить сверху вниз</button></div></details>
      <button data-paint-action="custom-color">Палитра</button><button data-paint-action="help">Справка</button>
    </nav>
    <div class="paint-workarea"><aside class="paint-toolbox" aria-label="Инструменты"><div class="paint-tool-grid">${tools.map(([tool,label,path]) => `<button data-paint-tool="${tool}" title="${label}" aria-label="${label}" aria-pressed="${tool === 'pencil'}"><svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="#000" stroke-width="1" shape-rendering="crispEdges">${path}</svg></button>`).join('')}</div><div class="paint-options"><label title="Толщина инструмента">Размер<select id="paint-size" aria-label="Толщина инструмента"><option value="1">1 px</option><option value="3" selected>3 px</option><option value="6">6 px</option><option value="12">12 px</option><option value="20">20 px</option></select></label><div class="shape-modes" aria-label="Заливка фигур"><button data-paint-shape="outline" aria-label="Только контур" aria-pressed="true"><i></i></button><button data-paint-shape="background" aria-label="Контур и фоновая заливка" aria-pressed="false"><i></i></button><button data-paint-shape="solid" aria-label="Сплошная заливка" aria-pressed="false"><i></i></button></div></div></aside>
    <div class="paint-workspace" id="paint-workspace"><div class="paint-stage" id="paint-stage"><canvas id="paint-canvas" width="640" height="400" tabindex="0" aria-label="Холст Paint. Рисуй мышью или пальцем."></canvas><canvas id="paint-overlay" width="640" height="400" aria-hidden="true"></canvas><input id="paint-text" aria-label="Текст на рисунке" placeholder="Твой текст" hidden><i class="canvas-handle h-right"></i><i class="canvas-handle h-bottom"></i><i class="canvas-handle h-corner"></i></div></div></div>
    <div class="paint-palette"><button class="paint-current-colors" id="paint-swap" title="Поменять основной и фоновый цвета" aria-label="Поменять основной и фоновый цвета"><i id="paint-bg"></i><i id="paint-fg"></i></button><div class="paint-swatches">${colors.map(color => `<button data-paint-color="${color}" style="background:${color}" aria-label="Цвет ${color}" title="${color}: основной — левый клик, фоновый — правый"></button>`).join('')}</div><input type="color" id="paint-custom" value="#000000" aria-label="Свой цвет" hidden></div>
    <footer class="paint-status"><span id="paint-status" role="status">Для справки выберите «Справка».</span><span id="paint-position">0, 0</span><span>640 × 400</span></footer><input type="file" id="paint-file" accept="image/png,image/jpeg,image/webp,image/gif,image/bmp" hidden>`;
  $('#desktop').append(win);TavernDesktop.registerWindow(win);
  const phone = matchMedia('(max-width: 800px)');
  const mobileBar = document.createElement('div');mobileBar.className = 'paint-mobile-bar';
  mobileBar.innerHTML = '<button class="classic" data-paint-action="undo" aria-label="Отменить последнее действие" disabled>Отмена</button><button class="classic" data-paint-action="redo" aria-label="Повторить действие" disabled>Повтор</button><button class="classic" data-paint-action="save">PNG ↓</button><select id="paint-mobile-zoom" aria-label="Масштаб холста"><option value="fit">По окну</option><option value="0.5">50%</option><option value="1">100%</option><option value="2">200%</option><option value="4">400%</option></select><button class="classic" data-paint-panel="menu" aria-label="Меню Paint" aria-expanded="false">Ещё</button>';
  win.querySelector('.paint-menubar').after(mobileBar);
  const dock = document.createElement('div');dock.className = 'paint-mobile-dock';
  dock.innerHTML = '<button class="classic" data-paint-quick="brush" aria-pressed="false">Кисть</button><button class="classic" data-paint-quick="eraser" aria-pressed="false">Ластик</button><button class="classic" data-paint-panel="colors" aria-expanded="false"><i id="paint-mobile-color"></i>Цвета</button><button class="classic" data-paint-panel="tools" aria-expanded="false">Инструм.</button><button class="classic" id="paint-pan" aria-pressed="false">Сдвиг</button>';
  win.querySelector('.paint-status').before(dock);
  const mobileInfo = document.createElement('div');mobileInfo.className = 'paint-mobile-info';
  mobileInfo.innerHTML = '<span id="paint-mobile-tool">Карандаш</span><label>Размер <select id="paint-mobile-size" aria-label="Размер кисти"><option value="1">1 px</option><option value="3" selected>3 px</option><option value="6">6 px</option><option value="12">12 px</option><option value="20">20 px</option></select></label><button class="classic" data-paint-action="finish" hidden>Готово</button>';
  dock.before(mobileInfo);
  const panelShade = document.createElement('button');panelShade.className = 'paint-panel-shade';panelShade.type = 'button';panelShade.setAttribute('aria-label','Закрыть панель Paint');panelShade.hidden = true;win.querySelector('.paint-workarea').before(panelShade);
  for(const [selector,title] of [['.paint-toolbox','Инструменты'],['.paint-palette','Цвета'],['.paint-menubar','Меню Paint']]){
    const heading = document.createElement('div');heading.className = 'paint-panel-heading';heading.innerHTML = `<strong>${title}</strong><button class="classic" data-paint-panel="close" aria-label="Закрыть панель ${title}">Готово</button>`;win.querySelector(selector).prepend(heading);
  }
  for(const button of win.querySelectorAll('[data-paint-tool]')){const label=document.createElement('span');label.textContent=button.title;button.append(label);}
  const customColor = document.createElement('button');customColor.className = 'classic paint-mobile-custom';customColor.dataset.paintAction = 'custom-color';customColor.textContent = 'Другой цвет…';win.querySelector('.paint-palette').append(customColor);
  const mobileHelp = document.createElement('p');mobileHelp.className='paint-mobile-help';mobileHelp.textContent='Рисуй одним пальцем. Два пальца меняют масштаб. «Сдвиг» двигает увеличенный холст, «PNG ↓» сохраняет рисунок.';win.querySelector('.paint-menubar').append(mobileHelp);
  const task = document.createElement('button');task.id = 'paint-task';task.className = 'task-button paint-task';task.hidden = true;task.dataset.windowTarget = win.id;task.title = 'Paint';task.setAttribute('aria-label','Paint');task.innerHTML = '<img src="assets/icons/paint_old_0.png" alt=""><span>Безымянный — Paint</span>';$('.taskbar-space').before(task);
  const startItem = document.createElement('button');startItem.dataset.paintOpen = '';startItem.innerHTML = '<img src="assets/icons/paint_old_0.png" alt="">Paint';$('#start-menu nav').insertBefore(startItem,$('#start-menu nav hr'));
  const canvas = $('#paint-canvas'), ctx = canvas.getContext('2d',{willReadFrequently:true}), overlay = $('#paint-overlay'), overlayCtx = overlay.getContext('2d');
  let tool = 'pencil', fg = '#000000', bg = '#ffffff', mode = 'outline', gesture = null, draft = null, selection = null, clipboard = null, textPoint = null, scale = 1;
  let panning = false, panGesture = null, pinch = null, touchBefore = null;
  const touches = new Map();
  const undo = [], redo = [];const WIDTH = canvas.width, HEIGHT = canvas.height;
  ctx.fillStyle = '#fff';ctx.fillRect(0,0,WIDTH,HEIGHT);
  const snap = () => ctx.getImageData(0,0,WIDTH,HEIGHT);
  const restore = image => ctx.putImageData(image,0,0);
  function status(text) {$('#paint-status').textContent = text;}
  function updateHistory() {for(const button of win.querySelectorAll('[data-paint-action="undo"]'))button.disabled = undo.length === 0&&!draft;for(const button of win.querySelectorAll('[data-paint-action="redo"]'))button.disabled = redo.length === 0;}
  function remember(image) {undo.push(image);if (undo.length > 24) undo.shift();redo.length = 0;updateHistory();}
  function updateColors() {$('#paint-fg').style.background = fg;$('#paint-bg').style.background = bg;$('#paint-custom').value = fg;$('#paint-mobile-color').style.background = fg;for(const button of win.querySelectorAll('[data-paint-color]'))button.setAttribute('aria-pressed',String(button.dataset.paintColor===fg));}
  function point(event) {const rect = canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(WIDTH - 1,Math.floor((event.clientX - rect.left) * WIDTH / rect.width))),y:Math.max(0,Math.min(HEIGHT - 1,Math.floor((event.clientY - rect.top) * HEIGHT / rect.height)))};}
  function closePanel() {delete win.dataset.paintPanel;panelShade.hidden=true;for(const button of win.querySelectorAll('[data-paint-panel]'))button.setAttribute('aria-expanded','false');}
  function syncMobileTool() {$('#paint-pan').setAttribute('aria-pressed',String(panning));for(const button of dock.querySelectorAll('[data-paint-quick]'))button.setAttribute('aria-pressed',String(!panning&&button.dataset.paintQuick===tool));$('#paint-mobile-tool').textContent=panning?'Сдвиг — веди по холсту':tools.find(t=>t[0]===tool)[1];canvas.classList.toggle('is-panning',panning);}
  function setTool(next) {commitText();finishDraft();commitSelection();tool = next;panning=false;for (const b of win.querySelectorAll('[data-paint-tool]')) b.setAttribute('aria-pressed',String(b.dataset.paintTool === tool));canvas.dataset.tool = tool;syncMobileTool();closePanel();status(tools.find(t => t[0] === tool)[1]);}
  function syncZoom() {const value=$('#paint-zoom').value;const select=$('#paint-mobile-zoom');select.querySelector('[data-custom-zoom]')?.remove();if(!Array.from(select.options).some(o=>o.value===value)){const option=new Option(`${Math.round(scale*100)}%`,value);option.dataset.customZoom='';select.add(option);}select.value=value;}
  function applyZoom() {
    const value = $('#paint-zoom').value, viewport = $('#paint-workspace');
    scale = value === 'fit' ? Math.max(.05,Math.min(1,(viewport.clientWidth - 18) / WIDTH,(viewport.clientHeight - 18) / HEIGHT)) : Number(value);
    $('#paint-stage').style.width = `${WIDTH * scale}px`;$('#paint-stage').style.height = `${HEIGHT * scale}px`;
    if(value==='fit'){viewport.scrollLeft=0;viewport.scrollTop=0;}syncZoom();
  }
  function zoomAt(next,clientX,clientY) {
    const viewport=$('#paint-workspace'),before=canvas.getBoundingClientRect();
    const x=(clientX-before.left)/scale,y=(clientY-before.top)/scale;
    let option=$('#paint-zoom').querySelector('[data-custom-zoom]');
    if(!option){option=new Option('','custom');option.dataset.customZoom='';$('#paint-zoom').add(option);}
    option.value=String(Math.max(.15,Math.min(4,next)));option.textContent=`${Math.round(Number(option.value)*100)}%`;
    $('#paint-zoom').value=option.value;applyZoom();
    const after=canvas.getBoundingClientRect();
    viewport.scrollLeft+=after.left+x*scale-clientX;viewport.scrollTop+=after.top+y*scale-clientY;
  }
  function openPaint() {win.hidden = false;task.hidden = false;task.classList.add('active');TavernDesktop.bringToFront(win);TavernDesktop.closeStart();closePanel();applyZoom();}
  function hidePaint(close = false) {commitText();finishDraft();commitSelection();closePanel();win.hidden = true;task.classList.remove('active');if (close) task.hidden = true;}
  function clearOverlay() {overlayCtx.clearRect(0,0,WIDTH,HEIGHT);}
  function selectionBorder() {clearOverlay();if (!selection) return;overlayCtx.save();overlayCtx.setLineDash([4,3]);overlayCtx.strokeStyle = '#000';overlayCtx.lineWidth = 1;overlayCtx.strokeRect(selection.x + .5,selection.y + .5,selection.w,selection.h);overlayCtx.restore();}
  function commitSelection() {if (!selection) return;if (selection.moved) remember(selection.original);selection = null;clearOverlay();}
  function drawSelection() {restore(selection.base);ctx.drawImage(selection.bitmap,selection.x,selection.y);selectionBorder();}
  function createSelection(points,freeform = false) {
    const xs = points.map(p => p.x), ys = points.map(p => p.y), x = Math.min(...xs), y = Math.min(...ys), w = Math.max(...xs) - x, h = Math.max(...ys) - y;
    if (w < 2 || h < 2) return;
    const original = snap(), bitmap = document.createElement('canvas');bitmap.width = w;bitmap.height = h;const bctx = bitmap.getContext('2d');
    if (freeform) {bctx.beginPath();points.forEach((p,i) => i ? bctx.lineTo(p.x - x,p.y - y) : bctx.moveTo(p.x - x,p.y - y));bctx.closePath();bctx.clip();}
    bctx.drawImage(canvas,x,y,w,h,0,0,w,h);
    ctx.save();ctx.fillStyle = bg;
    if (freeform) {ctx.beginPath();points.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();}else ctx.fillRect(x,y,w,h);
    const base = snap();ctx.restore();restore(original);
    selection = {x,y,w,h,bitmap,original,base,moved:false};selectionBorder();status('Перетащи выделение. Delete — удалить; Ctrl+C — копировать.');
  }
  function commitText() {
    const input = $('#paint-text');if (input.hidden) return;
    if (input.value.trim()) {remember(snap());ctx.fillStyle = fg;ctx.font = `${Math.max(12,Number($('#paint-size').value) * 4)}px Arial`;ctx.textBaseline = 'top';ctx.fillText(input.value,textPoint.x,textPoint.y);}
    input.hidden = true;input.value = '';textPoint = null;
  }
  $('#paint-text').addEventListener('keydown',event => {event.stopPropagation();if (event.key === 'Enter') {commitText();canvas.focus();}if (event.key === 'Escape') {$('#paint-text').value = '';commitText();canvas.focus();}});
  $('#paint-text').addEventListener('blur',commitText);
  function style(color) {ctx.strokeStyle = color;ctx.fillStyle = mode === 'background' ? bg : color;ctx.lineWidth = tool === 'pencil' ? 1 : Number($('#paint-size').value);ctx.lineCap = 'round';ctx.lineJoin = 'round';}
  function shape(start,end,color) {
    style(color);ctx.beginPath();const x = Math.min(start.x,end.x), y = Math.min(start.y,end.y), w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
    if (tool === 'ellipse') ctx.ellipse(x + w / 2,y + h / 2,Math.max(.5,w / 2),Math.max(.5,h / 2),0,0,Math.PI * 2);
    else if (tool === 'roundrect') ctx.roundRect(x,y,w,h,Math.min(12,w / 4,h / 4));
    else if (tool === 'rect') ctx.rect(x,y,w,h);
    else {ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);}
    if (['ellipse','rect','roundrect'].includes(tool) && mode !== 'outline') ctx.fill();
    if (mode !== 'solid' || ['line','curve'].includes(tool)) ctx.stroke();
  }
  function previewDraft(cursor) {
    restore(draft.before);style(draft.color);ctx.beginPath();const p = draft.points;ctx.moveTo(p[0].x,p[0].y);
    if (tool === 'polygon') {p.slice(1).forEach(v => ctx.lineTo(v.x,v.y));if (cursor) ctx.lineTo(cursor.x,cursor.y);}
    else if (p.length >= 4) ctx.bezierCurveTo(p[2].x,p[2].y,p[3].x,p[3].y,p[1].x,p[1].y);
    else if (p.length === 3) ctx.quadraticCurveTo(p[2].x,p[2].y,p[1].x,p[1].y);
    else ctx.lineTo(p[1].x,p[1].y);
    ctx.stroke();
  }
  function finishDraft() {if (!draft) return;if (tool === 'polygon') {previewDraft();ctx.closePath();if (mode !== 'outline') ctx.fill();if (mode !== 'solid') ctx.stroke();}remember(draft.before);draft = null;updateHistory();mobileInfo.querySelector('[data-paint-action="finish"]').hidden=true;}
  function spray(p,color) {ctx.fillStyle = color;const radius = Number($('#paint-size').value) * 2 + 3;for (let i = 0; i < 24; i++) {const angle = Math.random() * Math.PI * 2, distance = Math.sqrt(Math.random()) * radius;ctx.fillRect(Math.round(p.x + Math.cos(angle) * distance),Math.round(p.y + Math.sin(angle) * distance),1,1);}}
  canvas.addEventListener('contextmenu',event => event.preventDefault());
  canvas.addEventListener('pointerdown',event => {
    if (event.button !== 0 && event.button !== 2) return;
    if(event.pointerType==='touch'&&phone.matches){
      if(!touches.size)touchBefore={image:snap(),undo:[...undo],redo:[...redo]};
      touches.set(event.pointerId,{x:event.clientX,y:event.clientY});canvas.setPointerCapture(event.pointerId);
      if(touches.size>=2){endGesture(true);if(touchBefore){restore(touchBefore.image);undo.splice(0,undo.length,...touchBefore.undo);redo.splice(0,redo.length,...touchBefore.redo);updateHistory();}panGesture=null;const [a,b]=[...touches.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),scale};return;}
    }
    if(panning&&phone.matches){panGesture={id:event.pointerId,x:event.clientX,y:event.clientY,left:$('#paint-workspace').scrollLeft,top:$('#paint-workspace').scrollTop};canvas.setPointerCapture(event.pointerId);return;}
    if(event.pointerType!=='touch'){event.preventDefault();canvas.focus({preventScroll:true});}commitText();
    const p = point(event), color = event.button === 2 ? bg : fg;
    if (selection && p.x >= selection.x && p.x < selection.x + selection.w && p.y >= selection.y && p.y < selection.y + selection.h) {
      gesture = {moving:true,start:p,x:selection.x,y:selection.y};canvas.setPointerCapture(event.pointerId);return;
    }
    commitSelection();
    if (tool === 'picker') {const d = ctx.getImageData(p.x,p.y,1,1).data;const hex = '#' + Array.from(d.slice(0,3)).map(n => n.toString(16).padStart(2,'0')).join('');if (event.button === 2) bg = hex;else fg = hex;updateColors();setTool('pencil');return;}
    if (tool === 'zoom') {const values = [.5,1,2,4];$('#paint-zoom').value = String(values.find(v => v > scale + .01) || .5);applyZoom();return;}
    if (tool === 'text') {textPoint = p;const input = $('#paint-text');input.hidden = false;input.style.left = `${p.x * scale}px`;input.style.top = `${p.y * scale}px`;input.style.width = `${Math.max(40,(WIDTH - p.x) * scale)}px`;input.style.fontSize = `${Math.max(12,Number($('#paint-size').value) * 4) * scale}px`;input.style.color = fg;input.focus();return;}
    if (tool === 'fill') {const before = snap(), image = snap(), rgb = color.match(/[a-f\d]{2}/gi).map(n => parseInt(n,16));if (TavernPaint.floodFill(image.data,WIDTH,HEIGHT,p.x,p.y,[...rgb,255])) {remember(before);restore(image);}return;}
    if (tool === 'polygon') {if (!draft) draft = {before:snap(),points:[p],color};else draft.points.push(p);previewDraft(p);updateHistory();mobileInfo.querySelector('[data-paint-action="finish"]').hidden=false;status('Кликай по вершинам. Двойной клик или Enter — закончить.');return;}
    if (tool === 'curve' && draft) {draft.points.push(p);previewDraft();if (draft.points.length === 4) finishDraft();else status('Ещё один изгиб: нажми на холст или Enter, чтобы закончить.');return;}
    gesture = {start:p,last:p,before:snap(),color,points:[p]};canvas.setPointerCapture(event.pointerId);
    if (tool === 'pencil') {ctx.fillStyle = color;ctx.fillRect(p.x,p.y,1,1);}
    else if (tool === 'brush' || tool === 'eraser') {style(tool === 'eraser' ? bg : color);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x + .01,p.y + .01);ctx.stroke();}
    if (tool === 'spray') spray(p,color);
  });
  canvas.addEventListener('pointermove',event => {
    if(touches.has(event.pointerId))touches.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pinch){if(touches.size>=2){const [a,b]=[...touches.values()];zoomAt(pinch.scale*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance),(a.x+b.x)/2,(a.y+b.y)/2);}return;}
    if(panGesture){$('#paint-workspace').scrollLeft=panGesture.left+panGesture.x-event.clientX;$('#paint-workspace').scrollTop=panGesture.top+panGesture.y-event.clientY;return;}
    const p = point(event);$('#paint-position').textContent = `${p.x}, ${p.y}`;
    if (!gesture) {if (draft && tool === 'polygon') previewDraft(p);return;}
    if (gesture.moving) {selection.x = Math.max(0,Math.min(WIDTH - selection.w,gesture.x + p.x - gesture.start.x));selection.y = Math.max(0,Math.min(HEIGHT - selection.h,gesture.y + p.y - gesture.start.y));selection.moved = true;drawSelection();return;}
    if (tool === 'pencil') {ctx.fillStyle = gesture.color;TavernPaint.pixelLine(gesture.last.x,gesture.last.y,p.x,p.y,(x,y) => ctx.fillRect(x,y,1,1));}
    else if (tool === 'brush' || tool === 'eraser') {style(tool === 'eraser' ? bg : gesture.color);ctx.beginPath();ctx.moveTo(gesture.last.x,gesture.last.y);ctx.lineTo(p.x,p.y);ctx.stroke();}
    else if (tool === 'spray') spray(p,gesture.color);
    else if (tool === 'select' || tool === 'lasso') {clearOverlay();overlayCtx.setLineDash([4,3]);overlayCtx.strokeStyle = '#000';overlayCtx.beginPath();if (tool === 'select') overlayCtx.rect(gesture.start.x,gesture.start.y,p.x - gesture.start.x,p.y - gesture.start.y);else {gesture.points.push(p);gesture.points.forEach((v,i) => i ? overlayCtx.lineTo(v.x,v.y) : overlayCtx.moveTo(v.x,v.y));}overlayCtx.stroke();}
    else {restore(gesture.before);shape(gesture.start,p,gesture.color);}
    gesture.last = p;
  });
  function endGesture(cancel = false) {
    if (!gesture) return;const g = gesture;gesture = null;
    if (g.moving) {if (cancel) {selection.x = g.x;selection.y = g.y;drawSelection();}return;}
    if (cancel) {restore(g.before);clearOverlay();return;}
    if (tool === 'select' || tool === 'lasso') {clearOverlay();createSelection(tool === 'select' ? [g.start,g.last] : g.points,tool === 'lasso');}
    else if (tool === 'curve') {draft = {before:g.before,points:[g.start,g.last],color:g.color};updateHistory();mobileInfo.querySelector('[data-paint-action="finish"]').hidden=false;status('Нажми на холст, чтобы изогнуть линию; Enter — закончить.');}
    else remember(g.before);
  }
  function endPointer(event,cancel=false){touches.delete(event.pointerId);if(!touches.size)touchBefore=null;if(pinch){if(!touches.size)pinch=null;return;}if(panGesture){panGesture=null;return;}endGesture(cancel);}
  canvas.addEventListener('pointerup',event => endPointer(event));canvas.addEventListener('pointercancel',event => endPointer(event,true));canvas.addEventListener('lostpointercapture',event => {if(touches.has(event.pointerId)||gesture)endPointer(event,true);});canvas.addEventListener('dblclick',() => {if (tool === 'polygon') finishDraft();});
  const actions = {
    minimize:() => hidePaint(),close:() => hidePaint(true),maximize:() => {win.classList.toggle('maximized');applyZoom();},
    finish:() => {commitText();finishDraft();commitSelection();},
    undo() {commitText();if (draft) {restore(draft.before);draft = null;updateHistory();mobileInfo.querySelector('[data-paint-action="finish"]').hidden=true;return;}commitSelection();if (!undo.length) return;redo.push(snap());restore(undo.pop());updateHistory();},
    redo() {commitText();finishDraft();commitSelection();if (!redo.length) return;undo.push(snap());restore(redo.pop());updateHistory();},
    clear() {commitText();finishDraft();commitSelection();remember(snap());ctx.fillStyle = bg;ctx.fillRect(0,0,WIDTH,HEIGHT);status('Рисунок очищен. Ctrl+Z — вернуть.');},
    new() {actions.clear();$('#paint-title').textContent = 'Безымянный — Paint';},
    open:() => $('#paint-file').click(),
    save() {commitText();finishDraft();commitSelection();canvas.toBlob(blob => {if (!blob) {status('Не удалось сохранить рисунок.');return;}const link = document.createElement('a'), url = URL.createObjectURL(blob);link.href = url;link.download = 'my-tavern-paint.png';link.click();setTimeout(() => URL.revokeObjectURL(url),10000);status('Рисунок сохранён в PNG.');},'image/png');},
    copy() {if (selection) {clipboard = document.createElement('canvas');clipboard.width = selection.w;clipboard.height = selection.h;clipboard.getContext('2d').drawImage(selection.bitmap,0,0);status('Выделение скопировано внутри Paint.');}else status('Сначала выдели область рисунка.');},
    cut() {actions.copy();if (selection) actions.delete();},
    delete() {if (!selection) return;remember(selection.original);restore(selection.base);selection = null;clearOverlay();},
    paste() {if (!clipboard) {status('Сначала скопируй выделение в Paint.');return;}finishDraft();commitSelection();const original = snap();selection = {bitmap:clipboard,x:10,y:10,w:clipboard.width,h:clipboard.height,base:original,original,moved:true};drawSelection();},
    'flip-x':() => flip(true),'flip-y':() => flip(false),
    'custom-color':() => $('#paint-custom').click(),
    help:() => status(phone.matches?'Масштаб — двумя пальцами. «Сдвиг» двигает холст, PNG сохраняет рисунок.':'ЛКМ — основной цвет, ПКМ — фон. Ctrl+Z — отменить, Ctrl+S — скачать PNG. Рисовать можно и пальцем.')
  };
  function flip(horizontal) {commitText();finishDraft();commitSelection();remember(snap());const copy = document.createElement('canvas');copy.width = WIDTH;copy.height = HEIGHT;copy.getContext('2d').drawImage(canvas,0,0);ctx.save();ctx.translate(horizontal ? WIDTH : 0,horizontal ? 0 : HEIGHT);ctx.scale(horizontal ? -1 : 1,horizontal ? 1 : -1);ctx.drawImage(copy,0,0);ctx.restore();}
  document.addEventListener('click',event => {
    if (event.target.closest('[data-paint-open]')) openPaint();
    const action = event.target.closest('[data-paint-action]');if (action) {actions[action.dataset.paintAction]?.();win.querySelectorAll('details').forEach(d => d.open = false);closePanel();}
  });
  win.addEventListener('click',event => {
    const button = event.target.closest('[data-paint-tool]');if (button) setTool(button.dataset.paintTool);
    const color = event.target.closest('[data-paint-color]');if (color) {fg = color.dataset.paintColor;updateColors();closePanel();}
    const shape = event.target.closest('[data-paint-shape]');if (shape) {mode = shape.dataset.paintShape;win.querySelectorAll('[data-paint-shape]').forEach(b => b.setAttribute('aria-pressed',String(b === shape)));}
    const quick=event.target.closest('[data-paint-quick]');if(quick)setTool(quick.dataset.paintQuick);
    const panel=event.target.closest('button[data-paint-panel]');if(panel){const next=panel.dataset.paintPanel,previous=win.dataset.paintPanel;commitText();closePanel();if(next!=='close'&&next!==previous){win.dataset.paintPanel=next;panelShade.hidden=false;panel.setAttribute('aria-expanded','true');}}
  });
  panelShade.addEventListener('click',closePanel);
  $('#paint-pan').addEventListener('click',()=>{commitText();finishDraft();commitSelection();panning=!panning;closePanel();syncMobileTool();});
  win.addEventListener('contextmenu',event => {const color = event.target.closest('[data-paint-color]');if (color) {event.preventDefault();bg = color.dataset.paintColor;updateColors();}});
  $('#paint-swap').addEventListener('click',() => {[fg,bg] = [bg,fg];updateColors();});
  $('#paint-custom').addEventListener('input',event => {fg = event.target.value;updateColors();});
  $('#paint-zoom').addEventListener('change',applyZoom);
  $('#paint-mobile-zoom').addEventListener('change',event=>{$('#paint-zoom').value=event.target.value;applyZoom();});
  $('#paint-mobile-size').addEventListener('change',event=>{$('#paint-size').value=event.target.value;});
  $('#paint-size').addEventListener('change',event=>{$('#paint-mobile-size').value=event.target.value;});
  phone.addEventListener('change',()=>{closePanel();panning=false;syncMobileTool();applyZoom();});
  $('#paint-file').addEventListener('change',async event => {
    const file = event.target.files[0];if (!file) return;
    const url = URL.createObjectURL(file), image = new Image();
    try {image.src = url;await image.decode();commitText();finishDraft();commitSelection();remember(snap());ctx.fillStyle = '#fff';ctx.fillRect(0,0,WIDTH,HEIGHT);const fit = Math.min(1,WIDTH / image.width,HEIGHT / image.height);ctx.drawImage(image,0,0,image.width * fit,image.height * fit);$('#paint-title').textContent = `${file.name} — Paint`;status('Рисунок открыт. Ctrl+Z — вернуть предыдущий.');}catch {status('Не удалось открыть изображение. Попробуй PNG или JPG.');}finally {URL.revokeObjectURL(url);event.target.value = '';}
  });
  win.addEventListener('keydown',event => {
    if (event.target.matches('input,select')) return;
    if (event.ctrlKey || event.metaKey) {const map = {z:'undo',y:'redo',s:'save',o:'open',n:'new',c:'copy',x:'cut',v:'paste'};const key = event.code?.startsWith('Key') ? event.code.slice(3).toLowerCase() : event.key.toLowerCase();const action = map[key];if (action) {event.preventDefault();actions[action]();}}
    if (event.key === 'Delete') actions.delete();
    if (event.key === 'Enter') finishDraft();
    if (event.key === 'Escape') {if (draft) {restore(draft.before);draft = null;updateHistory();mobileInfo.querySelector('[data-paint-action="finish"]').hidden=true;}commitSelection();closePanel();win.querySelectorAll('details').forEach(d => d.open = false);}
  });
  task.addEventListener('click',() => {if (win.hidden) openPaint();else hidePaint();});
  new ResizeObserver(() => {if (!win.hidden && $('#paint-zoom').value === 'fit') applyZoom();}).observe($('#paint-workspace'));
  updateColors();updateHistory();syncMobileTool();canvas.dataset.tool = tool;
})();
