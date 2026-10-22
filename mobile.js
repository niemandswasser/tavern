'use strict';
(() => {
  const mobile=matchMedia('(max-width: 800px)');
  const desktop=document.querySelector('#desktop');
  const icons=document.querySelector('.desktop-icons');
  const taskbar=document.querySelector('.taskbar');
  const start=document.querySelector('#start-menu');
  const startButton=document.querySelector('#start-button');
  const tasks=document.createElement('div');
  tasks.className='taskbar-apps';tasks.setAttribute('role','group');tasks.setAttribute('aria-label','Открытые окна');
  taskbar.querySelector('.taskbar-space').before(tasks);
  const desktopButton=document.createElement('button');
  desktopButton.type='button';desktopButton.className='classic mobile-desktop-button';
  desktopButton.setAttribute('aria-label','Показать рабочий стол');desktopButton.setAttribute('aria-pressed','false');
  desktopButton.innerHTML='<img src="assets/icons/computer_explorer-4.png" alt=""><span>Стол</span>';
  taskbar.querySelector('.tray').before(desktopButton);
  const backdrop=document.createElement('button');
  backdrop.type='button';backdrop.className='mobile-start-backdrop';backdrop.hidden=true;
  backdrop.setAttribute('aria-label','Закрыть меню Пуск');start.before(backdrop);
  backdrop.addEventListener('click',()=>TavernDesktop.closeStart());

  const picker=document.createElement('select');
  picker.id='mobile-folder';picker.className='mobile-folder';picker.setAttribute('aria-label','Открыть папку');
  for(const link of document.querySelectorAll('.tree [data-page]')){
    const option=document.createElement('option');option.value=link.dataset.page;
    option.textContent=link.querySelector('span:last-child').textContent;picker.append(option);
  }
  document.querySelector('#address').after(picker);
  picker.value=document.querySelector('.tree .selected')?.dataset.page||'home';
  picker.addEventListener('change',()=>TavernDesktop.navigate(picker.value));
  const recycle=document.createElement('button');
  recycle.type='button';recycle.className='mobile-start-extra';recycle.dataset.action='recycle';
  recycle.innerHTML='<img src="assets/icons/recycle_bin_empty-4.png" alt="">Корзина';
  start.querySelector('nav').append(recycle);

  function collectTasks(){
    for(const task of taskbar.querySelectorAll(':scope > .task-button'))tasks.append(task);
  }
  function revealTask(){
    if(!mobile.matches)return;
    const active=tasks.querySelector('.task-button.active:not([hidden])');if(!active)return;
    const r=active.getBoundingClientRect(),view=tasks.getBoundingClientRect();
    if(r.left<view.left)tasks.scrollLeft-=view.left-r.left;
    else if(r.right>view.right)tasks.scrollLeft+=r.right-view.right;
  }
  function sync(){
    const active=desktop.querySelector(':scope > .window.is-active:not([hidden])');
    const showing=desktop.classList.contains('show-desktop')||!active;
    icons.inert=mobile.matches&&!showing;
    desktopButton.setAttribute('aria-pressed',String(showing));
    desktopButton.setAttribute('aria-label',showing?'Вернуться к окну':'Показать рабочий стол');
    document.querySelector('#note-task').toggleAttribute('data-mobile-closed',document.querySelector('#notepad').hidden);
    backdrop.hidden=!mobile.matches||start.hidden;
    document.querySelector('.addressbar > span').textContent=mobile.matches?'Папка':'Адрес';
  }
  function viewport(){
    if(!mobile.matches){document.documentElement.style.removeProperty('--mobile-height');return;}
    const visual=window.visualViewport;
    if(visual&&visual.scale!==1)return;
    document.documentElement.style.setProperty('--mobile-height',`${Math.round(visual?.height||innerHeight)}px`);
  }
  desktopButton.addEventListener('click',()=>{
    desktop.classList.toggle('show-desktop');TavernDesktop.closeStart();sync();
  });
  document.addEventListener('tavern:activate',()=>{
    desktop.classList.remove('show-desktop');sync();revealTask();
  });
  document.addEventListener('tavern:navigate',event=>{picker.value=event.detail.page;});
  // A background window is restored with one tap; tapping the active task still minimizes it.
  taskbar.addEventListener('click',event=>{
    const task=event.target.closest('.task-button[data-window-target]');
    if(!mobile.matches||!task)return;
    const win=document.getElementById(task.dataset.windowTarget);
    if(win&&!win.hidden&&(!win.classList.contains('is-active')||desktop.classList.contains('show-desktop'))){
      event.stopImmediatePropagation();TavernDesktop.closeStart();TavernDesktop.bringToFront(win);
    }
  },true);
  new MutationObserver(()=>{collectTasks();sync();}).observe(taskbar,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  new MutationObserver(sync).observe(desktop,{subtree:true,attributes:true,attributeFilter:['hidden']});
  new MutationObserver(sync).observe(start,{attributes:true,attributeFilter:['hidden']});
  mobile.addEventListener('change',()=>{desktop.classList.remove('show-desktop');viewport();sync();requestAnimationFrame(revealTask);});
  window.visualViewport?.addEventListener('resize',viewport);
  window.addEventListener('resize',viewport);
  collectTasks();viewport();sync();
})();
