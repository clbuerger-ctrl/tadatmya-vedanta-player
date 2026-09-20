const FILE_2B="Tādātmya Vedānta - Vortrag #2b zum Buch über die Philosophie der Hari Bhakta Sampradaya - Vertiefung.mp3";
const BOOK_URL="https://www.amazon.de/T%C4%81d%C4%81tmya-Ved%C4%81nta-Treatise-Philosophy-Samprad%C4%81ya-ebook/dp/B0FW4YJYJS";
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
  if(document.getElementById("tv-twocol")) return;
  const st=document.createElement("style");
  st.id="tv-twocol";
  st.textContent="@media (min-width:800px){.list{display:grid;grid-template-columns:1fr 1fr}.item{border-right:1px solid #3d2f26}.item:nth-child(even){border-right:none}}.cover-row{display:flex;gap:16px;align-items:center;justify-content:center;max-width:46rem;margin:0 auto 8px;padding:0 12px}.cover-row .cover{height:200px;margin:0}.cover-blurb{font-size:.78rem;line-height:1.4;color:#b7a48c;text-align:left;max-width:22rem}@media (max-width:700px){.cover-row{flex-direction:column}.cover-blurb{text-align:center;max-width:22rem}}";
  document.head.appendChild(st);
}
function ensureCoverLink(){
  const img=document.querySelector("img.cover");
  if(!img) return;
  if(img.parentElement && img.parentElement.tagName==="A"){
    img.parentElement.href=BOOK_URL;
    img.parentElement.target="_blank";
    img.parentElement.rel="noopener noreferrer";
    return;
  }
  const a=document.createElement("a");
  a.href=BOOK_URL;
  a.target="_blank";
  a.rel="noopener noreferrer";
  a.title="Tādātmya Vedānta bei Amazon";
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
  const bar=document.getElementById("playerBar");
  if(bar) dlg.style.top=bar.getBoundingClientRect().bottom+"px";
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
  st.textContent=".bd-mark{position:fixed;right:10px;bottom:6px;font-size:.68rem;color:#7a6a58;opacity:.7;pointer-events:none;z-index:5;}";
  document.head.appendChild(st);
  const d=document.createElement("div");
  d.className="bd-mark";
  d.textContent="BD Bonn, Mannheim 2026";
  document.body.appendChild(d);
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
  fixLecture2b();
});
ensureCredit();
ensureAppName();
ensureTwoCol();
ensureCoverLink();
ensureCoverBlurb();
