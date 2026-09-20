const FB_REMOTE="feedbacks.json";
const FB_FALLBACK="https://raw.githubusercontent.com/clbuerger-ctrl/tadatmya-vedanta-player/main/feedbacks.json";
const FB_LOCAL="tv-player-feedbacks-v1";
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
    return "<div class='fb-item'><div class='tags'>"+fbFmt(e.date)+(who?" · "+who:"")+"</div><div>"+String(e.text||"").replace(/</g,"&lt;")+"</div></div>";
  }).join("");
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
  refreshFb();
}
function hideFb(){document.getElementById("fbDlg").classList.remove("on");}
function sendFb(){
  const name=(document.getElementById("fbName").value||"").trim();
  const stadt=(document.getElementById("fbStadt").value||"").trim();
  const text=(document.getElementById("fbText").value||"").trim();
  if(!name || !stadt || !text){ alert("Bitte Name, Stadt und Feedback ausfüllen."); return; }
  const entry={date:new Date().toISOString(),name:name,stadt:stadt,text:text};
  const local=fbLoadLocal(); local.push(entry); fbSaveLocal(local);
  document.getElementById("fbText").value="";
  refreshFb();
}
document.addEventListener("DOMContentLoaded",function(){
  const dlg=document.getElementById("fbDlg");
  if(dlg) dlg.onclick=function(e){if(e.target===this)hideFb();};
});
