'use strict';
(() => {
  const win=document.createElement('section');
  win.id='system-window';win.className='window system-window';win.hidden=true;win.setAttribute('aria-label','Свойства системы');
  win.innerHTML=`<header class="titlebar" data-drag="system-window"><img src="assets/icons/computer_explorer-4.png" alt=""><strong>Свойства системы</strong><div class="window-controls"><button data-system-action="minimize" aria-label="Свернуть свойства системы">_</button><button data-system-action="close" aria-label="Закрыть свойства системы">×</button></div></header>
    <div class="system-content"><div class="system-tab">Общие</div><div class="system-sheet"><div class="system-mark" aria-hidden="true"><img src="assets/icons/computer_explorer-4.png" alt=""></div><div class="system-version"><p>Система:</p><h2 class="system-edition">Renri OS 98<span>4.10.1998</span></h2></div><dl class="system-facts"><div><dt>Зарегистрировано на имя:</dt><dd>Мясной мешочек</dd></div><div><dt>Компьютер:</dt><dd>Dream Engine 5.5</dd></div><div><dt>Оперативная память:</dt><dd>занята лором</dd></div></dl></div></div><footer class="system-footer"><button class="classic" data-system-action="close">ОК</button></footer>`;
  document.querySelector('#desktop').append(win);TavernDesktop.registerWindow(win);
  const task=document.createElement('button');task.id='system-task';task.className='task-button';task.hidden=true;task.dataset.windowTarget=win.id;task.setAttribute('aria-label','Свойства системы');task.title='Свойства системы';task.innerHTML='<img src="assets/icons/computer_explorer-4.png" alt=""><span>Свойства системы</span>';document.querySelector('.taskbar-space').before(task);
  function open(){win.hidden=false;task.hidden=false;TavernDesktop.bringToFront(win);TavernDesktop.closeStart();win.querySelector('[data-system-action="close"]').focus({preventScroll:true});}
  function hide(close=false){win.hidden=true;task.classList.remove('active');if(close)task.hidden=true;}
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-system-open]'))open();
    const button=event.target.closest('[data-system-action]');if(button)hide(button.dataset.systemAction==='close');
  });
  task.addEventListener('click',()=>{if(win.hidden)open();else hide();});
  win.addEventListener('keydown',event=>{if(event.key==='Escape')hide(true);});
})();
