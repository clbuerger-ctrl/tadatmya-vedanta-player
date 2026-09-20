const FILE_2B="Tādātmya Vedānta - Vortrag #2b zum Buch über die Philosophie der Hari Bhakta Sampradaya - Vertiefung.mp3";
const BOOK_URL="https://bhaktishop.com/products/tadatmya-vedanta";
const BOOK_BLURB="Dieses Werk stellt Tādātmya Vedānta vor, die Philosophie der Hari Bhakta Sampradāya, begründet von Paramahamsa Vishwananda. Es beleuchtet die Bausteine der Wirklichkeit und ihre Verbindung, das höchste Ziel spiritueller Verwirklichung sowie den Weg dorthin. Als philosophische Abhandlung und hingebungsvolles Angebot ist es eine Einladung zu Just Love.";
function fixLecture2b(){
  const list=window.LESUNGEN;
  if(!list||!list.length) return;
  list.forEach(function(L){
    const f=L.file||"";
    const t=L.titel||"";
    if(f.indexOf("Vertiefung #2.mp3")!==-1 || t.indexOf("#2b")!==-1 || f.indexOf("Vortrag #2b")!==-1){
      L.file=FILE_2B;
      L.titel="Vortrag #2b — Vertiefung";
    }
  });
  if(typeof zeichne==="function"){
    try{ zeichne(); }catch(e){}
  }
}
fixLecture2b();
setTimeout(fixLecture2b, 50);
function ensureTwoCol(){
  let st=document.getElementById("tv-twocol");
  if(!st){ st=document.createElement("style"); st.id="tv-twocol"; document.head.appendChild(st); }
  st.textContent="@media (min-width:800px){.list{display:grid;grid-template-columns:1fr 1fr}.item{border-right:1px solid #3d2f26}}@media (min-width:1200px){.list{grid-template-columns:1fr 1fr 1fr}}.cover-row{display:flex;gap:16px;align-items:center;justify-content:center;max-width:46rem;margin:0 auto 8px;padding:0 12px}.cover-row .cover{height:200px;margin:0}.cover-blurb{font-size:.8rem;line-height:1.45;color:#eadfcf;text-align:left;max-width:22rem;font-style:normal;font-family:system-ui,Segoe UI,Roboto,sans-serif}@media (max-width:700px){.cover-row{flex-direction:column}.cover-blurb{text-align:center;max-width:22rem}}";
}
function ensureCoverLink(){
  const img=document.querySelector("img.cover");
  if(!img) return;
  if(img.parentElement && img.parentElement.tagName==="A"){
    img.parentElement.href=BOOK_URL;
    img.parentElement.target="_blank";
    img.parentElement.rel="noopener noreferrer";
    img.parentElement.title="Tādātmya Vedānta im Bhakti Shop";
    return;
  }
  const a=document.createElement("a");
  a.href=BOOK_URL;
  a.target="_blank";
  a.rel="noopener noreferrer";
  a.title="Tādātmya Vedānta im Bhakti Shop";
  img.parentNode.insertBefore(a, img);
  a.appendChild(img);
}
function ensureCoverBlurb(){
  if(document.querySelector(".cover-blurb")) return;
  const img=document.querySelector("img.cover");
  if(!img) return;
  const node=img.parentElement && img.parentElement.tagName==="A" ? img.parentElement : img;
  const row=document.createElement("div");
  row.className="cover-row";
  const p=document.createElement("p");
  p.className="cover-blurb";
  p.textContent=BOOK_BLURB;
  node.parentNode.insertBefore(row, node);
  row.appendChild(node);
  row.appendChild(p);
}
function addHeadClose(dlgId, hideFn){
  const dlg=document.getElementById(dlgId);
  if(!dlg) return;
  const head=dlg.querySelector(".dlghead");
  if(!head || head.querySelector(".xclose")) return;
  const b=document.createElement("button");
  b.type="button";
  b.className="xclose gold";
  b.textContent="Schließen";
  b.onclick=hideFn;
  head.appendChild(b);
}
function ensureTextDlgFix(){
  addHeadClose("dlg", function(){ if(typeof hideSum==="function") hideSum(); });
  addHeadClose("fbDlg", hideFb);
  window.placeOverlay=function(){
    const d=document.getElementById("dlg");
    if(d) d.style.top="0px";
  };
  const fb=document.getElementById("fbDlg");
  if(fb) fb.style.top="0px";
}
const COUNT_API="https://countapi.mileshilliard.com/api/v1";
const CK="tvp-clbuerger-";
const TVS={day:null,month:null,total:null,dmin:0,mmin:0,tmin:0,acc:0,last:0};
function ymd(){const d=new Date(),p=function(n){return String(n).padStart(2,"0");};return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());}
function ym(){return ymd().slice(0,7);}
function countHit(key){return fetch(COUNT_API+"/hit/"+encodeURIComponent(key)).then(function(r){return r.json();}).then(function(j){return +j.value||0;}).catch(function(){return 0;});}
function countGet(key){return fetch(COUNT_API+"/get/"+encodeURIComponent(key)).then(function(r){return r.ok?r.json():{value:0};}).then(function(j){return +j.value||0;}).catch(function(){return 0;});}
function countSet(key,val){return fetch(COUNT_API+"/set/"+encodeURIComponent(key)+"?value="+encodeURIComponent(val)).then(function(r){return r.json();}).then(function(j){return +j.value||val;}).catch(function(){return val;});}
function fmtMinOnly(min){min=Math.max(0,Math.round(min||0));return min+" min";}
function fmtHours(min){min=Math.max(0,min||0);const h=min/60;if(h<10)return (Math.round(h*10)/10)+" h";return Math.round(h)+" h";}
function fmtMHD(min){min=Math.max(0,Math.round(min||0));const d=Math.floor(min/1440);min-=d*1440;const h=Math.floor(min/60);min-=h*60;const p=[];if(d)p.push(d+" d");if(h)p.push(h+" h");if(min||!p.length)p.push(min+" min");return p.join(" ");}
function drawStats(){
  let box=document.getElementById("tv-stats");
  if(!box){
    const st=document.createElement("style");
    st.textContent="#tv-stats{font-size:.68rem;color:#cbb89a;line-height:1.35;text-align:right;padding:4px 12px 6px;margin:0}";
    document.head.appendChild(st);
    box=document.createElement("div"); box.id="tv-stats";
    const foot=document.querySelector("footer.fb");
    if(foot) foot.appendChild(box); else document.body.appendChild(box);
  }
  const d=TVS.day==null?"—":TVS.day;
  const m=TVS.month==null?"—":TVS.month;
  const t=TVS.total==null?"—":TVS.total;
  box.innerHTML="Aufrufe: heute "+d+", Monat "+m+" = gesamt "+t+"<br>Hörzeit: heute "+fmtMinOnly(TVS.dmin)+", Monat "+fmtHours(TVS.mmin)+" = gesamt "+fmtMHD(TVS.tmin);
}
function hookListenTime(){
  const a=document.getElementById("a");
  if(!a||a.__tvListen) return;
  a.__tvListen=1;
  a.addEventListener("timeupdate",function(){
    if(a.paused){ TVS.last=0; return; }
    const now=Date.now();
    if(TVS.last){
      const add=Math.min(2.5,(now-TVS.last)/1000);
      if(add>0){ TVS.acc+=add; TVS.dmin+=add/60; TVS.mmin+=add/60; TVS.tmin+=add/60; }
    }
    TVS.last=now;
    if(TVS.acc>=60){
      TVS.acc-=60;
      countHit(CK+"min-"+ymd());
      countHit(CK+"min-"+ym());
      countHit(CK+"min-total").then(function(v){
        TVS.tmin=Math.max(TVS.tmin, v||0, TVS.mmin, TVS.dmin);
        drawStats();
      });
    }
    drawStats();
  });
  a.addEventListener("pause",function(){ TVS.last=0; });
}
function ensureStats(){
  if(window.__tvStatsOn) return;
  window.__tvStatsOn=1;
  drawStats();
  hookListenTime();
  const dayK=CK+"opens-"+ymd();
  const monK=CK+"opens-"+ym();
  const totK=CK+"opens-total";
  Promise.all([
    countHit(dayK),
    countHit(monK),
    countGet(totK),
    countGet(CK+"min-"+ymd()),
    countGet(CK+"min-"+ym()),
    countGet(CK+"min-total")
  ]).then(function(v){
    const day=v[0]||0;
    const mon=Math.max(v[1]||0, day);
    const tot=Math.max((v[2]||0)+1, mon);
    const jobs=[];
    if(mon!==(v[1]||0)) jobs.push(countSet(monK, mon));
    jobs.push(countSet(totK, tot));
    return Promise.all(jobs).then(function(){
      TVS.day=day;
      TVS.month=mon;
      TVS.total=tot;
      TVS.dmin=v[3]||0;
      TVS.mmin=Math.max(v[4]||0, TVS.dmin);
      TVS.tmin=Math.max(v[5]||0, TVS.mmin);
      drawStats();
    });
  });
}
const FB_REMOTE="feedbacks.json";
const FB_FALLBACK="https://raw.githubusercontent.com/clbuerger-ctrl/tadatmya-vedanta-player/main/feedbacks.json";
const FB_LOCAL="tv-player-feedbacks-v1";
let fbSum=0;
function fbLoadLocal(){try{return JSON.parse(localStorage.getItem(FB_LOCAL)||"[]");}catch(e){return [];}}
function fbSaveLocal(arr){localStorage.setItem(FB_LOCAL,JSON.stringify(arr));}
function fbKey(e){return [e.date||"",e.name||"",e.stadt||"",e.text||""].join("|");}
function fbMerge(remote,local){
  const seen={}; const out=[];
  (remote||[]).concat(local||[]).forEach(function(e){
    if(!e||!fbKey(e)) return;
    if(seen[fbKey(e)]) return;
    seen[fbKey(e)]=1; out.push(e);
  });
  out.sort(function(a,b){return String(b.date).localeCompare(String(a.date));});
  return out;
}
function fbFmt(iso){
  const d=new Date(iso);
  if(isNaN(d)) return iso||"";
  const p=function(n){return String(n).padStart(2,"0");};
  return p(d.getDate())+"."+p(d.getMonth()+1)+"."+d.getFullYear()+" "+p(d.getHours())+":"+p(d.getMinutes());
}
function renderFbList(items){
  const box=document.getElementById("fbList");
  if(!box) return;
  if(!items.length){ box.innerHTML="<p class='tags'>Noch keine Einträge.</p>"; return; }
  box.innerHTML=items.map(function(e){
    const who=[e.name||"",e.stadt||""].filter(Boolean).join(", ");
    return "<div class='fb-item'><div class='tags'>"+fbFmt(e.date)+(who?" · "+who:"")+"</div><div>"+String(e.text||"").replace(/</g,"<")+"</div></div>";
  }).join("");
}
function ensureCaptcha(){
  if(document.getElementById("fbCaptcha")) return;
  const text=document.getElementById("fbText");
  if(!text||!text.parentNode) return;
  const lab=document.createElement("label");
  lab.id="fbCaptchaLabel"; lab.htmlFor="fbCaptcha"; lab.textContent="Captcha";
  const inp=document.createElement("input");
  inp.id="fbCaptcha"; inp.type="text"; inp.inputMode="numeric"; inp.autocomplete="off";
  text.parentNode.insertBefore(lab, text.nextSibling);
  text.parentNode.insertBefore(inp, lab.nextSibling);
}
function newCaptcha(){
  ensureCaptcha();
  const a=1+Math.floor(Math.random()*8);
  const b=1+Math.floor(Math.random()*8);
  fbSum=a+b;
  const lab=document.getElementById("fbCaptchaLabel");
  if(lab) lab.textContent="Captcha: "+a+" + "+b+" = ?";
  const inp=document.getElementById("fbCaptcha");
  if(inp) inp.value="";
}
function refreshFb(){
  const local=fbLoadLocal();
  renderFbList(local);
  function ok(remote){
    if(!Array.isArray(remote)) remote=[];
    renderFbList(fbMerge(remote,local));
    const h=document.getElementById("fbHint");
    if(h) h.textContent="Gemeinsame Liste von GitHub. Neue Einträge erscheinen hier sofort.";
  }
  fetch(FB_REMOTE+"?t="+Date.now(),{cache:"no-store"}).then(function(r){return r.ok?r.json():Promise.reject();}).then(ok).catch(function(){
    fetch(FB_FALLBACK+"?t="+Date.now(),{cache:"no-store"}).then(function(r){return r.ok?r.json():[];}).then(ok).catch(function(){
      const h=document.getElementById("fbHint");
      if(h) h.textContent="GitHub-Liste gerade nicht erreichbar. Lokale Einträge werden angezeigt.";
    });
  });
}
function openFb(){
  const dlg=document.getElementById("fbDlg");
  dlg.classList.add("on");
  dlg.style.top="0px";
  newCaptcha();
  refreshFb();
}
function hideFb(){document.getElementById("fbDlg").classList.remove("on");}
function sendFb(){
  const name=(document.getElementById("fbName").value||"").trim();
  const stadt=(document.getElementById("fbStadt").value||"").trim();
  const text=(document.getElementById("fbText").value||"").trim();
  if(!name || !stadt || !text){ alert("Bitte Name, Stadt und Feedback ausfüllen."); return; }
  const cap=(document.getElementById("fbCaptcha")&&document.getElementById("fbCaptcha").value||"").trim();
  if(parseInt(cap,10)!==fbSum){ alert("Captcha stimmt nicht."); newCaptcha(); return; }
  const entry={date:new Date().toISOString(),name:name,stadt:stadt,text:text};
  const local=fbLoadLocal(); local.push(entry); fbSaveLocal(local);
  document.getElementById("fbText").value="";
  newCaptcha();
  refreshFb();
}
function ensureCredit(){
  if(document.querySelector(".bd-mark")) return;
  const st=document.createElement("style");
  st.textContent=".bd-mark{display:block;text-align:right;padding:0 12px 10px;font-size:.68rem;color:#7a6a58;opacity:.7;}";
  document.head.appendChild(st);
  const d=document.createElement("div");
  d.className="bd-mark";
  d.textContent="BD Bonn, Mannheim 2026";
  const foot=document.querySelector("footer.fb");
  if(foot) foot.appendChild(d); else document.body.appendChild(d);
}
function ensureAppName(){
  document.title="TadatmyaVedantaPlayer";
  if(!document.querySelector('link[rel="manifest"]')){
    const l=document.createElement("link");
    l.rel="manifest"; l.href="manifest.json";
    document.head.appendChild(l);
  }
  if(!document.querySelector('meta[name="apple-mobile-web-app-title"]')){
    const m=document.createElement("meta");
    m.name="apple-mobile-web-app-title"; m.content="TadatmyaVedantaPlayer";
    document.head.appendChild(m);
  }
}
document.addEventListener("DOMContentLoaded",function(){
  const dlg=document.getElementById("fbDlg");
  if(dlg) dlg.onclick=function(e){if(e.target===this)hideFb();};
  ensureCredit();
  ensureAppName();
  ensureTwoCol();
  ensureCoverLink();
  ensureCoverBlurb();
  ensureTextDlgFix();
  ensureStats();
  fixLecture2b();
});
ensureCredit();
ensureAppName();
ensureTwoCol();
ensureCoverLink();
ensureCoverBlurb();
ensureTextDlgFix();
