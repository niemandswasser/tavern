'use strict';
// Original, offline survivors game rules; also exercised without a browser.
(() => {
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const UPGRADES=[
    {id:'power',name:'Острый аргумент',text:'+7 к урону всех атак.'},
    {id:'haste',name:'Быстрые мысли',text:'Атаки на 18% чаще.'},
    {id:'bolt',name:'Ещё одна мысль',text:'Ещё один снаряд за выстрел.'},
    {id:'orbit',name:'Запретный том',text:'Вокруг Ренри вращается боевой гримуар.'},
    {id:'pulse',name:'Личное пространство',text:'Кольцо энергии бьёт врагов поблизости.'},
    {id:'speed',name:'Новые кеды',text:'+20 к скорости движения.'},
    {id:'health',name:'Запас чая',text:'+25 к здоровью и полное лечение.'},
    {id:'magnet',name:'Хапнуть лора',text:'Опыт притягивается с большего расстояния.'}
  ];
  class Survivors {
    constructor(random=Math.random){
      this.random=random;this.width=1800;this.height=1200;this.time=0;this.phase='playing';this.kills=0;this.coins=0;
      this.hero={x:900,y:600,hp:100,maxHp:100,speed:165,damage:16,rate:1,bolts:1,orbit:0,pulse:0,magnet:90,level:1,xp:0,nextXp:12,face:1,invulnerable:0,dash:0,dashCooldown:0};
      this.enemies=[];this.shots=[];this.gems=[];this.drops=[];this.effects=[];this.choices=[];
      this.shotClock=.15;this.spawnClock=.3;this.pulseClock=2;this.bossSpawned=false;this.bossDead=false;this.serial=0;this.lastDirection={x:1,y:0};
    }
    spawn(boss=false){
      const angle=this.random()*Math.PI*2;
      const big=!boss&&this.random()<.2,bat=!boss&&!big&&this.random()<.3;
      const hp=boss?1100:big?48+this.time*.18:15+this.time*.1;
      const enemy={id:++this.serial,x:clamp(this.hero.x+Math.cos(angle)*315,30,this.width-30),y:clamp(this.hero.y+Math.sin(angle)*315,30,this.height-30),hp,maxHp:hp,radius:boss?29:big?17:bat?10:12,speed:boss?48:big?38:bat?82:52,damage:boss?25:big?15:9,kind:boss?'boss':big?'golem':bat?'bat':'slime',hit:0,bookHit:0,fire:2.6};
      this.enemies.push(enemy);return enemy;
    }
    pause(){if(this.phase==='playing')this.phase='paused';}
    resume(){if(this.phase==='paused')this.phase='playing';}
    dash(){
      const h=this.hero;if(this.phase!=='playing'||h.dashCooldown>0)return false;
      h.dash=.18;h.dashCooldown=3.2;h.invulnerable=Math.max(h.invulnerable,.35);
      this.effects.push({kind:'dash',x:h.x,y:h.y,life:.3,maxLife:.3});return true;
    }
    hurt(amount){
      const h=this.hero;if(h.invulnerable>0||this.phase!=='playing')return;
      h.hp=Math.max(0,h.hp-amount);h.invulnerable=.7;
      this.effects.push({kind:'hurt',x:h.x,y:h.y,life:.3,maxLife:.3});
      if(h.hp===0)this.phase='lost';
    }
    damage(enemy,amount){
      if(enemy.hp<=0)return;
      enemy.hp-=amount;enemy.hit=.12;
      this.effects.push({kind:'hit',x:enemy.x,y:enemy.y,life:.24,maxLife:.24});
      if(enemy.hp>0)return;
      this.kills++;this.coins+=enemy.kind==='boss'?100:enemy.kind==='golem'?3:1;
      const value=enemy.kind==='boss'?50:enemy.kind==='golem'?5:2;
      if(this.gems.length<220)this.gems.push({x:enemy.x,y:enemy.y,value});else this.gems[this.gems.length-1].value+=value;
      if(enemy.kind==='boss')this.bossDead=true;
      else if(this.random()<.065&&this.drops.length<12)this.drops.push({x:enemy.x,y:enemy.y,life:25});
    }
    gainXp(value){this.hero.xp+=value;this.levelUp();}
    levelUp(){
      const h=this.hero;if(this.phase!=='playing'||h.xp<h.nextXp)return;
      h.xp-=h.nextXp;h.level++;h.nextXp=12+(h.level-1)*8;h.hp=Math.min(h.maxHp,h.hp+12);
      const options=UPGRADES.filter(u=>!(u.id==='bolt'&&h.bolts>=5)&&!(u.id==='orbit'&&h.orbit>=4)&&!(u.id==='haste'&&h.rate>=4));
      for(let i=options.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[options[i],options[j]]=[options[j],options[i]];}
      this.choices=options.slice(0,3);this.phase='upgrade';
    }
    choose(id){
      if(this.phase!=='upgrade'||!this.choices.some(u=>u.id===id))return false;
      const h=this.hero;
      if(id==='power')h.damage+=7;
      if(id==='haste')h.rate=Math.min(4,h.rate*1.18);
      if(id==='bolt')h.bolts++;
      if(id==='orbit')h.orbit++;
      if(id==='pulse')h.pulse++;
      if(id==='speed')h.speed+=20;
      if(id==='health'){h.maxHp+=25;h.hp=h.maxHp;}
      if(id==='magnet')h.magnet+=55;
      this.choices=[];this.phase='playing';this.levelUp();return true;
    }
    shoot(){
      const h=this.hero;let target=null,nearest=220;
      for(const e of this.enemies){const d=distance(h,e);if(e.hp>0&&d<nearest){target=e;nearest=d;}}
      if(!target)return;
      const angle=Math.atan2(target.y-h.y,target.x-h.x);
      for(let i=0;i<h.bolts;i++){
        const a=angle+(i-(h.bolts-1)/2)*.13;
        this.shots.push({x:h.x,y:h.y,vx:Math.cos(a)*355,vy:Math.sin(a)*355,life:1.5,hostile:false,damage:h.damage});
      }
    }
    tick(dt,input={x:0,y:0}){
      if(this.phase!=='playing')return;
      dt=clamp(Number(dt)||0,0,.05);if(!dt)return;
      this.time+=dt;const h=this.hero;
      h.invulnerable=Math.max(0,h.invulnerable-dt);h.dashCooldown=Math.max(0,h.dashCooldown-dt);
      let dx=Number.isFinite(input.x)?input.x:0,dy=Number.isFinite(input.y)?input.y:0,len=Math.hypot(dx,dy);
      if(len>1){dx/=len;dy/=len;len=1;}
      if(len>.05){this.lastDirection={x:dx/len,y:dy/len};if(Math.abs(dx)>.05)h.face=dx>0?1:-1;}
      const dashing=h.dash>0;h.dash=Math.max(0,h.dash-dt);
      h.x=clamp(h.x+(dashing?this.lastDirection.x*620:dx*h.speed)*dt,24,this.width-24);
      h.y=clamp(h.y+(dashing?this.lastDirection.y*620:dy*h.speed)*dt,24,this.height-24);
      this.spawnClock-=dt;
      if(this.spawnClock<=0){this.spawnClock=Math.max(.19,.85-this.time*.004);if(this.enemies.length<95)this.spawn();}
      if(this.time>=150&&!this.bossSpawned){this.bossSpawned=true;this.spawn(true);}
      this.shotClock-=dt;
      if(this.shotClock<=0){this.shotClock=.62/h.rate;this.shoot();}
      this.pulseClock-=dt;
      if(h.pulse&&this.pulseClock<=0){
        this.pulseClock=Math.max(.8,3.2-h.pulse*.3);const radius=90+h.pulse*13;
        this.effects.push({kind:'pulse',x:h.x,y:h.y,radius,life:.45,maxLife:.45});
        for(const e of this.enemies)if(distance(h,e)<radius+e.radius)this.damage(e,h.damage*(1+h.pulse*.25));
      }
      for(const e of this.enemies){
        if(e.hp<=0)continue;
        e.hit=Math.max(0,e.hit-dt);e.bookHit=Math.max(0,e.bookHit-dt);
        const d=distance(e,h)||1;e.x+=(h.x-e.x)/d*e.speed*dt;e.y+=(h.y-e.y)/d*e.speed*dt;
        if(d<e.radius+11)this.hurt(e.damage);
        for(let i=0;i<h.orbit&&e.bookHit<=0;i++){
          const a=this.time*2.6+i*Math.PI*2/h.orbit,book={x:h.x+Math.cos(a)*58,y:h.y+Math.sin(a)*58};
          if(distance(e,book)<e.radius+12){this.damage(e,h.damage*1.1);e.bookHit=.45;}
        }
        if(e.kind==='boss'){
          e.fire-=dt;if(e.fire<=0){e.fire=2.5;for(let i=0;i<12;i++){const a=i*Math.PI/6;this.shots.push({x:e.x,y:e.y,vx:Math.cos(a)*110,vy:Math.sin(a)*110,life:4,hostile:true,damage:12});}}
        }
      }
      // Keep the horde readable instead of collapsing into one overlapping sprite.
      for(let i=0;i<this.enemies.length;i++)for(let j=i+1;j<this.enemies.length;j++){
        const a=this.enemies[i],b=this.enemies[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),gap=(a.radius+b.radius)*.75;
        if(d>0&&d<gap){const push=(gap-d)*.22;a.x=clamp(a.x-dx/d*push,20,this.width-20);a.y=clamp(a.y-dy/d*push,20,this.height-20);b.x=clamp(b.x+dx/d*push,20,this.width-20);b.y=clamp(b.y+dy/d*push,20,this.height-20);}
      }
      for(const s of this.shots){
        s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
        if(s.life<=0)continue;
        if(s.hostile){if(distance(s,h)<12){this.hurt(s.damage);s.life=0;}}
        else for(const e of this.enemies)if(e.hp>0&&distance(s,e)<e.radius+5){this.damage(e,s.damage);s.life=0;break;}
      }
      this.shots=this.shots.filter(s=>s.life>0);this.enemies=this.enemies.filter(e=>e.hp>0);
      for(const gem of this.gems){const d=distance(gem,h);if(d<h.magnet){const step=Math.min(d,260*dt);gem.x+=(h.x-gem.x)/(d||1)*step;gem.y+=(h.y-gem.y)/(d||1)*step;}if(d<15){this.gainXp(gem.value);gem.collected=true;}}
      this.gems=this.gems.filter(g=>!g.collected);
      for(const drop of this.drops){drop.life-=dt;if(h.hp>0&&distance(drop,h)<25){h.hp=Math.min(h.maxHp,h.hp+24);drop.life=0;}}
      this.drops=this.drops.filter(d=>d.life>0);
      for(const effect of this.effects)effect.life-=dt;
      this.effects=this.effects.filter(e=>e.life>0).slice(-100);
      if(this.phase==='playing'&&this.time>=180&&this.bossDead)this.phase='won';
    }
  }
  globalThis.TavernSurvivors={Survivors,UPGRADES};
})();
