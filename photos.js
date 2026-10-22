'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const photos = [
    {file:'01-dream-engine.jpg',width:1264,height:848,bytes:771309,title:'Dream Engine',alt:'Ренри с зелёными волосами у панели Dream Engine нажимает большую красную кнопку.',caption:'Ренри запускает Dream Engine. Что может пойти не так? (¬‿¬)'},
    {file:'02-home-network.jpg',width:1264,height:848,bytes:858547,title:'Домашняя сеть',alt:'Ренри в красном свитере у старого компьютера; на мониторе сидит игрушечный пингвин.',caption:'Ренри на рабочем месте. Беспорядок — часть инфраструктуры.'},
    {file:'03-one-more-save.jpg',width:2528,height:1696,bytes:2943289,title:'Ещё одно сохранение',alt:'Ренри играет с геймпадом перед старым телевизором и приставкой; за окном ночь.',caption:'Ренри ещё сохранится — и точно пойдёт спать. Наверное.'}
  ];
  const source = photo => `assets/photos/${photo.file}`;
  const totalSize = `${(photos.reduce((sum,p) => sum + p.bytes,0) / 1048576).toFixed(1).replace('.',',')} МБ`;
  const folder = document.createElement('section');folder.id = 'photos-folder';folder.className = 'window photos-window photos-folder';folder.hidden = true;folder.setAttribute('aria-label','Картинки — Проводник');
  folder.innerHTML = `<header class="titlebar" data-drag="photos-folder"><img src="assets/icons/kodak_imaging_0.png" alt=""><strong>Картинки — Проводник</strong><div class="window-controls"><button data-photo-command="folder-minimize" aria-label="Свернуть картинки">_</button><button data-photo-command="folder-maximize" aria-label="Развернуть картинки">□</button><button data-photo-command="folder-close" aria-label="Закрыть картинки">×</button></div></header>
    <div class="photos-folder-address"><span>Адрес</span><div><img src="assets/icons/kodak_imaging_0.png" alt="">C:\\Мои документы\\Картинки</div></div>
    <div class="photos-folder-body"><aside class="photos-folder-sidebar"><img src="assets/icons/kodak_imaging_0.png" alt=""><h2>Картинки</h2><div class="rainbow-line"></div><p>Ренри сложила сюда три картинки.</p><p>Компромата нет.<br>Наверное. (¬_¬)</p><span>${totalSize} · JPEG</span></aside><div class="photo-thumb-grid" aria-label="Изображения">${photos.map((photo,index) => `<button class="photo-thumb${index === 0 ? ' selected' : ''}" data-photo-index="${index}" aria-label="Открыть ${photo.file}" aria-pressed="${index === 0}"><span class="photo-thumb-frame"><img src="${source(photo)}" alt="${photo.alt}" width="${photo.width}" height="${photo.height}" decoding="async"></span><span class="photo-filename">${photo.file}</span><small>${photo.width} × ${photo.height}</small></button>`).join('')}</div></div>
    <footer class="photos-status"><span>3 объекта · ${totalSize}</span><span>Мой компьютер</span></footer>`;
  const viewer = document.createElement('section');viewer.id = 'photo-viewer';viewer.className = 'window photos-window photo-viewer';viewer.hidden = true;viewer.tabIndex = -1;viewer.setAttribute('aria-label','Просмотр картинок');
  viewer.innerHTML = `<header class="titlebar" data-drag="photo-viewer"><img src="assets/icons/kodak_imaging_0.png" alt=""><strong id="photo-viewer-title">Просмотр картинок</strong><div class="window-controls"><button data-photo-command="viewer-minimize" aria-label="Свернуть просмотрщик">_</button><button data-photo-command="viewer-maximize" aria-label="Развернуть просмотрщик">□</button><button data-photo-command="viewer-close" aria-label="Закрыть просмотрщик">×</button></div></header>
    <nav class="photos-menubar" aria-label="Меню просмотра"><details class="classic-dropdown"><summary>Файл</summary><div class="classic-popup"><button data-photo-command="folder">Открыть папку</button><a class="photo-original-link" data-photo-download download>Сохранить оригинал…</a><hr><button data-photo-command="viewer-close">Закрыть</button></div></details><details class="classic-dropdown"><summary>Вид</summary><div class="classic-popup"><button data-photo-command="fit">Вписать в окно</button><button data-photo-command="actual">Исходный размер · 100%</button><button data-photo-command="slideshow">Слайд-шоу</button></div></details></nav>
    <div class="photo-toolbar"><button class="classic" data-photo-command="previous" title="Предыдущая картинка (←)" aria-label="Предыдущая картинка">←</button><span id="photo-number" aria-live="polite">1 из 3</span><button class="classic" data-photo-command="next" title="Следующая картинка (→)" aria-label="Следующая картинка">→</button><i class="photo-toolbar-divider"></i><button class="classic photo-fit" data-photo-command="fit" aria-pressed="true">Вписать</button><button class="classic photo-zoom-button" data-photo-command="zoom-out" aria-label="Уменьшить">−</button><select id="photo-zoom" aria-label="Масштаб картинки"><option value="fit">По окну</option><option value="0.25">25%</option><option value="0.5">50%</option><option value="0.75">75%</option><option value="1">100%</option><option value="1.5">150%</option><option value="2">200%</option><option value="3">300%</option><option value="4">400%</option></select><button class="classic photo-zoom-button" data-photo-command="zoom-in" aria-label="Увеличить">+</button><button class="classic photo-slideshow" id="photo-slideshow" data-photo-command="slideshow" aria-pressed="false" title="Слайд-шоу: смена каждые 4 секунды">Слайд-шоу</button></div>
    <div class="photo-viewport" id="photo-viewport"><div class="photo-stage" id="photo-stage" hidden></div><div class="photo-load-status" id="photo-load-status" role="status">Ренри открывает картинку…</div></div>
    <div class="photo-caption"><strong id="photo-title"></strong><p id="photo-caption"></p><a data-photo-download class="photo-download" download>Сохранить оригинал</a></div>
    <footer class="photos-status"><span id="photo-dimensions">JPEG</span><span id="photo-scale">По окну</span></footer>`;
  $('#desktop').append(folder,viewer);TavernDesktop.registerWindow(folder);TavernDesktop.registerWindow(viewer);
  function makeTask(id,label,win) {
    const button = document.createElement('button');button.id = id;button.className = 'task-button gallery-task';button.hidden = true;button.dataset.windowTarget = win.id;button.setAttribute('aria-label',label);button.title = label;button.innerHTML = `<img src="assets/icons/kodak_imaging_0.png" alt=""><span>${label}</span>`;$('.taskbar-space').before(button);return button;
  }
  const folderTask = makeTask('photos-folder-task','Картинки',folder), viewerTask = makeTask('photo-viewer-task','Просмотр картинок',viewer);
  const startItem = document.createElement('button');startItem.dataset.photosOpen = '';startItem.innerHTML = '<img src="assets/icons/kodak_imaging_0.png" alt="">Картинки';$('#start-menu nav').insertBefore(startItem,$('#start-menu nav hr'));
  let current = 0, request = 0, zoom = 'fit', currentScale = 1, natural = null, playing = false, slideTimer = null;
  const zoomSteps = [.25,.5,.75,1,1.5,2,3,4];
  function openFolder() {folder.hidden = false;folderTask.hidden = false;TavernDesktop.bringToFront(folder);TavernDesktop.closeStart();}
  function selectThumbnail() {folder.querySelectorAll('[data-photo-index]').forEach(button => {const selected = Number(button.dataset.photoIndex) === current;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});}
  function applyZoom() {
    if (!natural || viewer.hidden) return;
    const viewport = $('#photo-viewport');
    currentScale = zoom === 'fit' ? Math.max(.01,Math.min(1,(viewport.clientWidth - 18) / natural.width,(viewport.clientHeight - 18) / natural.height)) : Number(zoom);
    const stage = $('#photo-stage');stage.style.width = `${natural.width * currentScale}px`;stage.style.height = `${natural.height * currentScale}px`;
    $('#photo-scale').textContent = `${Math.round(currentScale * 100)}%${zoom === 'fit' ? ' · по окну' : ''}`;
    $('#photo-zoom').value = zoom;viewer.querySelector('.photo-fit').setAttribute('aria-pressed',String(zoom === 'fit'));
    viewer.querySelector('[data-photo-command="zoom-out"]').disabled = currentScale <= zoomSteps[0];viewer.querySelector('[data-photo-command="zoom-in"]').disabled = currentScale >= zoomSteps.at(-1);
  }
  function resetScroll() {$('#photo-viewport').scrollTop = 0;$('#photo-viewport').scrollLeft = 0;}
  function setZoom(value) {zoom = String(value);applyZoom();resetScroll();}
  function stopSlideshow() {playing = false;clearTimeout(slideTimer);slideTimer = null;$('#photo-slideshow').setAttribute('aria-pressed','false');$('#photo-slideshow').textContent = 'Слайд-шоу';}
  function scheduleSlide() {clearTimeout(slideTimer);if (playing && !viewer.hidden && !document.hidden) slideTimer = setTimeout(() => showPhoto(current + 1,false),4000);}
  async function showPhoto(index,activate = true) {
    const token = ++request;current = (index % photos.length + photos.length) % photos.length;const photo = photos[current];
    viewer.hidden = false;viewerTask.hidden = false;if (activate) {TavernDesktop.bringToFront(viewer);TavernDesktop.closeStart();}selectThumbnail();
    $('#photo-viewer-title').textContent = `${photo.file} — Просмотр картинок`;viewerTask.querySelector('span').textContent = photo.file;
    $('#photo-number').textContent = `${current + 1} из ${photos.length}`;$('#photo-title').textContent = photo.title;$('#photo-caption').textContent = photo.caption;
    for (const link of viewer.querySelectorAll('[data-photo-download]')) {link.href = source(photo);link.download = photo.file;}
    $('#photo-load-status').textContent = 'Ренри открывает картинку…';$('#photo-load-status').hidden = false;$('#photo-stage').hidden = true;
    clearTimeout(slideTimer);
    try {
      const image = new Image();image.src = source(photo);image.alt = photo.alt;image.className = 'photo-image';image.id = 'photo-image';image.draggable = false;
      await image.decode();
      if (request !== token || viewer.hidden) return;
      natural = {width:image.naturalWidth,height:image.naturalHeight};
      $('#photo-stage').replaceChildren(image);$('#photo-stage').hidden = false;$('#photo-load-status').hidden = true;
      $('#photo-dimensions').textContent = `${natural.width} × ${natural.height} · JPEG · ${(photo.bytes / 1048576).toFixed(2).replace('.',',')} МБ`;
      applyZoom();resetScroll();scheduleSlide();
    } catch {
      if (request !== token) return;natural = null;stopSlideshow();$('#photo-load-status').textContent = 'Ренри не смогла открыть картинку. Попробуй соседнюю.';$('#photo-dimensions').textContent = 'Файл недоступен';
    }
  }
  function openViewer(index) {showPhoto(index);viewer.focus({preventScroll:true});}
  function hideFolder(close = false) {folder.hidden = true;folderTask.classList.remove('active');if (close) folderTask.hidden = true;}
  function hideViewer(close = false) {request++;stopSlideshow();viewer.hidden = true;viewerTask.classList.remove('active');if (close) viewerTask.hidden = true;}
  function toggleSlide() {
    if (playing) {stopSlideshow();return;}
    playing = true;$('#photo-slideshow').setAttribute('aria-pressed','true');$('#photo-slideshow').textContent = 'Остановить';scheduleSlide();
  }
  const commands = {
    folder:openFolder,previous:() => showPhoto(current - 1),next:() => showPhoto(current + 1),fit:() => setZoom('fit'),actual:() => setZoom('1'),
    'zoom-in':() => setZoom(zoomSteps.find(value => value > currentScale + .001) || zoomSteps.at(-1)),
    'zoom-out':() => setZoom([...zoomSteps].reverse().find(value => value < currentScale - .001) || zoomSteps[0]),
    slideshow:toggleSlide,'folder-minimize':() => hideFolder(),'folder-close':() => hideFolder(true),'viewer-minimize':() => hideViewer(),'viewer-close':() => hideViewer(true),
    'folder-maximize':() => folder.classList.toggle('maximized'),'viewer-maximize':() => {viewer.classList.toggle('maximized');applyZoom();}
  };
  document.addEventListener('click',event => {
    if (event.target.closest('[data-photos-open]')) openFolder();
    const thumb = event.target.closest('[data-photo-index]');if (thumb) openViewer(Number(thumb.dataset.photoIndex));
    const command = event.target.closest('[data-photo-command]');if (command) {commands[command.dataset.photoCommand]?.();viewer.querySelectorAll('details').forEach(detail => detail.open = false);}
  });
  folderTask.addEventListener('click',() => {if (folder.hidden) openFolder();else hideFolder();});
  viewerTask.addEventListener('click',() => {if (viewer.hidden) openViewer(current);else hideViewer();});
  $('#photo-zoom').addEventListener('change',event => setZoom(event.target.value));
  viewer.addEventListener('keydown',event => {
    if (event.target.matches('select,input') || event.ctrlKey || event.metaKey || event.altKey) return;
    const keys = {ArrowLeft:() => showPhoto(current - 1),ArrowRight:() => showPhoto(current + 1),Home:() => showPhoto(0),End:() => showPhoto(photos.length - 1),Escape:stopSlideshow};
    if (keys[event.key]) {event.preventDefault();keys[event.key]();}
  });
  new ResizeObserver(() => {if (zoom === 'fit') applyZoom();}).observe($('#photo-viewport'));
  document.addEventListener('visibilitychange',() => {if (document.hidden) stopSlideshow();});
})();
