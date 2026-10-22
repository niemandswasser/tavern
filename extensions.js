'use strict';
(() => {
  const section=document.querySelector('#page-extensions');
  const announcement=document.createElement('span');
  announcement.className='extension-copy-announcement';
  announcement.setAttribute('role','status');
  section.append(announcement);

  async function copyText(text){
    if(navigator.clipboard?.writeText){
      try{await navigator.clipboard.writeText(text);return true;}catch{}
    }
    // Also support direct file opening and browsers without Clipboard API access.
    const focused=document.activeElement;
    const field=document.createElement('textarea');
    field.value=text;field.readOnly=true;
    field.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none';
    document.body.append(field);
    let copied=false;
    try{field.focus({preventScroll:true});field.select();copied=document.execCommand('copy');}catch{}
    finally{field.remove();focused?.focus({preventScroll:true});}
    return copied;
  }

  for(const link of section.querySelectorAll('.preset-download-row a[href^="https://github.com/"]')){
    const card=link.closest('article');
    const title=card.querySelector('h2').textContent.replace(/\s+/g,' ').trim();
    const button=document.createElement('button');
    button.type='button';button.className='classic extension-copy';button.textContent='Скопировать';
    button.setAttribute('aria-label',`Скопировать ссылку GitHub: ${title}`);
    link.after(button);
    let resetTimer,pending=false,manual;
    button.addEventListener('click',async()=>{
      if(pending)return;
      pending=true;clearTimeout(resetTimer);
      announcement.textContent='';
      button.setAttribute('aria-busy','true');button.textContent='Копирую…';
      if(manual)manual.hidden=true;
      try{
        const copied=await copyText(link.href);
        if(copied){
          button.textContent='Скопировано!';button.dataset.copyState='done';
          announcement.textContent=`Ссылка GitHub для ${title} скопирована.`;
          resetTimer=setTimeout(()=>{button.textContent='Скопировать';delete button.dataset.copyState;},2200);
        }else{
          button.textContent='Скопировать';delete button.dataset.copyState;
          if(!manual){
            manual=document.createElement('label');manual.className='extension-copy-manual';
            manual.append('Ссылка для копирования вручную:');
            const input=document.createElement('input');input.type='text';input.readOnly=true;
            input.addEventListener('click',()=>input.select());manual.append(input);
            link.closest('.preset-download-row').after(manual);
          }
          const input=manual.querySelector('input');input.value=link.href;manual.hidden=false;
          const pane=section.closest('.page-scroll');
          const fieldRect=manual.getBoundingClientRect(),paneRect=pane.getBoundingClientRect();
          if(fieldRect.bottom>paneRect.bottom)pane.scrollTop+=fieldRect.bottom-paneRect.bottom+8;
          else if(fieldRect.top<paneRect.top)pane.scrollTop-=paneRect.top-fieldRect.top+8;
          input.focus({preventScroll:true});input.select();
          announcement.textContent='Браузер не разрешил копирование. Ссылка выделена для копирования вручную.';
        }
      }finally{pending=false;button.removeAttribute('aria-busy');}
    });
  }
})();
