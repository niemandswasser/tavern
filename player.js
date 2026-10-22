'use strict';
(() => {
  const TRACK_TITLE = 'Песня для Хумана';
  const $ = selector => document.querySelector(selector);
  const player = document.createElement('section');
  player.id = 'music-player';player.className = 'window music-player';
  player.setAttribute('aria-label','Музыкальный плеер');
  player.innerHTML = `<header class="titlebar" data-drag="music-player"><img src="assets/icons/media_player_0.png" alt=""><strong>Песня для Хумана — Media Player</strong><div class="window-controls"><button id="player-minimize" aria-label="Свернуть плеер">_</button><button id="player-close" aria-label="Закрыть плеер">×</button></div></header>
    <div class="media-menubar"><details class="classic-dropdown"><summary>Файл</summary><div class="classic-popup"><button data-media-command="info">Сведения о песне</button><hr><button data-media-command="close">Закрыть</button></div></details><details class="classic-dropdown"><summary>Воспроизведение</summary><div class="classic-popup"><button data-media-command="play">Воспроизвести</button><button data-media-command="pause">Пауза</button><button data-media-command="stop">Стоп</button><button data-media-command="repeat">Повтор</button></div></details></div>
    <div class="player-body"><div class="player-brand"><span>TAVERN PLAYER</span><span>STEREO · MP3</span></div>
      <div class="player-display"><div class="player-lcd"><span class="play-indicator" id="play-indicator" aria-hidden="true">▸</span><output id="player-time">00:00</output><div class="player-spectrum" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="player-track"><span class="track-index">01.</span><strong id="player-track-name"></strong><span class="track-type">MP3</span></div></div>
      <div class="player-seek"><input type="range" id="player-seek" min="0" max="0" step="0.1" value="0" disabled aria-label="Позиция в песне"><span id="player-duration">—:—</span></div>
      <div class="player-controls"><button class="transport" id="player-restart" aria-label="С начала" title="С начала"><span class="transport-icon transport-restart-icon" aria-hidden="true"></span></button><button class="transport transport-play" id="player-play" aria-label="Воспроизвести" title="Воспроизвести"><span class="transport-icon transport-play-icon" id="play-symbol" aria-hidden="true">▶</span></button><button class="transport" id="player-stop" aria-label="Стоп" title="Стоп"><span class="transport-icon transport-stop-icon" aria-hidden="true"></span></button><span class="player-divider"></span><button class="transport repeat-button" id="player-repeat" aria-label="Повтор песни" aria-pressed="false" title="Повтор песни"><span class="transport-icon transport-repeat-icon" aria-hidden="true"></span></button><button class="player-mute" id="player-mute" aria-label="Выключить звук" aria-pressed="false" title="Выключить звук"><span class="speaker-symbol" aria-hidden="true"></span></button><input type="range" id="player-volume" min="0" max="100" step="1" value="40" aria-label="Громкость"></div>
      <div class="player-footer"><span><i class="player-led" aria-hidden="true"></i><span id="player-status" role="status">Жми Play, Хуман. Ренри поставит песню.</span></span><span id="player-volume-label">VOL 40%</span></div>
    </div><audio id="tavern-audio" preload="metadata" src="assets/audio/tavern-song.mp3"></audio>`;
  $('#desktop').append(player);
  $('#player-track-name').textContent = TRACK_TITLE;
  player.querySelector('.titlebar strong').textContent = `${TRACK_TITLE} — Media Player`;
  TavernDesktop.registerWindow(player);
  const task = document.createElement('button');task.className = 'task-button media-task';task.id = 'player-task';
  task.title = 'Музыка';task.setAttribute('aria-label','Музыка');
  task.dataset.windowTarget = player.id;
  task.innerHTML = '<img src="assets/icons/media_player_0.png" alt=""><span>Музыка</span>';
  $('.taskbar-space').before(task);
  const startItem = document.createElement('button');startItem.dataset.playerOpen = '';
  startItem.innerHTML = '<img src="assets/icons/media_player_0.png" alt="">Музыка';
  $('#start-menu nav').insertBefore(startItem,$('#start-menu nav hr'));
  const audio = $('#tavern-audio'), seek = $('#player-seek');
  let seeking = false, pendingPlay = 0;
  const formatTime = seconds => {
    const value = Number.isFinite(seconds) ? Math.max(0,Math.floor(seconds)) : 0;
    return `${String(Math.floor(value / 60)).padStart(2,'0')}:${String(value % 60).padStart(2,'0')}`;
  };
  function openPlayer() {player.hidden = false;task.hidden = false;task.classList.add('active');TavernDesktop.bringToFront(player);TavernDesktop.closeStart();}
  function minimize() {player.hidden = true;task.classList.remove('active');}
  function status(text) {$('#player-status').textContent = text;}
  function updatePlayback() {
    const playing = !audio.paused && !audio.ended;
    player.classList.toggle('is-playing',playing);
    $('#play-symbol').textContent = playing ? 'Ⅱ' : '▶';
    $('#player-play').setAttribute('aria-label',playing ? 'Пауза' : 'Воспроизвести');
    $('#player-play').title = playing ? 'Пауза' : 'Воспроизвести';
    $('#play-indicator').textContent = playing ? '▸' : 'Ⅱ';
    task.classList.toggle('music-playing',playing);
  }
  function updateTime() {
    if (!seeking) {seek.value = audio.currentTime;$('#player-time').textContent = formatTime(audio.currentTime);}
    seek.setAttribute('aria-valuetext',`${formatTime(Number(seek.value))} из ${formatTime(audio.duration)}`);
  }
  function savePreferences() {try {localStorage.setItem('tavern98-audio',JSON.stringify({volume:audio.volume,muted:audio.muted,loop:audio.loop}));} catch {}}
  function updateVolume() {
    const silent = audio.muted || audio.volume === 0;
    $('#player-volume').value = Math.round(audio.volume * 100);
    $('#player-mute').setAttribute('aria-pressed',String(silent));
    $('#player-mute').setAttribute('aria-label',silent ? 'Включить звук' : 'Выключить звук');
    $('#player-mute').title = silent ? 'Включить звук' : 'Выключить звук';
    $('#player-mute').classList.toggle('is-muted',silent);
    $('#player-volume-label').textContent = silent ? 'MUTE' : `VOL ${Math.round(audio.volume * 100)}%`;
    savePreferences();
  }
  audio.volume = .4;
  try {
    const preferences = JSON.parse(localStorage.getItem('tavern98-audio'));
    if (preferences && typeof preferences.volume === 'number' && Number.isFinite(preferences.volume)) audio.volume = Math.max(0,Math.min(1,preferences.volume));
    if (preferences) {audio.muted = preferences.muted === true;audio.loop = preferences.loop === true;}
  } catch {}
  $('#player-repeat').setAttribute('aria-pressed',String(audio.loop));updateVolume();
  async function play() {
    const attempt = ++pendingPlay;
    try {if (audio.ended) audio.currentTime = 0;status('Ренри загружает песню…');await audio.play();}
    catch (error) {if (attempt === pendingPlay && error.name !== 'AbortError') status(audio.error ? 'Не удалось открыть файл песни.' : 'Хуман, нажми Play ещё раз.');updatePlayback();}
  }
  function pause() {pendingPlay++;audio.pause();status('Пауза. Ренри подождёт.');}
  function stop() {pendingPlay++;audio.pause();if (audio.readyState) audio.currentTime = 0;seeking = false;updateTime();updatePlayback();status('Ренри остановила песню.');}
  $('#player-play').addEventListener('click',() => {if (audio.paused) play();else pause();});
  $('#player-stop').addEventListener('click',stop);
  $('#player-restart').addEventListener('click',() => {if (audio.readyState) audio.currentTime = 0;updateTime();if (audio.paused) status('Ренри вернула песню к началу.');});
  $('#player-repeat').addEventListener('click',() => {audio.loop = !audio.loop;$('#player-repeat').setAttribute('aria-pressed',String(audio.loop));savePreferences();status(audio.loop ? 'Ренри оставила песню на повторе.' : 'Ренри выключила повтор.');});
  $('#player-volume').addEventListener('input',event => {audio.volume = Number(event.target.value) / 100;audio.muted = false;updateVolume();});
  $('#player-mute').addEventListener('click',() => {if (audio.volume === 0) {audio.volume = .4;audio.muted = false;} else audio.muted = !audio.muted;updateVolume();});
  seek.addEventListener('input',() => {seeking = true;$('#player-time').textContent = formatTime(Number(seek.value));seek.setAttribute('aria-valuetext',`${formatTime(Number(seek.value))} из ${formatTime(audio.duration)}`);});
  seek.addEventListener('change',() => {if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(audio.duration,Math.max(0,Number(seek.value)));seeking = false;updateTime();});
  seek.addEventListener('pointercancel',() => {seeking = false;updateTime();});
  audio.addEventListener('loadedmetadata',() => {seek.max = audio.duration;seek.disabled = !Number.isFinite(audio.duration);$('#player-duration').textContent = formatTime(audio.duration);updateTime();});
  audio.addEventListener('timeupdate',updateTime);
  audio.addEventListener('playing',() => {updatePlayback();status('Ренри включила · трек 01');});
  audio.addEventListener('pause',updatePlayback);
  audio.addEventListener('ended',() => {updatePlayback();status('Ренри дослушала. Ещё раз, Хуман?');});
  audio.addEventListener('waiting',() => {if (!audio.paused) status('Ренри загружает песню…');});
  audio.addEventListener('volumechange',updateVolume);
  audio.addEventListener('error',() => {seek.disabled = true;status('Не удалось открыть файл песни.');updatePlayback();});
  $('#player-minimize').addEventListener('click',minimize);
  $('#player-close').addEventListener('click',() => {pause();minimize();task.hidden = true;});
  player.addEventListener('click',event => {
    const button = event.target.closest('[data-media-command]');if (!button) return;
    const commands = {play,pause,stop,repeat:() => $('#player-repeat').click(),close:() => $('#player-close').click(),info:() => status(`${TRACK_TITLE} · MP3 · ${formatTime(audio.duration)}`)};
    commands[button.dataset.mediaCommand]();player.querySelectorAll('details').forEach(detail => detail.open = false);
  });
  task.addEventListener('click',() => {if (player.hidden) openPlayer();else minimize();});
  document.addEventListener('click',event => {if (event.target.closest('[data-player-open]')) openPlayer();});
  player.addEventListener('keydown',event => {
    if (event.code === 'Space' && !event.target.closest('button,input')) {event.preventDefault();if (audio.paused) play();else pause();}
  });
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({title:TRACK_TITLE,album:'my little tavern'});
    for (const [action,handler] of Object.entries({play,pause,stop,seekto:event => {if (Number.isFinite(event.seekTime) && Number.isFinite(audio.duration)) audio.currentTime = Math.max(0,Math.min(audio.duration,event.seekTime));}})) {
      try {navigator.mediaSession.setActionHandler(action,handler);} catch {}
    }
  }
  if (matchMedia('(min-width: 801px)').matches) openPlayer();
  else {player.hidden = true;task.hidden = true;}
})();
