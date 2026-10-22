'use strict';
(() => {
  const {Survivors}=TavernSurvivors;
  const win=document.createElement('section');win.id='game-survivors';win.className='window survivors-window';win.hidden=true;win.setAttribute('aria-label','Renri Survivors');
  win.innerHTML=`<header class="titlebar" data-drag="game-survivors"><img src="assets/icons/joystick_3.png" alt=""><strong>Renri Survivors</strong><div class="window-controls"><button data-survivors-action="minimize" aria-label="Свернуть Renri Survivors">_</button><button data-survivors-action="maximize" aria-label="Развернуть Renri Survivors">□</button><button data-survivors-action="close" aria-label="Закрыть Renri Survivors">×</button></div></header>
    <div class="survivors-toolbar"><button data-survivors-action="pause" id="survivors-pause">Пауза</button><button data-survivors-action="help">Справка</button><span>Автоатака · забег 3:00</span></div>
    <div class="survivors-hud"><div class="survivors-hud-line"><span id="survivors-level">РЕНРИ · УР. 1</span><time id="survivors-time">00:00</time><span id="survivors-kills">0 врагов</span></div><div class="survivors-meters"><span id="survivors-health">100 / 100</span><progress id="survivors-hp" max="100" value="100" aria-label="Здоровье"></progress><span>ОПЫТ</span><progress id="survivors-xp" max="12" value="0" aria-label="Опыт до следующего уровня"></progress></div></div>
    <div class="survivors-stage"><canvas id="survivors-canvas" tabindex="0" aria-label="Игровое поле. WASD или стрелки — движение, пробел — рывок. Атаки автоматические."></canvas><div class="survivors-touch"><button class="survivors-stick" id="survivors-stick" aria-label="Джойстик движения"><span></span></button><button class="survivors-dash" id="survivors-dash" aria-label="Рывок">Рывок</button></div><div class="survivors-overlay" id="survivors-overlay"></div></div>
    <footer class="survivors-footer"><span id="survivors-status" role="status">Ренри против пожирателей контекста.</span><span class="survivors-keys">WASD / стрелки · пробел: рывок</span></footer>`;
  document.querySelector('#desktop').append(win);TavernDesktop.registerWindow(win);
  const shortcut=document.createElement('button');shortcut.dataset.survivorsOpen='';shortcut.innerHTML='<img src="assets/icons/joystick_3.png" alt=""><strong>Renri Survivors</strong><small>Ренри атакует. Хуман уворачивается.<br>Опыт, улучшения и три минуты хаоса.</small>';document.querySelector('.game-shortcuts').append(shortcut);
  document.querySelector('#game-games .game-folder-footer>span').textContent='3 объекта';
  const startItem=document.createElement('button');startItem.dataset.survivorsOpen='';startItem.innerHTML='<img src="assets/icons/joystick_3.png" alt="">Renri Survivors';document.querySelector('#start-menu nav').insertBefore(startItem,document.querySelector('#start-menu nav hr'));
  const task=document.createElement('button');task.id='survivors-task';task.className='task-button game-task';task.hidden=true;task.dataset.windowTarget=win.id;task.title='Renri Survivors';task.setAttribute('aria-label','Renri Survivors');task.innerHTML='<img src="assets/icons/joystick_3.png" alt=""><span>Renri Survivors</span>';document.querySelector('.taskbar-space').before(task);
  const $=selector=>win.querySelector(selector),canvas=$('#survivors-canvas'),ctx=canvas.getContext('2d'),overlay=$('#survivors-overlay');
  let game=new Survivors(),started=false,raf=0,lastFrame=0,lastHud=0,shown='',endedSaved=false,help=false;
  let stick={x:0,y:0},pointer=null,stickPointer=null,view={w:600,h:360,zoom:1.5,dpr:1};
  const keys=new Set();let record={kills:0,time:0,wins:0};
  try{const saved=JSON.parse(localStorage.getItem('renri-survivors-record'));if(saved&&Number.isFinite(saved.kills)&&Number.isFinite(saved.time)&&Number.isFinite(saved.wins))record={kills:Math.max(0,saved.kills),time:Math.max(0,saved.time),wins:Math.max(0,saved.wins)};}catch{}
  const clock=time=>`${String(Math.floor(time/60)).padStart(2,'0')}:${String(Math.floor(time%60)).padStart(2,'0')}`;
  function resetInput(){keys.clear();stick={x:0,y:0};pointer=null;stickPointer=null;$('#survivors-stick>span').style.transform='';}
  function pause(){game.pause();resetInput();shown='';sync();}
  function start(){game=new Survivors();started=true;endedSaved=false;help=false;resetInput();shown='';sync();canvas.focus({preventScroll:true});run();}
  function open(){win.hidden=false;task.hidden=false;TavernDesktop.bringToFront(win);TavernDesktop.closeStart();resize();sync();run();}
  function hide(close=false){pause();win.hidden=true;task.classList.remove('active');if(close)task.hidden=true;cancelAnimationFrame(raf);raf=0;}
  function resume(){help=false;game.resume();shown='';sync();canvas.focus({preventScroll:true});}
  function saveResult(){if(endedSaved)return;endedSaved=true;record.kills=Math.max(record.kills,game.kills);record.time=Math.max(record.time,Math.floor(game.time));if(game.phase==='won')record.wins++;try{localStorage.setItem('renri-survivors-record',JSON.stringify(record));}catch{}}
  function sync(){
    const h=game.hero;$('#survivors-level').textContent=`РЕНРИ · УР. ${h.level}`;$('#survivors-time').textContent=clock(game.time);$('#survivors-kills').textContent=`${game.kills} врагов`;
    $('#survivors-health').textContent=`${Math.ceil(h.hp)} / ${h.maxHp}`;$('#survivors-hp').max=h.maxHp;$('#survivors-hp').value=h.hp;$('#survivors-xp').max=h.nextXp;$('#survivors-xp').value=h.xp;
    $('#survivors-dash').textContent=h.dashCooldown>0?`${h.dashCooldown.toFixed(1)} с`:'Рывок';$('#survivors-dash').disabled=game.phase!=='playing'||h.dashCooldown>0;
    $('#survivors-pause').disabled=!started||!['playing','paused'].includes(game.phase);$('#survivors-pause').textContent=game.phase==='paused'?'Продолжить':'Пауза';
    const phase=!started?'title':help?'help':game.phase;if(phase===shown)return;shown=phase;
    overlay.hidden=phase==='playing';if(overlay.hidden){$('#survivors-status').textContent=game.bossSpawned&&!game.bossDead?'Пожиратель контекста здесь. Берегись снарядов!':game.bossDead?'Босс повержен. Продержись до 3:00.':'Ренри атакует. Собирай кристаллы опыта и держись подальше от толпы.';return;}
    resetInput();
    let title='',body='',buttons='';
    if(phase==='title'){title='Renri Survivors';body='Ренри атакует сама. Хуман, двигайся, собирай кристаллы опыта и выбирай улучшения. Выживи 3 минуты и победи пожирателя контекста.';buttons='<button class="classic" data-survivors-action="start">Начать забег</button>';}
    if(phase==='paused'){title='Пауза';body='Ренри придержит монстров. Выдохни, Хуман.';buttons='<button class="classic" data-survivors-action="resume">Продолжить</button> <button class="classic" data-survivors-action="start">Новый забег</button>';}
    if(phase==='help'){title='Как выжить';body='Атаки автоматические. Двигайся на WASD, стрелками или веди мышь с зажатой кнопкой. На телефоне используй джойстик. Собирай голубые кристаллы опыта, выбирай улучшения и подбирай чай для лечения. Пробел или «Рывок» помогут выскочить из толпы. Босс придёт на 2:30. При переключении окон игра ставится на паузу.';buttons=`<button class="classic" data-survivors-action="${started?'resume':'back'}">Понятно</button>`;}
    if(phase==='upgrade'){
      title=`Уровень ${h.level}`;body='Хуман, выбирай, чем Ренри будет разносить эту толпу. Клавиши 1, 2, 3 тоже работают.';
      buttons=`<div class="survivors-choices">${game.choices.map((u,i)=>`<button data-survivors-upgrade="${u.id}"><strong>${i+1}. ${u.name}</strong>${u.text}</button>`).join('')}</div>`;
    }
    if(phase==='lost'||phase==='won'){
      saveResult();title=phase==='won'?'Контекст отвоёван!':'Ренри вернётся.';body=`${clock(game.time)} · ${game.kills} врагов · ${game.coins} монет · уровень ${h.level}. ${phase==='won'?'Хуман, чай заслужен.':'Гримуар уцелел. Ещё один забег?'}`;buttons='<button class="classic" data-survivors-action="start">Ещё забег</button>';
    }
    overlay.innerHTML=`<div class="survivors-panel"><span class="survivors-eyebrow">RENRI DREAM ENGINE · SURVIVORS</span><h2>${title}</h2><p>${body}</p>${buttons}${phase==='title'||phase==='lost'||phase==='won'?`<p class="survivors-best">Рекорд: ${record.kills} врагов · ${clock(record.time)} · побед: ${record.wins}<br>Автоатака · опыт и улучшения · босс на 2:30</p>`:''}</div>`;
    $('#survivors-status').textContent=phase==='upgrade'?'Игра остановлена: выбери улучшение.':phase==='won'?'Ренри сохранила рекорд.':phase==='lost'?'Рекорд сохранён. Новый забег начинается с нуля.':'Ренри против пожирателей контекста.';
  }
  function resize(){const r=$('.survivors-stage').getBoundingClientRect();view={w:Math.max(1,r.width),h:Math.max(1,r.height),zoom:matchMedia('(max-width:800px)').matches?1:1.5,dpr:Math.min(2,devicePixelRatio||1)};canvas.width=Math.round(view.w*view.dpr);canvas.height=Math.round(view.h*view.dpr);draw();}
  function box(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
  function ring(x,y,r,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();}
  function diamond(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath();ctx.fill();}
  function shadow(x,y,r){ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(x,y+6,r,r*.4,0,0,Math.PI*2);ctx.fill();}
  function heroSprite(h){
    const x=Math.round(h.x),y=Math.round(h.y),step=Math.sin(game.time*11)*(Math.abs(stick.x)+Math.abs(stick.y)+keys.size>0?1.5:.3);
    shadow(x,y,12);if(h.invulnerable>0)ring(x,y-3,18,'#d8cf94',1);
    box(x-7,y+5,5,10,'#11151d');box(x+2,y+5+step,5,10-step,'#11151d');box(x-8,y+13,7,3,'#d4d4bf');box(x+2,y+13+step,7,3,'#d4d4bf');
    box(x-10,y-4,20,13,'#872f43');box(x-5,y-3,10,12,'#171a25');box(x-2,y-2,4,7,'#d0cbb3');box(x-2,y+5,4,3,'#b74355');
    box(x-8,y-20,16,12,'#d5b59b');box(x-11,y-22,22,7,'#527b42');box(x-12,y-18,5,15,'#6a964e');box(x+7,y-18,5,15,'#6a964e');box(x-14,y-10,5,12,'#456b3c');box(x+9,y-10,5,12,'#456b3c');
    box(x-7,y-18,5,5,'#638a48');box(x+2,y-18,6,4,'#638a48');box(x-6,y-12,3,2,'#ad4550');box(x+3,y-12,3,2,'#ad4550');box(x-1,y-7,3,1,'#825b50');box(x-12,y-19,3,7,'#20242d');box(x+9,y-19,3,7,'#20242d');
    for(let i=0;i<h.orbit;i++){const a=game.time*2.6+i*Math.PI*2/h.orbit,bx=x+Math.cos(a)*58,by=y+Math.sin(a)*58;shadow(bx,by,8);box(bx-7,by-8,14,17,'#344f5a');box(bx-5,by-6,10,13,'#93bfac');box(bx-1,by-4,2,9,'#365b50');}
  }
  function enemySprite(e){
    const x=Math.round(e.x),y=Math.round(e.y),boss=e.kind==='boss';shadow(x,y,e.radius);
    if(boss){
      box(x-23,y-32,46,55,'#4d314f');box(x-19,y-28,38,44,'#765065');box(x-14,y-24,28,17,'#23222e');box(x-10,y-20,6,4,'#ef9b75');box(x+4,y-20,6,4,'#ef9b75');box(x-8,y-6,16,3,'#231c29');box(x-27,y-27,7,35,'#b18165');box(x+20,y-27,7,35,'#b18165');box(x-17,y-40,6,13,'#d4ad7c');box(x+11,y-40,6,13,'#d4ad7c');
      box(x-30,y-49,60,4,'#302b31');box(x-30,y-49,60*Math.max(0,e.hp/e.maxHp),4,'#cc6c75');return;
    }
    if(e.kind==='bat'){const wing=Math.sin(game.time*10+e.id)*3;box(x-6,y-5,12,11,'#8d7299');box(x-16,y-9+wing,11,8,'#514262');box(x+5,y-9-wing,11,8,'#514262');box(x-4,y-2,2,2,'#eed6ac');box(x+2,y-2,2,2,'#eed6ac');}
    else if(e.kind==='golem'){box(x-15,y-21,30,33,'#4e6570');box(x-18,y-10,6,20,'#607d80');box(x+12,y-10,6,20,'#607d80');box(x-10,y-17,20,12,'#2b394a');box(x-6,y-13,3,3,'#c2c991');box(x+3,y-13,3,3,'#c2c991');box(x-7,y+3,14,4,'#2b394a');}
    else {box(x-11,y-6,22,14,'#765277');box(x-8,y-11,16,7,'#947092');box(x-7,y-5,4,3,'#e5c8a2');box(x+3,y-5,4,3,'#e5c8a2');box(x-3,y+2,6,2,'#3d2a48');}
    if(e.hit>0)ring(x,y-3,e.radius+2,'#b9d2ad');
  }
  function draw(){
    if(!ctx)return;const {w,h,zoom,dpr}=view,p=game.hero,cw=w/zoom,ch=h/zoom;
    const camX=Math.max(0,Math.min(game.width-cw,p.x-cw/2)),camY=Math.max(0,Math.min(game.height-ch,p.y-ch/2));
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#121720';ctx.fillRect(0,0,w,h);ctx.scale(zoom,zoom);ctx.translate(-Math.floor(camX),-Math.floor(camY));
    const startX=Math.floor(camX/48)*48,startY=Math.floor(camY/48)*48;
    for(let y=startY;y<camY+ch+48;y+=48)for(let x=startX;x<camX+cw+48;x+=48){const seed=(x/48*17+y/48*31)&7;box(x,y,47,47,seed<3?'#1b252c':'#1d292f');box(x+2,y+2,44,1,'#29353a');if(seed===3){box(x+7,y+20,9,1,'#33433f');box(x+15,y+21,1,7,'#33433f');}}
    ring(900,600,128,'#38463f');ring(900,600,121,'#2b3734');ring(900,600,50,'#394d43');
    for(let i=0;i<8;i++){const a=i*Math.PI/4;diamond(900+Math.cos(a)*124,600+Math.sin(a)*124,4,'#687458');}
    for(let y=96;y<game.height;y+=288)for(let x=96;x<game.width;x+=288){if(x<camX-30||x>camX+cw+30||y<camY-40||y>camY+ch+30)continue;shadow(x,y,18);box(x-13,y-28,26,39,'#2f3d43');box(x-10,y-31,20,8,'#42535a');box(x-17,y+6,34,9,'#35464b');box(x-3,y-27,6,15,'#8b7855');box(x-2,y-26,4,7,'#d8b978');}
    box(0,0,game.width,12,'#435357');box(0,0,12,game.height,'#435357');box(0,game.height-12,game.width,12,'#435357');box(game.width-12,0,12,game.height,'#435357');
    for(const g of game.gems){diamond(g.x,g.y,5,g.value>3?'#b6d7b9':'#74c2ca');diamond(g.x-1,g.y-1,2,'#d9f0dc');}
    for(const d of game.drops){box(d.x-5,d.y-5,10,10,'#d6c8a0');box(d.x+5,d.y-3,3,5,'#a69774');box(d.x-3,d.y-3,6,2,'#76654b');}
    const sprites=[...game.enemies,{kind:'hero',x:p.x,y:p.y}].sort((a,b)=>a.y-b.y);
    for(const e of sprites)if(e.x>camX-60&&e.x<camX+cw+60&&e.y>camY-70&&e.y<camY+ch+60){if(e.kind==='hero')heroSprite(p);else enemySprite(e);}
    for(const s of game.shots){ctx.strokeStyle=s.hostile?'#cf7b83':'#a4d6ae';ctx.lineWidth=s.hostile?4:3;ctx.beginPath();ctx.moveTo(s.x-s.vx*.022,s.y-s.vy*.022);ctx.lineTo(s.x,s.y);ctx.stroke();diamond(s.x,s.y,s.hostile?3:2,s.hostile?'#edaf90':'#dfefc9');}
    for(const e of game.effects){ctx.globalAlpha=e.life/e.maxLife;if(e.kind==='pulse')ring(e.x,e.y,(1-e.life/e.maxLife)*e.radius,'#9fc6a2',3);else if(e.kind==='dash')ring(e.x,e.y,17,'#7bb8be',2);else if(e.kind==='hurt')ring(e.x,e.y,21,'#cb8d81',2);else diamond(e.x,e.y,6*(1-e.life/e.maxLife),'#d8daa9');ctx.globalAlpha=1;}
    ctx.setTransform(dpr,0,0,dpr,0,0);const shade=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.25,w/2,h/2,Math.max(w,h)*.68);shade.addColorStop(0,'#0000');shade.addColorStop(1,'#070b1455');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
    const boss=game.enemies.find(e=>e.kind==='boss');if(boss){ctx.fillStyle='#e0c5a4';ctx.font='12px Arial';ctx.textAlign='center';ctx.fillText('ПОЖИРАТЕЛЬ КОНТЕКСТА',w/2,18);ctx.fillStyle='#39303c';ctx.fillRect(w*.25,25,w*.5,5);ctx.fillStyle='#bb6d7c';ctx.fillRect(w*.25,25,w*.5*Math.max(0,boss.hp/boss.maxHp),5);}
  }
  function frame(now){
    raf=0;if(win.hidden)return;
    const dt=lastFrame?Math.min(.05,(now-lastFrame)/1000):0;lastFrame=now;
    if(win.classList.contains('is-active')&&!document.hidden){
      if(started&&game.phase==='playing'){
        let x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),y=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);
        if(!x&&!y){x=stick.x;y=stick.y;}if(pointer){const r=canvas.getBoundingClientRect(),h=game.hero,cw=view.w/view.zoom,ch=view.h/view.zoom,cx=Math.max(0,Math.min(game.width-cw,h.x-cw/2)),cy=Math.max(0,Math.min(game.height-ch,h.y-ch/2)),dx=pointer.x-r.left-(h.x-cx)*view.zoom,dy=pointer.y-r.top-(h.y-cy)*view.zoom,d=Math.hypot(dx,dy);if(d>12){x=dx/d;y=dy/d;}}
        game.tick(dt,{x,y});
      }
      draw();if(now-lastHud>90){lastHud=now;sync();}
    }
    raf=requestAnimationFrame(frame);
  }
  function run(){if(!raf){lastFrame=0;raf=requestAnimationFrame(frame);}}
  document.addEventListener('click',event=>{if(event.target.closest('[data-survivors-open]'))open();const choice=event.target.closest('[data-survivors-upgrade]');if(choice){game.choose(choice.dataset.survivorsUpgrade);shown='';sync();canvas.focus({preventScroll:true});}const action=event.target.closest('[data-survivors-action]')?.dataset.survivorsAction;if(!action)return;if(action==='start')start();if(action==='resume')resume();if(action==='back'){help=false;shown='';sync();}if(action==='pause'){if(game.phase==='paused')resume();else pause();}if(action==='help'){game.pause();help=true;shown='';sync();}if(action==='minimize'||action==='close')hide(action==='close');if(action==='maximize'){win.classList.toggle('maximized');resize();}});
  task.addEventListener('click',()=>{if(win.hidden||!win.classList.contains('is-active'))open();else hide();});
  win.addEventListener('keydown',event=>{
    if(event.target.matches('input,select')||win.hidden||!win.classList.contains('is-active')||!started)return;
    const choice=/^(?:Digit|Numpad)([123])$/.exec(event.code);
    if(game.phase==='upgrade'&&choice&&!event.repeat){event.preventDefault();game.choose(game.choices[Number(choice[1])-1]?.id);shown='';sync();return;}
    if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(event.code)){event.preventDefault();keys.add(event.code);if(event.code==='Space'&&!event.repeat)game.dash();}
    if((event.code==='Escape'||event.code==='KeyP')&&!event.repeat){event.preventDefault();if(game.phase==='paused'||help)resume();else pause();}
  });
  window.addEventListener('keyup',event=>keys.delete(event.code));window.addEventListener('blur',()=>{if(started)pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&started)pause();});
  document.addEventListener('tavern:activate',event=>{if(event.detail.window!==win&&started)pause();});
  new MutationObserver(()=>{if(document.querySelector('#desktop').classList.contains('show-desktop')&&started)pause();}).observe(document.querySelector('#desktop'),{attributes:true,attributeFilter:['class']});
  canvas.addEventListener('pointerdown',event=>{if(game.phase!=='playing'||!started||event.button!==0)return;pointer={x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);canvas.focus({preventScroll:true});});
  canvas.addEventListener('pointermove',event=>{if(pointer)pointer={x:event.clientX,y:event.clientY};});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>pointer=null);
  const stickButton=$('#survivors-stick');
  function moveStick(event){const r=stickButton.getBoundingClientRect(),max=r.width*.31,dx=event.clientX-r.left-r.width/2,dy=event.clientY-r.top-r.height/2,d=Math.hypot(dx,dy)||1;stick={x:dx/Math.max(d,max),y:dy/Math.max(d,max)};$('#survivors-stick>span').style.transform=`translate(${stick.x*max}px,${stick.y*max}px)`;}
  stickButton.addEventListener('pointerdown',event=>{if(game.phase!=='playing'||!started)return;stickPointer=event.pointerId;stickButton.setPointerCapture(event.pointerId);moveStick(event);});
  stickButton.addEventListener('pointermove',event=>{if(event.pointerId===stickPointer)moveStick(event);});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])stickButton.addEventListener(type,()=>{stickPointer=null;stick={x:0,y:0};$('#survivors-stick>span').style.transform='';});
  $('#survivors-dash').addEventListener('pointerdown',()=>game.dash());
  new ResizeObserver(()=>{if(!win.hidden)resize();}).observe($('.survivors-stage'));
  sync();
})();
