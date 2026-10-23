const LINES = [
  "FROM: CODEPEN",
  "SUBJ: NEW EMAIL CHALLENGE",
  "TAG #CODEPENCHALLENGE",
  "SPONSOR: PAGERDUTY",
  "(PUN INTENDED)",
  "DEADLINE: SUNDAY",
  "REPLY 'STOP' TO UNSUB...",
  "JK. YOU CANT ESCAPE.",
  "-- END --"
];

const pager=document.getElementById('pager');
const lcd=document.getElementById('lcd');
const bodyEl=document.getElementById('lcdBody');
const dateEl=document.getElementById('date');
const soundBtn=document.getElementById('sound');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

const ROWS=3;
let revealed=0;
let armed=false;
let typing=false, typeToken=0;
let soundOn=false, ac=null;
let idleTimer=null;

function ensureAudio(){ if(!ac){ try{ ac=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(ac&&ac.state==='suspended') ac.resume(); }
function blip(freq,when,dur){
  if(!soundOn||!ac) return;
  const o=ac.createOscillator(),g=ac.createGain();
  o.type='square';o.frequency.value=freq;
  g.gain.setValueAtTime(0.0001,when);
  g.gain.exponentialRampToValueAtTime(0.12,when+0.01);
  g.gain.exponentialRampToValueAtTime(0.0001,when+dur);
  o.connect(g).connect(ac.destination);o.start(when);o.stop(when+dur+0.02);
}
function beepAlert(){ if(!soundOn||!ac) return; const t=ac.currentTime; blip(1320,t,0.09); blip(1320,t+0.14,0.09); blip(1660,t+0.30,0.12); }
function tick(){ if(!soundOn||!ac) return; blip(2200,ac.currentTime,0.012); }

soundBtn.addEventListener('click',()=>{
  soundOn=!soundOn; ensureAudio();
  soundBtn.textContent=soundOn?'🔊 Sound on':'🔈 Sound off';
  soundBtn.setAttribute('aria-pressed',String(soundOn));
  if(soundOn) blip(880,ac.currentTime,0.05);
});

function buzz(){
  lcd.classList.add('flash');
  setTimeout(()=>lcd.classList.remove('flash'),160);
  if(reduce) return;
  pager.classList.remove('buzz'); void pager.offsetWidth; pager.classList.add('buzz');
  if(navigator.vibrate) navigator.vibrate([90,40,90]);
}

function paint(typedText,withCursor){
  const rows=[];
  const start=Math.max(0,revealed-ROWS);
  for(let i=start;i<revealed-1;i++) rows.push(LINES[i]);
  const last=(typedText!==undefined)?typedText:LINES[revealed-1];
  bodyEl.innerHTML='';
  rows.forEach(t=>{ const d=document.createElement('div'); d.className='row'; d.textContent=t; bodyEl.appendChild(d); });
  if(revealed>0){
    const d=document.createElement('div'); d.className='row';
    d.textContent=last;
    if(withCursor){ const c=document.createElement('span'); c.className='cursor'; c.textContent='█'; d.appendChild(c); }
    bodyEl.appendChild(d);
  }
}

function typeLine(){
  const full=LINES[revealed-1];
  if(reduce){ paint(full,false); typing=false; return; }
  typing=true; const my=++typeToken; let i=0;
  paint('',true);
  (function step(){
    if(my!==typeToken) return;
    i++; paint(full.slice(0,i),i<full.length); tick();
    if(i<full.length){ setTimeout(step,42); }
    else { typing=false; }
  })();
}

function next(){
  if(!armed) return;
  if(typing){ typeToken++; typing=false; paint(LINES[revealed-1],false); poke(false); return; }
  if(revealed>=LINES.length){ revealed=0; }
  revealed++;
  typeLine();
  if(revealed>=LINES.length){ stopHL(); } else { poke(false); }
}
function prev(){
  if(!armed||typing) return;
  if(revealed>1){ revealed--; paint(LINES[revealed-1],false); poke(false); }
}

function poke(steady){
  clearTimeout(idleTimer);
  if(steady){ nextBtn.classList.add('on'); nextBtn.classList.remove('pulse'); }
  else { nextBtn.classList.remove('on','pulse'); }
  idleTimer=setTimeout(()=>{ nextBtn.classList.remove('on'); nextBtn.classList.add('pulse'); },5000);
}
function stopHL(){ clearTimeout(idleTimer); nextBtn.classList.remove('on','pulse'); }

function arrive(){
  armed=true;
  buzz(); beepAlert();
  bodyEl.innerHTML='<div class="row">&gt; NEW EMAIL</div><div class="row" style="opacity:.72">1 UNREAD</div>';
  poke(true);
}

const MON=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
(function(){ const d=new Date(); dateEl.textContent=String(d.getDate()).padStart(2,'0')+' '+MON[d.getMonth()]; })();

bodyEl.innerHTML='<div class="row" style="opacity:.5">  STANDBY</div>';

function press(btn){ btn.classList.add('pressed'); setTimeout(()=>btn.classList.remove('pressed'),110); }
const nextBtn=document.getElementById('next'), prevBtn=document.getElementById('prev');
nextBtn.addEventListener('click',e=>{ e.stopPropagation(); ensureAudio(); press(nextBtn); next(); });
prevBtn.addEventListener('click',e=>{ e.stopPropagation(); ensureAudio(); press(prevBtn); prev(); });
lcd.addEventListener('click',()=>{ ensureAudio(); press(nextBtn); next(); });
window.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key===' '||e.key==='Enter'){ e.preventDefault(); ensureAudio(); press(nextBtn); next(); }
  if(e.key==='ArrowLeft'){ e.preventDefault(); press(prevBtn); prev(); }
});

setTimeout(arrive,2000);