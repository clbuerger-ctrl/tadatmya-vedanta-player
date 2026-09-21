const FOLDER="https://www.dropbox.com/scl/fo/m10ycst2zjp72cwygc1fo/ALB3AGy0uKvmitTOetYJB4U";
const RLKEY="ubqr97xi75q2xr6d3jhf4hcyf";
const STORE="tv-player-resume-v1";
const TEXT_BASE="texte/";
const LESUNGEN=(window.LESUNGEN||[]).map(function(L){ L.sum=L.sum||""; return L; });
function mediaUrl(name){return FOLDER+"?rlkey="+encodeURIComponent(RLKEY)+"&preview="+encodeURIComponent(name)+"&raw=1";}
const textCache={};
function loadLectureText(L){
  const key=L.file;
  if(textCache[key]!==undefined) return Promise.resolve(textCache[key]);
  const urls=[];
  if(L.nr) urls.push(TEXT_BASE+L.nr+".txt");
  function tryOne(k){
    if(k>=urls.length){textCache[key]=null;return Promise.resolve(null);}
    return fetch(urls[k],{cache:"no-store"}).then(function(r){
      if(!r.ok) return tryOne(k+1);
      return r.text().then(function(t){ textCache[key]=t; return t; });
    }).catch(function(){ return tryOne(k+1); });
  }
  return tryOne(0);
}
function fmt(sec){sec=Math.max(0,Math.floor(sec||0));return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0");}
function loadState(){try{return JSON.parse(localStorage.getItem(STORE)||"null");}catch(e){return null;}}
function saveState(){if(i<0||!sichtbar[i])return;localStorage.setItem(STORE,JSON.stringify({file:sichtbar[i].file,time:a.currentTime||0}));updateResume();}
let i=-1,resumeTo=0,sichtbar=LESUNGEN.slice();
const a=document.getElementById("a");
function holdPitch(){a.preservesPitch=true;a.webkitPreservesPitch=true;a.mozPreservesPitch=true;}
function setSpeed(v){const r=parseFloat(v);a.playbackRate=isFinite(r)&&r>0?r:1;try{holdPitch();}catch(e){}}
try{holdPitch();}catch(e){}
a.addEventListener("play",function(){const sel=document.getElementById("speed");if(sel)setSpeed(sel.value);});
function filterList(){const q=document.getElementById("q").value.trim().toLowerCase();sichtbar=LESUNGEN.filter(function(L){if(!q)return true;return (L.titel+" "+L.file+" "+(L.tags||[]).join(" ")).toLowerCase().indexOf(q)!==-1;});if(i>=sichtbar.length)i=sichtbar.length?0:-1;zeichne();}
function labelOf(L){return (L.nr?"#"+L.nr+"  ":"")+L.titel;}
function zeichne(){const box=document.getElementById("list");box.innerHTML="";sichtbar.forEach(function(L,idx){const d=document.createElement("div");d.className="item"+(idx===i?" active":"");d.innerHTML=labelOf(L)+"<div class='tags'>"+(L.tags||[]).join(" ")+"</div>";d.onclick=function(){play(idx,0);};box.appendChild(d);});}
function updateResume(){const st=loadState();const btn=document.getElementById("btnResume");if(!st||!st.file){btn.disabled=true;btn.textContent="Weiterhören";return;}const L=LESUNGEN.find(function(x){return x.file===st.file;});btn.disabled=false;btn.textContent="Weiterhören · "+(L?labelOf(L):"Datei")+" ("+fmt(st.time)+")";}
function play(idx,startAt){if(!sichtbar.length)return;i=Math.max(0,Math.min(idx,sichtbar.length-1));const L=sichtbar[i];resumeTo=startAt||0;document.getElementById("now").textContent=labelOf(L);document.getElementById("nr").value=L.nr||"";document.getElementById("err").textContent="";zeichne();a.muted=false;a.volume=1;a.src=mediaUrl(L.file);function tryPlay(){const p=a.play();if(p&&p.catch)p.catch(function(){document.getElementById("err").textContent="Kein Ton — Play im Balken oder im grauen Regler tippen.";});}if(a.readyState>=3) tryPlay();else a.addEventListener("canplay",tryPlay,{once:true});a.load();}
function playNr(){const n=parseInt(document.getElementById("nr").value,10);const idx=sichtbar.findIndex(function(L){return L.nr===n;});if(idx<0){document.getElementById("err").textContent="Keine Lesung für #"+n;return;}play(idx,0);}
function resumeNow(){const st=loadState();if(!st)return;let idx=sichtbar.findIndex(function(L){return L.file===st.file;});if(idx<0){document.getElementById("q").value="";filterList();idx=sichtbar.findIndex(function(L){return L.file===st.file;});}if(idx<0)return;play(idx,st.time||0);}
function skip(sec){if(!a.getAttribute("src"))return;try{const t=(a.currentTime||0)+sec;if(isFinite(a.duration)&&a.duration>1)a.currentTime=Math.max(0,Math.min(t,a.duration-0.25));else a.currentTime=Math.max(0,t);}catch(e){}}
function prev(){play(i<0?0:i-1,0);} function next(){play(i<0?0:i+1,0);}
function toggle(){if(!a.getAttribute("src")){if(loadState())resumeNow();else play(0,0);return;}if(a.paused)a.play();else a.pause();}
function syncPlayBtn(){const b=document.getElementById("btnPlay");if(b)b.textContent=a.paused?"Play":"Pause";}
function placeOverlay(){document.getElementById("dlg").style.top="0px";}
function showSum(){const L=(i>=0?sichtbar[i]:null)||sichtbar[0];if(!L)return;document.getElementById("dlgT").textContent=labelOf(L);document.getElementById("dlgTags").textContent=(L.tags||[]).join(" ");document.getElementById("dlgB").textContent="Text wird geladen …";placeOverlay();document.getElementById("dlg").classList.add("on");loadLectureText(L).then(function(t){document.getElementById("dlgB").textContent=t||L.sum||"Kein Text gefunden.";});}
function hideSum(){document.getElementById("dlg").classList.remove("on");}
document.getElementById("btnCloseSum").onclick=hideSum;
document.getElementById("dlg").onclick=function(e){if(e.target===this)hideSum();};
a.addEventListener("loadedmetadata",function(){if(resumeTo>0&&isFinite(a.duration)){a.currentTime=Math.min(resumeTo,Math.max(0,a.duration-1));resumeTo=0;}});
a.addEventListener("timeupdate",function(){if(!a.paused)saveState();});
a.addEventListener("play",function(){syncPlayBtn();});
a.addEventListener("pause",function(){saveState();syncPlayBtn();});
a.addEventListener("ended",function(){saveState();next();});
a.addEventListener("error",function(){document.getElementById("err").textContent="Diese Datei startet nicht."});
function mergeEntries(arr){
  if(!Array.isArray(arr)) return 0;
  let n=0;
  arr.forEach(function(E){
    if(!E) return;
    const file=E.file||E.name||E.filename;
    if(!file) return;
    if(LESUNGEN.some(function(L){return L.file===file;})) return;
    let nr=E.nr||null;
    const m=String(file+" "+(E.titel||"")).match(/#(\d+)/);
    if(!nr && m) nr=parseInt(m[1],10);
    LESUNGEN.push({nr:nr,titel:E.titel||E.title||file.replace(/\.mp3$/i,""),file:file,tags:E.tags||[],sum:E.sum||""});
    n++;
  });
  if(n){ sichtbar=LESUNGEN.slice(); filterList(); updateResume(); }
  return n;
}
function loadExtraCatalog(){
  fetch(mediaUrl("katalog.json"),{cache:"no-store"}).then(function(r){return r.ok?r.json():Promise.reject();}).then(mergeEntries).catch(function(){
    fetch(mediaUrl("katalog.txt"),{cache:"no-store"}).then(function(r){return r.ok?r.text():"";}).then(function(t){
      if(!t) return;
      const files=t.split(/\r?\n/).map(function(l){return l.trim();}).filter(function(l){return l&&l.charAt(0)!=="#"&&/\.mp3$/i.test(l);});
      mergeEntries(files.map(function(f){return {file:f};}));
    }).catch(function(){});
  });
}
zeichne();updateResume();
loadExtraCatalog();
if(!LESUNGEN.length) document.getElementById("err").textContent="Katalog lesungen.js fehlt.";
