'use strict';
(() => {
  // Add newer entries at the top. The same text is displayed and saved as TXT.
  const history = `ИСТОРИЯ ОБНОВЛЕНИЙ

22.10.2026
Сайт полностью обновлен.
`;
  const win=document.createElement('section');win.id='updates-window';win.className='window updates-window';win.hidden=true;win.setAttribute('aria-label','История обновлений — Блокнот');
  win.innerHTML=`<header class="titlebar" data-drag="updates-window"><img src="assets/icons/notepad_file-2.png" alt=""><strong>обновления.txt — Блокнот</strong><div class="window-controls"><button data-updates-action="minimize" aria-label="Свернуть историю обновлений">_</button><button data-updates-action="maximize" aria-label="Развернуть историю обновлений">□</button><button data-updates-action="close" aria-label="Закрыть историю обновлений">×</button></div></header><div class="updates-filebar"><span>Текстовый документ</span><a class="classic" id="updates-download" download="обновления.txt">Сохранить .txt</a></div><pre class="updates-text" id="updates-text" tabindex="0" aria-label="Текст истории обновлений"></pre><footer class="updates-status"><span>Последнее обновление: 22.10.2026</span><span>UTF-8</span></footer>`;
  win.querySelector('#updates-text').textContent=history;
  win.querySelector('#updates-download').href=URL.createObjectURL(new Blob([history],{type:'text/plain;charset=utf-8'}));
  document.querySelector('#desktop').append(win);TavernDesktop.registerWindow(win);
  const task=document.createElement('button');task.id='updates-task';task.className='task-button';task.hidden=true;task.dataset.windowTarget=win.id;task.title='История обновлений';task.setAttribute('aria-label','История обновлений');task.innerHTML='<img src="assets/icons/notepad_file-2.png" alt=""><span>обновления.txt</span>';document.querySelector('.taskbar-space').before(task);
  function open(){win.hidden=false;task.hidden=false;TavernDesktop.bringToFront(win);TavernDesktop.closeStart();win.querySelector('#updates-text').focus({preventScroll:true});}
  function hide(close=false){win.hidden=true;task.classList.remove('active');if(close)task.hidden=true;}
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-updates-open]'))open();
    const button=event.target.closest('[data-updates-action]');if(!button)return;
    if(button.dataset.updatesAction==='maximize')win.classList.toggle('maximized');
    else hide(button.dataset.updatesAction==='close');
  });
  task.addEventListener('click',()=>{if(win.hidden)open();else hide();});
  win.addEventListener('keydown',event=>{if(event.key==='Escape')hide(true);if((event.ctrlKey||event.metaKey)&&event.code==='KeyS'){event.preventDefault();win.querySelector('#updates-download').click();}});
})();
